import { test, expect } from "@playwright/test";

/**
 * Runtime-performance guardrails for a 3D-heavy marketing page. These target
 * the things code review can't see: page weight, main-thread jank, scroll
 * frame-rate through the WebGL sequence, and heap growth (leaks).
 *
 * NOTE on FPS/heap: headless Chromium renders WebGL through ANGLE/SwiftShader,
 * so absolute numbers run *below* a real GPU. Thresholds here are deliberately
 * conservative floors — a regression will still cross them, but a healthy site
 * clears them with room to spare. Tune the budgets below as the site grows.
 */

// ---- Budgets (tune here) --------------------------------------------------
const BUDGET = {
  jsKB: 1800, // total transferred JavaScript
  imageKB: 4000, // total images (logos, recap photos, decorative art)
  modelKB: 600, // the .glb 3D model
  totalKB: 8000, // everything
  minFps: 30, // scroll frame-rate floor through the 3D span
  maxLongTaskMs: 1500, // cumulative main-thread blocking during load + scroll
  maxHeapGrowthMB: 60, // heap growth after repeated scroll cycles
};

// Only meaningful on desktop; the mobile project doesn't match this file.
test.describe("performance", () => {
  test("page weight is within budget", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // Scroll so lazy images/models are all requested.
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(50);
    }
    await page.waitForLoadState("networkidle");

    const weight = await page.evaluate(() => {
      const res = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];
      const kb = (b: number) => b / 1024;
      const sum = { js: 0, image: 0, model: 0, total: 0 };
      for (const r of res) {
        const bytes = r.encodedBodySize || r.transferSize || 0;
        sum.total += bytes;
        if (/\.js(\?|$)/.test(r.name) || r.initiatorType === "script") sum.js += bytes;
        else if (r.initiatorType === "img" || /\.(png|jpe?g|webp|avif|svg|gif)(\?|$)/.test(r.name)) sum.image += bytes;
        else if (/\.(glb|gltf|bin)(\?|$)/.test(r.name)) sum.model += bytes;
      }
      return {
        js: Math.round(kb(sum.js)),
        image: Math.round(kb(sum.image)),
        model: Math.round(kb(sum.model)),
        total: Math.round(kb(sum.total)),
      };
    });

    test.info().annotations.push({
      type: "weight",
      description: `JS ${weight.js}KB · images ${weight.image}KB · model ${weight.model}KB · total ${weight.total}KB`,
    });

    expect(weight.js, "JS transfer KB").toBeLessThanOrEqual(BUDGET.jsKB);
    expect(weight.image, "image transfer KB").toBeLessThanOrEqual(BUDGET.imageKB);
    expect(weight.model, "model transfer KB").toBeLessThanOrEqual(BUDGET.modelKB);
    expect(weight.total, "total transfer KB").toBeLessThanOrEqual(BUDGET.totalKB);
  });

  test("main thread isn't blocked for long during load + scroll", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // @ts-expect-error test-only global
      window.__longTaskMs = 0;
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            // @ts-expect-error test-only global
            window.__longTaskMs += e.duration;
          }
        }).observe({ type: "longtask", buffered: true });
      } catch {
        /* longtask unsupported — leaves total at 0 */
      }
    });

    await page.goto("/", { waitUntil: "networkidle" });
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(500);

    const longTaskMs = await page.evaluate(
      // @ts-expect-error test-only global
      () => Math.round(window.__longTaskMs as number),
    );
    test.info().annotations.push({
      type: "longtasks",
      description: `${longTaskMs}ms cumulative main-thread blocking`,
    });
    expect(longTaskMs, "cumulative long-task ms").toBeLessThanOrEqual(
      BUDGET.maxLongTaskMs,
    );
  });

  test("maintains frame-rate while scrolling the 3D sequence", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // Start a rAF frame counter in the page, then drive a sustained scroll
    // from the test side and measure how many frames actually rendered.
    await page.evaluate(() => {
      // @ts-expect-error test-only globals
      window.__frames = 0;
      // @ts-expect-error test-only globals
      window.__t0 = performance.now();
      const loop = () => {
        // @ts-expect-error test-only globals
        window.__frames++;
        // @ts-expect-error test-only globals
        window.__raf = requestAnimationFrame(loop);
      };
      // @ts-expect-error test-only globals
      window.__raf = requestAnimationFrame(loop);
    });

    for (let i = 0; i < 50; i++) {
      await page.mouse.wheel(0, 250);
      await page.waitForTimeout(16);
    }

    const { fps, frames, ms } = await page.evaluate(() => {
      // @ts-expect-error test-only globals
      cancelAnimationFrame(window.__raf);
      // @ts-expect-error test-only globals
      const frames = window.__frames as number;
      // @ts-expect-error test-only globals
      const ms = performance.now() - (window.__t0 as number);
      return { fps: (frames / ms) * 1000, frames, ms: Math.round(ms) };
    });

    test.info().annotations.push({
      type: "fps",
      description: `${fps.toFixed(1)} fps (${frames} frames / ${ms}ms)`,
    });
    expect(fps, "scroll fps through 3D span").toBeGreaterThanOrEqual(
      BUDGET.minFps,
    );
  });

  test("does not leak heap across repeated scrolling", async ({ page }) => {
    // performance.memory is Chromium-only; skip elsewhere.
    const supported = await page
      .goto("/", { waitUntil: "networkidle" })
      .then(() =>
        page.evaluate(
          () => "memory" in performance && !!(performance as unknown as { memory?: unknown }).memory,
        ),
      );
    test.skip(!supported, "performance.memory unavailable");

    const gcAndMeasure = async () => {
      await page.evaluate(() => {
        const g = (window as unknown as { gc?: () => void }).gc;
        if (g) {
          g();
          g();
        }
      });
      await page.waitForTimeout(300);
      return page.evaluate(
        () =>
          (performance as unknown as { memory: { usedJSHeapSize: number } })
            .memory.usedJSHeapSize,
      );
    };

    const baseline = await gcAndMeasure();

    // Several full up/down scroll cycles — the kind of thing that accumulates
    // detached nodes or orphaned rAF loops if something isn't cleaned up.
    for (let cycle = 0; cycle < 3; cycle++) {
      for (let i = 0; i < 25; i++) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(15);
      }
      for (let i = 0; i < 25; i++) {
        await page.mouse.wheel(0, -500);
        await page.waitForTimeout(15);
      }
    }

    const after = await gcAndMeasure();
    const growthMB = (after - baseline) / (1024 * 1024);
    test.info().annotations.push({
      type: "heap",
      description: `baseline ${(baseline / 1e6).toFixed(1)}MB → after ${(after / 1e6).toFixed(1)}MB (Δ ${growthMB.toFixed(1)}MB)`,
    });
    expect(growthMB, "heap growth MB").toBeLessThanOrEqual(
      BUDGET.maxHeapGrowthMB,
    );
  });
});

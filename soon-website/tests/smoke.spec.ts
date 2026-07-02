import { test, expect } from "@playwright/test";

import { SECTIONS, scrollThrough } from "./helpers";

/**
 * Functional smoke tests: the page loads clean, the 3D scene mounts (or its
 * error boundary falls back), every section is present, no images 404, and the
 * primary navigation works on both desktop and mobile. Runs on both projects.
 */

// Console/network noise we don't want to fail on (third-party, dev-only, or
// known-benign). Keep this list tight — it's the escape hatch, not the rule.
const IGNORED_MESSAGES = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
];

test.describe("smoke", () => {
  test("loads with no console errors or failed requests", async ({ page }) => {
    const errors: string[] = [];
    const failed: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (IGNORED_MESSAGES.some((re) => re.test(text))) return;
      errors.push(text);
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("requestfailed", (req) => {
      const url = req.url();
      if (IGNORED_MESSAGES.some((re) => re.test(url))) return;
      failed.push(`${url} — ${req.failure()?.errorText ?? "failed"}`);
    });

    const resp = await page.goto("/", { waitUntil: "networkidle" });
    expect(resp?.status(), "homepage HTTP status").toBeLessThan(400);

    // Exercise the whole page so lazy assets / scroll effects run.
    await scrollThrough(page);

    expect(errors, `console errors:\n${errors.join("\n")}`).toHaveLength(0);
    expect(failed, `failed requests:\n${failed.join("\n")}`).toHaveLength(0);
  });

  test("all sections are present", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    for (const id of SECTIONS) {
      await expect(page.locator(id).first(), `section ${id}`).toBeAttached();
    }
  });

  test("3D scene mounts a live WebGL context (or falls back cleanly)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const canvasCount = await page.locator("canvas").count();

    if (canvasCount === 0) {
      // Acceptable only if the scene's error boundary rendered its fallback
      // rather than leaving a blank hole — assert the rest of the page is fine.
      await expect(page.locator("#top")).toBeVisible();
      test.info().annotations.push({
        type: "note",
        description: "No <canvas> — scene fell back; page still renders.",
      });
      return;
    }

    const hasContext = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      if (!c) return false;
      const gl =
        c.getContext("webgl2") ||
        c.getContext("webgl") ||
        c.getContext("experimental-webgl");
      return !!gl;
    });
    expect(hasContext, "WebGL context on the scene canvas").toBeTruthy();
  });

  test("no broken images anywhere on the page", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollThrough(page);
    await page.waitForLoadState("networkidle");

    const broken = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => (img.currentSrc || img.getAttribute("src")) && img.complete)
        .filter((img) => img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    );
    expect(broken, `broken images:\n${broken.join("\n")}`).toHaveLength(0);
  });

  test("primary navigation jumps to a section", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const width = page.viewportSize()?.width ?? 1440;
    const isMobile = width < 768;

    if (isMobile) {
      // Open the hamburger menu, then tap a link.
      const toggle = page.getByRole("button", { name: /toggle menu/i });
      await toggle.click();
      const panelLink = page.locator("a[href='#sponsors']").last();
      await expect(panelLink).toBeVisible();
      await panelLink.click();
    } else {
      await page.locator("nav a[href='#sponsors']").first().click();
    }

    // Anchor navigation updates the hash and brings the section into view.
    await expect(page).toHaveURL(/#sponsors$/);
    await page.waitForTimeout(1200); // allow smooth-scroll to arrive
    const inView = await page.locator("#sponsors").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    });
    expect(inView, "#sponsors scrolled into view").toBeTruthy();
  });
});

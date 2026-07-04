import { test, expect } from "@playwright/test";

/**
 * Visual regression on the *stable, opaque* content sections — the ones safe to
 * pixel-diff. We deliberately skip sections layered over the animated WebGL
 * canvas (hero) or with auto-scrolling marquees / particle fields (recap, team),
 * which never settle to a deterministic frame.
 *
 * `reducedMotion: reduce` makes the site show reveals/counters in their final
 * state immediately (see the [data-reveal] rule in globals.css and CountUp),
 * so a scrolled-in section renders identically every run. Baselines are stored
 * per project (desktop/mobile) automatically. Runs on both projects.
 */

const TARGETS: { name: string; selector: string }[] = [
  { name: "sponsors", selector: "#sponsors" },
  { name: "footer", selector: "[role='contentinfo']" },
];

test.describe("visual", () => {
  for (const { name, selector } of TARGETS) {
    test(`${name} section matches baseline`, async ({ page }) => {
      // Set explicitly in-body (file-level test.use didn't reliably reach the
      // page). This flips the site's [data-reveal] CSS to force every reveal
      // visible and makes CountUp render its final value instantly, so a
      // scrolled-in section is deterministic frame-to-frame.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      const section = page.locator(selector).first();
      await section.scrollIntoViewIfNeeded();
      // Let lazy images decode and reveals settle in their final state.
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(600);

      await expect(section).toHaveScreenshot(`${name}.png`);
    });
  }
});

import { test } from "@playwright/test";
import { chromium } from "playwright";
import { playAudit } from "playwright-lighthouse";
// Lighthouse's desktop preset (no types shipped; Playwright transpiles without
// type-checking, so the import resolves fine at runtime).
// @ts-ignore no type declarations in some environments
import desktopConfig from "lighthouse/core/config/desktop-config.js";

import { PORT } from "../playwright.config";

/**
 * Standardized Lighthouse audit against the production build, desktop profile.
 * playwright-lighthouse drives Lighthouse over CDP, so we launch a dedicated
 * Chromium with a remote-debugging port rather than reusing the project page.
 * Thresholds fail the test if a category regresses below them.
 */

const CDP_PORT = 9222;

// Desktop floors. Performance is intentionally forgiving for a WebGL-heavy
// page; the others we hold to a high bar. Tune as the site evolves.
// Actuals at time of writing: perf 95, a11y 96, best-practices 100, seo 100.
// Floors sit a notch below to catch real regressions while tolerating the
// run-to-run variance Lighthouse is prone to.
const THRESHOLDS = {
  performance: 80,
  accessibility: 90,
  "best-practices": 90,
  seo: 95,
};

test.describe.configure({ mode: "serial" });

test("lighthouse audit (desktop) meets thresholds", async () => {
  test.slow(); // Lighthouse takes a while.

  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${CDP_PORT}`],
  });
  try {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

    await playAudit({
      page,
      port: CDP_PORT,
      thresholds: THRESHOLDS,
      config: desktopConfig,
      reports: {
        formats: { html: true },
        name: "lighthouse",
        directory: "playwright-report/lighthouse",
      },
    });
  } finally {
    await browser.close();
  }
});

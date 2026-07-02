import type { Page } from "@playwright/test";

/** In-page section anchors, top to bottom. */
export const SECTIONS = [
  "#top",
  "#soon",
  "#impact",
  "#recap",
  "#guests",
  "#sponsors",
  "#team",
  "#faq",
];

/**
 * Scroll the whole page top→bottom in steps so lazy (`next/image`) assets and
 * scroll-triggered reveals actually load/fire, then settle at the bottom. Uses
 * the real wheel path so Lenis smooth-scroll is exercised like a user's.
 */
export async function scrollThrough(page: Page, steps = 30, dyPerStep = 400) {
  await page.mouse.move(400, 300);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dyPerStep);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(400);
  // Return to top so subsequent measurements start from a known state.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

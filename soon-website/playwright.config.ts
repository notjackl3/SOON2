import { defineConfig, devices } from "@playwright/test";

/**
 * Test runner for the SOON site. Runs against a *production* build (not `next
 * dev`) so performance/Lighthouse numbers are realistic — the webServer below
 * builds and serves on a dedicated port that won't clash with a running dev
 * server. Set `reuseExistingServer` locally so a build you already have up is
 * reused instead of rebuilt on every run.
 *
 * Projects:
 *  - `desktop` runs every spec (smoke, performance, lighthouse, visual).
 *  - `mobile`  runs only the specs that make sense on a phone (smoke + visual);
 *    Playwright auto-namespaces screenshot baselines per project, so the same
 *    visual spec yields separate desktop/mobile baselines automatically.
 */

export const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

// Flags that give headless Chromium a real (ANGLE) WebGL context and expose
// window.gc for the heap-leak check, instead of falling back to no-GL.
const GPU_ARGS = [
  "--use-angle=default",
  "--ignore-gpu-blocklist",
  "--enable-gpu-rasterization",
  "--js-flags=--expose-gc",
];

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // one prod server; keeps FPS/heap samples from contending
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // A little tolerance for font AA / sub-pixel drift across machines.
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: GPU_ARGS },
      },
    },
    {
      name: "mobile",
      testMatch: [/smoke\.spec\.ts/, /visual\.spec\.ts/],
      use: {
        ...devices["Pixel 5"],
        launchOptions: { args: GPU_ARGS },
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});

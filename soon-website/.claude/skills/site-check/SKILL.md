---
name: site-check
description: Run the SOON website Playwright suite (smoke/functional, runtime performance, Lighthouse, visual regression) against a production build and report results. Use when the user wants to verify the site works, check performance/FPS on the 3D scene, catch broken images or console errors, validate before deploying, or update visual baselines. Triggers include "check the site", "run the tests", "is the page working", "did I break anything", "check performance".
---

# Site check

Runs the committed Playwright suite in `soon-website/tests/` and reports a clear
pass/fail summary. The suite runs against a **production build** (`next build` +
`next start` on port 3100), so the first run of any command spends ~30–60s
building before tests execute.

## How to run

Work from the `soon-website/` directory. Pick the narrowest command that fits
the request:

| User intent | Command |
| --- | --- |
| Everything (default) | `npm test` |
| "Does it work / broken images / console errors" | `npm run test:smoke` |
| "Is it fast / FPS / page weight / leaks" | `npm run test:perf` |
| "Lighthouse / SEO / accessibility score" | `npm run test:lh` |
| "Did the layout change / visual diff" | `npm run test:visual` |
| Accept intentional visual changes | `npm run test:update` |

Run the command with a generous timeout (the build is slow). Prefer running in
the background and streaming output if the harness supports it.

Notes:
- If a `next start`/prod server is already up on port 3100, the suite reuses it
  (no rebuild). Otherwise it builds and starts one, then tears it down.
- `test:perf` and `test:lh` run **desktop only** (they're meaningless on a
  throttled phone profile). `smoke` and `visual` run on **desktop + mobile**.

## First run / after intentional UI changes

Visual tests compare against committed baselines in
`tests/visual.spec.ts-snapshots/`. If baselines are missing (first ever run) or
you *intended* to change the UI, regenerate and commit them:

```
npm run test:update
```

Then eyeball the new PNGs before committing — an update blesses whatever the
page currently looks like.

## Reading results

- **Green:** report the one-line summary plus the useful annotations the perf
  and Lighthouse tests print (FPS, JS/image/model KB, heap Δ, category scores).
  Pull these from the terminal output or `npm run test:report` (opens the HTML
  report).
- **Red:** identify which spec failed and why:
  - *smoke* → console error text, failed request URL, or broken image src is in
    the assertion message. These are usually real bugs — surface the offending
    URL/message.
  - *performance* → compare the printed value against the budget in
    `tests/performance.spec.ts` (the `BUDGET` object). If it's a real
    regression, investigate; if the budget is simply stale, propose adjusting
    it rather than silently loosening.
  - *lighthouse* → the failing category + score vs threshold is in the error;
    open the report at `playwright-report/lighthouse/` for details.
  - *visual* → open the report (`npm run test:report`) to see the
    expected/actual/diff triptych. Decide with the user whether it's a
    regression (fix it) or an intended change (`npm run test:update`).
- Failure traces/screenshots land in `test-results/`; the HTML report is at
  `playwright-report/`.

## Don't

- Don't loosen a budget or threshold to make a red test pass without flagging it
  to the user first — the thresholds are the guardrail.
- Don't commit `test-results/` or `playwright-report/` (already gitignored).
- Don't run against the `next dev` server on port 3001 — perf/Lighthouse numbers
  from dev mode are unrepresentative; the suite intentionally uses a prod build.

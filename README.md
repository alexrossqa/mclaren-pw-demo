# McLaren QA Demo: Playwright + Applitools

Playwright TypeScript test suite targeting `cars.mclaren.com` and `www.mclaren.com`. Three test areas: CSS token contracts, visual regression (static and dynamic content), and a direct comparison of pixel-diff vs AI-powered visual matching.

**Stack:** Playwright · TypeScript · Applitools Eyes (Ultrafast Grid) · Chromium + WebKit

---

## Section 1: CSS Token Contracts

**File:** `specs/css-tokens.spec.ts`  
**Fixtures:** `fixtures/token-specs.ts`

### Mission
Verify that McLaren's brand CSS tokens are correctly resolved by the browser across multiple page templates. Two templates are tested: the supercars subdomain (`cars.mclaren.com`) and the racing site (`www.mclaren.com/racing`), which share a brand but run on different codebases with different font stacks.

### Method
`getComputedStyle()` is called inside `page.evaluate()` to read the final computed value of each CSS property, not the stylesheet declaration, but the result after the cascade, specificity, media queries, and any JS-injected styles have all resolved. Expected values are harvested from the browser DevTools console.

A factory function (`tokenSuite()`) generates one named test per token per page, so adding a new page requires one line in the page map.

### Tests

| Page group | Pages | Tokens per page | Total assertions |
|---|---|---|---|
| Supercars (`cars.mclaren.com`) | Artura, Artura Spider, 750S, 750S Spider | 6 | 24 |
| Racing (`www.mclaren.com/racing`) | Racing | 2 | 2 |

Tokens checked: `fontFamily`, `color`, `fontSize`, `backgroundColor`, `letterSpacing`

### Notes
- `waitForSelector` is called before `page.evaluate()` because Playwright's auto-waiting only applies to action methods. `evaluate()` is a raw code bridge with no implicit wait.
- The racing site includes `"Noto Sans Fallback"` in its font stack; the supercars site does not. This difference is the basis of the intentional demo failure.
- **Demo failure:** uncomment `SUPERCAR_PAGES_WITH_FAILURE` in `specs/css-tokens.spec.ts` to slip the racing page into the supercars spec. The `fontFamily` assertion fails and the HTML report shows expected vs actual side by side.

---

## Section 2: Visual Regression - Static Pages

**File:** `specs/visual-static.spec.ts`

### Mission
Catch unintended visual changes to key product pages before they reach production.

### Method
Applitools Eyes with Ultrafast Grid (UFG). Playwright drives Chromium locally and captures the DOM once. Applitools renders it in Chrome, Firefox, and Safari simultaneously in the cloud. One test run produces three browser results without running three browsers locally.

### Tests

**Artura: full page**  
Full-page capture of the Artura page. The OneTrust cookie banner is dismissed before capture (waits up to 10s for the late-injected JS), then `waitForSelector('h1')` confirms JS-rendered content is ready.

**750S: hero image ignored** *(ignore region demo)*  
Captures the 750S page viewport with the hero `img.bg-image` element defined as an ignore region in code. The test injects a different image src via `page.evaluate()` before capture. The test still passes because the image is excluded from the diff. Removing `.ignore()` causes the test to fail, proving the region was doing the work.

### Notes
- Ignore regions can be defined in the Applitools dashboard UI by drawing on the baseline image, or in the test code as shown here. Defining them in code means they are part of the repo. Any change to an ignore region goes through a pull request and is visible to the team. Regions defined only in the dashboard can be changed or deleted by anyone with dashboard access, with no record of what changed or why.
- Visual tests run against `--project=chromium` only. UFG handles cross-browser rendering in the cloud.
- `retries: 0` is scoped to visual describes. The global config sets `retries: 1` for flaky network tests, but if a visual test fails and Playwright retries it, both attempts are submitted to Applitools as separate results. You end up with two entries for the same test in the dashboard, one flagged as a diff and one potentially passing, which makes the results unreliable. Visual tests manage their own pass/fail through Applitools, so Playwright retries are disabled for these suites only. This is done with `test.describe.configure({ retries: 0 })` at the top of each visual test suite, which overrides the global `retries: 1` in `playwright.config.ts` for that suite only.

---

## Section 3: Visual Regression - Dynamic Content

**File:** `specs/visual-dynamic.spec.ts`

### Mission
Reliably snapshot a page section whose content is driven by a scroll-triggered JS animation, without capturing a mid-animation state.

### Method
The Artura specification section contains three animated counters (top speed, torque, power) that are reset to 0 on page load and count up to their final values when scrolled into view. Two `waitForFunction` calls handle the timing:

1. **Phase 1:** wait until all `span.counter` elements leave zero (animation has started)
2. **Phase 2:** poll every 300ms; when two consecutive reads return the same values, the animation has settled

`Target.region()` captures only the specification section, not the full page.

### Notes
- Checking for non-zero was not sufficient on its own. The condition fired while the counters were mid-animation, capturing partial values. The stability check (two matching polls) was added after observing this in practice.
- This pattern applies to any JS-driven animation: count-up counters, progress bars, chart draws.

---

## Section 4: AI Diff vs Pixel Diff

**File:** `specs/visual-ai.spec.ts`

### Mission
Demonstrate why AI-powered visual matching produces fewer false positives than pixel-perfect comparison, and illustrate the maintenance cost of storing browser-specific baselines.

### Method
Two describe blocks, same page, same scenario:

1. **`toHaveScreenshot()`** (Playwright built-in): pixel-perfect diff. Baselines are PNG files committed to the repo, named with browser and OS baked in (`artura-hero-chromium-win32.png`). A CSS change is injected via `page.evaluate()` before capture.

2. **Applitools AI diff:** same page, no injection, no local PNG files. Results appear in the Applitools dashboard across Chrome, Firefox, and Safari.

### Tests

**Artura: hero (pixel diff)**  
Injects `h1 { letter-spacing: 4px }` before the screenshot. Fails with 11,071 pixels different. A single CSS property change on the heading text triggers a cascade of pixel mismatches across the entire text area. Results visible in the Playwright HTML report.

**Artura: hero (AI diff)**  
Same page without injection. Passes on Chrome, Firefox, and Safari in the Applitools dashboard. AI matching treats minor rendering variation as noise.

### Notes
- The pixel diff baseline filename (`artura-hero-chromium-win32.png`) encodes browser and OS. Run the same test on a Linux CI server and it looks for `artura-hero-chromium-linux.png`, a file that doesn't exist. Baselines generated on one machine don't transfer.
- At scale: 1000 pages x 3 browsers = 3000 PNG files to store, review, and regenerate on every intentional redesign. Applitools stores nothing locally.
- `toHaveScreenshot()` results appear in the **Playwright HTML report**. Applitools results appear in the **Applitools dashboard**. They are separate tools with separate outputs.

---

## Setup

```bash
npm install
npx playwright install chromium webkit
```

Set your Applitools API key as a Windows environment variable:
```
APPLITOOLS_API_KEY=<your key>
```

## Running the tests

```bash
# CSS token contracts (Chromium + WebKit)
npx playwright test css-tokens.spec.ts

# Visual tests (Chromium only - Applitools UFG handles cross-browser)
npx playwright test visual-static.spec.ts --project=chromium
npx playwright test visual-dynamic.spec.ts --project=chromium
npx playwright test visual-ai.spec.ts --project=chromium

# All visual specs in one command
npm run test:visual

# View Playwright HTML report
npx playwright show-report
```

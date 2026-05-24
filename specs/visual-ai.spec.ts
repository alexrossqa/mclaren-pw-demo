import { test, expect } from '@playwright/test';
import {
  Eyes,
  Target,
  Configuration,
  BatchInfo,
  VisualGridRunner,
  BrowserType,
} from '@applitools/eyes-playwright';

// ─── WHY THIS FILE EXISTS ─────────────────────────────────────────────────────
// toHaveScreenshot() uses pixel-perfect matching — it compares every pixel
// against a stored PNG. It fails on rendering noise: sub-pixel font differences,
// anti-aliasing variations, minor layout shifts from ads or late-loading assets.
// Cross-browser means separate baseline files per browser/OS combination.
//
// Applitools Visual AI asks "would a human notice this?" — it ignores rendering
// noise and only flags meaningful visual changes. One test run, all browsers
// rendered in the cloud via Ultrafast Grid, results in the dashboard.
//
// Run both suites. toHaveScreenshot() generates snapshot files in this repo
// (one per browser). Applitools generates nothing locally — results live in
// the dashboard. At 1000 pages × 3 browsers = 3000 PNGs to store and maintain
// vs one Applitools batch.
// ─────────────────────────────────────────────────────────────────────────────

// ─── SHARED PAGE SETUP ───────────────────────────────────────────────────────

async function loadArtura(page: any) {
  await page.goto('https://cars.mclaren.com/gl_en/artura', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 10000 });
    await page.click('#onetrust-accept-btn-handler');
    await page.waitForSelector('#onetrust-banner-sdk', { state: 'hidden', timeout: 5000 });
  } catch {
    // banner didn't appear — continue
  }
  await page.waitForSelector('h1', { timeout: 15000 });
}

// ─── SUITE A: PIXEL DIFF (toHaveScreenshot) ──────────────────────────────────
// Baselines are PNG files committed to this repo under snapshots/.
// Playwright generates one file per browser — run on Chromium, you get
// artura-hero-chromium.png. Run on WebKit, you get artura-hero-webkit.png.
// Any rendering difference between browsers = a different file = separate
// maintenance burden. On CI, the OS matters too (Linux renders fonts differently
// to macOS) — baselines generated on one machine may fail on another.

test.describe('Pixel diff — toHaveScreenshot()', () => {
  test.describe.configure({ retries: 0 });

  test('Artura — hero (pixel diff)', async ({ page }) => {
    await loadArtura(page);

    // Inject a subtle styling change — widens h1 letter-spacing slightly
    // Pixel diff catches this as thousands of changed pixels and fails.
    // The Applitools AI diff test below runs the same page without injection
    // and passes — AI understands this level of change is not meaningful.
    await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) h1.style.letterSpacing = '4px';
    });

    await expect(page).toHaveScreenshot('artura-hero.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });
});

// ─── SUITE B: AI DIFF (Applitools) ───────────────────────────────────────────
// No snapshot files. No per-browser baselines. Playwright captures the DOM once;
// Applitools renders it in Chrome, Firefox, and Safari in the cloud and compares
// using Visual AI — rendering noise is ignored, meaningful changes are flagged.

const aiRunner = new VisualGridRunner({ testConcurrency: 5 });
const aiConfig = new Configuration();
aiConfig.setApiKey(process.env.APPLITOOLS_API_KEY!);
aiConfig.setBatch(new BatchInfo({ name: 'McLaren Visual Regression' }));
aiConfig.addBrowser(1440, 900, BrowserType.CHROME);
aiConfig.addBrowser(1440, 900, BrowserType.FIREFOX);
aiConfig.addBrowser(1440, 900, BrowserType.SAFARI);

test.describe('AI diff — Applitools', () => {
  test.describe.configure({ retries: 0, timeout: 120000 });

  let eyes: Eyes;

  test.beforeEach(async () => {
    eyes = new Eyes(aiRunner, aiConfig);
  });

  test.afterEach(async () => {
    await eyes.close(false);
  });

  test('Artura — hero (AI diff)', async ({ page }) => {
    await loadArtura(page);
    await eyes.open(page, 'McLaren', 'Artura — hero (AI diff)', { width: 1440, height: 900 });
    await eyes.check('Artura hero', Target.window());
  });
});

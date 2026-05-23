import { test } from '@playwright/test';
import {
  Eyes,
  Target,
  Configuration,
  BatchInfo,
  VisualGridRunner,
  BrowserType,
} from '@applitools/eyes-playwright';

// ─── SUITE-LEVEL SETUP ────────────────────────────────────────────────────────
// Runner and config are created once, shared across all tests in this file.
// VisualGridRunner orchestrates parallel cloud renders — Playwright captures the
// DOM once; Applitools renders it in Chrome, Firefox, and Safari simultaneously.

const runner = new VisualGridRunner({ testConcurrency: 5 });

const config = new Configuration();
config.setApiKey(process.env.APPLITOOLS_API_KEY!);
config.setBatch(new BatchInfo({ name: 'McLaren Visual Regression' }));
config.addBrowser(1440, 900, BrowserType.CHROME);
config.addBrowser(1440, 900, BrowserType.FIREFOX);
config.addBrowser(1440, 900, BrowserType.SAFARI);

// ─── TESTS ────────────────────────────────────────────────────────────────────

test.describe('Visual — Supercars', () => {
  // Retries create duplicate Applitools results — visual tests manage their own pass/fail
  test.describe.configure({ retries: 0 });

  let eyes: Eyes;

  test.beforeEach(async () => {
    eyes = new Eyes(runner, config);
  });

  test.afterEach(async () => {
    // closeAsync fires the render job without blocking — results collected below
    await eyes.closeAsync();
  });

  test.afterAll(async () => {
    // Block here until all cloud renders finish and surface any visual diffs
    await runner.getAllTestResults();
  });

  test('Artura — full page', async ({ page }) => {
    await page.goto('https://cars.mclaren.com/gl_en/artura', { waitUntil: 'domcontentloaded' });

    // Dismiss OneTrust banner — wait up to 10s for late-injected JS to render it
    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 10000 });
      await page.click('#onetrust-accept-btn-handler');
      await page.waitForSelector('#onetrust-banner-sdk', { state: 'hidden', timeout: 5000 });
    } catch {
      // banner didn't appear — continue
    }

    // Wait for JS-rendered content before capturing
    await page.waitForSelector('h1', { timeout: 15000 });

    await eyes.open(page, 'McLaren', 'Artura — full page', { width: 1440, height: 900 });
    await eyes.check('Artura full page', Target.window().fully());
  });
});

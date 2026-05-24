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
  test.describe.configure({ retries: 0, timeout: 120000 });

  let eyes: Eyes;

  test.beforeEach(async () => {
    eyes = new Eyes(runner, config);
  });

  test.afterEach(async () => {
    await eyes.close(false);
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

// ─── IGNORE REGION DEMO ───────────────────────────────────────────────────────
// Demonstrates ignore regions defined in code (not the Applitools dashboard UI).
// Stage 1: baseline captured with real hero image, ignore region covering img.bg-image.
// Stage 2 (next run): inject a different image src — test still passes because the
// hero is excluded from the diff. Remove .ignore() to prove the region was doing the work.

const ignoreRunner = new VisualGridRunner({ testConcurrency: 5 });
const ignoreConfig = new Configuration();
ignoreConfig.setApiKey(process.env.APPLITOOLS_API_KEY!);
ignoreConfig.setBatch(new BatchInfo({ name: 'McLaren Visual Regression' }));
ignoreConfig.addBrowser(1440, 900, BrowserType.CHROME);
ignoreConfig.addBrowser(1440, 900, BrowserType.FIREFOX);
ignoreConfig.addBrowser(1440, 900, BrowserType.SAFARI);

test.describe('Visual — Ignore region demo', () => {
  test.describe.configure({ retries: 0, timeout: 120000 });

  let eyes: Eyes;

  test.beforeEach(async () => {
    eyes = new Eyes(ignoreRunner, ignoreConfig);
  });

  test.afterEach(async () => {
    await eyes.close(false);
  });

  test('750S — hero image ignored', async ({ page }) => {
    await page.goto('https://cars.mclaren.com/gl_en/750s', { waitUntil: 'domcontentloaded' });

    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 10000 });
      await page.click('#onetrust-accept-btn-handler');
      await page.waitForSelector('#onetrust-banner-sdk', { state: 'hidden', timeout: 5000 });
    } catch {
      // banner didn't appear — continue
    }

    await page.waitForSelector('img.bg-image', { timeout: 15000 });

    // Inject a different image — simulates an unexpected hero change
    // Test should still PASS because img.bg-image is inside the ignore region
    await page.evaluate(() => {
      const img = document.querySelector('img.bg-image') as HTMLImageElement;
      if (img) img.src = 'https://cars-assets-production.mclaren.com/178/mclaren-750s-hero-mobile.jpg';
    });

    await eyes.open(page, 'McLaren', '750S — hero image ignored', { width: 1440, height: 900 });
    // viewport only — hero is above the fold, no need to scroll the full page
    await eyes.check('750S hero', Target.window()
      .ignore(page.locator('img.bg-image').first())
    );
  });
});

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
// Same runner / config pattern as visual-static — one DOM capture, three browsers.

const runner = new VisualGridRunner({ testConcurrency: 5 });

const config = new Configuration();
config.setApiKey(process.env.APPLITOOLS_API_KEY!);
config.setBatch(new BatchInfo({ name: 'McLaren Visual Regression' }));
config.addBrowser(1440, 900, BrowserType.CHROME);
config.addBrowser(1440, 900, BrowserType.FIREFOX);
config.addBrowser(1440, 900, BrowserType.SAFARI);

// ─── TESTS ────────────────────────────────────────────────────────────────────

test.describe('Visual — Dynamic content', () => {
  test.describe.configure({ retries: 0 });

  let eyes: Eyes;

  test.beforeEach(async () => {
    eyes = new Eyes(runner, config);
  });

  test.afterEach(async () => {
    await eyes.closeAsync();
  });

  test.afterAll(async () => {
    await runner.getAllTestResults();
  });

  test('Artura — spec highlights', async ({ page }) => {
    await page.goto('https://cars.mclaren.com/gl_en/artura', { waitUntil: 'domcontentloaded' });

    // Dismiss OneTrust banner
    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 10000 });
      await page.click('#onetrust-accept-btn-handler');
      await page.waitForSelector('#onetrust-banner-sdk', { state: 'hidden', timeout: 5000 });
    } catch {
      // banner didn't appear — continue
    }

    // Scroll into view — JS resets span.counter elements to 0 on load and only
    // triggers the count-up animation when the section enters the viewport
    await page.locator('section.highlighted-specs').scrollIntoViewIfNeeded();

    // Wait for the animation to settle — all counters must show a non-zero value
    await page.waitForFunction(() => {
      const counters = document.querySelectorAll('span.counter');
      return counters.length > 0 &&
        Array.from(counters).every(el => el.textContent?.trim() !== '0');
    }, { timeout: 10000 });

    await eyes.open(page, 'McLaren', 'Artura — spec highlights', { width: 1440, height: 900 });
    await eyes.check('Spec highlights', Target.region(page.locator('section.highlighted-specs')));
  });
});

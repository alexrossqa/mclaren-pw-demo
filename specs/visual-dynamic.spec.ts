import { test } from '@playwright/test';
import {
  Eyes,
  Target,
  Configuration,
  BatchInfo,
  VisualGridRunner,
  BrowserType,
} from '@applitools/eyes-playwright';

const runner = new VisualGridRunner({ testConcurrency: 5 });

const config = new Configuration();
config.setApiKey(process.env.APPLITOOLS_API_KEY!);
config.setBatch(new BatchInfo({ name: 'McLaren Visual Regression' }));
config.addBrowser(1440, 900, BrowserType.CHROME);
config.addBrowser(1440, 900, BrowserType.FIREFOX);
config.addBrowser(1440, 900, BrowserType.SAFARI);

test.describe('Visual — Dynamic content', () => {
  test.describe.configure({ retries: 0, timeout: 120000 });

  let eyes: Eyes;

  test.beforeEach(async () => {
    eyes = new Eyes(runner, config);
  });

  test.afterEach(async () => {
    await eyes.close(false);
  });

  test('Artura — spec highlights', async ({ page }) => {
    await page.goto('https://cars.mclaren.com/gl_en/artura', { waitUntil: 'domcontentloaded' });

    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 10000 });
      await page.click('#onetrust-accept-btn-handler');
      await page.waitForSelector('#onetrust-banner-sdk', { state: 'hidden', timeout: 5000 });
    } catch {
      // banner didn't appear
    }

    await page.locator('section.highlighted-specs').scrollIntoViewIfNeeded();

    await page.waitForFunction(() => {
      const counters = document.querySelectorAll('span.counter');
      return counters.length > 0 &&
        Array.from(counters).every(el => el.textContent?.trim() !== '0');
    }, { timeout: 10000 });

    await page.waitForFunction(() => {
      const current = Array.from(document.querySelectorAll('span.counter'))
        .map(el => el.textContent?.trim()).join(',');
      const w = window as any;
      if (w.__lastCounterVal === current) return true;
      w.__lastCounterVal = current;
      return false;
    }, { timeout: 10000, polling: 300 });

    await eyes.open(page, 'McLaren', 'Artura — spec highlights', { width: 1440, height: 900 });
    await eyes.check('Spec highlights', Target.region(page.locator('section.highlighted-specs')));
  });
});

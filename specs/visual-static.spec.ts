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

    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 10000 });
      await page.click('#onetrust-accept-btn-handler');
      await page.waitForSelector('#onetrust-banner-sdk', { state: 'hidden', timeout: 5000 });
    } catch {
      // banner didn't appear
    }

    await page.waitForSelector('h1', { timeout: 15000 });

    await eyes.open(page, 'McLaren', 'Artura — full page', { width: 1440, height: 900 });
    await eyes.check('Artura full page', Target.window().fully());
  });
});

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
      // banner didn't appear
    }

    await page.waitForSelector('img.bg-image', { timeout: 15000 });

    await page.evaluate(() => {
      const img = document.querySelector('img.bg-image') as HTMLImageElement;
      if (img) img.src = 'https://cars-assets-production.mclaren.com/178/mclaren-750s-hero-mobile.jpg';
    });

    await eyes.open(page, 'McLaren', '750S — hero image ignored', { width: 1440, height: 900 });
    await eyes.check('750S hero', Target.window()
      .ignore(page.locator('img.bg-image').first())
    );
  });
});

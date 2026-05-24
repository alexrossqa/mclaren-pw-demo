import { test, expect } from '@playwright/test';
import {
  Eyes,
  Target,
  Configuration,
  BatchInfo,
  VisualGridRunner,
  BrowserType,
} from '@applitools/eyes-playwright';

async function loadArtura(page: any) {
  await page.goto('https://cars.mclaren.com/gl_en/artura', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 10000 });
    await page.click('#onetrust-accept-btn-handler');
    await page.waitForSelector('#onetrust-banner-sdk', { state: 'hidden', timeout: 5000 });
  } catch {
    // banner didn't appear
  }
  await page.waitForSelector('h1', { timeout: 15000 });
}

test.describe('Pixel diff — toHaveScreenshot()', () => {
  test.describe.configure({ retries: 0 });

  test('Artura — hero (pixel diff)', async ({ page }) => {
    await loadArtura(page);

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

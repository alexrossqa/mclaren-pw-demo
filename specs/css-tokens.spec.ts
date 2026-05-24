import { test, expect } from '@playwright/test';
import {
  SUPERCAR_PAGES,
  RACING_PAGES,
  type PageTokenSpec,
} from '../fixtures/token-specs';

function tokenSuite(pages: PageTokenSpec[]) {
  for (const pageSpec of pages) {
    test.describe(pageSpec.name, () => {
      for (const token of pageSpec.tokens) {
        test(token.description, async ({ page }) => {
          await page.goto(pageSpec.path, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector(token.selector, { timeout: 15000 });

          const actual = await page.evaluate(
            ({ selector, property }) => {
              const el = document.querySelector(selector);
              if (!el) throw new Error(`Element not found: ${selector}`);
              return (getComputedStyle(el) as CSSStyleDeclaration & Record<string, string>)[property];
            },
            { selector: token.selector, property: token.property }
          );

          expect(actual, `${token.selector} → ${token.property}`).toBe(token.expected);
        });
      }
    });
  }
}

test.describe('Supercars — token contracts', () => {
  tokenSuite(SUPERCAR_PAGES);
});

test.describe('Racing — token contracts', () => {
  tokenSuite(RACING_PAGES);
});

// To demo the failure, also add SUPERCAR_PAGES_WITH_FAILURE to the import above, then uncomment:
// test.describe('Cross-template failure demo', () => {
//   tokenSuite(SUPERCAR_PAGES_WITH_FAILURE);
// });

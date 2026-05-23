import { test, expect } from '@playwright/test';
import {
  SUPERCAR_PAGES,
  RACING_PAGES,
  SUPERCAR_PAGES_WITH_FAILURE,
  type PageTokenSpec,
} from '../fixtures/token-specs';

// ─── TOKEN TEST RUNNER ────────────────────────────────────────────────────────
// Loops over a page group and generates one test per token per page.
// Test names surface in the HTML report: "Artura > Primary CTA background"

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

// ─── SUITES ───────────────────────────────────────────────────────────────────

test.describe('Supercars — token contracts', () => {
  tokenSuite(SUPERCAR_PAGES);
});

test.describe('Racing — token contracts', () => {
  tokenSuite(RACING_PAGES);
});

// ─── DEMO FAILURE ─────────────────────────────────────────────────────────────
// Uncomment to show a racing page tested against the supercars token spec.
// Fails on fontFamily — report shows expected vs actual side by side.
// Re-comment to restore green.
//
// test.describe('Cross-template failure demo', () => {
//   tokenSuite(SUPERCAR_PAGES_WITH_FAILURE);
// });

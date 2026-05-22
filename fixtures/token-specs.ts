export interface TokenSpec {
  selector: string;
  property: string;
  expected: string;
  description: string;
}

export interface PageTokenSpec {
  name: string;
  path: string;
  tokens: TokenSpec[];
}

// ─── WHY getComputedStyle() ───────────────────────────────────────────────────
// Stylesheets declare intent. By the time the browser renders a page, the
// cascade has run, specificity has resolved, media queries have fired, and JS
// may have injected inline styles or mutated custom properties. getComputedStyle()
// interrogates the result of all of that — the actual rendered state, not the
// source. A CSS test that reads a file could pass while the page looks wrong.
//
// "We test what the browser rendered, not what we asked it to render."
// ─────────────────────────────────────────────────────────────────────────────

// ─── HOMEPAGE ────────────────────────────────────────────────────────────────
// Values below are placeholders — run recon in DevTools and replace.
// getComputedStyle() returns resolved values: rgb() not hex, px not rem.

const homepage: PageTokenSpec = {
  name: 'Homepage',
  path: '/',
  tokens: [
    {
      selector: 'body',
      property: 'fontFamily',
      expected: 'FILL_AFTER_RECON',
      description: 'Body font family',
    },
    {
      selector: 'body',
      property: 'backgroundColor',
      expected: 'FILL_AFTER_RECON',
      description: 'Page background (expect black or near-black)',
    },
    {
      selector: 'h1',
      property: 'color',
      expected: 'FILL_AFTER_RECON',
      description: 'H1 text colour',
    },
    {
      selector: 'h1',
      property: 'fontSize',
      expected: 'FILL_AFTER_RECON',
      description: 'H1 font size in px',
    },
    {
      selector: 'nav a',
      property: 'color',
      expected: 'FILL_AFTER_RECON',
      description: 'Nav link colour',
    },
  ],
};

// ─── CARS LISTING ─────────────────────────────────────────────────────────────

const carsListing: PageTokenSpec = {
  name: 'Cars listing',
  path: '/cars',
  tokens: [
    {
      selector: '.card-title, h2, h3',
      property: 'fontFamily',
      expected: 'FILL_AFTER_RECON',
      description: 'Card heading font — should match brand typeface',
    },
    {
      selector: 'button, .btn-primary, [class*="cta"]',
      property: 'backgroundColor',
      expected: 'FILL_AFTER_RECON',
      description: 'Primary CTA background (expect brand orange/red)',
    },
    {
      selector: 'button, .btn-primary, [class*="cta"]',
      property: 'color',
      expected: 'FILL_AFTER_RECON',
      description: 'Primary CTA text colour',
    },
  ],
};

export const PAGE_TOKEN_SPECS: PageTokenSpec[] = [homepage, carsListing];

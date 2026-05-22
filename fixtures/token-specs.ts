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
// Note: this site mixes Tailwind utilities AND custom BEM classes (e.g. btn--accent).
// getComputedStyle() doesn't care where the style came from — it reads the result.
//
// "We test what the browser rendered, not what we asked it to render."
// ─────────────────────────────────────────────────────────────────────────────

// ─── GROUP A: SUPERCARS ───────────────────────────────────────────────────────
// cars.mclaren.com/gl_en — Artura, Artura Spider, 750S, 750S Spider
// Values harvested via getComputedStyle() in Chrome DevTools console.
// getComputedStyle() returns resolved values: rgb() not hex, px not rem.

const supercarsTokens: TokenSpec[] = [
  {
    selector: 'body',
    property: 'fontFamily',
    expected: '"Noto Sans", ui-sans-serif, system-ui',
    description: 'Body font family',
  },
  {
    selector: 'h1',
    property: 'color',
    expected: 'rgb(255, 255, 255)',
    description: 'H1 text colour — white on dark background',
  },
  {
    selector: 'h1',
    property: 'fontSize',
    expected: '100px',
    description: 'H1 font size',
  },
  {
    selector: 'a.no-underline.btn--accent',
    property: 'backgroundColor',
    expected: 'rgb(243, 109, 30)',
    description: 'Primary CTA background — McLaren brand orange',
  },
  {
    selector: 'a.no-underline.btn--accent',
    property: 'color',
    expected: 'rgb(255, 255, 255)',
    description: 'Primary CTA text colour — white',
  },
  {
    selector: 'a.no-underline.btn--accent',
    property: 'letterSpacing',
    expected: '2px',
    description: 'CTA letter spacing',
  },
];

export const SUPERCAR_PAGES: PageTokenSpec[] = [
  { name: 'Artura',        path: 'https://cars.mclaren.com/gl_en/artura',        tokens: supercarsTokens },
  { name: 'Artura Spider', path: 'https://cars.mclaren.com/gl_en/artura-spider', tokens: supercarsTokens },
  { name: '750S',          path: 'https://cars.mclaren.com/gl_en/750s',          tokens: supercarsTokens },
  { name: '750S Spider',   path: 'https://cars.mclaren.com/gl_en/750s-spider',   tokens: supercarsTokens },
];

// ─── GROUP B: RACING (www.mclaren.com) ───────────────────────────────────────
// Different subdomain, different codebase — pure Tailwind, no BEM classes.
// Key difference: font stack includes "Noto Sans Fallback" which cars.mclaren.com omits.
// Brand orange is named "papaya" in their Tailwind config (bg-papaya).
//
// DEMO FAILURE: RACING_PAGES[0] is also added to SUPERCAR_PAGES below.
// It will fail the fontFamily assertion — expected vs actual shown in the report.
// Remove it from SUPERCAR_PAGES to restore green.

const racingTokens: TokenSpec[] = [
  {
    selector: 'body',
    property: 'fontFamily',
    expected: '"Noto Sans", "Noto Sans Fallback", ui-sans-serif, system-ui',
    description: 'Body font family — includes Noto Sans Fallback (absent on cars subdomain)',
  },
  {
    selector: 'h1',
    property: 'color',
    expected: 'rgb(0, 0, 0)',
    description: 'H1 text colour — black on light background (differs from supercars)',
  },
];

export const RACING_PAGES: PageTokenSpec[] = [
  { name: 'Racing', path: 'https://www.mclaren.com/racing/', tokens: racingTokens },
];

// ─── INTENTIONAL FAILURE ─────────────────────────────────────────────────────
// Racing page slipped into the supercars spec.
// fontFamily will fail: supercars expects no "Noto Sans Fallback" in the stack.
// This demonstrates that the token contract catches cross-template contamination.

export const SUPERCAR_PAGES_WITH_FAILURE: PageTokenSpec[] = [
  ...SUPERCAR_PAGES,
  { name: 'Racing (wrong group)', path: 'https://www.mclaren.com/racing/', tokens: supercarsTokens },
];

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

export const SUPERCAR_PAGES_WITH_FAILURE: PageTokenSpec[] = [
  ...SUPERCAR_PAGES,
  { name: 'Racing (wrong group)', path: 'https://www.mclaren.com/racing/', tokens: supercarsTokens },
];

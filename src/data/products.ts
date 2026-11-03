/**
 * Product registry — the single source for every product name, URL, step,
 * one-liner, chip and status line on the site (build plan §8.1, §8.2).
 *
 * The nav, footer, ProductGrid, ProductCard, StatusChip, SolutionProducts and
 * the product pages all read from here. Never hard-code a product name,
 * one-liner or chip in a page.
 *
 * Draft products (draft: true) are left out of the nav, footer, grids,
 * sitemap and internal links. Their copy is not approved yet, so their
 * oneLiner, chip, statusLine and navDescription are null and never render on
 * a non-draft surface.
 */

export type Step = 'accept' | 'issue' | 'convert';
export type ChipTone = 'live' | 'neutral';

export type ProductSlug =
  | 'pay-by-bank'
  | 'pay-by-crypto'
  | 'digital-cash'
  | 'tokenization'
  | 'real-world-assets'
  | 'on-chain-fx'
  | 'walletless-settlement'
  | 'blockchain-connector';

export interface Product {
  slug: ProductSlug;
  name: string;
  step: Step;
  /** Card one-liner, exact from §8.1. Null while the product is a draft without approved copy. */
  oneLiner: string | null;
  /**
   * Status chip text. Only Pay by Bank (live) and Pay by Crypto (in build) carry one; the other
   * products are presented as working infrastructure, delivered per engagement.
   */
  chip: string | null;
  /** "live" only for Pay by Bank; every other chip is neutral (§7.5). */
  chipTone: ChipTone;
  /** Status line on the product page, exact from §8.2. */
  statusLine: string | null;
  url: string;
  /** Short description in the Products dropdown (nav-and-footer.md S2). */
  navDescription: string | null;
  draft: boolean;
}

export const steps: { id: Step; label: string; number: string }[] = [
  { id: 'accept', label: 'Accept', number: '01' },
  { id: 'issue', label: 'Issue', number: '02' },
  { id: 'convert', label: 'Convert & settle', number: '03' },
];

export const products: Product[] = [
  {
    slug: 'pay-by-bank',
    name: 'Pay by Bank',
    step: 'accept',
    oneLiner: 'A better way for UK and European merchants to get paid.',
    chip: 'Live · UK and EU',
    chipTone: 'live',
    statusLine: 'Live in the UK and the EU. Payouts are in pilot, activated per named merchant.',
    url: '/products/pay-by-bank',
    navDescription: 'Get paid straight from bank accounts.',
    draft: false,
  },
  {
    slug: 'pay-by-crypto',
    name: 'Pay by Crypto',
    step: 'accept',
    oneLiner: 'Let customers pay in supported digital assets, with a defined route to ordinary money.',
    chip: 'In build',
    chipTone: 'neutral',
    statusLine: 'In build. Not available yet, and unpriced until it goes live.',
    url: '/products/pay-by-crypto',
    navDescription: 'Accept supported digital assets at checkout.',
    draft: false,
  },
  {
    slug: 'digital-cash',
    name: 'Digital Cash',
    step: 'issue',
    oneLiner: 'Issue for the payment. Not for a market you first have to build.',
    chip: null,
    chipTone: 'neutral',
    statusLine: 'Issuer and route are agreed per engagement.',
    url: '/products/digital-cash',
    navDescription: 'Issue digital money for a defined payment.',
    draft: false,
  },
  {
    slug: 'tokenization',
    name: 'Tokenization',
    step: 'issue',
    oneLiner: null,
    chip: null,
    chipTone: 'neutral',
    statusLine: null,
    url: '/products/tokenization',
    navDescription: null,
    draft: true,
  },
  {
    slug: 'real-world-assets',
    name: 'Real-world assets',
    step: 'issue',
    oneLiner: null,
    chip: null,
    chipTone: 'neutral',
    statusLine: null,
    url: '/products/real-world-assets',
    navDescription: null,
    draft: true,
  },
  {
    slug: 'on-chain-fx',
    name: 'On-chain FX',
    step: 'convert',
    oneLiner: 'Convert and move value across currencies and chains.',
    chip: null,
    chipTone: 'neutral',
    statusLine: 'Conversion between networks delivered for clients. Corridors are scoped per engagement.',
    url: '/products/on-chain-fx',
    navDescription: 'Convert value across currencies and chains.',
    draft: false,
  },
  {
    slug: 'walletless-settlement',
    name: 'Walletless Settlement',
    step: 'convert',
    oneLiner: 'A conversion layer for banks whose clients are paid in stablecoins.',
    chip: null,
    chipTone: 'neutral',
    statusLine: 'Scoped per engagement and proven on your route before it goes live.',
    url: '/products/walletless-settlement',
    navDescription: 'Stablecoins in, ordinary money on the account.',
    draft: false,
  },
  {
    slug: 'blockchain-connector',
    name: 'Blockchain Connector',
    step: 'convert',
    oneLiner: 'The integration layer that makes a settlement-network membership usable.',
    chip: null,
    chipTone: 'neutral',
    statusLine: 'Each engagement starts with a pilot.',
    url: '/products/blockchain-connector',
    navDescription: 'Make a settlement-network membership usable.',
    draft: false,
  },
];

/** The product for a slug. Throws on an unknown slug so typos fail the build. */
export function getProduct(slug: ProductSlug | string): Product {
  const p = products.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown product slug: ${slug}`);
  return p;
}

/** Products that may appear on public surfaces (nav, footer, grids, links). */
export function visibleProducts(): Product[] {
  return products.filter((p) => !p.draft);
}

/** Visible products of one step, in registry order. */
export function productsByStep(step: Step, includeDrafts = false): Product[] {
  return products.filter((p) => p.step === step && (includeDrafts || !p.draft));
}

/** Visible products grouped by step, in step order, skipping empty groups. */
export function productGroups(includeDrafts = false) {
  return steps
    .map((s) => ({ ...s, products: productsByStep(s.id, includeDrafts) }))
    .filter((g) => g.products.length > 0);
}

/** URLs of draft product pages — excluded from the sitemap. */
export const draftUrls: string[] = products.filter((p) => p.draft).map((p) => p.url);

/** True when a path is a draft product page. */
export function isDraftPath(path: string): boolean {
  return draftUrls.includes(path.replace(/\.html$/, '').replace(/\/+$/, ''));
}

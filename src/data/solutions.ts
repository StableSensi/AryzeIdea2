/**
 * Solution registry — the five solution pages (nav-and-footer.md S3,
 * short lines from home.md S5). Read by the nav, footer and any solution grid.
 */
export interface Solution {
  slug: 'banks-emis' | 'psps-fintechs' | 'igaming' | 'issuers' | 'treasury';
  name: string;
  url: string;
  /** Short card line (home.md S5). */
  shortLine: string;
}

export const solutions: Solution[] = [
  {
    slug: 'banks-emis',
    name: 'Banks & EMIs',
    url: '/solutions/banks-emis',
    shortLine: "Turn clients' stablecoins into ordinary money, and cover corridors the incumbent rails don't.",
  },
  {
    slug: 'psps-fintechs',
    name: 'PSPs & payment platforms',
    url: '/solutions/psps-fintechs',
    shortLine: 'Add the payment type, market or route your merchants need.',
  },
  {
    slug: 'igaming',
    name: 'iGaming operators',
    url: '/solutions/igaming',
    shortLine: "Take deposits straight from players' bank accounts, live in the UK and the EU.",
  },
  {
    slug: 'issuers',
    name: 'Stablecoin & token issuers',
    url: '/solutions/issuers',
    shortLine: 'Issue digital cash, or move the money you already issue across currencies and networks.',
  },
  {
    slug: 'treasury',
    name: 'Corporate Treasury',
    url: '/solutions/treasury',
    shortLine: 'Move money between group entities, or pay a supplier in its own currency.',
  },
];

export function getSolution(slug: Solution['slug'] | string): Solution {
  const s = solutions.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown solution slug: ${slug}`);
  return s;
}

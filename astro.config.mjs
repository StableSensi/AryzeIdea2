// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { draftUrls } from './src/data/products.ts';

// Draft product pages (registry draft: true) stay out of the sitemap.
const DRAFT_PATHS = draftUrls;

// Permanent redirects (build plan §7.4). Mirrored in vercel.json for the host.
/** @type {Record<string, { status: 308; destination: string }>} */
const redirects = {
  '/products/pay-by-wallet': { status: 308, destination: '/products/pay-by-crypto' },
  '/products/trading-fx': { status: 308, destination: '/products/on-chain-fx' },
  '/platform': { status: 308, destination: '/how-it-works' },
};

export default defineConfig({
  site: 'https://aryze-website-2-0.vercel.app',
  trailingSlash: 'never',
  build: { format: 'file' },
  redirects,
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\.html$/, '').replace(/\/+$/, '');
        return !DRAFT_PATHS.includes(path) && !Object.keys(redirects).includes(path);
      },
    }),
  ],
});

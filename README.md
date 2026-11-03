# Aryze website

The Aryze website, built with [Astro](https://astro.build). One product catalogue, grouped by what the money has to do (Accept · Issue · Convert & settle), on top of MoneyOS, the infrastructure under every product.

## Run it

Needs Node 22.23 or newer.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serves dist/
npm run check     # type check
```

## Branches

- `main` is a replica of the site as it was on 2 November 2026.
- `rebuild/founder-lineup` is the new site.

## Where things live

| What | Where |
|---|---|
| Pages, one file per URL | `src/pages/` |
| Shared components | `src/components/` |
| Product names, one-liners, status chips and drafts | `src/data/products.ts` — the single source; never hard-code a product name or chip in a page |
| Solution pages | `src/data/solutions.ts` |
| Contact address, form endpoint, menu links | `src/data/site.ts` |
| Global styles and design tokens | `src/styles/global.css` |
| Page shell: head, header, footer, `noindex` | `src/layouts/Base.astro` |
| Redirects from old URLs | `vercel.json` |
| Images, videos and partner logos | `public/` |
| Build notes and the first QA report | `docs/` |

The approved copy for every page lives in the Aryze knowledge base (`Marketing/Website/Copy/`). Change it there first, then here.

## House rules the site follows

- Status chips appear only on Pay by Bank ("Live · UK and EU") and Pay by Crypto ("In build").
- Tokenization and Real-world assets are drafts (`draft: true` in `src/data/products.ts`). They stay out of the menus, grids and sitemap and are `noindex` until the founder's copy is approved.
- Partner logos (Mastercard, Grant Thornton, softstack) are used as supplied. Never recolour or crop them.
- The licensed partner behind Pay by Bank is never named on the site.

## Contact forms

Contact and Consulting share `src/components/ContactForm.astro`. Submissions go to Formspree: set `formEndpoint` in `src/data/site.ts` to the form's address (`https://formspree.io/f/…`). While it is empty, the form opens the visitor's email app, addressed to info@aryze.io.

## Before launch

1. Set `formEndpoint` in `src/data/site.ts`.
2. Set `site` in `astro.config.mjs` to the production domain. Canonical URLs and the sitemap use it.
3. Turn indexing on: in `src/layouts/Base.astro`, change the `noindex` default from `true` to `false`. Draft pages stay `noindex`.
4. Add `public/robots.txt` with `Sitemap: https://<domain>/sitemap-index.xml`.
5. Connect this repository to the Vercel project and set its production branch.

# Rebuild notes — Aryze website

This is a Path B rebuild (build plan §4): the source of the live site `aryze-website-2-0.vercel.app` was not available, so this Astro 7 project was rebuilt from the production HTML, CSS and JS captured on 2 November 2026.

- **`main`** holds a faithful replica of today's live site. It matches the live screenshots pixel for pixel at 1280 px and 375 px, and the visible text, attributes and computed styles match too.
- **`rebuild/founder-lineup`** is where Stage 2 builds the new site.

## Commands

```bash
npm install            # PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 — screenshots use system Chrome
npm run dev            # http://localhost:4321
npm run build          # static output in dist/ (build.format 'file', trailingSlash 'never')
npm run preview        # serves dist/ — Astro 7 allows one preview server per project
npm run check          # astro check
node scripts/screens.mjs <baseUrl> <outDir> <paths...>   # full-page PNGs at 1280 and 375, flags horizontal overflow
```

## Reference material — `_reference/` (local only, not in the repo)

- `live/*.html` — production HTML of every page (file name is the path with `/` replaced by `__`).
- `live/assets/` — production CSS and JS bundles, fonts, images and videos.
- `screens/` — live screenshots at 1280 px and 375 px. `rebuild-screens/` — the same captures of this project.

## Where things live

| What | Where |
|---|---|
| Global styles, tokens (`:root`, build plan §8.7), fonts (`@fontsource-variable/geist`, `geist-mono`) | `src/styles/global.css` |
| Page shell: `<head>`, `ClientRouter`, JSON-LD, Header, `<main>`, Footer, motion script | `src/layouts/Base.astro` — props `title` (full title, used verbatim), `description`, `ogImageAlt?`, `noindex?` (default true, as live), slot `head` |
| Blog article shell | `src/layouts/BlogPost.astro` — props `title`, `lede`, `category`, `date`, `readTime`, `sourceUrl` |
| Nav | `src/components/Header.astro` + `src/scripts/main-menu.ts` |
| Footer | `src/components/Footer.astro` |
| Shared components | `src/components/` — Logo, PageHero, LivingPhoto, CtaPanel, PuzzleJoin, SettlementFlow |
| Page-only components | `src/components/pages/<group>/` — house (RouteBankFit, RouteSelector, TrustFit), products (Calculator, RouteFlowJoin, ApplicationTriangle), solutions (BankAssembly, MerchantRoute, TreasuryCaseRoute), trust-blog (BlogCard) |
| Pages | `src/pages/` — one `.astro` file per URL |
| Static assets | `public/` — `brand/`, `images/`, `videos/`, `og.png` |

## How a page is composed

```astro
---
import Base from '../layouts/Base.astro';
import PageHero from '../components/PageHero.astro';
import CtaPanel from '../components/CtaPanel.astro';
---
<Base title="X — Aryze" description="…">
  <PageHero tone="blue" eyebrow="…" title="…" lede="…" chips={[…]} image={{ src, alt, position }} video="/videos/…mp4" />
  <section class="section">…page markup, with its own scoped <style>…</section>
  <CtaPanel title="…" text="…" primary={{ label, href }} secondary={{ label, href }} />
</Base>
```

- Write section heads and eyebrows directly in the page. Do not wrap them in a style-less component, or the page's scoped styles stop applying.
- When a page styles elements that a shared component renders (`.puzzle-join`, `.living-photo`), use `:global(...)`.
- Keep `global.css` as the first import in `Base.astro`, so the CSS order matches live.

**Global classes available to pages:** `.container`, `.section` (`--tight`, `--card`, `--alt`, `--accent`, `--sand`, `--ink`), `.section-head`, `.eyebrow`, `.lede`, `.muted`, `.mono`, `.btn` (`--primary`, `--ghost`, `--lg`), `.btn-row`, `.arrow-link`, `.grid` (`--2`, `--3`, `--4`), `.card` (`--ink`), `.chip` (`--live`, `--partner`, `--pending`), `.chip-row`, `.verb`, `.steps`, `.features`, `.tile`, `.prose`, `.two-col`, `.divider`, `.photo`, `.photo-card`, `.used-band`, `.solution-photo`, and the `route-*` set (`.route-grid`, `.route-panel`, `.route-number`, `.route-flow`, `.route-note`, `.route-evidence` fold-out, `.route-amounts`, `.route-proof-list`, `.route-proof-label`, `.mechanism-explainer`).

## Shared component props

- **PageHero:** `eyebrow`, `title` (a literal `\n` is kept), `lede`, `tone?` (`plain` | `blue` | `sand` | `ink`), `chips?` (`{label, status?: 'live' | 'partner' | 'pending'}[]`), `image?` (`{src, alt, width?, height?, position?}`), `video?`, `videoPosition?`. A default slot sits after the chips.
- **LivingPhoto:** `src`, `position?`, `radius?`, `transfers?`. A lazy video overlay on a still image, which pauses under reduced motion.
- **CtaPanel:** `title`, `text`, `primary?` (default Talk to Aryze → `/contact`), `secondary?` (default How it fits → `/platform`).
- **PuzzleJoin:** `direction` (`up` | `right` | `down` | `left`), `x?`, `y?`. The parent must be `position: relative`.
- **SettlementFlow:** `rate?` (default 1.18), `amount?`. The `<aryze-settlement-flow>` custom element on `/platform`.

## Interactive scripts

| Script | Where | Notes |
|---|---|---|
| ClientRouter view transitions | `<ClientRouter />` in `Base.astro` | Every script re-initialises on `astro:page-load` and tears down on `astro:before-swap` |
| Menu | `src/scripts/main-menu.ts`, plus an `is:inline data-astro-rerun` pre-paint snippet in `Header.astro` | On desktop the `<details>` stays open; on mobile it collapses. One dropdown opens at a time. It closes on an outside click, when focus leaves it, or on Escape |
| Motion | `src/scripts/motion.ts` | Reveal-on-scroll (`.reveal`, `.is-in`), the `.site-header.is-scrolled` toggle, and re-adding `html.js` after each swap |
| LivingPhoto | `src/scripts/living-photo.ts` | In-view gating, a fade-in on the first frame, a pause/play toggle, and the office clip at 4× speed |
| SettlementFlow | `src/scripts/settlement-flow.ts` | A custom element with staged animation that autoplays at 60 % in view |
| Calculator | `src/components/pages/products/Calculator.astro` | Plan §8.5. The defaults give £72,000 for card, £30,000 for bank and £42,000 a year difference. The fee assumptions sit in a `<details>`. Checked against live in 12 scenarios |
| Fold-outs | native `<details>` (`.route-evidence`, `.fee-assumptions`, company) | No script |

## Known differences from live

- The `data-astro-cid` hashes differ for CtaPanel, BlogPost and the page-scoped styles. This is cosmetic.
- The motion script is a bundled module rather than live's inline script, and the calculator script is a processed module rather than an inline IIFE. Behaviour is the same.
- The unscoped `route-*` stylesheet that live inlined on 12 pages now sits at the end of `global.css`.

## Content carried over from live, which Stage 2 replaces

The replica copies today's wording exactly, including text that the rules now forbid. The Pay by Bank lede and the trust pages name the licence partner, and the old products (Pay by Crypto at `/products/pay-by-wallet`, "Digital cash", FX at `/products/trading-fx`) and the "missing piece" framing are all still there. `/privacy` is also missing a space before its two mailto links.

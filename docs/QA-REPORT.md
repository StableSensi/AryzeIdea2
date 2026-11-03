> Historical QA record of the first build (2 November 2026). The screenshots it links to are kept locally in `qa-screens/` and are not in the repo.

# QA report: rebuild/founder-lineup (B5)

> **Update after B5 (session).** All three shared-component requests are applied, so **all 12 items now pass**:
> - **Item 7:** `BlogPost` takes `metaDescription`. The vs-card-fees post uses the first sentence of its own lede (102 characters, today's wording).
> - **Item 3:** the Company dropdown is right-anchored on desktop and spans 791–1111 px at 1280 (checked in the browser).
> - **Item 10:** the SettlementFlow amount field has a visible `:focus-visible` outline.
>
> `astro check` reports 0 errors and the build passes with 25 pages. The B5 text below is unchanged.

Checked 2 November 2026 against build plan §7.6. The build went to a scratch folder and was served by `scripts/serve-dist.mjs`, which applies the `vercel.json` redirects. Browser checks ran in Playwright with system Chrome.

**Summary.** 11 of 12 items pass. Item 7 fails on one page: the meta description of `/blog/pay-by-bank-vs-card-fees` is 169 characters, and only a change to the shared layout can fix it. I found no hard-ban hits, no broken links or anchors, no horizontal scroll and no new third-party requests. The calculator matches §8.5. I fixed two page files. I found one visible defect in a shared component: the Company dropdown runs 38 px past the right edge of the viewport at every desktop width.

## Results

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Build + astro check | **Pass** | `astro build` built 25 pages. `astro check` reported 0 errors, 0 warnings and 0 hints on 78 files, both before and after my fixes. |
| 2 | Internal links, anchors, redirects | **Pass** | I crawled every `href` on all 25 rendered pages, `#anchors` across pages included (`/how-it-works#evidence`, `/products/pay-by-bank#calculator`, `/solutions/psps-fintechs#merchant-flows`, `#products`, `#main-content`). Nothing is missing and no link points to a redirect source. Through vercel.json, `/products/pay-by-wallet`, `/products/trading-fx` and `/platform` each return **308** to `/products/pay-by-crypto`, `/products/on-chain-fx` and `/how-it-works`, and following them ends at 200. The `redirects` in `astro.config.mjs` are the same three pairs with status 308. |
| 3 | 375 / 1280, nav, mobile menu | **Pass** (one shared defect) | No page scrolls sideways at 375 px or 1280 px. I also checked 320, 768 and 1024 px. No console errors. **Mouse:** Products, Solutions and Company each open, only one is open at a time, an outside click closes them, and a link navigates. **Keyboard:** Tab reaches the summary, Enter opens it, Tab moves into the panel with a 2 px ring, Escape closes it and returns focus, and tabbing out closes it. **Touch** at 1280 (hasTouch) and at 375 (isMobile): tap opens and closes, tapping outside closes. **Mobile menu:** a tap opens and closes it, Escape closes it, and it closes after navigation. **Defect:** the Company panel sits at 998 to 1318 px in a 1280 px viewport, so its right edge is cut off ([screenshot](qa-screens/)). This is in Header.astro and is listed under shared requests. |
| 4 | §8.6 hard bans | **Pass** | Zero hits in all HTML and the sitemap, covering visible text, attributes, meta and inline code. "Aryze Pay" is allowed only as "Aryze Payments" (4 hits). The plain substring `DeFi` matches only "define/defined", and a word-boundary search finds 0. The review-list verdicts are below. |
| 5 | Chips per §8.2, registry only | **Pass** | Product cards: home has 6, pay-by-crypto 3, issuers 2 and treasury 2, and every chip is exact. Every product page has its exact chip in the hero, plus its §8.2 status line and §8.1 one-liner. No page or component hard-codes a chip string or one-liner (grep of `src/`). The only matches are front-matter meta descriptions from the copy files. I fixed one hard-coded status line on igaming (see Fixes). |
| 6 | Drafts hidden + noindex | **Pass** | "Tokenization" and "Real-world assets" appear on no non-draft page: not in the nav, footer, grids, any link or the sitemap. Both draft pages have `noindex, follow`. `<NEEDS …>` text appears only on these two pages. |
| 7 | Meta title ≤ 60, description ≤ 155, unique | **Fail (1 page)** | All 22 indexed pages match their copy file's `meta_title` and `meta_description` exactly. `/blog/pay-by-bank-vs-card-fees` had a 71-character title, which I fixed (now 33). Its description is still **169** characters, because BlogPost uses the lede as the description (shared request). The two draft pages share the description `<NEEDS FOUNDER>`, which is allowed on drafts. |
| 8 | Sitemap | **Pass** | `sitemap-0.xml` lists exactly the 22 non-draft pages. It has no drafts, no redirect sources and no 404. |
| 9 | No new third-party requests | **Pass** | Home: rebuild 12 requests, all to its own host. Live: 12 requests, all to its own host. The resource-type mix is the same. Pay by Bank gives the same result (11 against 11). Fonts are self-hosted Geist and Geist Mono woff2. There is no analytics, and no external `src`, `preconnect` or JS URL. |
| 10 | Accessibility | **Pass** (one minor shared note) | Every page has exactly one h1 and no skipped heading levels. Every focusable element shows a visible ring. The pay-by-bank triangle uses an SVG focus outline, which I checked visually. Every fold-out (`details`) opens and closes with Enter and Space. Images have alt text. The one empty alt, on the home city band, sits inside `aria-hidden`. Chip contrast is **14.75:1** for live (navy on mint) and **14.07:1** for neutral (muted on white). Minor: on how-it-works, the SettlementFlow amount input shows focus only as a bottom-border colour change (shared note). |
| 11 | Calculator | **Pass** | Without JS, and with JS at the defaults, it shows **£42,000** less per year, with card £72,000 and bank £30,000 (1.5% + £0.00 against 0% + £0.50). Monthly shows £3,500, £6,000 and £2,500. At a £20 average it shows "£12,000 more per year with bank payments", so it says when cards are cheaper. Equal costs give "same estimated cost". Invalid input hides the result and shows an error. The sliders work by keyboard. The disclaimer text is word for word. |
| 12 | Copy fidelity | **Pass** | I compared rendered text section by section for **home, pay-by-bank, solutions/banks-emis and solutions/igaming** in full, and by script for all 20 copy-backed pages. Every heading, line, list item, fold-out (opened) and CTA is present, and CTA targets match. The only differences are intended: draft products are hidden, the how-it-works heading drops the count as its builder-note says, and the widget's default direction is GBP→EUR, so it reads "GBP burned → Recorded → EUR minted", which its builder-note allows. |

### Review-list hits (item 4)

| Page | Word | Context | Verdict |
|---|---|---|---|
| /solutions/banks-emis | instant ×2 | "Currency pairs outside the free instant rails… Where a free instant rail already covers the pair, that rail wins." | Correct. It sells coverage against the incumbent rails, not speed. |
| /products/digital-cash | instant | "does not make bank legs atomic or guarantee instant account credit" | Correct. It is a limit. |
| /products/pay-by-bank | instant(ly) | "See the cost difference instantly." (calculator) | Correct. It is UI copy. |
| /blog/…already-in-your-pocket | real time ×2 | "Funds move in real time or near real time, depending on the payment rail" | Correct. It is Pay by Bank, not On-chain FX. |
| /products/pay-by-bank | payout ×3 | Status line, "Payouts are in pilot", "Payouts · Pilot, activated per named merchant" | Correct. Pilot is stated. |
| /solutions/igaming | payout ×5 | Meta "Payouts in pilot"; chips "Payouts pilot, per named operator" and "Pilot"; limits "Payouts are in pilot…" | Correct. Pilot is stated each time. |
| /how-it-works, /solutions/banks-emis, /products/on-chain-fx | payout | A route step in the sandbox record ("Funding, conversion and payout") | Correct. It is not a Pay by Bank capability (how-it-works builder-note). |
| /how-it-works, /solutions/banks-emis, /solutions/psps-fintechs, blog | journey | "recorded journey", "end-to-end journey", "Different journeys", "payment journey" | KEEP (approved). |
| /contact, /solutions/banks-emis | missing piece | "What's your missing piece?", "We will map the missing piece." | KEEP (approved). |
| /solutions/issuers | smart money ×2 | "Make your smart money work further.", "Discuss your smart money" | KEEP (approved). |
| /solutions/issuers | ecosystem | "move through a selected payment ecosystem" | Acceptable. It is literal. |
| /privacy | invest(igation) | "fault investigation" | Not about investing. |

No review-list word describes On-chain FX as fast.

## Fixes made (page files only)

1. `src/pages/blog/pay-by-bank-vs-card-fees.astro`: added `metaTitle="Pay by Bank vs. Card Fees — Aryze"`. The title went from 71 characters to 33. The visible h1 is unchanged.
2. `src/pages/solutions/igaming.astro`: the Crypto acceptance status row hard-coded Pay by Crypto's §8.2 status line. It now reads `payByCrypto.statusLine` from the registry. The rendered text is identical.

## Open issues

- **Blog vs-card-fees meta description is 169 characters**, over the 155 limit. It needs the shared change below. Suggested value, cut from the lede without new wording: "In this illustration, a £0.50 flat Pay by Bank fee breaks even with a 1.5% card rate at about £33." (99 characters). No copy file defines this post's meta, so Rabii should approve the value.
- **The Company dropdown overflows the viewport** by 38 px at every width above 1000 px. Live does not have this problem. Shared change below.
- The draft pages share one description (`<NEEDS FOUNDER>`). This is acceptable while they are drafts and noindex. It resolves when the founder's copy arrives.
- Possible typo, not changed: the vs-card-fees blog body uses US "math" in five places ("The math is simple enough…", "What the math actually tells you"). §3.12 asks for British English ("maths"). This is a wording change, so it needs Rabii's approval.

## Shared-component requests

| File | Change needed |
|---|---|
| `src/components/Header.astro` | In the desktop styles, anchor the last dropdown's panel to the right, for example `.nav-dropdown:last-of-type .nav-panel { left: auto; right: 0; }`, or add a `nav-dropdown--end` class on Company. Today the Company panel spans 998 to 1318 px at 1280 px and 1078 to 1398 px at 1440 px. |
| `src/layouts/BlogPost.astro` | Add an optional `metaDescription?: string` prop and pass `description={metaDescription ?? lede}` to Base. The vs-card-fees post can then set a description of 155 characters or fewer. |
| `src/components/SettlementFlow.astro` (optional) | `.amount:focus` shows focus only as a bottom-border colour change. Add `.amount:focus-visible { outline: 2px solid #007599; outline-offset: 4px; }` to match the widget's other controls. This is carried over from live, so it is low priority. |

## Launch items (not failures)

- **Site-wide `noindex, follow`** comes from the Base default, the same as today's live site. Switch it to indexable on non-draft pages at launch, and keep `noindex` on the drafts.
- `astro.config.mjs` `site` is still `https://aryze-website-2-0.vercel.app`, so the canonicals, `og:url` and sitemap URLs point there. Set it to the production domain at launch.
- There is no `robots.txt` and no `<link rel="sitemap">`. At launch, add `public/robots.txt` with a `Sitemap: …/sitemap-index.xml` line.
- Astro also writes meta-refresh stubs (`platform.html`, `pay-by-wallet.html`, `trading-fx.html`). On Vercel, the `vercel.json` 308s run first. The stubs are noindex and stay out of the sitemap.

## Screenshots

| Page | 375 px | 1280 px |
|---|---|---|
| Home | [index-375](qa-screens/index-375.png) | [index-1280](qa-screens/index-1280.png) |
| Pay by Bank | [pay-by-bank-375](qa-screens/products__pay-by-bank-375.png) | [pay-by-bank-1280](qa-screens/products__pay-by-bank-1280.png) |
| Banks & EMIs | [banks-emis-375](qa-screens/solutions__banks-emis-375.png) | [banks-emis-1280](qa-screens/solutions__banks-emis-1280.png) |

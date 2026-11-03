/**
 * Motion runtime: auto-tags reveal elements, staggers them per parent and
 * reveals them as they scroll into view; toggles the header shadow on scroll.
 *
 * Runs on initial load and after every ClientRouter swap (astro:page-load).
 * The `js` class on <html> gates the hidden "before reveal" state, so no-JS
 * and reduced-motion visitors always see everything. ClientRouter replaces
 * the <html> attributes on each swap, so the class is re-added after swaps.
 */
const REVEAL_SELECTOR = [
  '.section-head',
  '.card',
  '.tile',
  '.steps li',
  '.photo',
  '.photo-card',
  '.member',
  '.matrix-wrap',
  '.lines-card',
  '.rail-col',
  '.rail-core',
].join(', ');

let observer: IntersectionObserver | undefined;
let scrollBound = false;

function markJs() {
  document.documentElement.classList.add('js');
}

function updateHeaderShadow() {
  document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 8);
}

function run() {
  markJs();
  observer?.disconnect();
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Tag reveal targets and give each a stagger index within its parent (max 7).
  const perParent = new Map<Element | null, number>();
  document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
    if (el.closest('footer') || el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    const parent = el.parentElement;
    const index = perParent.get(parent) ?? 0;
    el.style.setProperty('--ri', String(Math.min(index, 7)));
    perParent.set(parent, index + 1);
  });

  const io = (observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  ));
  document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el));

  if (!scrollBound) {
    scrollBound = true;
    addEventListener('scroll', updateHeaderShadow, { passive: true });
  }
  updateHeaderShadow();
}

export function initMotion() {
  markJs();
  document.addEventListener('astro:after-swap', markJs);
  document.addEventListener('astro:page-load', run);
  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run, { once: true });
}

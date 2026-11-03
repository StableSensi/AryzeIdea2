// Full-page screenshots at 1280 px and 375 px.
// Usage: node scripts/screens.mjs <baseUrl> <outDir> [path ...]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [base = 'http://localhost:4321', out = '_reference/screens', ...paths] = process.argv.slice(2);
const pages = paths.length ? paths : ['/'];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
for (const width of [1280, 375]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const name = (p.replace(/^\//, '').replace(/\//g, '__') || 'index') + `-${width}.png`;
    await page.screenshot({ path: `${out}/${name}`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`${name}${overflow ? '  ⚠ horizontal overflow' : ''}`);
  }
  await ctx.close();
}
await browser.close();

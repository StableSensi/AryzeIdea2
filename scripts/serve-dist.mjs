// Static server for a build folder, mapping /path to /path.html (build.format 'file').
// Honours vercel.json redirects so QA can test them. Usage: node scripts/serve-dist.mjs <dir> <port>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const [dir = 'dist', port = '4321'] = process.argv.slice(2);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
const redirects = existsSync('vercel.json') ? (JSON.parse(readFileSync('vercel.json', 'utf8')).redirects ?? []) : [];

const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const r = redirects.find((x) => x.source === path);
  if (r) { res.writeHead(r.permanent === false ? 307 : 308, { Location: r.destination }); return res.end(); }
  const base = normalize(join(dir, path));
  for (const p of [base, base + '.html', join(base, 'index.html')]) {
    if (await isFile(p)) {
      res.writeHead(200, { 'Content-Type': types[extname(p)] ?? 'application/octet-stream' });
      return res.end(await readFile(p));
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(await isFile(join(dir, '404.html')) ? await readFile(join(dir, '404.html')) : 'Not found');
}).listen(Number(port), () => console.log(`serving ${dir} on http://localhost:${port}`));

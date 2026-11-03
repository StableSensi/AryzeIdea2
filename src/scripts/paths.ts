/**
 * Normalise a URL pathname for comparisons: drop a trailing ".html"
 * (build.format "file") and any trailing slash, keeping "/" for home.
 */
export function normalizePath(pathname: string): string {
  let p = pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

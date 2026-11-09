// Serveur statique minimal pour les tests E2E : sert le build de production
// sous le préfixe /daily-timer-simple/, comme GitHub Pages.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('dist/daily-timer-simple/browser');
const prefix = '/daily-timer-simple';
const port = 4300;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  if (pathname === '/') {
    res.writeHead(302, { location: `${prefix}/` }).end();
    return;
  }
  if (!pathname.startsWith(`${prefix}/`)) {
    res.writeHead(404).end();
    return;
  }
  let relative = pathname.slice(prefix.length);
  if (relative.endsWith('/')) {
    relative += 'index.html';
  }
  const file = normalize(join(root, relative));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port}${prefix}/`);
});

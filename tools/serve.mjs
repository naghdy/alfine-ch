#!/usr/bin/env node
/**
 * Minimal static server for previewing ./_site locally (Node built-ins only).
 *   node tools/serve.mjs [port]     default port 8080
 * Mirrors GitHub Pages behaviour: /path/ serves /path/index.html and unknown
 * paths return /404.html with status 404.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../_site/', import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 8080);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

async function resolve(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, safe);
  if (!file.startsWith(root)) return null;
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  // Like GitHub Pages, redirect /de to /de/.
  if (!extname(pathname) && !pathname.endsWith('/') && (await resolve(`${pathname}/`))) {
    res.writeHead(301, { Location: `${pathname}/` }).end();
    return;
  }
  const file = await resolve(pathname);
  const status = file ? 200 : 404;
  const body = await readFile(file || join(root, '404.html'));
  res.writeHead(status, { 'Content-Type': types[file ? extname(file) : '.html'] || 'application/octet-stream' });
  res.end(body);
}).listen(port, () => console.log(`Serving _site at http://localhost:${port}`));

#!/usr/bin/env node
/**
 * Renders the raster images from their SVG sources. Run it only when the
 * artwork changes; the generated files are committed.
 *
 *   npm install --no-save puppeteer && node tools/render-images.mjs
 *
 * Outputs (into src/assets):
 *   images/og-image.png          1200 x 630 social sharing image
 *   icons/apple-touch-icon.png   180 x 180
 *   icons/icon-192.png, icon-512.png, icon-maskable-512.png
 *   static/favicon.ico           16, 32 and 48 px (PNG-encoded ICO)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  console.error('This script needs puppeteer: npm install --no-save puppeteer');
  process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, 'src');
const read = (p) => readFileSync(join(src, p), 'utf8');

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();

async function render(svgMarkup, size, background = 'transparent') {
  const [w, h] = size;
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:${background}">${svgMarkup.replace(
      '<svg ',
      `<svg width="${w}" height="${h}" style="display:block" `,
    )}</body></html>`,
  );
  return page.screenshot({ type: 'png', omitBackground: background === 'transparent' });
}

// Social image.
writeFileSync(join(src, 'assets/images/og-image.png'), await render(read('svg/og-image.svg'), [1200, 630]));

// App icons from the square favicon artwork.
const icon = read('assets/icons/icon.svg');
writeFileSync(join(src, 'assets/icons/apple-touch-icon.png'), await render(icon.replace('rx="12"', 'rx="0"'), [180, 180]));
writeFileSync(join(src, 'assets/icons/icon-192.png'), await render(icon, [192, 192]));
writeFileSync(join(src, 'assets/icons/icon-512.png'), await render(icon, [512, 512]));

// Maskable icon: full-bleed background with the mark inside the safe zone.
const maskable = icon
  .replace('rx="12"', 'rx="0"')
  .replace(/(<path[\s\S]*<\/svg>)/, '<g transform="translate(9.6 9.6) scale(.7)">$1')
  .replace('</svg>', '</g></svg>');
writeFileSync(join(src, 'assets/icons/icon-maskable-512.png'), await render(maskable, [512, 512]));

// favicon.ico containing PNG images (supported by all current browsers).
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) pngs.push(await render(icon, [s, s]));
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(sizes[i], e);
  header.writeUInt8(sizes[i], e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(png.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
writeFileSync(join(src, 'static/favicon.ico'), Buffer.concat([header, ...pngs]));

await browser.close();
console.log('✓ Rendered og-image.png, app icons and favicon.ico');

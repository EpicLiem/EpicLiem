import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { renderQuote, wrap, encodeReadmeImage } from '../scripts/render-quote.mjs';
const quotes = JSON.parse(await readFile(new URL('../data/quotes.json',import.meta.url)));
test('all 54 quotes render as smaller, pixel-identical lossless WebP images', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(),'leonardo-'));
  let pngBytes = 0, webpBytes = 0;
  try {
    for (const quote of quotes) {
      const destination = path.join(directory,quote.id+'.png');
      const result = await renderQuote(quote,destination,'2026-10-29');
      const metadata = await sharp(destination).metadata();
      assert.equal(metadata.width,3200);
      assert.equal(metadata.height,result.height);
      assert.ok(result.height <= 2000,quote.id);
      assert.equal(wrap(quote.text,56,1400).join(' '),quote.text);
      const png = await readFile(destination);
      const webp = await encodeReadmeImage(png);
      const webpMetadata = await sharp(webp).metadata();
      assert.equal(webpMetadata.format,'webp');
      assert.equal(webpMetadata.width,metadata.width);
      assert.equal(webpMetadata.height,metadata.height);
      assert.deepEqual(await sharp(webp).ensureAlpha().raw().toBuffer(), await sharp(png).ensureAlpha().raw().toBuffer(), quote.id);
      assert.ok(webp.length < png.length,quote.id);
      pngBytes += png.length;
      webpBytes += webp.length;
    }
    console.log(`54 images: PNG ${pngBytes} bytes; lossless WebP ${webpBytes} bytes (${(100 * (1-webpBytes/pngBytes)).toFixed(1)}% smaller).`);
  } finally { await rm(directory,{recursive:true,force:true}); }
});

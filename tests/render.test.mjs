import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { renderQuote, wrap, encodeReadmeImage, quoteArtwork } from '../scripts/render-quote.mjs';
const quotes = JSON.parse(await readFile(new URL('../data/quotes.json',import.meta.url)));
test('all 54 crisp SVG quotes render with transparent corners and lossless raster exports', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(),'leonardo-'));
  let pngBytes = 0, webpBytes = 0;
  try {
    for (const quote of quotes) {
      const {svg} = quoteArtwork(quote,'2026-10-29');
      assert.match(svg,/shape-rendering="crispEdges"/);
      assert.doesNotMatch(svg,/<(?:script|text|image|foreignObject)\b|https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
      const vectorMetadata = await sharp(Buffer.from(svg)).metadata();
      assert.equal(vectorMetadata.width,1600);
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
      const pixels = await sharp(webp).ensureAlpha().raw().toBuffer();
      for (const [x,y] of [[0,0],[metadata.width-1,0],[0,metadata.height-1],[metadata.width-1,metadata.height-1]]) {
        assert.equal(pixels[(y * metadata.width + x) * 4 + 3],0,`${quote.id}: transparent corner`);
      }
      assert.equal(pixels[Math.floor(metadata.width/2) * 4 + 3],255,`${quote.id}: opaque top edge`);
      assert.deepEqual(await sharp(webp).ensureAlpha().raw().toBuffer(), await sharp(png).ensureAlpha().raw().toBuffer(), quote.id);
      assert.ok(webp.length < png.length,quote.id);
      pngBytes += png.length;
      webpBytes += webp.length;
    }
    console.log(`54 images: PNG ${pngBytes} bytes; lossless WebP ${webpBytes} bytes (${(100 * (1-webpBytes/pngBytes)).toFixed(1)}% smaller).`);
  } finally { await rm(directory,{recursive:true,force:true}); }
});

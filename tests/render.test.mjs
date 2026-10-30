import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { renderQuote, wrap } from '../scripts/render-quote.mjs';
const quotes = JSON.parse(await readFile(new URL('../data/quotes.json',import.meta.url)));
test('all curated quotes render as readable PNGs', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(),'leonardo-'));
  try {
    for (const quote of quotes) {
      const destination = path.join(directory,quote.id+'.png');
      const result = await renderQuote(quote,destination);
      const metadata = await sharp(destination).metadata();
      assert.equal(metadata.width,1600);
      assert.ok(result.height <= 1000,quote.id);
      assert.equal(wrap(quote.text,56,1400).join(' '),quote.text);
    }
  } finally { await rm(directory,{recursive:true,force:true}); }
});

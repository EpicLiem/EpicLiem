import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const quotes = JSON.parse(await readFile(new URL('../data/quotes.json',import.meta.url)));
test('profile and website share one source-checked catalog with unique stable IDs', async () => {
  const website = JSON.parse(await readFile(new URL('../website/lib/quotes.json',import.meta.url)));
  assert.deepEqual(quotes,website);
  assert.equal(new Set(quotes.map(quote=>quote.id)).size,quotes.length);
  assert.equal(new Set(quotes.map(quote=>quote.text)).size,quotes.length);
  for(const quote of quotes) {
    assert.match(quote.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(quote.text.trim().split(/\s+/).join(' '),quote.text);
    assert.match(quote.source,/^https:\/\/www\.gutenberg\.org\/cache\/epub\/5000\/pg5000-images\.html#id\d+$/);
    assert.match(quote.section,/^\d+$/);
    if (/prophec/i.test(quote.topic)) assert.equal(quote.retired,true);
  }
  const edition = JSON.parse(await readFile(new URL('../current-quote.json',import.meta.url)));
  assert.equal(quotes.find(quote=>quote.id===edition.quote.id)?.text,edition.quote.text);
});

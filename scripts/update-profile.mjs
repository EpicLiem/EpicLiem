import { readFile, writeFile } from 'node:fs/promises';
import { renderQuote } from './render-quote.mjs';
const origin = 'https://profile.epicliem.com';
let edition;
if (process.argv[2] === '--fixture') {
  const quotes = JSON.parse(await readFile(new URL('../data/quotes.json',import.meta.url)));
  edition = {day:'2026-10-29',quote:quotes[0]};
} else {
  const response = await fetch(`${origin}/api/today`, {signal:AbortSignal.timeout(30000),headers:{'Cache-Control':'no-cache'}});
  if (!response.ok) throw new Error(`Daily quote endpoint returned ${response.status}`);
  edition = await response.json();
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if (edition.day !== today) throw new Error(`Expected ${today}; received ${edition.day}`);
}
const quotes = JSON.parse(await readFile(new URL('../data/quotes.json',import.meta.url)));
const quote = quotes.find(q => q.id === edition.quote?.id);
if (!quote || quote.text !== edition.quote.text) throw new Error('The endpoint returned a passage outside the verified collection.');
await renderQuote(quote, new URL('../quote.png',import.meta.url).pathname, edition.day);
const alt = `${edition.day}. ${quote.text} — Leonardo da Vinci. Click to vote for tomorrow’s quote.`.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await writeFile(new URL('../README.md',import.meta.url), `<a href="${origin}" title="Choose tomorrow’s Leonardo da Vinci quote"><img src="./quote.png?day=${edition.day}" alt="${alt}" width="100%" /></a>\n`);
await writeFile(new URL('../current-quote.json',import.meta.url), JSON.stringify({...edition,quote},null,2)+'\n');
console.log(`Rendered ${quote.id} for ${edition.day}.`);

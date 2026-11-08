import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dayAt,nextDay,midnight,candidates,selectWinner,editionQuote} from '../lib/calendar.mjs';
const quotes = JSON.parse(await readFile(new URL('../lib/quotes.json',import.meta.url)));
test('New York day and DST cutoffs',()=>{
  assert.equal(dayAt(new Date('2026-10-30T03:59:59Z')),'2026-10-29');
  assert.equal(dayAt(new Date('2026-10-30T04:00:00Z')),'2026-10-30');
  assert.equal(new Date(midnight('2026-03-08')*1000).toISOString(),'2026-03-08T05:00:00.000Z');
  assert.equal(new Date(midnight('2026-03-09')*1000).toISOString(),'2026-03-09T04:00:00.000Z');
  assert.equal(new Date(midnight('2026-11-01')*1000).toISOString(),'2026-11-01T04:00:00.000Z');
  assert.equal(new Date(midnight('2026-11-02')*1000).toISOString(),'2026-11-02T05:00:00.000Z');
  assert.equal(nextDay('2026-12-31'),'2027-01-01');
});
test('adjacent ballots are disjoint throughout a year',()=>{
  let day = '2026-01-01';
  for(let i=0;i<366;i++) {
    const current = candidates(day,quotes).map(q=>q.id);
    const tomorrow = candidates(nextDay(day),quotes).map(q=>q.id);
    assert.equal(new Set(current).size,3);
    assert.ok(current.every(id=>!tomorrow.includes(id)));
    day=nextDay(day);
  }
});
test('votes select winner; ties and empty ballots use published first choice',()=>{
  const choices=candidates('2026-10-30',quotes);
  assert.equal(selectWinner(choices,{}).id,choices[0].id);
  assert.equal(selectWinner(choices,{[choices[2].id]:4}).id,choices[2].id);
  assert.equal(selectWinner(choices,{[choices[0].id]:4,[choices[1].id]:4}).id,choices[0].id);
});
test('retired prophecies never enter ballots; every active passage appears in a cycle',()=>{
  const active = quotes.filter(quote => !quote.retired);
  assert.equal(active.length % 3,0);
  assert.ok(active.every(quote => !/prophec/i.test(quote.topic)));
  const seen = new Set();
  let day = '2026-11-08';
  for(let i=0;i<active.length/3;i++) {
    for(const quote of candidates(day,quotes)) {
      assert.ok(!quote.retired);
      assert.ok(!seen.has(quote.id));
      seen.add(quote.id);
    }
    day=nextDay(day);
  }
  assert.equal(seen.size,active.length);
  assert.throws(()=>candidates(day,quotes.map(quote=>({...quote,retired:true}))),/six passages/);
});
test('saved editions keep valid winners and replace retired winners without losing IDs',()=>{
  const day = '2026-11-08';
  for(const quote of quotes) {
    const published = editionQuote(day,quote.id,quotes);
    assert.ok(!published.retired);
    assert.equal(published.id,quote.retired ? candidates(day,quotes)[0].id : quote.id);
  }
  assert.throws(()=>editionQuote(day,'unknown-id',quotes),/Published passage missing/);
});

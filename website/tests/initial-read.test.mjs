import test from 'node:test';
import assert from 'node:assert/strict';
import { initialRead } from '../lib/initial-read.mjs';

test('server sections resolve independently and release stalled requests to client retry', async () => {
  let release;
  const slow = initialRead(new Promise(resolve=>{release=resolve;}),30);
  assert.equal(await initialRead(Promise.resolve('ready'),30),'ready');
  assert.equal(await initialRead(Promise.reject(new Error('offline')),30),null);
  assert.equal(await slow,null);
  release('too late');
});

import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {checkBatch} from '../src/batch.js';
import {checkHistory} from '../extension/history.js';

const incident = JSON.parse(readFileSync(new URL('../public/data/incident.json', import.meta.url)));

test('batch discards URL details, deduplicates hosts and distinguishes match types', () => {
  const result = checkBatch(incident.organizations,
    'example.org\r\nBBC.com\rhttps://cnn.com/path?secret=1#private\nCNN.com\njavascript:alert(1)\n');
  assert.deepEqual(result.results.map(({host, kind}) => [host, kind]),
    [['cnn.com', 'exact'], ['bbc.com', 'related'], ['example.org', 'unknown']]);
  assert.equal(result.duplicates, 1);
  assert.equal(result.invalid, 1);
  assert.doesNotMatch(JSON.stringify(result), /secret|private/);
});

test('batch rejects oversized input rather than giving partial results', () => {
  assert.match(checkBatch(incident.organizations, 'cnn.com\n'.repeat(101)).error, /100/);
  assert.match(checkBatch(incident.organizations, 'x'.repeat(32001)).error, /32,000/);
});

test('history filters individual visits to the UTC window and returns only exact hosts and timestamps', async () => {
  const start = Date.parse(incident.eventWindowUtc.start);
  const end = Date.parse('2026-11-17T00:00:00Z');
  const calls = [];
  const history = {
    search: async options => {
      assert.deepEqual(options, {text: '', startTime: start, endTime: end, maxResults: 10000});
      return ['https://cnn.com/private?secret=yes', 'https://bbc.com/', 'https://example.org/'].map(url => ({url}));
    },
    getVisits: async ({url}) => {
      calls.push(url);
      return [start - 1, start, start, end - 1, end].map(visitTime => ({visitTime}));
    }
  };
  const result = await checkHistory(history, incident);
  assert.equal(calls.length, 1);
  assert.deepEqual(result.matches, [{host: 'cnn.com', visitTime: end - 1}, {host: 'cnn.com', visitTime: start}]);
  assert.doesNotMatch(JSON.stringify(result), /secret|private/);
});

test('pilot requests no host or storage permissions', () => {
  const manifest = JSON.parse(readFileSync(new URL('../extension/manifest.json', import.meta.url)));
  assert.deepEqual(manifest.optional_permissions, ['history']);
  for (const key of ['permissions', 'host_permissions', 'optional_host_permissions', 'content_scripts']) {
    assert.equal(manifest[key], undefined);
  }
});

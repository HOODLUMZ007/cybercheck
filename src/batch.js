import {findHosts, normalizeHost} from './assessment.js';

export const MAX_BATCH_LINES = 100;
export const MAX_BATCH_LENGTH = 32000;
const order = {exact: 0, related: 1, unknown: 2};

export function checkBatch(organizations, input) {
  if (input.length > MAX_BATCH_LENGTH) return {error: 'Paste up to 32,000 characters.'};
  const lines = input.split(/\r\n?|\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length > MAX_BATCH_LINES) return {error: 'Enter up to 100 addresses per check.'};
  const hosts = new Set();
  let invalid = 0;
  let duplicates = 0;
  for (const line of lines) {
    const host = normalizeHost(line);
    if (!host) invalid++;
    else if (hosts.has(host)) duplicates++;
    else hosts.add(host);
  }
  const results = Array.from(hosts, host => findHosts(organizations, host))
    .sort((a, b) => order[a.kind] - order[b.kind]);
  return {results, invalid, duplicates};
}

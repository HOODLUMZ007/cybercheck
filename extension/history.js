import {normalizeHost} from '../src/assessment.js';

const maxUrls = 10000;

export async function checkHistory(history, incident) {
  const startTime = Date.parse(incident.eventWindowUtc.start);
  const endTime = Date.parse(incident.date + 'T00:00:00Z') + 86400000;
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
    throw new Error('Invalid incident period');
  }

  const listedHosts = new Set(incident.organizations.flatMap(org => org.domains));
  const items = await history.search({text: '', startTime, endTime, maxResults: maxUrls});
  const matches = new Map();
  for (const {url} of items) {
    const host = normalizeHost(url);
    if (!listedHosts.has(host)) continue;
    const visits = await history.getVisits({url});
    for (const {visitTime} of visits) {
      if (!Number.isFinite(visitTime) || visitTime < startTime || visitTime >= endTime) continue;
      matches.set(host + ':' + visitTime, {host, visitTime});
    }
  }
  return {
    matches: Array.from(matches.values()).sort((a, b) => b.visitTime - a.visitTime),
    truncated: items.length >= maxUrls,
    startTime,
    endTime
  };
}

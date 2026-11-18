export function normalizeHost(input) {
  const s = String(input||'').trim().toLowerCase();
  if (!s || /[\s\\]/.test(s)) return null;
  try {
    // Never navigate to submitted URL; URL parses locally.
    const url = new URL(s.includes('://') ? s : `https://${s}`);
    if (!['https:','http:'].includes(url.protocol) || url.username || url.password) return null;
    const h = url.hostname.replace(/\.$/,'');
    if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(h) || h.length > 253 || h.split('.').some(label=>label.length>63 || label.startsWith('-') || label.endsWith('-'))) return null;
    return h;
  } catch { return null; }
}

export function findHosts(organizations, input) {
  const host=normalizeHost(input);
  if (!host) return {kind:'invalid',host:null, matches:[]};
  const exact=organizations.filter(o=>o.domains.includes(host));
  if(exact.length) return {kind:'exact',host,matches:exact};
  // A registered-brand-looking name is NOT a confirmed match. Distinct results.
  const hints=organizations.filter(o=>o.domains.some(d=>d===`www.${host}` || host===`www.${d}`));
  return {kind:hints.length?'related':'unknown',host,matches:hints};
}

export function assess({match,visit,activity,device,time}) {
  if (!match || match.kind==='invalid') return {level:'unknown',label:'We need a valid site address',description:'Type a domain from browser history, such as cnn.com, or select an organization from the list.',actions:['Check the exact address in your browser history.']};
  if (match.kind!=='exact') return {level:'unknown',label:'Not enough evidence to determine exposure',description:match.kind==='related'?'Your address resembles a reported host, but is not an exact published hostname match.':'This exact hostname is not in our curated list. Our inventory may be incomplete, so this is not a clean bill of health.',actions:['Compare the exact address against the original Report URI investigation.','Review your browsing history and any alerts from the website operator.']};
  if (visit==='no') return {level:'unknown',label:'Affected host identified — visit not confirmed',description:'The website appears in the published list, but you have not identified a visit during the incident.',actions:['Check browser history for November 16, 2026.','No exposure is established from the information entered.']};
  if (visit==='unsure') return {level:'unknown',label:'Affected host identified — timing unclear',description:'The hostname is listed, but we cannot establish whether you visited during the relevant window.',actions:['Check the date and approximate time in browser history.','Remember: each site may have been affected for a different period.']};
  if (visit!=='yes') return {level:'unknown',label:'Visit needs clarification',description:'Choose whether you visited during the incident date.',actions:['Review your visit details.']};
  if (time && !Number.isFinite(new Date(time).getTime())) return {level:'unknown',label:'Visit time is invalid',description:'Check the date, time, and time zone before continuing.',actions:['Correct or remove the optional time.']};
  const high=['card','crypto'].includes(activity);
  const ios=device==='iphone';
  const actions=[];
  if(activity==='card') actions.push('Review recent card transactions. If you entered card information into the website’s own form, contact your card issuer about possible exposure.');
  if(activity==='crypto') actions.push('Check the recipient address and transaction details of any cryptocurrency you transferred. If funds went to an unexpected address, contact your wallet or exchange provider promptly.');
  if(activity==='login') actions.push('Review your account’s recent sessions and activity. Sign out suspicious sessions and change the password if compromise is indicated.');
  if(ios) actions.push('Update your iPhone or iPad to the latest supported iOS/iPadOS release. Older versions faced additional browser exploit risk.');
  actions.push('Update the browser and operating system, and keep an eye on relevant account activity.');
  actions.push('A published hostname match does not prove the malicious script loaded or that data was stolen.');
  let description='Your reported visit overlaps the incident date and matches a hostname in the researcher’s list. Individual website exposure windows and successful execution are not proven.';
  if(time) {
    const ts=new Date(time).getTime();
    const start=Date.parse('2026-11-16T04:21:00Z');
    const end=Date.parse('2026-11-16T21:52:00Z');
    if(Number.isFinite(ts) && ts<start) return {level:'unknown',label:'Visit before the first observed injection',description:'The time you entered precedes the researcher’s first observed injection timestamp. Because the observations do not establish complete exposure periods for each site or related earlier campaigns, this does not prove safety.',actions:['Verify the visit time and time zone.','Review official website-specific notices and the researcher’s investigation.']};
    if(Number.isFinite(ts) && ts>end) description='Your visit was after the last observation recorded here. At that observation, one snippet was still infected; this is not a verified all-clear time. Per-host exposure timing remains unknown.';
    else if(Number.isFinite(ts)) description='Your entered time falls within the researcher’s broad observation window, but there is no per-host verification of active compromise at that moment.';
  }
  return {level:high?'action':'possible',label:high?'Prompt follow-up recommended':'Possible exposure — not confirmed infection',description,actions};
}

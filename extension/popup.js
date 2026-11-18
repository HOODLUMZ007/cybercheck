import {checkHistory} from './history.js';

const check = document.querySelector('#check');
const clear = document.querySelector('#clear');
const status = document.querySelector('#status');
const results = document.querySelector('#results');
const scope = {permissions: ['history']};
let incident;

async function revokeAccess() {
  await chrome.permissions.remove(scope);
  return !(await chrome.permissions.contains(scope));
}

fetch('../data/incident.json').then(response => {
  if (!response.ok) throw new Error('Dataset unavailable');
  return response.json();
}).then(data => {
  incident = data;
  check.disabled = false;
}).catch(() => {
  status.textContent = 'The bundled incident data could not load.';
});

check.addEventListener('click', async () => {
  check.disabled = true;
  clear.disabled = true;
  results.replaceChildren();
  status.textContent = 'Waiting for permission…';
  try {
    if (!(await chrome.permissions.request(scope))) {
      status.textContent = 'History access was declined. No history was checked.';
      return;
    }
    status.textContent = 'Checking saved visits on this device…';
    const report = await checkHistory(chrome.history, incident);
    status.textContent = report.matches.length
      ? `Found ${report.matches.length} matching saved visits. Times are local.`
      : 'No matching saved visits were found in the selected window.';
    if (report.truncated) status.textContent += ' The search limit was reached, so results may be incomplete.';
    for (const {host, visitTime} of report.matches) {
      const row = document.createElement('li');
      row.textContent = `${host} — ${new Date(visitTime).toLocaleString()}`;
      results.append(row);
    }
  } catch {
    status.textContent = 'The check could not finish. No results are available.';
  } finally {
    try {
      if (!(await revokeAccess())) status.textContent += ' Remove history access in Chrome’s extension settings.';
    } catch {
      status.textContent += ' History access could not be verified. Check Chrome’s extension settings.';
    }
    check.disabled = false;
    clear.disabled = false;
  }
});

clear.addEventListener('click', async () => {
  check.disabled = true;
  clear.disabled = true;
  results.replaceChildren();
  try {
    status.textContent = await revokeAccess()
      ? 'Results cleared and history access removed.'
      : 'Results cleared. Remove history access in Chrome’s extension settings.';
  } catch {
    status.textContent = 'Results cleared. History access could not be verified.';
  } finally {
    check.disabled = !incident;
    clear.disabled = false;
  }
});

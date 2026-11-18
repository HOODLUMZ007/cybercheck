import React, {useState} from 'react';
import {checkBatch, MAX_BATCH_LENGTH} from './batch.js';

const labels = {
  exact: 'Exact published match',
  related: 'Related hostname only',
  unknown: 'Not listed'
};

export default function BatchCheck({organizations, onAssess}) {
  const [input, setInput] = useState('');
  const [report, setReport] = useState(null);
  const clear = () => {
    setInput('');
    setReport(null);
  };

  function runCheck(event) {
    event.preventDefault();
    const next = checkBatch(organizations, input);
    setReport(next);
    if (!next.error) setInput('');
  }

  return <details className="batchcheck" onToggle={event => {
    if (!event.currentTarget.open) clear();
  }}>
    <summary>Check multiple websites</summary>
    <form onSubmit={runCheck}>
      <label className="fieldlabel" htmlFor="batch-input">Website addresses</label>
      <p id="batch-help" className="muted">Paste one address per line, up to 100. The check runs on this device and clears pasted text after checking.</p>
      <textarea id="batch-input" rows={4} maxLength={MAX_BATCH_LENGTH}
        autoComplete="off" autoCapitalize="none" spellCheck={false}
        aria-describedby="batch-help" value={input}
        placeholder={'cnn.com\nhttps://zoom.us/example'}
        onChange={event => { setInput(event.target.value); setReport(null); }} />
      <div className="actions">
        <button className="primary" disabled={!input.trim()} type="submit">Check addresses</button>
        <button className="secondary" type="button" onClick={clear}>Clear</button>
      </div>
    </form>
    {report && (report.error ? <p role="alert">{report.error}</p> : <div>
      <p role="status">{report.results.length} unique hostnames checked. {report.duplicates} duplicates and {report.invalid} invalid entries skipped.</p>
      {report.results.length > 0 && <>
        <p className="muted">Matches indicate a listed hostname. An unlisted hostname leaves exposure unconfirmed.</p>
        <ul className="batchresults">{report.results.map(({host, kind}) =>
          <li key={host}><span><strong>{host}</strong><small>{labels[kind]}</small></span>
            {kind === 'exact' && <button type="button" className="secondary" onClick={() => onAssess(host)}
              aria-label={`Assess ${host}`}>Assess</button>}
          </li>)}</ul>
      </>}
    </div>)}
  </details>;
}

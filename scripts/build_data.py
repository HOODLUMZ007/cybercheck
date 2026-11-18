#!/usr/bin/env python3
"""Offline-only curated dataset compiler; NEVER fetches or executes site content."""
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE='https://report-uri.ghost.io/worlds-largest-brands-infected-with-malware-via-optimizely/'
HOST_PATTERN=re.compile(r'^[a-z0-9-]+(?:\.[a-z0-9-]+)+$')

def compile_dataset(source_path=ROOT/'scripts/source_domains.txt'):
    rows=[]
    for lineno,line in enumerate(Path(source_path).read_text().splitlines(),1):
        if not line.strip() or line.startswith('#'):continue
        fields=line.split('|')
        if len(fields)!=3:raise ValueError(f'Bad row at {lineno}')
        sector,name,domains=fields
        hosts=sorted(set(d.strip().lower() for d in domains.split(',')))
        if not hosts or any(not HOST_PATTERN.fullmatch(d) for d in hosts):
            raise ValueError(f'Invalid host at {lineno}')
        rows.append({'id':f'org-{len(rows)+1:03d}','name':name.strip(),'sector':sector.strip(), 'domains':hosts})
    if len(rows)!=178:raise ValueError(f'Expected 178 organizations, found {len(rows)}')
    counts=Counter(row['sector'] for row in rows)
    expected=[32,23,20,12,10,9,8,8,7,6,6,6,5,5,4,4,4,3,3,3]
    if sorted(counts.values(),reverse=True)!=sorted(expected,reverse=True):raise ValueError(f'Sector counts unexpectedly differ: {counts}')
    return {'incidentId':'optimizely-2026-11-16','title':'Optimizely Web supply-chain incident',
            'date':'2026-11-16', 'sourcePublished':'2026-11-16', 'lastCurated':'2026-11-18',
            'sources':[SOURCE,'https://pages.optimizely.com/rs/947-RKE-048/images/Security%20Incident%20Report%20-%20Optimizely%20Web%20Experimentation%20-%20Nov%2017%202026.pdf'],
            'scopeNote':'178 organizations are listed; some additional domains are abbreviated as +N more in the source, so this dataset is NOT a complete inventory of every affected hostname. Brand-only matches are not confirmed domain matches.',
            'timeNote':'Exposure varied by domain and payload; a single incident-wide timeframe cannot confirm an individual visit.',
            'eventWindowUtc':{'start':'2026-11-16T04:21:00Z','end':'2026-11-16T21:52:00Z','description':'Researcher observations, not a verified per-domain exposure window'},
            'organizations':rows}

if __name__=='__main__':
    data=compile_dataset()
    out=ROOT/'public/data/incident.json'
    out.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
    print(f"Created {out}: {len(data['organizations'])} organizations and {sum(len(x['domains']) for x in data['organizations'])} published hostnames")

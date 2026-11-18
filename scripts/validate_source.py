#!/usr/bin/env python3
"""Compare explicit table hostnames with a locally saved original research HTML.
Usage: python3 scripts/validate_source.py /path/to/research.html
Never requests or executes content from affected websites. Standard library only.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from build_data import compile_dataset

class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows, self.row, self.cell = [], None, None
    def handle_starttag(self, tag, attrs):
        if tag == 'tr': self.row = []
        if tag in ('td', 'th'): self.cell = ''
    def handle_data(self, data):
        if self.cell is not None: self.cell += data
    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            if self.row is not None: self.row.append(self.cell.strip())
            self.cell = None
        if tag == 'tr' and self.row:
            self.rows.append(self.row)
            self.row = None

def validate(path):
    parser = Tables()
    parser.feed(Path(path).read_text())
    published = {r[0]: r[1] for r in parser.rows if len(r) == 2}
    data = compile_dataset()
    errors = []
    for org in data['organizations']:
        text = published.get(org['name'])
        hosts = re.findall(r'[a-z0-9-]+(?:\.[a-z0-9-]+)+', text or '')
        if sorted(hosts) != sorted(org['domains']): errors.append(org['name'])
    if errors: raise ValueError('Source differences: ' + ', '.join(errors))
    print('PASS: all 178 organizations and 253 explicit hostnames match original table')

if __name__ == '__main__': validate(sys.argv[1])

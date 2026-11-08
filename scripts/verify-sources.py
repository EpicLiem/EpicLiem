"""Verify the corpus against downloaded Gutenberg plain-text and HTML files.

Usage: python3 scripts/verify-sources.py /path/pg5000.txt /path/pg5000-images.html
"""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys


def normalize(text):
    return ' '.join(text.split())


class Paragraphs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.current = None
        self.section = None
        self.paragraphs = {}

    def handle_starttag(self, tag, attrs):
        if tag == 'p':
            self.current = (dict(attrs).get('id'), [])

    def handle_data(self, data):
        if self.current is not None:
            self.current[1].append(data)

    def handle_endtag(self, tag):
        if tag == 'p' and self.current is not None:
            anchor, parts = self.current
            text = normalize(''.join(parts))
            if re.fullmatch(r'\d+\.', text):
                self.section = text[:-1]
            if anchor:
                self.paragraphs[anchor] = (self.section, text)
            self.current = None


if __name__ == '__main__':
    plain_path, html_path = map(Path, sys.argv[1:])
    plain = normalize(plain_path.read_text())
    parser = Paragraphs()
    parser.feed(html_path.read_text())
    root = Path(__file__).resolve().parent.parent
    quotes = json.loads((root / 'data/quotes.json').read_text())
    assert quotes == json.loads((root / 'website/lib/quotes.json').read_text())
    for quote in quotes:
        text = quote['text']
        assert text == normalize(text), quote['id']
        assert text in plain, f"{quote['id']}: not verbatim in plain text"
        anchor = quote['source'].split('#')[1]
        section, paragraph = parser.paragraphs[anchor]
        assert section == quote['section'], f"{quote['id']}: wrong section"
        assert text in paragraph, f"{quote['id']}: not in linked paragraph"
    print(f'Verified {len(quotes)} texts, sections and source anchors in both collections.')
    for path in (plain_path, html_path):
        print(f'{path.name} SHA-256: {hashlib.sha256(path.read_bytes()).hexdigest()}')

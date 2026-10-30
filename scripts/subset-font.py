"""Run with: uv run --with 'fonttools[woff]' scripts/subset-font.py"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
original = root / 'assets/terminess-regular.ttf'
output = root / 'website/public/fonts/terminess-latin.woff2'
font = TTFont(original)
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=list(range(0x20, 0x100)) + list(range(0x2000, 0x2070)))
subsetter.subset(font)
font.flavor = 'woff2'
font.save(output)
print(f'Saved {output.name}: {output.stat().st_size} bytes')

"""Generate standalone previews, or check that committed previews are current."""
import argparse
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true', help='Check without writing files')
args = parser.parse_args()
root = Path(__file__).resolve().parent
source = (root / 'direction.html').read_text(encoding='utf-8')
if source.count('data-initial="inbox"') != 1:
    raise SystemExit('Expected exactly one initial inbox marker in direction.html')
pages = ('inbox', 'thread', 'compose', 'search', 'snooze', 'accounts', 'agents',
         'sent', 'spam', 'trash', 'drafts', 'organize')
stale = []
if not args.check:
    (root / 'pages').mkdir(exist_ok=True)
for page in pages:
    target = root / 'pages' / f'{page}.html'
    content = source.replace('data-initial="inbox"', f'data-initial="{page}"', 1)
    if args.check:
        if not target.exists() or target.read_text(encoding='utf-8') != content:
            stale.append(target.name)
    else:
        target.write_text(content, encoding='utf-8')
if stale:
    raise SystemExit('Stale previews: ' + ', '.join(stale) +
                     '. Run python3 design/build-previews.py')
print(f'{len(pages)} standalone previews ' + ('are current' if args.check else 'generated'))

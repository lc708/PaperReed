from pathlib import Path
root = Path(__file__).resolve().parent
source = (root / 'direction.html').read_text()
for page in ('inbox', 'thread', 'compose', 'search', 'snooze', 'accounts', 'agents', 'sent', 'spam', 'trash', 'drafts', 'organize'):
    (root / 'pages' / f'{page}.html').write_text(source.replace('data-initial="inbox"', f'data-initial="{page}"', 1))
print('Generated standalone page previews')

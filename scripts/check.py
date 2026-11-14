"""Offline repository checks. Does not run browser interactions or mail integration."""
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class InlineScripts(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.active = False
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            attrs = dict(attrs)
            self.active = not attrs.get('src') and attrs.get('type', '') in (
                '', 'text/javascript', 'application/javascript', 'module')
            if self.active:
                self.scripts.append('')

    def handle_data(self, data):
        if self.active:
            self.scripts[-1] += data

    def handle_endtag(self, tag):
        if tag == 'script':
            self.active = False


def main():
    if not shutil.which('node'):
        raise SystemExit('Node.js 22+ is required for JavaScript syntax checks.')
    subprocess.run([sys.executable, 'design/build-previews.py', '--check'],
                   cwd=ROOT, check=True)
    names = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
    errors = []
    scripts_checked = 0
    for name in filter(None, names):
        path = ROOT / name
        if not path.is_file():
            errors.append(f'{name}: tracked file is missing')
            continue
        if path.suffix == '.json':
            try:
                json.loads(path.read_text(encoding='utf-8'))
            except ValueError as error:
                errors.append(f'{name}: {error}')
        if path.suffix == '.md':
            for target in re.findall(r'\]\(([^)]+)\)', path.read_text(encoding='utf-8')):
                target = target.strip('<>')
                url = urlsplit(target)
                if url.scheme or url.netloc or not url.path:
                    continue
                if not (path.parent / unquote(url.path)).is_file():
                    errors.append(f'{name}: broken local link {target}')
        scripts = []
        if path.suffix in ('.js', '.cjs', '.mjs'):
            scripts.append(path.read_text(encoding='utf-8'))
        elif path.suffix == '.html':
            parser = InlineScripts()
            parser.feed(path.read_text(encoding='utf-8'))
            scripts.extend(parser.scripts)
        for index, source in enumerate(scripts, 1):
            result = subprocess.run(['node', '--check'], input=source, text=True,
                                    capture_output=True, cwd=ROOT)
            scripts_checked += 1
            if result.returncode:
                errors.append(f'{name}, script {index}: {result.stderr.strip()}')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'PASS: {scripts_checked} JavaScript syntax checks; JSON and local Markdown links valid.')
    print('Browser interaction, visual design and real mailbox integration are not tested here.')


if __name__ == '__main__':
    main()

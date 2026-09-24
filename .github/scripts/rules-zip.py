"""Post-build step: assemble the downloadable rules ZIP from the staged rules in the built site.

Usage: python .github/scripts/rules-zip.py SITE_DIR
       python .github/scripts/rules-zip.py --self-test

- reads SITE_DIR/assets/rules/rules.json (written by the GDoc pipeline's build-downloads step)
- Parts and README come from SITE_DIR/assets/rules/<name>.markdown and are zipped as <name>.md
  (a .md under docs/ would render as a site page; .markdown is copied verbatim)
- sheets and art come from SITE_DIR/assets/images/ into Assets/Sheets/ and Assets/Art/
- the license file named in rules.json comes from the repo root (beside .github/)
- wallpapers come from SITE_DIR/assets/rules/wallpapers/ into Assets/Wallpapers/
- everything sits under one Mommyship-Rules-v<version>/ folder inside the ZIP
- writes SITE_DIR/downloads/Mommyship-Rules-v<version>.zip plus a byte-identical latest.zip

Fixed entry order, timestamps, and permissions, so the same inputs always give the same bytes.
Any missing file, dangling image link, or version mismatch with the README or footer fails the build.
"""
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path
from urllib.parse import unquote

EPOCH = (1980, 1, 1, 0, 0, 0)
ASSET_REF = re.compile(r'Assets/(?:Art|Sheets)/')
QUOTE_CLOSERS = {'"': '"', "'": "'", '<': '>', '`': '`'}
IMAGE_SUFFIXES = ('.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg')
REPO_ROOT = Path(__file__).resolve().parents[2]


def link_end(text: str, start: int, opener: str) -> int:
    """Where a link ends depends on what opened it; a Markdown (...) destination may nest parentheses."""
    if opener in QUOTE_CLOSERS:
        return text.find(QUOTE_CLOSERS[opener], start)
    if opener != '(':
        return -1
    depth = 0
    for i in range(start, len(text)):
        c = text[i]
        if c == '(':
            depth += 1
        elif c == ')':
            if depth == 0:
                return i
            depth -= 1
        elif c.isspace():
            return i if depth == 0 else -1
    return -1


def asset_links(text: str) -> list:
    """Every Assets/ link target in text, or None for one whose end can't be found."""
    out = []
    for m in ASSET_REF.finditer(text):
        end = link_end(text, m.end(), text[m.start() - 1] if m.start() else '')
        out.append(text[m.start():end] if end >= m.end() else None)
    return out


def self_test():
    cases = [
        ('<img src="Assets/Art/Jaz\'s Landscape (Final).webp" alt="x">', "Assets/Art/Jaz's Landscape (Final).webp"),
        ('![](Assets/Art/Jaz\'s%20Landscape%20(Final).webp){.x}', "Assets/Art/Jaz's%20Landscape%20(Final).webp"),
        ('![](Assets/Sheets/a(b(c))d.png "title")', 'Assets/Sheets/a(b(c))d.png'),
        ('see `Assets/Art/` here', 'Assets/Art/'),
        ('see Assets/Art/x.png here', None),
    ]
    bad = [(text, asset_links(text)) for text, want in cases if asset_links(text) != [want]]
    for text, got in bad:
        print(f'  FAIL {text} -> {got}')
    print(f'Self-test: {len(bad)} failure(s).' if bad else f'Self-test: {len(cases)} checks passed.')
    sys.exit(1 if bad else 0)


def safe_rel(rel: str) -> bool:
    parts = rel.split('/')
    return bool(rel) and '\\' not in rel and not rel.startswith('/') and all(p not in ('', '.', '..') for p in parts)


def entry(name: str, is_dir: bool = False) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name, date_time=EPOCH)
    info.create_system = 3
    info.external_attr = (0o40755 << 16) | 0x10 if is_dir else 0o100644 << 16
    # Images are already compressed; deflating them only costs time
    stored = is_dir or name.lower().endswith(IMAGE_SUFFIXES)
    info.compress_type = zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED
    return info


def fail(problems):
    sys.exit('rules-zip failed:\n  ' + '\n  '.join(problems))


def main():
    if sys.argv[1:] == ['--self-test']:
        self_test()
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    site = Path(sys.argv[1])
    rules_dir = site / 'assets' / 'rules'
    images_dir = site / 'assets' / 'images'
    try:
        manifest = json.loads((rules_dir / 'rules.json').read_text(encoding='utf-8'))
    except (OSError, ValueError) as e:
        sys.exit(f'rules-zip: cannot read {rules_dir / "rules.json"}: {e}')

    version = manifest.get('version', '')
    if not re.fullmatch(r'\d+\.\d+', str(version)):
        sys.exit(f'rules-zip: version must be X.Y, got {version!r}')

    parts = manifest.get('parts') or []
    problems = [] if parts else ['rules.json lists no parts']
    planned = []  # (zip name, source path)
    license_name = manifest.get('license') or ''
    if not safe_rel(license_name) or '/' in license_name:
        problems.append(f'bad or missing license name {license_name!r}')
    else:
        planned.append((license_name, REPO_ROOT / license_name))
    for name in ['README.md', *parts]:
        if not safe_rel(name) or '/' in name or not name.endswith('.md'):
            problems.append(f'bad part name {name!r}')
            continue
        planned.append((name, rules_dir / (name[:-len('.md')] + '.markdown')))
    wallpapers = manifest.get('wallpapers') or []
    if not wallpapers:
        problems.append('rules.json lists no wallpapers')
    for name in wallpapers:
        if not safe_rel(name) or '/' in name:
            problems.append(f'bad wallpaper name {name!r}')
            continue
        planned.append((f'Assets/Wallpapers/{name}', rules_dir / 'wallpapers' / name))
    for key, folder in (('sheets', 'Sheets'), ('art', 'Art')):
        for rel in manifest.get(key, []):
            if not safe_rel(rel):
                problems.append(f'bad {key} path {rel!r}')
                continue
            planned.append((f'Assets/{folder}/{rel.rsplit("/", 1)[-1]}', images_dir.joinpath(*rel.split('/'))))

    names = [n for n, _ in planned]
    for dup in sorted({n for n in names if names.count(n) > 1}):
        problems.append(f'two files would share {dup}')
    for name, src in planned:
        if not src.is_file():
            problems.append(f'missing {src.as_posix()} (for {name})')
    if problems:
        fail(problems)

    files = {name: src.read_bytes() for name, src in planned}

    # CI trusts rules.json alone, so a half-committed version bump must not ship mismatched text
    h1 = re.search(r'^# .*$', files['README.md'].decode('utf-8'), re.M)
    readme_title = h1.group(0).strip() if h1 else ''
    if not re.search(rf'\bv{re.escape(version)}\b', readme_title):
        problems.append(f'README title {readme_title!r} does not carry v{version}; rerun the pipeline')
    try:
        stamps = set(re.findall(r'Rules v(\d+\.\d+)', (site / 'index.html').read_text(encoding='utf-8')))
        if stamps != {version}:
            problems.append(f'footer stamp in index.html is {sorted(stamps) or "missing"}, rules.json says {version}; '
                            'rerun the pipeline')
    except OSError as e:
        problems.append(f'cannot read {site / "index.html"}: {e}')

    for name, data in files.items():
        if not name.endswith('.md'):
            continue
        text = data.decode('utf-8')
        if 'mommyship.mom/assets/images/' in text:
            problems.append(f'{name} still links images on the live site; rerun the pipeline')
        for link in asset_links(text):
            if link is None:
                problems.append(f'{name} has an Assets/ reference whose end cannot be found')
            elif not link.endswith('/') and unquote(link) not in files:
                problems.append(f'{name} links {link}, which is not in the ZIP')
    if problems:
        fail(problems)

    # README and license first, Parts in rulebook order, then assets alphabetically
    root = f'Mommyship-Rules-v{version}/'
    order = ['README.md', license_name, *parts] + sorted(n for n in files if n.startswith('Assets/'))
    out_dir = site / 'downloads'
    out_dir.mkdir(parents=True, exist_ok=True)
    zip_path = out_dir / f'Mommyship-Rules-v{version}.zip'
    with zipfile.ZipFile(zip_path, 'w') as zf:
        zf.writestr(entry(root, is_dir=True), b'')
        for name in order:
            info = entry(root + name)
            zf.writestr(info, files[name], compresslevel=9 if info.compress_type == zipfile.ZIP_DEFLATED else None)
    shutil.copyfile(zip_path, out_dir / 'latest.zip')

    print(f'rules-zip v{version}: {len(order)} files, {zip_path.stat().st_size / 1e6:.1f} MB '
          f'-> downloads/{zip_path.name} + downloads/latest.zip')


if __name__ == '__main__':
    main()

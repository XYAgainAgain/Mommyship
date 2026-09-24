"""Post-build PWA step: writes the service worker's file lists and stamps the build id.

Usage: python .github/scripts/pwa-build.py SITE_DIR [--build ID]

- SITE_DIR/precache.json      site shell the worker caches on install (rules, CSS/JS, fonts, art)
- SITE_DIR/galaxy/offline.json every galaxy + vendored Three.js file with size and hash, for the
                               "Download galaxy for offline" button and stale-entry eviction
- SITE_DIR/sw.js               __BUILD__ replaced with ID (or a timestamp)
"""
import argparse
import hashlib
import json
import sys
import time
from pathlib import Path

SHELL_EXCLUDE_DIRS = {'osminok', 'galaxy', 'vendor', 'search', 'downloads'}
SHELL_EXCLUDE_FILES = {'404.html', 'sitemap.xml', 'sitemap.xml.gz', 'objects.inv', 'sw.js', 'precache.json'}
SHELL_ASSET_SUFFIXES = {'.css', '.js', '.woff2', '.svg', '.png', '.webmanifest', '.json'}
# Lightbox originals and print sheets stay out; the pages reference the WebP copies
SHELL_IMAGE_SUFFIXES = {'.webp'}
AUDIO_SUFFIXES = {'.ogg', '.mp3', '.wav', '.m4a', '.opus'}


def url_for(site: Path, p: Path) -> str:
    rel = p.relative_to(site).as_posix()
    if rel.endswith('index.html'):
        rel = rel[:-len('index.html')]
    return '/' + rel


def shell_files(site: Path):
    out = []
    for p in sorted(site.rglob('*')):
        if not p.is_file():
            continue
        rel = p.relative_to(site)
        top = rel.parts[0] if len(rel.parts) > 1 else ''
        if top in SHELL_EXCLUDE_DIRS or rel.name in SHELL_EXCLUDE_FILES:
            continue
        # The classic-variant stylesheets ship in every build but only the modern ones load
        if 'classic' in rel.parts:
            continue
        if rel.name == 'index.html' or rel.suffix == '.html':
            out.append(url_for(site, p))
        elif rel.parts[0] == 'assets' and 'images' in rel.parts:
            if p.suffix in SHELL_IMAGE_SUFFIXES or p.suffix == '.svg':
                out.append(url_for(site, p))
        elif rel.parts[0] == 'assets' and 'audio' in rel.parts:
            continue
        elif p.suffix in SHELL_ASSET_SUFFIXES:
            out.append(url_for(site, p))
    # Offline search needs the index (modern variant: /search.json; classic: search/search_index.json)
    for idx in (site / 'search.json', site / 'search' / 'search_index.json'):
        if idx.is_file():
            out.append(url_for(site, idx))
    return list(dict.fromkeys(out))


def galaxy_files(site: Path):
    out = []
    roots = [site / 'galaxy', site / 'vendor']
    for root in roots:
        if not root.is_dir():
            continue
        for p in sorted(root.rglob('*')):
            if not p.is_file() or p.suffix in AUDIO_SUFFIXES or p.name == 'offline.json':
                continue
            data = p.read_bytes()
            out.append({
                'url': url_for(site, p),
                'size': len(data),
                'hash': hashlib.md5(data).hexdigest()[:12],
            })
    page = site / 'galaxy.html'
    if page.is_file():
        data = page.read_bytes()
        out.append({'url': '/galaxy.html', 'size': len(data), 'hash': hashlib.md5(data).hexdigest()[:12]})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('site')
    ap.add_argument('--build', default=time.strftime('%Y%m%d%H%M%S'))
    args = ap.parse_args()
    site = Path(args.site)
    if not (site / 'index.html').is_file():
        sys.exit(f'{site} does not look like a built site')

    shell = shell_files(site)
    (site / 'precache.json').write_text(json.dumps({'build': args.build, 'files': shell}), encoding='utf-8')

    galaxy = galaxy_files(site)
    (site / 'galaxy' / 'offline.json').write_text(
        json.dumps({'build': args.build, 'files': galaxy}), encoding='utf-8')

    sw = site / 'sw.js'
    sw.write_text(sw.read_text(encoding='utf-8').replace('__BUILD__', args.build), encoding='utf-8')

    print(f'pwa-build {args.build}: {len(shell)} shell files, '
          f'{len(galaxy)} galaxy files ({sum(f["size"] for f in galaxy) / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()

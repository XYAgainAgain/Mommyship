"""Post-build PWA step: writes the service worker's file lists and stamps the build id.

Usage: python .github/scripts/pwa-build.py SITE_DIR [--build ID]

- SITE_DIR/precache.json      site shell the worker caches on install (rules, CSS/JS, fonts, art;
                               never downloads/ or the assets/rules/ ZIP staging)
- SITE_DIR/galaxy/offline.json every galaxy + vendored Three.js file with size and hash, for the
                               "Offline Galaxy Map" button and stale-entry eviction
- SITE_DIR/sw.js               __BUILD__ replaced with ID (or a timestamp)
- SITE_DIR/manifests/          one <variant>.webmanifest per assets/icons/<variant>/ folder holding an
                               icon-512.png (the Logo Lab's export layout), plus index.json listing them
"""
import argparse
import copy
import hashlib
import json
import re
import sys
import time
from pathlib import Path

SHELL_EXCLUDE_DIRS = {'osminok', 'galaxy', 'vendor', 'search', 'downloads'}
# Subtrees kept out of the shell: the rules ZIP staging (Markdown, rules.json, ~8 MB of wallpapers)
SHELL_EXCLUDE_SUBDIRS = {('assets', 'rules')}
SHELL_EXCLUDE_FILES = {'404.html', 'sitemap.xml', 'sitemap.xml.gz', 'objects.inv', 'sw.js', 'precache.json'}
SHELL_ASSET_SUFFIXES = {'.css', '.js', '.woff2', '.svg', '.png', '.webmanifest', '.json'}
# Lightbox originals and print sheets stay out; the pages reference the WebP copies
SHELL_IMAGE_SUFFIXES = {'.webp'}
AUDIO_SUFFIXES = {'.ogg', '.mp3', '.wav', '.m4a', '.opus'}
# Must match pwa.js and main.html's [\w-] check, or the browser drops a variant the build advertised
VARIANT_ID = re.compile(r'^[A-Za-z0-9_-]+$')
SAFE_FILE = re.compile(r'^[A-Za-z0-9._-]+$')
HEX_COLOR = re.compile(r'^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$')


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
        if rel.parts[:2] in SHELL_EXCLUDE_SUBDIRS:
            continue
        # Icon variant folders can hold wallpapers and oversized extras; only the list thumbnail
        # is shell material, the installer fetches the rest while online
        if rel.parts[:2] == ('assets', 'icons') and len(rel.parts) > 3:
            if rel.name != 'icon-192.png' or len(rel.parts) != 4 or not (p.parent / 'icon-512.png').is_file():
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


def variant_icons(icons, folder: Path, vid: str, keep_missing: bool):
    """Point each icon at the variant's file of the same name. Shortcuts keep the root icon when the
    variant lacks that file, so they never end up iconless; the app's own list just drops it."""
    out = []
    for icon in icons:
        if not isinstance(icon, dict):
            continue
        name = str(icon.get('src', '')).rsplit('/', 1)[-1]
        # A variant's icon.svg is foreground only, so installing from it would drop the background
        if name and not name.endswith('.svg') and (folder / name).is_file():
            out.append({**icon, 'src': f'/assets/icons/{vid}/{name}'})
        elif keep_missing:
            out.append(icon)
    return out


def variant_manifests(site: Path):
    """Clone the root manifest per icon variant: same id, start_url, scope, and shortcuts, so browsers
    treat every variant as the same app; only icons (and declared colors) change."""
    root = site / 'manifest.webmanifest'
    icons_dir = site / 'assets' / 'icons'
    out_dir = site / 'manifests'
    walls_dir = site / 'assets' / 'rules' / 'wallpapers'
    walls = sorted(p.name for p in walls_dir.iterdir() if p.is_file()) if walls_dir.is_dir() else []
    variants = []
    errors = []
    # Regenerated from scratch, so a renamed or deleted variant folder leaves no orphan to precache
    if out_dir.is_dir():
        for old in out_dir.glob('*.webmanifest'):
            old.unlink()
    if root.is_file() and icons_dir.is_dir():
        base = json.loads(root.read_text(encoding='utf-8'))
        for folder in sorted(p for p in icons_dir.iterdir() if p.is_dir()):
            vid = folder.name
            if not (folder / 'icon-512.png').is_file():
                errors.append(f'icon variant {vid!r} has no icon-512.png')
                continue
            if not VARIANT_ID.match(vid):
                errors.append(f'icon variant {vid!r}: folder names may only use letters, digits, - and _')
                continue
            meta = {}
            meta_file = folder / 'variant.json'
            if meta_file.is_file():
                try:
                    meta = json.loads(meta_file.read_text(encoding='utf-8'))
                except (ValueError, OSError) as e:
                    print(f'pwa-build: {meta_file} unreadable ({e}); using root colors', file=sys.stderr)
                if not isinstance(meta, dict):
                    meta = {}
            manifest = copy.deepcopy(base)
            manifest['icons'] = variant_icons(base.get('icons', []), folder, vid, keep_missing=False)
            for shortcut in manifest.get('shortcuts', []):
                if isinstance(shortcut, dict) and isinstance(shortcut.get('icons'), list):
                    shortcut['icons'] = variant_icons(shortcut['icons'], folder, vid, keep_missing=True)
            for key in ('theme_color', 'background_color'):
                value = meta.get(key)
                if isinstance(value, str) and HEX_COLOR.match(value):
                    manifest[key] = value
            out_dir.mkdir(exist_ok=True)
            (out_dir / f'{vid}.webmanifest').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
            thumb = 'icon-192.png' if (folder / 'icon-192.png').is_file() else 'icon-512.png'
            name = meta.get('name') if isinstance(meta.get('name'), str) and meta.get('name').strip() else vid
            entry = {
                'id': vid,
                'name': name.strip()[:80],
                'manifest': f'/manifests/{vid}.webmanifest',
                'thumb': f'/assets/icons/{vid}/{thumb}',
            }
            # Matching wallpaper is "<Variant-Id>-WxH.png"; names stay URL-safe so pwa.js can allowlist them
            wall = next((w for w in walls if w.lower().startswith(vid.lower() + '-') and SAFE_FILE.match(w)), None)
            if wall:
                entry['wallpaper'] = f'/assets/rules/wallpapers/{wall}'
            variants.append(entry)
    if errors:
        sys.exit('pwa-build: ' + '; '.join(errors))
    out_dir.mkdir(exist_ok=True)
    (out_dir / 'index.json').write_text(json.dumps({'variants': variants}, indent=2) + '\n', encoding='utf-8')
    return variants


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('site')
    ap.add_argument('--build', default=time.strftime('%Y%m%d%H%M%S'))
    args = ap.parse_args()
    site = Path(args.site)
    if not (site / 'index.html').is_file():
        sys.exit(f'{site} does not look like a built site')

    # Before the shell list, so the variant manifests and index land in the precache
    variants = variant_manifests(site)
    shell = shell_files(site)
    (site / 'precache.json').write_text(json.dumps({'build': args.build, 'files': shell}), encoding='utf-8')

    galaxy = galaxy_files(site)
    (site / 'galaxy' / 'offline.json').write_text(
        json.dumps({'build': args.build, 'files': galaxy}), encoding='utf-8')

    sw = site / 'sw.js'
    sw.write_text(sw.read_text(encoding='utf-8').replace('__BUILD__', args.build), encoding='utf-8')

    print(f'pwa-build {args.build}: {len(shell)} shell files, '
          f'{len(galaxy)} galaxy files ({sum(f["size"] for f in galaxy) / 1e6:.1f} MB), '
          f'{len(variants)} icon variant manifest(s)')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Restore a selected encrypted Git backup into an EMPTY directory."""
import argparse, hashlib, json, pathlib, subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--repo', required=True, type=pathlib.Path)
parser.add_argument('--identity', required=True, type=pathlib.Path)
parser.add_argument('--snapshot', required=True, help='Manifest filename, e.g. TIMESTAMP.json.age')
parser.add_argument('--output', required=True, type=pathlib.Path)
args = parser.parse_args()

def decrypt(file):
    return subprocess.check_output(['age', '-d', '-i', str(args.identity), str(file)])

snapshot_name = pathlib.PurePosixPath(args.snapshot)
if len(snapshot_name.parts) != 1 or snapshot_name.name in ('', '.', '..'):
    raise ValueError('Snapshot must be a filename')
manifest = json.loads(decrypt(args.repo / 'snapshots' / snapshot_name.name))
if args.output.exists() and any(args.output.iterdir()):
    raise ValueError('Output directory must be empty')
seen = set()
for record in manifest['files']:
    name = pathlib.PurePosixPath(record['path'])
    if name.is_absolute() or '..' in name.parts or '\\' in record['path'] or record['path'] in seen:
        raise ValueError('Unsafe or duplicate restore path')
    seen.add(record['path'])
    for part in record['parts']:
        if part['object'] != 'objects/' + part['sha256'] + '.age' or len(part['sha256']) != 64 or any(c not in '0123456789abcdef' for c in part['sha256']):
            raise ValueError('Unsafe object reference')
args.output.mkdir(parents=True, exist_ok=True, mode=0o700)
for record in manifest['files']:
    destination = args.output / record['path']
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with destination.open('xb') as stream:
        for part in record['parts']:
            chunk = decrypt(args.repo / part['object'])
            if hashlib.sha256(chunk).hexdigest() != part['sha256'] or len(chunk) != part['bytes']:
                raise ValueError('Backup chunk integrity check failed')
            stream.write(chunk)
    destination.chmod(0o600)
(args.output / 'snapshot-metadata.json').write_text(json.dumps({'timestamp': manifest['timestamp'], 'sourceCommit': manifest['sourceCommit']}))
print('Restored', len(manifest['files']), 'files into', args.output)

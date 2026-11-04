"""Retention metadata contains ciphertext object references, never file names."""
import datetime, json, re

STAMP = re.compile(r'^\d{8}T\d{12}Z\.json\.age$')
OBJECT = re.compile(r'^objects/[0-9a-f]{64}\.age$')

def prune_snapshots(repo, current_name, current_objects, now, days=7, keep_latest=False):
    if days < 1:
        raise ValueError('At least one day of retention is required')
    snapshots = repo / 'snapshots'
    objects = repo / 'objects'
    index_file = repo / 'snapshot-index.json'
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    files = list(snapshots.glob('*.json.age'))
    if not any(file.name == current_name for file in files):
        raise ValueError('Current snapshot must exist before pruning')
    existing_objects = sorted('objects/' + p.name for p in objects.glob('*.age'))
    # Legacy encrypted manifests cannot be decrypted on the server. Retain all
    # their objects conservatively until these legacy snapshots themselves age out.
    for file in files:
        if not STAMP.fullmatch(file.name) or file.is_symlink():
            raise ValueError('Unsafe snapshot name')
        index.setdefault(file.name, existing_objects)
    index[current_name] = sorted(set(current_objects))
    if any(not OBJECT.fullmatch(obj) for refs in index.values() for obj in refs):
        raise ValueError('Unsafe object reference')
    cutoff = now - datetime.timedelta(days=days)
    retained = {}
    expired = []
    for file in files:
        timestamp = datetime.datetime.strptime(file.name, '%Y%m%dT%H%M%S%fZ.json.age').replace(tzinfo=datetime.timezone.utc)
        if file.name == current_name or (not keep_latest and timestamp >= cutoff):
            retained[file.name] = index[file.name]
        else:
            expired.append(file)
    reachable = {obj for refs in retained.values() for obj in refs}
    for obj in reachable:
        target = repo / obj
        if target.is_symlink() or not target.is_file():
            raise ValueError('Missing or unsafe retained object')
    for file in expired:
        file.unlink()
    removed_objects = 0
    for file in objects.glob('*.age'):
        if 'objects/' + file.name not in reachable:
            if file.is_symlink() or file.resolve().parent != objects.resolve():
                raise ValueError('Unsafe deletion target')
            file.unlink()
            removed_objects += 1
    temporary = index_file.with_suffix('.tmp')
    temporary.write_text(json.dumps(retained, sort_keys=True))
    temporary.replace(index_file)
    return {'retentionDays': None if keep_latest else days, 'retentionPolicy': 'latest_only' if keep_latest else 'days', 'snapshotsKept': len(retained), 'snapshotsRemoved': len(expired), 'objectsRemoved': removed_objects}

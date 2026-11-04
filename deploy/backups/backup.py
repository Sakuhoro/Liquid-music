#!/usr/bin/env python3
"""Encrypted, deduplicated application backups to a dedicated Git branch."""
import datetime, hashlib, json, os, pathlib, socket, sqlite3, subprocess, tempfile
from retention import prune_snapshots

APP = pathlib.Path('/opt/liquid-music')
ROOT = pathlib.Path('/var/lib/liquidmusic-backup')
REPO = ROOT / 'repo'
RECIPIENT = pathlib.Path('/etc/liquidmusic-backup/recipient.pub').read_text().strip()
ENV = dict(os.environ, GIT_SSH_COMMAND='ssh -i /etc/liquidmusic-backup/github_ed25519 -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new')
STAMP = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')

def git(*args):
    return subprocess.run(['git', '-C', str(REPO), *args], check=True, env=ENV, text=True, capture_output=True).stdout.strip()

def object_parts(source, work):
    result = []
    with source.open('rb') as stream:
        while True:
            chunk = stream.read(45 * 1024 * 1024)
            if not chunk and result:
                break
            digest = hashlib.sha256(chunk).hexdigest()
            target = REPO / 'objects' / (digest + '.age')
            if not target.exists():
                plain = work / 'chunk'
                plain.write_bytes(chunk)
                cipher = work / 'chunk.age'
                subprocess.run(['age', '-r', RECIPIENT, '-o', str(cipher), str(plain)], check=True)
                target.parent.mkdir(parents=True, exist_ok=True)
                cipher.replace(target)
                plain.unlink()
            result.append({'object': str(target.relative_to(REPO)), 'sha256': digest, 'bytes': len(chunk)})
            if not chunk:
                break
    return result

def main():
    manifest = {'timestamp': STAMP, 'host': socket.gethostname(), 'sourceCommit': subprocess.check_output(['git', '-C', str(APP), 'rev-parse', 'HEAD'], text=True).strip(), 'files': []}
    with tempfile.TemporaryDirectory(prefix='snapshot-', dir=ROOT) as temp:
        work = pathlib.Path(temp)
        # SQLite online backup gives a consistent snapshot, including WAL data.
        source = sqlite3.connect('file:' + str(APP / 'state/data/liquid_music.db') + '?mode=ro', uri=True, timeout=60)
        snapshot = work / 'liquid_music.db'
        destination = sqlite3.connect(snapshot)
        source.backup(destination)
        assert destination.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        destination.close()
        source.close()
        inputs = [('data/liquid_music.db', snapshot)]
        for name in ['.env', 'compose.yaml']:
            file = APP / name
            if file.is_file():
                inputs.append(('config/' + name, file))
        for name, folder in [('data/uploads', APP / 'state/data/uploads'), ('public', APP / 'public'), ('media-overrides', APP / 'state/media'), ('nginx', pathlib.Path('/etc/nginx/sites-available'))]:
            if folder.is_dir():
                inputs.extend((name + '/' + str(file.relative_to(folder)), file) for file in sorted(folder.rglob('*')) if file.is_file())
        for name, file in inputs:
            manifest['files'].append({'path': name, 'parts': object_parts(file, work)})
        private_manifest = work / 'manifest.json'
        private_manifest.write_text(json.dumps(manifest, ensure_ascii=False))
        snapshots = REPO / 'snapshots'
        snapshots.mkdir(exist_ok=True)
        subprocess.run(['age', '-r', RECIPIENT, '-o', str(snapshots / (STAMP + '.json.age')), str(private_manifest)], check=True)
    retention = prune_snapshots(REPO, STAMP + '.json.age',
        [part['object'] for file in manifest['files'] for part in file['parts']],
        datetime.datetime.now(datetime.timezone.utc), keep_latest=True)
    remote = git('ls-remote', '--heads', 'origin', 'server-backups').split()[0]
    git('add', '-A', 'objects', 'snapshots', 'snapshot-index.json')
    tree = git('write-tree')
    # Parentless history is deliberate: deleting files in normal Git history
    # does not remove old backups. Only the dedicated backup branch is rewritten.
    commit = git('commit-tree', tree, '-m', 'Encrypted backup ' + STAMP + ' (latest snapshot only)')
    git('update-ref', 'HEAD', commit, git('rev-parse', 'HEAD'))
    summary = {'timestamp': STAMP, 'files': len(manifest['files']), 'gitCommit': commit, 'uploaded': False, **retention}
    status = ROOT / 'last-backup.json'
    status.write_text(json.dumps(summary))
    try:
        git('push', '--force-with-lease=refs/heads/server-backups:' + remote, 'origin', 'HEAD:server-backups')
    except subprocess.CalledProcessError:
        raise RuntimeError('Encrypted backup saved locally; GitHub push failed. Check deploy-key write access and network.') from None
    summary['uploaded'] = True
    status.write_text(json.dumps(summary))
    git('reflog', 'expire', '--expire=now', '--all')
    git('gc', '--prune=now', '--quiet')
    print(json.dumps(summary))

if __name__ == '__main__':
    main()

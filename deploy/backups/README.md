# Hourly encrypted backups

The Timeweb server runs `liquidmusic-backup.timer` hourly. SQLite is backed up through the online backup API and checked for integrity. Database, environment, uploads, repository public assets, runtime media overrides, Nginx configuration and an exact source commit identifier are backed up. This is an application backup, not a bootable disk image. Deleted objects are retained in Git history.

The `server-backups` branch contains only age-encrypted objects and encrypted manifests. Every file is split into chunks of at most 45 MiB. Unchanged content is uploaded once. A fresh encrypted manifest is recorded for every run. Never commit the plaintext database, .env, SSH private keys or recovery identities.

Encryption recipient: `/etc/liquidmusic-backup/recipient.pub`. The corresponding private SSH key must be kept OFF the server and outside Git. Losing it makes restoration impossible. The GitHub deploy key at `/etc/liquidmusic-backup/github_ed25519` is a separate key used only for writing encrypted backups; it cannot decrypt them. Grant it write permission in repository Settings → Deploy keys.

Monitoring:

```sh
systemctl list-timers liquidmusic-backup.timer
systemctl status liquidmusic-backup.service
journalctl -u liquidmusic-backup.service --since today
cat /var/lib/liquidmusic-backup/last-backup.json
```

`uploaded: false` means a local backup exists but GitHub upload has failed. The next successful push includes previous local commits. Local copies alone do not protect against loss of the VPS. Review backup status regularly.

## Restore

Clone `server-backups` onto a trusted recovery machine and install age. Decrypt the selected manifest:

```sh
age -d -i /secure/path/id_liquidmusic_codex -o manifest.json snapshots/TIMESTAMP.json.age
```

For each manifest file, decrypt its `parts` objects in the listed order, verify each plaintext chunk's SHA-256 and byte count, and concatenate the chunks. Restore only into an empty staging directory, rejecting absolute paths and `..` path components from manifests. Check SQLite using `PRAGMA integrity_check`. Restore `data/liquid_music.db` and `data/uploads` into `state/data`; restore `public` and media overrides into `state/media` (overrides last). Restore `.env` separately with mode 600. Check permissions before starting the container. Stop the old app and notification sender before final cutover.

The first backup on the new server contains its CURRENT staging database. It does not recover unavailable old Beget data. Source, dependency images and operating-system packages can be reconstructed separately from the recorded commit and deployment instructions.

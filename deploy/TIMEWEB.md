# Migration to Timeweb VPS/Cloud — liquidmusic.store

This deployment requires a VPS with Docker Compose v2, Nginx, Git, and Certbot. It is not a shared-hosting deployment. Source code is prepared from the previously deployed fixes; a fresh comparison with the old server is still required because SSH was unavailable during preparation.

## Data that Git does not replace

The live `data/liquid_music.db` contains customers, orders, recipes, flavor prices, collection archives, and the Telegram notification queue. Also transfer `data/uploads/` and the entire current `public/` directory. Copy credentials separately into `.env`; never commit them. Prices set to 200 RUB and the six locally supplied Bones tracks require these live data/media copies: they are not recoverable from source alone.

## Prepare the new server

```sh
git clone https://github.com/Sakuhoro/Liquid-music.git /opt/liquid-music
cd /opt/liquid-music
# Check out the reviewed migration branch/commit before building.
cp .env.example .env
chmod 600 .env
mkdir -p state/data state/media
sudo chown -R 1000:1000 state/data
docker compose build
```

Keep `ORDER_NOTIFICATIONS_ENABLED=false` during staging. Fill bot token, chat IDs and the existing webhook secret from the old server. If importing the database, leave ADMIN_PASSWORD empty; existing accounts keep their password hashes. For a deliberately fresh install, choose a strong unique ADMIN_PASSWORD before the first start.

## Consistent final migration

1. Put checkout on the old server into maintenance, stop its app and Telegram sender, and wait for in-flight sends to complete. Do not run two senders against independent database copies.
2. Back up SQLite using its online backup API, or copy it only after the application has fully stopped. Do not copy only a live `.db` file while WAL writes continue.
3. Transfer the backup as `state/data/liquid_music.db`, all old `data/uploads/` to `state/data/uploads/`, and the contents of old `public/` to `state/media/`.
4. Set `sudo chown -R 1000:1000 state/data` and make migrated media readable by the app user. Keep the original server and backup intact for rollback.
5. Start `docker compose up -d`, then verify `curl -f http://127.0.0.1:3000/api/health`. Check existing customers, orders, manual discounts, 200 RUB flavor prices, archives, product media and all audio tracks. A seeded empty database is not a completed migration.

## Domain and HTTPS

Point the A record for `liquidmusic.store` to `147.45.134.68`. Add `www` only if it will be used. Remove any stale AAAA records that route elsewhere. Install `deploy/nginx/liquidmusic.store.conf` in `/etc/nginx/sites-available/`, symlink it into `sites-enabled`, run `sudo nginx -t`, then reload Nginx. Allow inbound ports 80 and 443.

```sh
sudo certbot --nginx -d liquidmusic.store
# Include -d www.liquidmusic.store only after its DNS is ready.
```

Authorize the new Telegram login domain through BotFather `/setdomain`. After HTTPS is working, configure the bot webhook using `docker compose exec app node scripts/set-telegram-webhook.mjs`. Ensure `scripts/` is included in the runtime image. Verify Telegram login from the new domain.

Set `ORDER_NOTIFICATIONS_ENABLED=true` only once the old server's sender is stopped and the final database is imported; recreate the app with `docker compose up -d --force-recreate`. Check the existing queue and validate a new authorized test order reaches the bot. Queue entries marked sent must remain sent. Do not requeue all historical orders.

## Rollback and backups

Retain the old source, data, media and environment backup. If any real orders are accepted on the new server, migrate those changes back before rollback; switching DNS alone would lose them. Keep only one active notification sender. Back up SQLite consistently and back up media regularly. Do not run `docker compose down -v` as a cleanup shortcut.

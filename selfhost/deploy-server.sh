#!/usr/bin/env bash
set -euo pipefail

release_id="${1:?release id required}"
release_dir="/srv/yizhiji/releases/${release_id}"

if ! id -u yizhiji >/dev/null 2>&1; then
  useradd --system --home-dir /srv/yizhiji --shell /sbin/nologin yizhiji
fi

install -d -o yizhiji -g yizhiji /srv/yizhiji/data /srv/yizhiji/releases
install -d "${release_dir}"
tar -xzf /tmp/yizhiji-deploy.tar.gz -C "${release_dir}"
chown -R root:root "${release_dir}"
ln -sfn "${release_dir}" /srv/yizhiji/current

install -m 0644 "${release_dir}/selfhost/yizhiji-web.service" /etc/systemd/system/yizhiji-web.service
install -m 0644 "${release_dir}/selfhost/yizhiji-api.service" /etc/systemd/system/yizhiji-api.service
install -m 0644 "${release_dir}/selfhost/nginx-yizhiji.conf" /etc/nginx/conf.d/yizhiji.conf

install -d /srv/yizhiji/import
tar -xzf /tmp/sites-export.tar.gz -C /srv/yizhiji/import
chown -R yizhiji:yizhiji /srv/yizhiji/data /srv/yizhiji/import

ADMIN_PASSWORD="${ADMIN_PASSWORD:?admin password required}" node - <<'NODE'
const { randomBytes, scryptSync } = require("node:crypto");
const { writeFileSync, chmodSync } = require("node:fs");
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(process.env.ADMIN_PASSWORD, salt, 32).toString("hex");
const secret = randomBytes(48).toString("hex");
writeFileSync("/etc/yizhiji.env", `ADMIN_PASSWORD_HASH=${salt}:${hash}\nSESSION_SECRET=${secret}\nCOOKIE_SECURE=true\n`, { mode: 0o600 });
chmodSync("/etc/yizhiji.env", 0o600);
NODE

runuser -u yizhiji -- env \
  DATA_DIR=/srv/yizhiji/data \
  SOURCE_JSON_FILE=/srv/yizhiji/import/skills.json \
  SOURCE_ASSET_DIR=/srv/yizhiji/import/uploads \
  node "${release_dir}/selfhost/migrate-from-sites.mjs"

systemctl daemon-reload
systemctl enable --now yizhiji-web.service
systemctl enable --now yizhiji-api.service

if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" = "Enforcing" ]; then
  setsebool -P httpd_can_network_connect 1
fi

nginx -t
systemctl enable --now nginx

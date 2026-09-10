#!/usr/bin/env bash
# Creates a consistent, restorable snapshot of the self-hosted database and uploads.
set -Eeuo pipefail

data_dir="${YIZHIJI_DATA_DIR:-/srv/yizhiji/data}"
backup_dir="${YIZHIJI_BACKUP_DIR:-/srv/yizhiji/backups}"
api_service="${YIZHIJI_API_SERVICE:-yizhiji-api}"
retention_days="${YIZHIJI_BACKUP_RETENTION_DAYS:-14}"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$backup_dir/yizhiji-data-$stamp.tar.gz"
temporary="$archive.partial"
api_was_active=0

restart_api() {
  if [[ "$api_was_active" == "1" ]]; then
    systemctl start "$api_service"
  fi
}
trap restart_api EXIT

mkdir -p "$backup_dir"

if systemctl is-active --quiet "$api_service"; then
  api_was_active=1
  systemctl stop "$api_service"
fi

# The database uses WAL mode. Archive all three SQLite files while its only writer
# is stopped, together with user uploads, so this archive can be restored as a unit.
entries=(yizhiji.sqlite uploads)
[[ -f "$data_dir/yizhiji.sqlite-wal" ]] && entries+=(yizhiji.sqlite-wal)
[[ -f "$data_dir/yizhiji.sqlite-shm" ]] && entries+=(yizhiji.sqlite-shm)
tar -C "$data_dir" -czf "$temporary" "${entries[@]}"
mv -f "$temporary" "$archive"

if [[ "$api_was_active" == "1" ]]; then
  systemctl start "$api_service"
  api_was_active=0
fi

find "$backup_dir" -maxdepth 1 -type f -name 'yizhiji-data-*.tar.gz' -mtime +"$retention_days" -delete
printf 'Created %s\n' "$archive"

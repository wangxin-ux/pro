# 益智集生产数据备份与恢复

`backup-yizhiji-data.sh` 会在 API 停止期间，将下面内容归档到
`/srv/yizhiji/backups/yizhiji-data-<UTC 时间>.tar.gz`：

- `yizhiji.sqlite`
- 存在时的 `yizhiji.sqlite-wal` 与 `yizhiji.sqlite-shm`
- `uploads/`

脚本每天 03:17 UTC 由 `yizhiji-backup.timer` 执行，保留 14 天。它只删除
自己创建的 `yizhiji-data-*.tar.gz`，不会删除发布前的手工 SQLite 快照。

## 恢复

1. 先停止 `yizhiji-api`。
2. 将当前 `/srv/yizhiji/data` 改名保存，绝不直接删除。
3. 解压选定归档到新的 `/srv/yizhiji/data`，并将属主设为 `yizhiji:yizhiji`。
4. 启动 `yizhiji-api`，检查主页、管理端和一条上传媒体。

恢复前先复制一份当前数据目录；不要在运行中的 API 上覆盖数据库或上传文件。

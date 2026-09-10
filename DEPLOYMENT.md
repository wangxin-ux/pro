# 益智集 Sites 部署流程

## 阿里云正式环境（当前主站）

- 主站：`https://yizhiji.jianglang1892.xyz`
- 管理后台：`https://yizhiji.jianglang1892.xyz/admin`
- 应用目录：`/srv/yizhiji/current`
- 持久数据：`/srv/yizhiji/data`
- 元数据：SQLite `yizhiji.sqlite`
- 图片：`/srv/yizhiji/data/uploads`
- Vinext 服务：`yizhiji-web.service`，仅监听 `127.0.0.1:3001`
- API/后台网关：`yizhiji-api.service`，仅监听 `127.0.0.1:3000`
- 公网入口：Nginx 80/443；HTTP 自动跳转 HTTPS
- HTTPS：Let's Encrypt，`certbot-renew.timer` 每天检查两次续期

管理员密码哈希和会话密钥保存在服务器 `/etc/yizhiji.env`，不得写入仓库。发布新版本时保留 `/srv/yizhiji/data` 和该环境文件，只替换版本目录与 `current` 软链接。删除社区 Skill 时，服务会同步删除其图片目录。

原 Sites 站保留为迁移来源和历史版本。首次迁移使用 `selfhost/migrate-from-sites.mjs`，已经迁移的记录按原 ID 更新，不重复创建。

更新日期：2026-09-04

## 当前约定

- 项目仍处于测试和持续修改阶段。
- 暂时不要求创建 Git 提交，也不向 GitHub `origin/main` 同步。
- 继续复用现有 Sites 项目，不创建新站点。
- 社区 Skill 提交后立即公开，当前不设置审核流程。
- 线上地址保持为 `https://yizhiji-ai.joliveirazananar.chatgpt.site`。

## 固定配置

- Sites 项目 ID：`appgprj_6a97fbf147cc81918c42bcac79174423`
- D1 绑定：`DB`
- R2 绑定：`UPLOADS`
- Sites 配置文件：`.openai/hosting.json`
- Worker 入口：`worker/index.ts`
- 构建命令：`npm run build`

不要把 Sites 临时写入令牌、授权请求头或其他短期凭据写入仓库。

## 发布前检查

在 `pro` 目录执行：

```powershell
npm run build
npm run lint
```

构建必须成功。Lint 当前可能报告 `<img>` 性能警告，但不应出现 error。

完整测试可执行：

```powershell
npm test
```

目前渲染测试仍检查旧文案“本地 Codex 能力库”，而页面现为“Codex 能力库”，因此该断言会失败。发布是否可继续应以构建结果和页面人工验证为准，直到测试文案被同步。

发布前还应检查：

```powershell
git status --short
git diff --stat
```

测试阶段允许存在未提交修改，但要确认这些修改全部属于本次准备发布的内容。

## Sites 发布

1. 读取 `.openai/hosting.json`，确认项目 ID、D1 和 R2 绑定没有变化。
2. 对当前 `pro` 工作目录执行 Sites 构建准备和打包，生成包含 `dist` 的 `.tar.gz` 归档。
3. 确认归档中的 `dist/.openai/hosting.json` 和数据库迁移文件完整存在。
4. 使用现有项目 ID 保存一个新的 Site Version。
5. 以保存后返回的 Version ID 发布到现有站点。
6. 持续查询 Deployment 状态，直到状态为 `succeeded` 或明确失败。

当前处于测试阶段时，Site Version 的来源标识可以使用当前 `HEAD`，但这不代表必须新建 Git 提交。实际发布内容以打包时工作目录中的文件为准。

## 发布后验证

打开线上地址并检查：

- 首页能够正常加载，静态图片和视频没有缺失。
- 搜索、类型筛选和资源详情弹窗可用。
- PPT Master 的定制卡片和详情页显示正常。
- `/api/skills` 能读取 D1 中的社区 Skill。
- 上传一条测试 Skill 时，封面和补充图片可以写入 R2，提交后资源立即出现在主页。
- GitHub 链接和“复制调用方式”可以正常使用。
- 桌面与移动端没有明显遮挡、溢出或弹窗无法关闭的问题。

避免为了验证重复上传无意义数据；当前还没有后台删除入口。

## 数据库变更

修改 `db/schema.ts` 后先生成迁移：

```powershell
npm run db:generate
```

检查新生成的 `drizzle` SQL，确认是向前兼容的增量修改，再随站点归档一同发布。不要直接改写已经在线上执行过的旧迁移。

## 常见问题

### 归档上传超时

此前发布中，归档上传偶尔在约 60 秒后超时，但重试相同的 `save_site_version` 操作通常可以成功。重试前先确认没有已经生成对应版本，避免无意义地创建重复版本。

### Git 分支与线上版本不一致

当前本地 `main` 比 GitHub `origin/main` 超前，Sites Git 远端也不一定包含最新归档版本。这是测试阶段暂时接受的状态。判断线上内容时，以 Sites 当前成功部署的 Version ID 为准，不以 GitHub 分支为准。

### 构建成功但测试失败

先判断失败是功能问题还是测试断言仍对应旧页面内容。当前已知失败属于旧文案断言，不影响 Vinext 构建产物生成。

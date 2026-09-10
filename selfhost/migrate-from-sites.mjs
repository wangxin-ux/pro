import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const source = (process.env.SOURCE_SITE || "https://yizhiji-ai.joliveirazananar.chatgpt.site").replace(/\/$/, "");
const dataDir = resolve(process.env.DATA_DIR || join(process.cwd(), "data"));
const uploadDir = join(dataDir, "uploads");
await mkdir(uploadDir, { recursive: true });

const sourceJsonFile = process.env.SOURCE_JSON_FILE;
const sourceAssetDir = process.env.SOURCE_ASSET_DIR ? resolve(process.env.SOURCE_ASSET_DIR) : null;
let skills;
if (sourceJsonFile) {
  skills = JSON.parse(await readFile(resolve(sourceJsonFile), "utf8"));
} else {
  const response = await fetch(`${source}/api/skills`);
  if (!response.ok) throw new Error(`读取旧站数据失败：HTTP ${response.status}`);
  skills = await response.json();
}
if (!Array.isArray(skills)) throw new Error("旧站返回的数据格式不正确。");

const db = new DatabaseSync(join(dataDir, "yizhiji.sqlite"));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS community_skills (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, author TEXT NOT NULL,
    github_url TEXT NOT NULL, platform TEXT NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL, images_json TEXT NOT NULL,
    feature TEXT NOT NULL, codex_prompt TEXT NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  );
`);
const upsert = db.prepare(`INSERT INTO community_skills
  (id,name,author,github_url,platform,tags_json,images_json,feature,codex_prompt,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT(id) DO UPDATE SET name=excluded.name,author=excluded.author,github_url=excluded.github_url,
  platform=excluded.platform,tags_json=excluded.tags_json,images_json=excluded.images_json,
  feature=excluded.feature,codex_prompt=excluded.codex_prompt,updated_at=excluded.updated_at`);

let downloaded = 0;
for (const skill of skills) {
  const oldImages = JSON.parse(skill.images_json || "[]");
  const newImages = [];
  for (const image of oldImages) {
    const imageUrl = new URL(image, source);
    const relative = imageUrl.pathname.replace(/^\/api\/uploads\//, "");
    const destination = join(uploadDir, relative);
    await mkdir(dirname(destination), { recursive: true });
    if (sourceAssetDir) {
      await copyFile(join(sourceAssetDir, relative), destination);
    } else {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) throw new Error(`下载图片失败：${imageUrl} HTTP ${imageResponse.status}`);
      await writeFile(destination, Buffer.from(await imageResponse.arrayBuffer()));
    }
    newImages.push(`/api/uploads/${relative.replaceAll("\\", "/")}`);
    downloaded += 1;
  }
  const createdAt = Number(skill.created_at) || Math.floor(Date.now() / 1000);
  upsert.run(skill.id, skill.name, skill.author, skill.github_url, skill.platform || "", skill.tags_json, JSON.stringify(newImages), skill.feature, skill.codex_prompt, createdAt, Math.floor(Date.now() / 1000));
}

console.log(JSON.stringify({ migratedSkills: skills.length, downloadedImages: downloaded, source }, null, 2));

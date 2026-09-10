import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import {
  createHmac,
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const upstream = process.env.VINEXT_UPSTREAM || "http://127.0.0.1:3001";
const dataDir = resolve(process.env.DATA_DIR || join(process.cwd(), "data"));
const uploadDir = join(dataDir, "uploads");
const sessionSecret = process.env.SESSION_SECRET || "";
const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
const arkApiKey = process.env.ARK_API_KEY || "";
const arkBaseUrl =
  process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const embeddingModel =
  process.env.ARK_EMBEDDING_MODEL || "doubao-embedding-vision-251215";
const secureCookie = process.env.COOKIE_SECURE !== "false";
const cookieName = "yizhiji_admin";
const loginAttempts = new Map();

if (!sessionSecret || !passwordHash)
  throw new Error("SESSION_SECRET and ADMIN_PASSWORD_HASH are required");
await mkdir(uploadDir, { recursive: true });

const db = new DatabaseSync(join(dataDir, "yizhiji.sqlite"));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS community_skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    author TEXT NOT NULL,
    github_url TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL,
    images_json TEXT NOT NULL,
    intro TEXT NOT NULL DEFAULT '',
    feature TEXT NOT NULL,
    adapted_by TEXT NOT NULL DEFAULT '',
    install_command TEXT NOT NULL DEFAULT '',
    demo_video TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    resource_type TEXT NOT NULL DEFAULT 'Skill',
    codex_prompt TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    source TEXT NOT NULL DEFAULT 'community'
  );
  CREATE TABLE IF NOT EXISTS catalog_overrides (
    id TEXT PRIMARY KEY,
    data_json TEXT NOT NULL DEFAULT '{}',
    deleted INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS search_embeddings (
    id TEXT PRIMARY KEY,
    content_hash TEXT NOT NULL,
    vector_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS search_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_community_skills_created_at ON community_skills(created_at DESC);
  PRAGMA optimize;
`);
const skillColumns = db.prepare("PRAGMA table_info(community_skills)").all();
if (!skillColumns.some((column) => column.name === "source"))
  db.exec(
    "ALTER TABLE community_skills ADD COLUMN source TEXT NOT NULL DEFAULT 'community'",
  );
if (!skillColumns.some((column) => column.name === "summary"))
  db.exec(
    "ALTER TABLE community_skills ADD COLUMN summary TEXT NOT NULL DEFAULT ''",
  );
if (!skillColumns.some((column) => column.name === "intro"))
  db.exec(
    "ALTER TABLE community_skills ADD COLUMN intro TEXT NOT NULL DEFAULT ''",
  );
if (!skillColumns.some((column) => column.name === "adapted_by"))
  db.exec(
    "ALTER TABLE community_skills ADD COLUMN adapted_by TEXT NOT NULL DEFAULT ''",
  );
if (!skillColumns.some((column) => column.name === "install_command"))
  db.exec(
    "ALTER TABLE community_skills ADD COLUMN install_command TEXT NOT NULL DEFAULT ''",
  );
if (!skillColumns.some((column) => column.name === "demo_video"))
  db.exec(
    "ALTER TABLE community_skills ADD COLUMN demo_video TEXT NOT NULL DEFAULT ''",
  );
if (!skillColumns.some((column) => column.name === "featured"))
  db.exec(
    "ALTER TABLE community_skills ADD COLUMN featured INTEGER NOT NULL DEFAULT 0",
  );
if (!skillColumns.some((column) => column.name === "resource_type"))
  db.exec(
    "ALTER TABLE community_skills ADD COLUMN resource_type TEXT NOT NULL DEFAULT 'Skill'",
  );
db.exec("UPDATE community_skills SET intro = feature WHERE intro = ''");

const skillFields =
  "id, name, author, github_url, platform, tags_json, images_json, intro, feature, summary, adapted_by, install_command, demo_video, featured, resource_type, codex_prompt, created_at, updated_at, source";
const selectAll = db.prepare(
  `SELECT ${skillFields} FROM community_skills ORDER BY created_at DESC`,
);
const selectOne = db.prepare(
  `SELECT ${skillFields} FROM community_skills WHERE id = ?`,
);
const insertOne = db.prepare(
  "INSERT INTO community_skills (id, name, author, github_url, platform, tags_json, images_json, intro, feature, summary, adapted_by, install_command, demo_video, featured, resource_type, codex_prompt, created_at, updated_at, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
);
const updateOne = db.prepare(
  "UPDATE community_skills SET name = ?, author = ?, github_url = ?, platform = ?, tags_json = ?, images_json = ?, intro = ?, feature = ?, summary = ?, adapted_by = ?, install_command = ?, demo_video = ?, resource_type = ?, codex_prompt = ?, updated_at = ? WHERE id = ?",
);
const updateFeatured = db.prepare(
  "UPDATE community_skills SET featured = ?, updated_at = ? WHERE id = ?",
);
const deleteOne = db.prepare("DELETE FROM community_skills WHERE id = ?");
const selectOverrides = db.prepare(
  "SELECT id, data_json, deleted, updated_at FROM catalog_overrides ORDER BY updated_at DESC",
);
const upsertOverride = db.prepare(
  "INSERT INTO catalog_overrides (id, data_json, deleted, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json, deleted=excluded.deleted, updated_at=excluded.updated_at",
);
const selectEmbedding = db.prepare(
  "SELECT content_hash, vector_json FROM search_embeddings WHERE id = ?",
);
const upsertEmbedding = db.prepare(
  "INSERT INTO search_embeddings (id, content_hash, vector_json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET content_hash=excluded.content_hash, vector_json=excluded.vector_json, updated_at=excluded.updated_at",
);
const selectSearchSetting = db.prepare(
  "SELECT value FROM search_settings WHERE key = ?",
);
const upsertSearchSetting = db.prepare(
  "INSERT INTO search_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
);

function searchSettings() {
  const value = Number(selectSearchSetting.get("min_score")?.value ?? 0.45);
  return {
    minScore: Number.isFinite(value)
      ? Math.min(0.6, Math.max(0.3, value))
      : 0.45,
  };
}

function embeddingText(item) {
  return [item.name, ...(item.tags || []), item.summary, item.description]
    .filter(Boolean)
    .join("\n");
}

function normalizeVector(vector) {
  const length = Math.sqrt(
    vector.reduce((sum, value) => sum + value * value, 0),
  );
  return length ? vector.map((value) => value / length) : vector;
}

async function createEmbeddings(input) {
  if (!arkApiKey) throw new Error("语义搜索尚未配置 ARK_API_KEY。");
  const results = new Array(input.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < input.length) {
      const index = cursor++;
      const response = await fetch(`${arkBaseUrl}/embeddings/multimodal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${arkApiKey}`,
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: [{ type: "text", text: input[index] }],
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(body.error?.message || "豆包向量接口调用失败。");
      results[index] = normalizeVector(body.data?.embedding || []);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, input.length) }, worker));
  return results;
}

async function semanticSearch(query, items) {
  const texts = items.map(embeddingText);
  const hashes = texts.map((value) =>
    createHash("sha256").update(value).digest("hex"),
  );
  const vectors = new Array(items.length);
  const missing = [];
  items.forEach((item, index) => {
    const cached = selectEmbedding.get(item.id);
    if (cached?.content_hash === hashes[index])
      vectors[index] = JSON.parse(cached.vector_json);
    else missing.push(index);
  });
  const generated = await createEmbeddings([
    query,
    ...missing.map((index) => texts[index]),
  ]);
  const queryVector = generated[0];
  missing.forEach((itemIndex, generatedIndex) => {
    const vector = generated[generatedIndex + 1];
    vectors[itemIndex] = vector;
    upsertEmbedding.run(
      items[itemIndex].id,
      hashes[itemIndex],
      JSON.stringify(vector),
      Math.floor(Date.now() / 1000),
    );
  });
  const { minScore } = searchSettings();
  return items
    .map((item, index) => ({
      ...item,
      score: vectors[index].reduce(
        (sum, value, vectorIndex) => sum + value * queryVector[vectorIndex],
        0,
      ),
      match: "semantic",
    }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function json(res, status, value, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(value));
}

function normalizeGitHub(value) {
  try {
    const url = new URL(String(value).trim());
    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== "github.com"
    )
      return null;
    const [owner, repo] = url.pathname.split("/").filter(Boolean);
    return owner && repo
      ? `https://github.com/${owner}/${repo.replace(/\.git$/i, "")}`
      : null;
  } catch {
    return null;
  }
}

function parseArray(value) {
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function verifyPassword(value) {
  const [salt, expected] = passwordHash.split(":");
  if (!salt || !expected) return false;
  return safeEqual(
    scryptSync(String(value), salt, 32).toString("hex"),
    expected,
  );
}

function signSession(expires) {
  const body = `${expires}.${randomBytes(12).toString("hex")}`;
  return `${body}.${createHmac("sha256", sessionSecret).update(body).digest("hex")}`;
}

function cookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim().split(/=(.*)/s))
      .filter(([key]) => key),
  );
}

function isAdmin(req) {
  const token = cookies(req)[cookieName];
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || Number(parts[0]) < Date.now()) return false;
  const body = `${parts[0]}.${parts[1]}`;
  return safeEqual(
    createHmac("sha256", sessionSecret).update(body).digest("hex"),
    parts[2],
  );
}

function requestFromNode(req) {
  const url = `http://${req.headers.host || "localhost"}${req.url}`;
  const init = { method: req.method, headers: req.headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req;
    init.duplex = "half";
  }
  return new Request(url, init);
}

function validateFields(form, defaults = {}) {
  const requestedResourceType = String(
    form.get("resourceType") || defaults.resourceType || "Skill",
  );
  const resourceType = ["Skill", "Agent", "AI 应用"].includes(requestedResourceType)
    ? requestedResourceType
    : "Skill";
  const name = String(form.get("name") || defaults.name || "")
    .trim()
    .slice(0, 80);
  const author = String(form.get("author") || defaults.author || "")
    .trim()
    .slice(0, 80);
  const githubUrl = normalizeGitHub(
    form.get("githubUrl") || defaults.githubUrl || "",
  );
  const platform = String(form.get("platform") || defaults.platform || "")
    .trim()
    .slice(0, 500);
  const feature = String(form.get("feature") || defaults.feature || "")
    .trim()
    .slice(0, 1200);
  const intro = String(form.get("intro") || defaults.intro || feature)
    .trim()
    .slice(0, 500);
  const summary = String(form.get("summary") || defaults.summary || feature)
    .trim()
    .slice(0, 180);
  const adaptedBy = String(form.get("adaptedBy") || defaults.adaptedBy || "")
    .trim()
    .slice(0, 80);
  const installCommand = String(
    form.get("installCommand") || defaults.installCommand || "",
  )
    .trim()
    .slice(0, 1000);
  const codexPrompt = String(
    form.get("codexPrompt") || defaults.codexPrompt || "",
  )
    .trim()
    .slice(0, 800);
  const tags = parseArray(
    form.get("tags") || JSON.stringify(defaults.tags || []),
  )
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);
  if (
    !name ||
    !author ||
    !githubUrl ||
    !platform ||
    !intro ||
    !feature ||
    !summary ||
    (resourceType === "Skill" && !codexPrompt) ||
    !tags.length
  )
    return null;
  return {
    name,
    resourceType,
    author,
    githubUrl,
    platform,
    intro,
    feature,
    summary,
    adaptedBy,
    installCommand,
    codexPrompt,
    tags,
  };
}

function imageFiles(form, field) {
  return form
    .getAll(field)
    .filter((item) => item instanceof File && item.size > 0);
}

async function saveImage(file, id, index) {
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024)
    throw new Error("仅支持单张不超过 8MB 的图片。");
  const extension =
    (extname(file.name).slice(1) || file.type.split("/")[1] || "jpg")
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 8) || "jpg";
  const directory = join(uploadDir, "community", id);
  await mkdir(directory, { recursive: true });
  const filename = `${Date.now()}-${index}-${randomBytes(4).toString("hex")}.${extension}`;
  await writeFile(
    join(directory, filename),
    Buffer.from(await file.arrayBuffer()),
  );
  return `/api/uploads/community/${id}/${filename}`;
}

async function saveDemoMedia(file, id) {
  const allowed = new Set(["image/gif", "video/mp4", "video/webm"]);
  if (!allowed.has(file.type) || file.size > 60 * 1024 * 1024)
    throw new Error("演示视频仅支持不超过 60MB 的 GIF、MP4 或 WebM。");
  const extension = (extname(file.name).slice(1) || "mp4")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8);
  const directory = join(uploadDir, "community", id);
  await mkdir(directory, { recursive: true });
  const filename = `${Date.now()}-demo-${randomBytes(4).toString("hex")}.${extension}`;
  await writeFile(
    join(directory, filename),
    Buffer.from(await file.arrayBuffer()),
  );
  return `/api/uploads/community/${id}/${filename}`;
}

async function createSkill(form, source = "community") {
  const fields = validateFields(form);
  const covers = imageFiles(form, "cover");
  const cover = covers[0];
  const details = imageFiles(form, "images").slice(0, 7);
  if (!fields || covers.length !== 1 || !cover || 1 + details.length > 8)
    throw new Error(
      "请完整填写信息：封面必须且只能上传 1 张，适用平台、1–5 个标签及最多 8 张图片均需符合要求。",
    );
  const id = randomUUID();
  const files = [cover, ...details];
  const images = [];
  try {
    for (let index = 0; index < files.length; index += 1)
      images.push(await saveImage(files[index], id, index));
    const demoFiles = form
      .getAll("demoVideo")
      .filter((item) => item instanceof File && item.size > 0);
    if (demoFiles.length > 1) throw new Error("演示视频只能上传 1 个。");
    const demoVideo = demoFiles[0] ? await saveDemoMedia(demoFiles[0], id) : "";
    const now = Math.floor(Date.now() / 1000);
    insertOne.run(
      id,
      fields.name,
      fields.author,
      fields.githubUrl,
      fields.platform,
      JSON.stringify(fields.tags),
      JSON.stringify(images),
      fields.intro,
      fields.feature,
      fields.summary,
      fields.adaptedBy,
      fields.installCommand,
      demoVideo,
      0,
      fields.resourceType,
      fields.codexPrompt,
      now,
      now,
      source,
    );
    return selectOne.get(id);
  } catch (error) {
    await rm(join(uploadDir, "community", id), {
      recursive: true,
      force: true,
    });
    throw error;
  }
}

function localPathFromUrl(value) {
  const prefix = "/api/uploads/";
  if (!value.startsWith(prefix)) return null;
  const relative = normalize(
    decodeURIComponent(value.slice(prefix.length)),
  ).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = resolve(uploadDir, relative);
  return full.startsWith(uploadDir + "\\") || full.startsWith(uploadDir + "/")
    ? full
    : null;
}

async function updateSkill(id, form) {
  const current = selectOne.get(id);
  const fields = validateFields(form, {
    name: current?.name,
    author: current?.author,
    githubUrl: current?.github_url,
    platform: current?.platform,
    intro: current?.intro,
    feature: current?.feature,
    summary: current?.summary,
    adaptedBy: current?.adapted_by,
    installCommand: current?.install_command,
    resourceType: current?.resource_type,
    codexPrompt: current?.codex_prompt,
    tags: current ? parseArray(current.tags_json) : [],
  });
  if (!current || !fields) throw new Error("Skill 不存在或信息不完整。");
  const demoFiles = form
    .getAll("demoVideo")
    .filter((item) => item instanceof File && item.size > 0);
  if (demoFiles.length > 1) throw new Error("演示视频只能上传 1 个。");
  const demoVideo = demoFiles[0]
    ? await saveDemoMedia(demoFiles[0], id)
    : form.get("removeDemoVideo") === "1"
      ? ""
      : current.demo_video;
  const currentImages = parseArray(current.images_json);
  const retained = parseArray(form.get("existingImages") || "[]").filter(
    (item) => currentImages.includes(item),
  );
  const newCovers = imageFiles(form, "cover");
  if (newCovers.length > 1) throw new Error("封面只能上传 1 张。");
  const newCover = newCovers[0];
  const newDetails = imageFiles(form, "images");
  const retainedAfterCover = newCover
    ? retained.filter((item) => item !== currentImages[0])
    : retained;
  if ((newCover ? 1 : 0) + retainedAfterCover.length + newDetails.length > 8)
    throw new Error("图片总数不能超过 8 张。");
  const coverImage = newCover
    ? await saveImage(newCover, id, 0)
    : retainedAfterCover[0] === currentImages[0]
      ? currentImages[0]
      : retained.includes(currentImages[0])
        ? currentImages[0]
        : "";
  const retainedDetails = retainedAfterCover.filter(
    (item) => item !== currentImages[0],
  );
  const uploadedDetails = new Map();
  for (let index = 0; index < newDetails.length; index += 1) {
    const image = newDetails[index];
    uploadedDetails.set(
      image.name,
      await saveImage(image, id, retainedDetails.length + index + 1),
    );
  }
  const requestedOrder = parseArray(form.get("imageOrder") || "[]");
  const orderedDetails = requestedOrder.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    if (entry.type === "existing" && retainedDetails.includes(entry.value))
      return [entry.value];
    if (entry.type === "new" && uploadedDetails.has(entry.value))
      return [uploadedDetails.get(entry.value)];
    return [];
  });
  const details = [
    ...orderedDetails,
    ...retainedDetails.filter((item) => !orderedDetails.includes(item)),
    ...[...uploadedDetails.values()].filter(
      (item) => !orderedDetails.includes(item),
    ),
  ];
  const images = [...(coverImage ? [coverImage] : []), ...details];
  if (!images.length) throw new Error("至少保留或上传一张封面图片。");
  const now = Math.floor(Date.now() / 1000);
  updateOne.run(
    fields.name,
    fields.author,
    fields.githubUrl,
    fields.platform,
    JSON.stringify(fields.tags),
    JSON.stringify(images),
    fields.intro,
    fields.feature,
    fields.summary,
    fields.adaptedBy,
    fields.installCommand,
    demoVideo,
    fields.resourceType,
    fields.codexPrompt,
    now,
    id,
  );
  for (const image of currentImages.filter((item) => !images.includes(item))) {
    const file = localPathFromUrl(image);
    if (file) await rm(file, { force: true });
  }
  if (current.demo_video && current.demo_video !== demoVideo) {
    const file = localPathFromUrl(current.demo_video);
    if (file) await rm(file, { force: true });
  }
  return selectOne.get(id);
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/search" && req.method === "POST") {
    try {
      const body = await requestFromNode(req).json();
      const query = String(body.query || "")
        .trim()
        .slice(0, 200);
      const items = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
      if (!query || !items.length)
        return json(res, 200, { mode: "keyword", results: [] });
      const keyword = query.toLowerCase();
      const keywordResults = items
        .map((item) => {
          const name = String(item.name || "").toLowerCase();
          const tags = Array.isArray(item.tags)
            ? item.tags.join(" ").toLowerCase()
            : "";
          const summary = String(
            item.summary || item.description || "",
          ).toLowerCase();
          const score =
            (name.includes(keyword) ? 1 : 0) +
            (tags.includes(keyword) ? 0.4 : 0) +
            (summary.includes(keyword) ? 0.2 : 0);
          return { ...item, score, match: "keyword" };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
      if (keywordResults.length)
        return json(res, 200, { mode: "keyword", results: keywordResults });
      return json(res, 200, {
        mode: "semantic",
        results: await semanticSearch(query, items),
      });
    } catch (error) {
      return json(res, 502, { error: error.message || "搜索服务暂时不可用。" });
    }
  }
  if (url.pathname === "/api/skills" && req.method === "GET")
    return json(res, 200, selectAll.all());
  if (url.pathname === "/api/catalog-overrides" && req.method === "GET")
    return json(res, 200, selectOverrides.all());
  if (url.pathname === "/api/skills" && req.method === "POST") {
    try {
      return json(
        res,
        201,
        await createSkill(await requestFromNode(req).formData()),
      );
    } catch (error) {
      return json(res, 400, { error: error.message || "提交失败。" });
    }
  }
  if (url.pathname === "/api/admin/login" && req.method === "POST") {
    const ip = req.socket.remoteAddress || "unknown";
    const state = loginAttempts.get(ip) || { count: 0, until: 0 };
    if (state.until > Date.now())
      return json(res, 429, { error: "尝试次数过多，请稍后再试。" });
    const body = await requestFromNode(req)
      .json()
      .catch(() => ({}));
    if (!verifyPassword(body.password || "")) {
      state.count += 1;
      if (state.count >= 5) {
        state.count = 0;
        state.until = Date.now() + 15 * 60 * 1000;
      }
      loginAttempts.set(ip, state);
      return json(res, 401, { error: "密码错误。" });
    }
    loginAttempts.delete(ip);
    const expires = Date.now() + 8 * 60 * 60 * 1000;
    return json(
      res,
      200,
      { ok: true },
      {
        "Set-Cookie": `${cookieName}=${signSession(expires)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secureCookie ? "; Secure" : ""}`,
      },
    );
  }
  if (url.pathname === "/api/admin/logout" && req.method === "POST")
    return json(
      res,
      200,
      { ok: true },
      {
        "Set-Cookie": `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureCookie ? "; Secure" : ""}`,
      },
    );
  if (url.pathname === "/api/admin/session" && req.method === "GET")
    return json(res, isAdmin(req) ? 200 : 401, { authenticated: isAdmin(req) });
  if (url.pathname.startsWith("/api/admin/") && !isAdmin(req))
    return json(res, 401, { error: "请先登录。" });
  if (url.pathname === "/api/admin/skills" && req.method === "GET")
    return json(res, 200, selectAll.all());
  if (url.pathname === "/api/admin/search-settings" && req.method === "GET")
    return json(res, 200, searchSettings());
  if (url.pathname === "/api/admin/search-settings" && req.method === "PUT") {
    const body = await requestFromNode(req)
      .json()
      .catch(() => ({}));
    const minScore = Number(body.minScore);
    if (!Number.isFinite(minScore) || minScore < 0.3 || minScore > 0.6)
      return json(res, 400, { error: "模糊搜索阈值必须在 0.3 到 0.6 之间。" });
    upsertSearchSetting.run(
      "min_score",
      String(minScore),
      Math.floor(Date.now() / 1000),
    );
    return json(res, 200, { minScore });
  }
  if (url.pathname === "/api/admin/skills" && req.method === "POST") {
    try {
      return json(
        res,
        201,
        await createSkill(await requestFromNode(req).formData(), "admin"),
      );
    } catch (error) {
      return json(res, 400, { error: error.message || "新增失败。" });
    }
  }
  const match = url.pathname.match(/^\/api\/admin\/skills\/([a-f0-9-]+)$/i);
  if (match && req.method === "PUT") {
    try {
      return json(
        res,
        200,
        await updateSkill(match[1], await requestFromNode(req).formData()),
      );
    } catch (error) {
      return json(res, 400, { error: error.message || "修改失败。" });
    }
  }
  if (match && req.method === "DELETE") {
    const current = selectOne.get(match[1]);
    if (!current) return json(res, 404, { error: "Skill 不存在。" });
    deleteOne.run(match[1]);
    await rm(join(uploadDir, "community", match[1]), {
      recursive: true,
      force: true,
    });
    return json(res, 200, { ok: true });
  }
  const featuredMatch = url.pathname.match(
    /^\/api\/admin\/skills\/([a-f0-9-]+)\/featured$/i,
  );
  if (featuredMatch && req.method === "PUT") {
    const body = await requestFromNode(req)
      .json()
      .catch(() => ({}));
    const current = selectOne.get(featuredMatch[1]);
    if (!current) return json(res, 404, { error: "Skill 不存在。" });
    updateFeatured.run(
      body.featured ? 1 : 0,
      Math.floor(Date.now() / 1000),
      featuredMatch[1],
    );
    return json(res, 200, selectOne.get(featuredMatch[1]));
  }
  if (url.pathname === "/api/admin/catalog-overrides" && req.method === "GET")
    return json(res, 200, selectOverrides.all());
  const catalogMatch = url.pathname.match(
    /^\/api\/admin\/catalog\/(builtin-\d+)$/,
  );
  if (catalogMatch && req.method === "PATCH") {
    const body = await requestFromNode(req)
      .json()
      .catch(() => ({}));
    const existing = selectOverrides.get(catalogMatch[1]);
    let data = {};
    try {
      data = JSON.parse(existing?.data_json || "{}");
    } catch {
      data = {};
    }
    data.featured = Boolean(body.featured);
    upsertOverride.run(
      catalogMatch[1],
      JSON.stringify(data),
      0,
      Math.floor(Date.now() / 1000),
    );
    return json(res, 200, { featured: data.featured });
  }
  if (catalogMatch && req.method === "PUT") {
    try {
      const form = await requestFromNode(req).formData();
      const fields = validateFields(form);
      if (!fields) throw new Error("请完整填写所有字段。");
      const existingImages = parseArray(form.get("existingImages") || "[]");
      const covers = imageFiles(form, "cover");
      if (covers.length > 1) throw new Error("封面只能上传 1 张。");
      const id = catalogMatch[1];
      const previous = selectOverrides.get(id);
      let previousData = {};
      try {
        previousData = JSON.parse(previous?.data_json || "{}");
      } catch {
        previousData = {};
      }
      const detailFiles = imageFiles(form, "images");
      const newImages = [...covers, ...detailFiles];
      if (existingImages.length + newImages.length > 8)
        throw new Error("图片总数不能超过 8 张。");
      const uploaded = [];
      for (let index = 0; index < newImages.length; index += 1)
        uploaded.push(
          await saveImage(newImages[index], `catalog-${id}`, index),
        );
      const cover = covers.length ? uploaded[0] : existingImages[0] || "";
      const retainedDetails = existingImages.slice(1);
      const uploadedDetails = new Map(
        detailFiles.map((file, index) => [
          file.name,
          uploaded[index + (covers.length ? 1 : 0)],
        ]),
      );
      const requestedOrder = parseArray(form.get("imageOrder") || "[]");
      const orderedDetails = requestedOrder.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        if (entry.type === "existing" && retainedDetails.includes(entry.value))
          return [entry.value];
        if (entry.type === "new" && uploadedDetails.has(entry.value))
          return [uploadedDetails.get(entry.value)];
        return [];
      });
      const images = [
        ...(cover ? [cover] : []),
        ...orderedDetails,
        ...retainedDetails.filter((item) => !orderedDetails.includes(item)),
        ...[...uploadedDetails.values()].filter(
          (item) => !orderedDetails.includes(item),
        ),
      ];
      const data = {
        name: fields.name,
        author: fields.author,
        githubUrl: fields.githubUrl,
        platform: fields.platform,
        tags: fields.tags,
        description: fields.intro,
        summary: fields.summary,
        caseSummary: fields.feature,
        adaptedBy: fields.adaptedBy,
        installCommand: fields.installCommand,
        featured: Boolean(previousData.featured),
        prompt: fields.codexPrompt,
        cover: images[0] || "",
        media: images.map((src, index) => ({
          type: "image",
          src,
          alt: `${fields.name} ${index + 1}`,
        })),
      };
      const demoFiles = form
        .getAll("demoVideo")
        .filter((item) => item instanceof File && item.size > 0);
      if (demoFiles.length > 1) throw new Error("演示视频只能上传 1 个。");
      if (demoFiles[0])
        data.demoVideo = await saveDemoMedia(demoFiles[0], `catalog-${id}`);
      else if (form.get("removeDemoVideo") !== "1")
        data.demoVideo = String(form.get("existingDemoVideo") || "");
      upsertOverride.run(
        id,
        JSON.stringify(data),
        0,
        Math.floor(Date.now() / 1000),
      );
      return json(res, 200, {
        id,
        data_json: JSON.stringify(data),
        deleted: 0,
      });
    } catch (error) {
      return json(res, 400, { error: error.message || "修改失败。" });
    }
  }
  if (catalogMatch && req.method === "DELETE") {
    upsertOverride.run(catalogMatch[1], "{}", 1, Math.floor(Date.now() / 1000));
    return json(res, 200, { ok: true });
  }
  return false;
}

async function serveUpload(res, pathname) {
  const file = localPathFromUrl(pathname);
  if (!file) return json(res, 404, { error: "Not Found" });
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error();
    const types = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
    };
    res.writeHead(200, {
      "Content-Type":
        types[extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": info.size,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(file).pipe(res);
  } catch {
    json(res, 404, { error: "Not Found" });
  }
}

async function proxy(req, res) {
  const target = new URL(req.url, upstream);
  const response = await fetch(target, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    duplex: "half",
    redirect: "manual",
  });
  const headers = Object.fromEntries(response.headers);
  delete headers["transfer-encoding"];
  delete headers.connection;
  res.writeHead(response.status, headers);
  if (!response.body) return res.end();
  for await (const chunk of response.body) res.write(chunk);
  res.end();
}

createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`,
    );
    if (url.pathname.startsWith("/api/uploads/"))
      return await serveUpload(res, url.pathname);
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, url);
      if (handled !== false) return;
    }
    await proxy(req, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) json(res, 500, { error: "服务器暂时无法处理请求。" });
    else res.end();
  }
}).listen(port, host, () =>
  console.log(`Yizhiji gateway listening on http://${host}:${port}`),
);

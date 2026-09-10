"use client";
import {
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { resources, type Resource } from "../page";
import "./admin.css";
type Skill = {
  id: string;
  name: string;
  author: string;
  github_url: string;
  platform: string;
  tags_json: string;
  images_json: string;
  intro: string;
  feature: string;
  summary: string;
  codex_prompt: string;
  adapted_by: string;
  install_command: string;
  demo_video: string;
  featured: number;
  source?: "community" | "admin";
};
type Override = { id: string; data_json: string; deleted: number };
type Item = {
  id: string;
  kind: "builtin" | "upload";
  source: "community" | "admin";
  name: string;
  author: string;
  githubUrl: string;
  platform: string;
  tags: string[];
  images: string[];
  intro: string;
  feature: string;
  summary: string;
  codexPrompt: string;
  adaptedBy: string;
  installCommand: string;
  demoVideo: string;
  featured: boolean;
};
type PreviewItem = {
  id: string;
  src: string;
  existing?: string;
  file?: File;
};
const list = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const compactSummary = (value: string) => {
  const text = value.trim().replace(/\s+/g, " ");
  return (text.match(/^.*?[。！？.!?](?:\s|$)/)?.[0] || text).slice(0, 90);
};
const fromResource = (
  resource: Resource,
  index: number,
  override?: Override,
): Item | null => {
  if (override?.deleted) return null;
  let value = resource;
  if (override?.data_json) {
    try {
      value = { ...resource, ...JSON.parse(override.data_json) };
    } catch {
      value = resource;
    }
  }
  return {
    id: `builtin-${index}`,
    kind: "builtin",
    source: "admin",
    name: value.name,
    author: value.author || "益智集",
    githubUrl: value.githubUrl || "https://github.com/openai/openai-cookbook",
    platform: value.platform || value.category,
    tags: value.tags,
    images: [
      value.cover,
      ...(value.media || [])
        .filter((m) => m.type === "image")
        .map((m) => m.src),
    ].filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i),
    intro: value.description,
    feature: value.caseSummary || value.description,
    summary: value.summary || compactSummary(value.description),
    codexPrompt: value.prompt,
    adaptedBy: value.adaptedBy || "",
    installCommand: value.installCommand || "",
    demoVideo: value.demoVideo || "",
    featured: Boolean(value.featured),
  };
};
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null),
    [password, setPassword] = useState(""),
    [skills, setSkills] = useState<Skill[]>([]),
    [overrides, setOverrides] = useState<Override[]>([]),
    [editing, setEditing] = useState<Item | null>(null),
    [filter, setFilter] = useState<"all" | "community" | "admin">("all"),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [coverPreview, setCoverPreview] = useState(""),
    [detailPreviews, setDetailPreviews] = useState<PreviewItem[]>([]),
    [draggedPreview, setDraggedPreview] = useState<string | null>(null),
    [demoPreview, setDemoPreview] = useState("");
  const [minScore, setMinScore] = useState("0.45");
  const coverInput = useRef<HTMLInputElement>(null);
  const load = async () => {
    const [a, b] = await Promise.all([
      fetch("/api/admin/skills"),
      fetch("/api/admin/catalog-overrides"),
    ]);
    if (!a.ok) {
      setAuthenticated(false);
      return;
    }
    setSkills(await a.json());
    setOverrides(b.ok ? await b.json() : []);
    setAuthenticated(true);
    const settings = await fetch("/api/admin/search-settings");
    if (settings.ok) setMinScore(String((await settings.json()).minScore));
  };
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/skills"),
      fetch("/api/admin/catalog-overrides"),
    ]).then(async ([a, b]) => {
      if (!active) return;
      if (!a.ok) {
        setAuthenticated(false);
        return;
      }
      setSkills(await a.json());
      setOverrides(b.ok ? await b.json() : []);
      setAuthenticated(true);
      const settings = await fetch("/api/admin/search-settings");
      if (active && settings.ok)
        setMinScore(String((await settings.json()).minScore));
    });
    return () => {
      active = false;
    };
  }, []);
  const items = useMemo(() => {
    const builtins = resources
      .map((r, i) =>
        fromResource(
          r,
          i,
          overrides.find((o) => o.id === `builtin-${i}`),
        ),
      )
      .filter((v): v is Item => Boolean(v));
    const uploads = skills.map((s): Item => ({
      id: s.id,
      kind: "upload",
      source: s.source || "community",
      name: s.name,
      author: s.author,
      githubUrl: s.github_url,
      platform: s.platform,
      tags: list(s.tags_json),
      images: list(s.images_json),
      intro: s.intro || s.feature,
      feature: s.feature,
      summary: s.summary || compactSummary(s.feature),
      codexPrompt: s.codex_prompt,
      adaptedBy: s.adapted_by || "",
      installCommand: s.install_command || "",
      demoVideo: s.demo_video || "",
      featured: Boolean(s.featured),
    }));
    return [...uploads, ...builtins];
  }, [skills, overrides]);
  const visible = items.filter((item) => {
    const sourceMatched = filter === "all" || item.source === filter;
    const keyword = query.trim().toLowerCase();
    const content =
      `${item.name} ${item.author} ${item.feature} ${item.tags.join(" ")}`.toLowerCase();
    return sourceMatched && (!keyword || content.includes(keyword));
  });
  const login = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await r.json();
    if (r.ok) {
      setPassword("");
      await load();
    } else setNotice(data.error || "登录失败");
    setBusy(false);
  };
  const choose = (item: Item | null) => {
    setEditing(item);
    setNotice("");
    setCoverPreview("");
    setDetailPreviews(
      (item?.images.slice(1) || []).map((src) => ({
        id: `existing:${src}`,
        src,
        existing: src,
      })),
    );
    setDraggedPreview(null);
    setDemoPreview("");
  };
  const reorderPreview = (targetId: string) => {
    if (!draggedPreview || draggedPreview === targetId) return;
    setDetailPreviews((items) => {
      const from = items.findIndex((item) => item.id === draggedPreview);
      const to = items.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0) return items;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    const form = new FormData(e.currentTarget);
    const retainedCover = editing?.images[0];
    const existingImages = [
      ...(retainedCover ? [retainedCover] : []),
      ...detailPreviews.flatMap((item) =>
        item.existing ? [item.existing] : [],
      ),
    ];
    form.set("existingImages", JSON.stringify(existingImages));
    form.set(
      "imageOrder",
      JSON.stringify(
        detailPreviews.map((item) =>
          item.existing
            ? { type: "existing", value: item.existing }
            : { type: "new", value: item.id },
        ),
      ),
    );
    form.delete("images");
    detailPreviews.forEach((item) => {
      if (item.file) form.append("images", item.file, item.id);
    });
    form.set(
      "tags",
      JSON.stringify(
        String(form.get("tagsText") || "")
          .split(/[，,]/)
          .map((v) => v.trim())
          .filter(Boolean)
          .slice(0, 5),
      ),
    );
    form.delete("tagsText");
    const url =
      editing?.kind === "builtin"
        ? `/api/admin/catalog/${editing.id}`
        : editing
          ? `/api/admin/skills/${editing.id}`
          : "/api/admin/skills";
    const r = await fetch(url, {
      method: editing ? "PUT" : "POST",
      body: form,
    });
    const data = await r.json();
    if (r.ok) {
      choose(null);
      (e.target as HTMLFormElement).reset();
      setNotice("保存成功。");
      await load();
    } else setNotice(data.error || "保存失败");
    setBusy(false);
  };
  const remove = async (item: Item) => {
    if (!confirm(`确认删除“${item.name}”？`)) return;
    setBusy(true);
    const url =
      item.kind === "builtin"
        ? `/api/admin/catalog/${item.id}`
        : `/api/admin/skills/${item.id}`;
    const r = await fetch(url, { method: "DELETE" });
    if (r.ok) {
      choose(null);
      setNotice("已删除。");
      await load();
    } else setNotice("删除失败。");
    setBusy(false);
  };
  const toggleFeatured = async (item: Item) => {
    setBusy(true);
    setNotice("");
    const url =
      item.kind === "builtin"
        ? `/api/admin/catalog/${item.id}`
        : `/api/admin/skills/${item.id}/featured`;
    const response = await fetch(url, {
      method: item.kind === "builtin" ? "PATCH" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !item.featured }),
    });
    if (response.ok) {
      setNotice(item.featured ? "已取消推荐。" : "已设为精选推荐。 ");
      await load();
    } else {
      const data = await response.json().catch(() => ({}));
      setNotice(data.error || "推荐状态保存失败。 ");
    }
    setBusy(false);
  };
  const saveSearchSettings = async () => {
    setBusy(true);
    const response = await fetch("/api/admin/search-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minScore: Number(minScore) }),
    });
    const data = await response.json();
    setNotice(
      response.ok ? "智能搜索参数已保存。" : data.error || "保存失败。",
    );
    setBusy(false);
  };
  if (authenticated === null)
    return (
      <main className="admin-shell">
        <p>正在确认管理员身份…</p>
      </main>
    );
  if (!authenticated)
    return (
      <main className="admin-login">
        <section>
          <Link href="/" className="admin-brand">
            <b>益</b>益智集
          </Link>
          <span>ADMIN CONSOLE</span>
          <h1>管理员登录</h1>
          <p>登录后可管理主站全部 Skill。</p>
          <form onSubmit={login}>
            <label>
              管理员密码
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {notice && <em>{notice}</em>}
            <button disabled={busy}>{busy ? "正在登录…" : "登录"}</button>
          </form>
        </section>
      </main>
    );
  const images = editing?.images || [];
  return (
    <main className="admin-shell">
      <header>
        <Link href="/" className="admin-brand">
          <b>益</b>益智集
        </Link>
        <div>
          <span>{items.length} 个 Skill</span>
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              setAuthenticated(false);
            }}
          >
            退出登录
          </button>
        </div>
      </header>
      <div className="admin-layout">
        <section className="admin-list">
          <div className="admin-heading">
            <div>
              <span>CONTENT</span>
              <h1>Skill 管理</h1>
            </div>
          </div>
          <label className="admin-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索 Skill、作者、标签或功能…"
              aria-label="搜索 Skill"
            />
          </label>
          <div className="admin-filters">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              全部
            </button>
            <button
              className={filter === "community" ? "active" : ""}
              onClick={() => setFilter("community")}
            >
              社区上传
            </button>
            <button
              className={filter === "admin" ? "active" : ""}
              onClick={() => setFilter("admin")}
            >
              管理上传
            </button>
          </div>
          <div className="search-config">
            <div>
              <strong>智能搜索</strong>
              <small>调整模糊描述进入结果的最低相关度</small>
            </div>
            <label>
              MIN_SCORE
              <input
                type="number"
                min="0.3"
                max="0.6"
                step="0.01"
                value={minScore}
                onChange={(event) => setMinScore(event.target.value)}
              />
            </label>
            <button type="button" onClick={saveSearchSettings} disabled={busy}>
              保存参数
            </button>
          </div>
          <div className="admin-cards">
            {visible.map((item) => (
              <article
                key={`${item.kind}-${item.id}`}
                className={editing?.id === item.id ? "active" : ""}
              >
                <button
                  className={`recommend ${item.featured ? "active" : ""}`}
                  type="button"
                  aria-label={
                    item.featured
                      ? `取消推荐 ${item.name}`
                      : `推荐 ${item.name}`
                  }
                  title={item.featured ? "取消推荐" : "推荐为精选"}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFeatured(item);
                  }}
                >
                  👍
                </button>
                <button
                  className="card-select"
                  type="button"
                  onClick={() => choose(item)}
                  aria-label={`编辑 ${item.name}`}
                />
                {item.images[0] ? (
                  <img src={item.images[0]} alt="" />
                ) : (
                  <div className="admin-image-placeholder">
                    {item.name.slice(0, 2)}
                  </div>
                )}
                <div>
                  <small>
                    <b className={`origin ${item.source}`}>
                      {item.source === "community" ? "社区上传" : "管理上传"}
                    </b>{" "}
                    {item.author}
                    {item.featured && <b className="admin-featured">精选</b>}
                  </small>
                  <h2>{item.name}</h2>
                  <p>{item.feature}</p>
                  <nav>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        choose(item);
                      }}
                    >
                      编辑
                    </button>
                    <button
                      className="danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        remove(item);
                      }}
                    >
                      删除
                    </button>
                  </nav>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="admin-editor">
          <div className="admin-editor-head">
            <span>{editing ? "EDIT SKILL" : "NEW SKILL"}</span>
            <button type="button" onClick={() => choose(null)}>
              ＋ 上传新 Skill
            </button>
          </div>
          <h2>{editing ? `修改 ${editing.name}` : "管理上传 Skill"}</h2>
          <p>
            所有 Skill 共用 PPT Master 模板。封面必须且只能 1 张，图片总计最多 8
            张。
          </p>
          <form key={editing?.id || "new"} onSubmit={save}>
            <label>
              名称
              <input
                name="name"
                defaultValue={editing?.name}
                required={!editing}
              />
            </label>
            <label>
              作者
              <input
                name="author"
                defaultValue={editing?.author}
                required={!editing}
              />
            </label>
            <label>
              GitHub 仓库地址
              <input
                name="githubUrl"
                type="url"
                defaultValue={editing?.githubUrl}
                required={!editing}
              />
            </label>
            <label>
              适用平台
              <textarea
                name="platform"
                defaultValue={editing?.platform}
                required={!editing}
              />
            </label>
            <label>
              标签（逗号分隔）
              <input
                name="tagsText"
                defaultValue={editing?.tags.join("，")}
                required={!editing}
              />
            </label>
            <label>
              功能总结
              <textarea
                name="summary"
                maxLength={180}
                defaultValue={editing?.summary}
                required={!editing}
                placeholder="用于搜索结果展示，不在详情页显示"
              />
            </label>
            <label>
              简介
              <textarea
                name="intro"
                maxLength={500}
                defaultValue={editing?.intro}
                required={!editing}
                placeholder="显示在 Skill 卡片和详情页标题下方"
              />
            </label>
            <label>
              功能介绍
              <textarea
                name="feature"
                defaultValue={editing?.feature}
                required={!editing}
                placeholder="显示在 Skill 详情页的功能介绍板块"
              />
            </label>
            <label>
              Codex 调用方式
              <textarea
                name="codexPrompt"
                defaultValue={editing?.codexPrompt}
                required={!editing}
              />
            </label>
            <label>
              改编者（可选）
              <input
                name="adaptedBy"
                defaultValue={editing?.adaptedBy}
                placeholder="例如：演示人"
              />
            </label>
            <label>
              安装到 Codex
              <textarea
                name="installCommand"
                defaultValue={editing?.installCommand}
                placeholder="例如：npx skills add owner/repository -a codex -g -y"
              />
            </label>
            {editing && images[0] && (
              <fieldset>
                <legend>当前封面</legend>
                <span className="upload-preview current-cover">
                  <img src={images[0]} alt="当前封面" />
                  <b>上传新封面后替换</b>
                </span>
              </fieldset>
            )}
            <label>
              {editing
                ? "替换封面（可选，只能 1 张）"
                : "封面（必须且只能 1 张）"}
              <input
                ref={coverInput}
                name="cover"
                type="file"
                accept="image/*"
                required={!editing}
                onChange={(e) =>
                  setCoverPreview(
                    e.target.files?.[0]
                      ? URL.createObjectURL(e.target.files[0])
                      : "",
                  )
                }
              />
              {coverPreview && (
                <span className="upload-preview">
                  <img src={coverPreview} alt="封面预览" />
                  <b>封面预览</b>
                  <button
                    className="clear-cover-preview"
                    type="button"
                    onClick={() => {
                      setCoverPreview("");
                      if (coverInput.current) coverInput.current.value = "";
                    }}
                  >
                    删除
                  </button>
                </span>
              )}
            </label>
            <label>
              预览图（可选，可拖动排序）
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setDetailPreviews((items) => [
                    ...items,
                    ...files.map((file, index) => ({
                      id: `new:${Date.now()}:${index}:${file.name}`,
                      src: URL.createObjectURL(file),
                      file,
                    })),
                  ]);
                  e.currentTarget.value = "";
                }}
              />
              {detailPreviews.length > 0 && (
                <span className="preview-sort-list">
                  {detailPreviews.map((item, index) => (
                    <span
                      className={`preview-sort-item ${draggedPreview === item.id ? "dragging" : ""}`}
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggedPreview(item.id)}
                      onDragOver={(event: DragEvent<HTMLSpanElement>) => {
                        event.preventDefault();
                        reorderPreview(item.id);
                      }}
                      onDragEnd={() => setDraggedPreview(null)}
                    >
                      <img src={item.src} alt={`预览图 ${index + 1}`} />
                      <small>{index + 1}</small>
                      <button
                        type="button"
                        aria-label={`删除预览图 ${index + 1}`}
                        title="删除预览图"
                        onClick={() =>
                          setDetailPreviews((items) =>
                            items.filter((value) => value.id !== item.id),
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </span>
              )}
            </label>
            <label>
              演示视频（可选，GIF / MP4 / WebM，最大 60MB）
              <input
                name="demoVideo"
                type="file"
                accept="image/gif,video/mp4,video/webm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setDemoPreview(file ? URL.createObjectURL(file) : "");
                }}
              />
              <input
                type="hidden"
                name="existingDemoVideo"
                value={editing?.demoVideo || ""}
              />
              {(demoPreview || editing?.demoVideo) && (
                <span className="demo-video-preview">
                  {(demoPreview || editing?.demoVideo || "")
                    .toLowerCase()
                    .endsWith(".gif") ? (
                    <img
                      src={demoPreview || editing?.demoVideo}
                      alt="演示视频预览"
                    />
                  ) : (
                    <video
                      src={demoPreview || editing?.demoVideo}
                      controls
                      muted
                    />
                  )}
                  {editing?.demoVideo && !demoPreview && (
                    <span>
                      <input type="checkbox" name="removeDemoVideo" value="1" />
                      删除现有演示视频
                    </span>
                  )}
                </span>
              )}
            </label>
            {notice && <em>{notice}</em>}
            <button className="save" disabled={busy}>
              {busy ? "正在保存…" : editing ? "保存修改" : "新增并公开"}
            </button>
            {editing && (
              <button
                className="exit-edit"
                type="button"
                onClick={() => choose(null)}
              >
                退出编辑
              </button>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

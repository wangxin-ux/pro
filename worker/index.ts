/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  UPLOADS: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

function normalizeGitHubRepositoryUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") return null;
    const [owner, repository] = url.pathname.split("/").filter(Boolean);
    if (!owner || !repository) return null;
    return `https://github.com/${owner}/${repository.replace(/\.git$/i, "")}`;
  } catch {
    return null;
  }
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/skills") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT id, name, author, github_url, platform, tags_json, images_json, feature, codex_prompt, created_at FROM community_skills ORDER BY created_at DESC").all();
        return Response.json(results);
      }
      if (request.method === "POST") {
        const form = await request.formData();
        const name = String(form.get("name") ?? "").trim().slice(0, 80);
        const author = String(form.get("author") ?? "").trim().slice(0, 80);
        const githubUrl = normalizeGitHubRepositoryUrl(String(form.get("githubUrl") ?? "").trim().slice(0, 300));
        const platform = String(form.get("platform") ?? "").trim().slice(0, 500);
        const feature = String(form.get("feature") ?? "").trim().slice(0, 1200);
        const codexPrompt = String(form.get("codexPrompt") ?? "").trim().slice(0, 800);
        let tags: string[] = [];
        try { tags = JSON.parse(String(form.get("tags") ?? "[]")); } catch { /* validation below */ }
        tags = Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 5) : [];
        const cover = form.get("cover");
        const detailImages = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0).slice(0, 7);
        const images = [cover, ...detailImages].filter((item): item is File => item instanceof File && item.size > 0);
        if (!name || !author || !githubUrl || !platform || !feature || !codexPrompt || !tags.length || !images.length || images.length > 8) return Response.json({ error: "请完整填写信息：封面、适用平台、1–5 个标签及最多 8 张图片均需符合要求。" }, { status: 400 });
        if (!githubUrl) return Response.json({ error: "请填写有效的 GitHub 仓库地址，例如 https://github.com/owner/repo。" }, { status: 400 });
        if (images.some((image) => !image.type.startsWith("image/") || image.size > 8 * 1024 * 1024)) return Response.json({ error: "仅支持单张不超过 8MB 的图片。" }, { status: 400 });
        const id = crypto.randomUUID();
        const imageUrls = await Promise.all(images.map(async (image, index) => {
          const extension = image.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
          const key = `community/${id}/${index}.${extension}`;
          await env.UPLOADS.put(key, image.stream(), { httpMetadata: { contentType: image.type } });
          return `/api/uploads/${key}`;
        }));
        const createdAt = Math.floor(Date.now() / 1000);
        await env.DB.prepare("INSERT INTO community_skills (id, name, author, github_url, platform, tags_json, images_json, feature, codex_prompt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, name, author, githubUrl, platform, JSON.stringify(tags), JSON.stringify(imageUrls), feature, codexPrompt, createdAt).run();
        return Response.json({ id, name, author, github_url: githubUrl, platform, tags_json: JSON.stringify(tags), images_json: JSON.stringify(imageUrls), feature, codex_prompt: codexPrompt, created_at: createdAt }, { status: 201 });
      }
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (url.pathname.startsWith("/api/uploads/") && request.method === "GET") {
      const key = decodeURIComponent(url.pathname.slice("/api/uploads/".length));
      const object = await env.UPLOADS.get(key);
      if (!object) return new Response("Not Found", { status: 404 });
      return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

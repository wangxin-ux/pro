import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Yizhiji resource library", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>益智集｜免费的 AI 工具公益导航<\/title>/i);
  assert.match(html, /本地 Codex 能力库/);
  assert.match(html, /不只告诉你/);
  assert.match(html, /\/cases\/nuwa-demo\.mp4/);
  assert.match(html, /\/cases\/nuwa-landing\.png/);
  assert.match(html, /https:\/\/yizhiji-ai\.quyenmthao\.chatgpt\.site\/og\.png/);
});

test("ships the case media referenced by the homepage", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const media = [
    "../public/og.png",
    "../public/cases/nuwa-demo.mp4",
    "../public/cases/nuwa-landing.png",
    "../public/cases/dream-skin.jpg",
    "../public/cases/presentations.png",
  ];

  await Promise.all(media.map((path) => access(new URL(path, import.meta.url))));
  assert.match(page, /nuwa-demo\.mp4/);
  assert.match(page, /nuwa-landing\.png/);
  assert.match(page, /const resources/);
  assert.match(page, /type: "Skill" \| "Agent" \| "AI 应用"/);
});

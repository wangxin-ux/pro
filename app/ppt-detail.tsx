"use client";

import { useEffect, useRef, useState } from "react";
import "./ppt-detail.css";

type Props = { onClose: () => void; onCopy: () => void; copied: boolean; githubUrl: string };

function FactIcon({ kind }: { kind: "author" | "github" | "platform" }) {
  return <span className="ppt-fact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    {kind === "author" ? <><path d="M9 3.3a4 4 0 1 0 6 0M5 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2M8 20v-2h8v2M4 8a3 3 0 0 0 0 6M2 19v-1a4 4 0 0 1 3-3"/></> : kind === "platform" ? <><path d="m12 2-10 5 10 5 10-5-10-5ZM2 12l10 5 10-5M2 17l10 5 10-5"/></> : <path fill="currentColor" stroke="none" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.4-1.22.72-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.16a10.66 10.66 0 0 1 5.6 0c2.14-1.46 3.08-1.16 3.08-1.16.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.27-5.14 5.55.4.35.77 1.03.77 2.08v3.1c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z"/>}
  </svg></span>;
}

export default function PptDetail({ onClose, onCopy, copied, githubUrl }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / 1586, entry.contentRect.height / 992)));
    observer.observe(el);
    closeButton.current?.focus({ preventScroll: true });
    return () => observer.disconnect();
  }, []);
  return <div ref={viewport} className="ppt-reference-viewport" role="presentation">
    <section className="ppt-reference-stage" role="dialog" aria-modal="true" aria-labelledby="ppt-reference-title" style={{ transform: `translate(-50%, -50%) scale(${scale})`, visibility: scale ? "visible" : "hidden" }}>
      <img className="ppt-reference-media" src="/cases/deerflow-ppt-detail-cover-reference.png" alt="DeerFlow Agent 界面示例" />
      <div className="ppt-reference-wash" aria-hidden="true" />
      <button ref={closeButton} className="ppt-reference-close" onClick={onClose} aria-label="关闭详情"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      <h2 id="ppt-reference-title">PPT Generation</h2>
      <p className="ppt-reference-description">DeerFlow 的演示文稿生成 Skill：按统一视觉风格逐页生成幻灯片图像，<br />并自动合成为专业 PPTX。</p>
      <div className="ppt-reference-tags"><span>PPTX</span><span>AI 生图</span><span>统一风格</span><span>DeerFlow</span></div>
      <div className="ppt-reference-facts">
        <div className="ppt-reference-author"><FactIcon kind="author" /><div><span>作者</span><p>ByteDance DeerFlow 团队</p></div></div>
        <div className="ppt-reference-github"><FactIcon kind="github" /><div><span>GitHub</span><a href={githubUrl} target="_blank" rel="noreferrer">查看开源项目 →</a></div></div>
        <div className="ppt-reference-platform"><FactIcon kind="platform" /><div><span>适用平台</span><p>DeerFlow；可由 Codex、Claude Code、Cursor 等<br />编码 Agent 接入与调用</p></div></div>
      </div>
      <div className="ppt-reference-case"><h3>从内容大纲到统一视觉的完整演示文稿</h3><p>可规划多页结构，选择版式与风格，暗黑高级、现代简洁、Keynote 等视觉方向；<br />每页会沿用前一页的视觉参考，使整套演示保持一致。</p></div>
      <div className="ppt-reference-prompt"><h3>在 Codex 中这样说</h3><p>使用 PPT Generation，基于这份大纲生成 10 页 16:9 的商务风格 PPTX，<br />并保持整套视觉统一。</p><button onClick={onCopy}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1c1.5 7 4 9.5 11 11-7 1.5-9.5 4-11 11C10.5 16 8 13.5 1 12c7-1.5 9.5-4 11-11Z"/></svg>{copied ? "已复制 ✓" : "复制调用方式"}</button></div>
    </section>
  </div>;
}

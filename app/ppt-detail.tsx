"use client";
import { useEffect, useRef, useState } from "react";
import type { Resource } from "./page";
import "./ppt-detail.css";
type Props = {
  onClose: () => void;
  onCopy: () => void;
  copied: boolean;
  resource: Resource;
};
const pptMasterSlides = [
  "/cases/ppt-master-preview-a.png",
  "/cases/ppt-master-preview-b.png",
  "/cases/ppt-master-classical-preview-1.png",
  "/cases/ppt-master-classical-preview-2.png",
  "/cases/ppt-master-classical-preview-3.png",
  "/cases/ppt-master-classical-preview-4.png",
].map((src) => ({ type: "image" as const, src }));
function FactIcon({
  kind,
}: {
  kind: "author" | "github" | "platform" | "adapt" | "install";
}) {
  if (kind === "adapt" || kind === "install")
    return (
      <span className="ppt-fact-icon" aria-hidden="true">
        <img src={`/icons/${kind}.svg`} alt="" />
      </span>
    );
  return (
    <span className="ppt-fact-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === "author" ? (
          <>
            <circle cx="12" cy="7" r="3.4" />
            <path d="M5.4 20c.65-3.7 3.15-5.55 6.6-5.55s5.95 1.85 6.6 5.55" />
          </>
        ) : kind === "platform" ? (
          <>
            <path d="m12 2-10 5 10 5 10-5-10-5ZM2 12l10 5 10-5M2 17l10 5 10-5" />
          </>
        ) : (
          <path
            fill="currentColor"
            stroke="none"
            d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.4-1.22.72-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.16a10.66 10.66 0 0 1 5.6 0c2.14-1.46 3.08-1.16 3.08-1.16.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.27-5.14 5.55.4.35.77 1.03.77 2.08v3.1c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z"
          />
        )}
      </svg>
    </span>
  );
}
export default function PptDetail({
  onClose,
  onCopy,
  copied,
  resource,
}: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [installCopied, setInstallCopied] = useState(false);
  const [isLandscapeImage, setIsLandscapeImage] = useState(false);
  const resourceSlides = [
    ...(resource.detailCover
      ? [{ type: "image" as const, src: resource.detailCover }]
      : []),
    ...(resource.media || [])
      .filter((item) => item.src !== resource.cover)
      .map((item) => ({ type: item.type, src: item.src })),
  ].filter(
    (item, index, all) =>
      all.findIndex((value) => value.src === item.src) === index,
  );
  const slides =
    resource.githubUrl === "https://github.com/hugohe3/ppt-master"
      ? [
          ...pptMasterSlides,
          ...(resource.demoVideo
            ? [{ type: "video" as const, src: resource.demoVideo }]
            : []),
        ]
      : [
          ...resourceSlides,
          ...(resource.demoVideo &&
          !resourceSlides.some((item) => item.src === resource.demoVideo)
            ? [{ type: "video" as const, src: resource.demoVideo }]
            : []),
        ];
  if (!slides.length)
    slides.push({ type: "image", src: resource.cover || "/og.png" });
  const active = slides[Math.min(slideIndex, slides.length - 1)];
  useEffect(() => setIsLandscapeImage(false), [active.src]);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setScale(
        Math.min(
          (entry.contentRect.width - 8) / 1586,
          (entry.contentRect.height - 8) / 992,
          1,
        ),
      ),
    );
    observer.observe(el);
    closeButton.current?.focus({ preventScroll: true });
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={viewport} className="ppt-reference-viewport" role="presentation">
      <section
        className={`ppt-reference-stage${resource.type !== "Skill" ? " is-agent" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ppt-reference-title"
        style={{
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        <img
          key={`background-${active.src}`}
          className="ppt-reference-stage-background"
          src={active.type === "image" ? active.src : resource.cover || "/og.png"}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <div className="ppt-reference-left">
          {isLandscapeImage && (
            <img
              className="ppt-reference-media-background"
              src={active.src}
              alt=""
              aria-hidden="true"
              decoding="async"
            />
          )}
          {active.type === "video" &&
          !active.src.toLowerCase().endsWith(".gif") ? (
            <video
              key={active.src}
              className="ppt-reference-media is-video"
              src={active.src}
              controls
              muted
              playsInline
              preload="metadata"
              poster={resource.cover || undefined}
            />
          ) : (
            <img
              key={active.src}
              className={`ppt-reference-media ${active.type === "video" ? "is-video" : ""} ${isLandscapeImage ? "is-landscape" : ""}`}
              src={active.src}
              alt={`${resource.name} 预览`}
              decoding="async"
              onLoad={(event) =>
                setIsLandscapeImage(
                  event.currentTarget.naturalWidth >
                    event.currentTarget.naturalHeight,
                )
              }
            />
          )}
          <div className="ppt-media-shade" />
        </div>
        <div className="ppt-reference-wash" aria-hidden="true" />
        <div className="ppt-preview-strip" aria-label="图片预览">
          <button
            type="button"
            className="ppt-preview-arrow"
            onClick={() =>
              setSlideIndex((slideIndex - 1 + slides.length) % slides.length)
            }
            aria-label="上一张"
          >
            <img
              className="ppt-preview-arrow-icon"
              src="/icons/preview-left.svg"
              alt=""
              aria-hidden="true"
            />
          </button>
          <div className="ppt-preview-thumbnails">
            {slides.map((media, index) => (
              <button
                key={media.src}
                type="button"
                className={slideIndex === index ? "active" : ""}
                onClick={() => setSlideIndex(index)}
                aria-label={`查看${media.type === "video" ? "视频" : "图片"} ${index + 1}`}
              >
                {media.type === "video" &&
                !media.src.toLowerCase().endsWith(".gif") ? (
                  <span className="ppt-video-thumb" aria-hidden="true">
                    <img src={resource.cover || "/og.png"} alt="" />
                    <b>▶</b>
                  </span>
                ) : (
                  <img
                    src={media.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ppt-preview-arrow"
            onClick={() => setSlideIndex((slideIndex + 1) % slides.length)}
            aria-label="下一张"
          >
            <img
              className="ppt-preview-arrow-icon"
              src="/icons/preview-right.svg"
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
        <button
          ref={closeButton}
          className="ppt-reference-close"
          onClick={onClose}
          aria-label="关闭详情"
          title="关闭详情"
        >
          <img src="/icons/detail-close.svg" alt="" aria-hidden="true" />
        </button>
        <h2 id="ppt-reference-title">{resource.name}</h2>
        <div className="ppt-reference-tags">
          {resource.tags.slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="ppt-reference-facts">
          <div className="ppt-reference-facts-primary">
            <div className="ppt-reference-author">
              <FactIcon kind="author" />
              <div>
                <span>作者</span>
                <p>{resource.author || "益智集"}</p>
              </div>
            </div>
            <div className="ppt-reference-github">
              {resource.websiteUrl ? <img className="ppt-reference-website-icon" src="/icons/website-user.svg" alt="" /> : <FactIcon kind="github" />}
              <div>
                <span>{resource.websiteUrl ? "网站" : "GitHub"}</span>
                {resource.websiteUrl || resource.githubUrl ? (
                  <a href={resource.websiteUrl || resource.githubUrl} target="_blank" rel="noreferrer">
                    {resource.websiteUrl ? resource.websiteUrl : "查看开源项目 →"}
                  </a>
                ) : (
                  <p>暂未提供</p>
                )}
              </div>
            </div>
            <div className="ppt-reference-platform">
              <FactIcon kind="platform" />
              <div>
                <span>适用平台</span>
                <p>{resource.platform || resource.category}</p>
              </div>
            </div>
          </div>
          {(resource.adaptedBy || resource.installCommand) && (
            <div className="ppt-reference-facts-optional">
              {resource.adaptedBy && (
                <div className="ppt-reference-adapt">
                  <FactIcon kind="adapt" />
                  <div>
                    <span>改编</span>
                    <p>{resource.adaptedBy}</p>
                  </div>
                </div>
              )}
              {resource.installCommand && (
                <div className="ppt-reference-install">
                  <FactIcon kind="install" />
                  <div>
                    <span>安装到 Codex</span>
                    <button
                      type="button"
                      title="复制安装命令"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          resource.installCommand || "",
                        );
                        setInstallCopied(true);
                        window.setTimeout(() => setInstallCopied(false), 1600);
                      }}
                    >
                      <code>{resource.installCommand}</code>
                      <b>{installCopied ? "已复制" : "复制"}</b>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="ppt-reference-case">
          <h3>功能介绍</h3>
          <p>{resource.caseSummary || resource.description}</p>
        </div>
        {resource.type === "Skill" && (
          <div className="ppt-reference-prompt">
            <h3>在 Codex 中这样说</h3>
            <p>{resource.prompt}</p>
            <button onClick={onCopy}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="8" y="8" width="11" height="12" rx="1.5" />
                <path d="M5 16V5.5A1.5 1.5 0 0 1 6.5 4H16" />
              </svg>
              {copied ? "已复制 ✓" : "复制调用方式"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

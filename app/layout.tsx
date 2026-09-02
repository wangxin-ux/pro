import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "益智集｜免费的 AI 工具公益导航",
  description: "聚合本地 Codex 已安装的 Skill、Agent 和 AI 应用，提供真实案例、图片、视频与可复制的调用方式。",
  metadataBase: new URL("https://yizhiji-ai.quyenmthao.chatgpt.site"),
  openGraph: {
    title: "益智集｜让好用的 AI，被更多人看见",
    description: "本地 Codex Skill、Agent 与 AI 应用公益资源库。",
    images: [{ url: "/og.png", width: 1728, height: 905, alt: "益智集 AI 公益资源平台" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}

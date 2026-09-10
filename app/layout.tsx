import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillHub 免费Skill集成分享网站",
  description: "聚合 Skill、Agent 和 AI 应用，提供真实案例、图片、视频与可复制的调用方式。",
  metadataBase: new URL("https://yizhiji.jianglang1892.xyz"),
  icons: {
    icon: [{ url: "/icons/logo-s-user.svg", type: "image/svg+xml" }],
    shortcut: "/icons/logo-s-user.svg",
  },
  openGraph: {
    title: "益智集｜让好用的 AI，被更多人看见",
    description: "Skill、Agent 与 AI 应用公益资源库。",
    images: [{ url: "/og.png", width: 1728, height: 905, alt: "益智集 AI 公益资源平台" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}

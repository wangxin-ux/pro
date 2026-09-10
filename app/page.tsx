"use client";

import { DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import PptDetail from "./ppt-detail";
import KageStart from "./kage-start";
import "./ppt-card.css";

export type Media = { type: "image" | "video"; src: string; alt: string };
export type Resource = {
  id?: string;
  name: string;
  type: "Skill" | "Agent" | "AI 应用";
  description: string;
  summary?: string;
  category: string;
  tags: string[];
  icon: string;
  tint: string;
  featured?: boolean;
  media?: Media[];
  caseTitle: string;
  caseSummary: string;
  prompt: string;
  author?: string;
  platform?: string;
  githubUrl?: string;
  websiteUrl?: string;
  adaptedBy?: string;
  installCommand?: string;
  demoVideo?: string;
  cover?: string;
  detailCover?: string;
  community?: boolean;
  source?: "community" | "admin";
};

type CommunitySkill = {
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
  resource_type?: string;
  featured: number;
  source?: "community" | "admin";
};
type CatalogOverride = { id: string; data_json: string; deleted: number };
type UploadPreview = { id: string; src: string; file: File };

export const resources: Resource[] = [
  {
    name: "女娲造人",
    type: "Agent",
    description:
      "从人物或模糊需求出发，深度调研并蒸馏成可运行的思维顾问 Skill。",
    category: "研究与智能体",
    tags: ["深度调研", "Skill 生成", "多智能体"],
    icon: "女",
    tint: "#eaf2ff",
    featured: true,
    media: [
      {
        type: "video",
        src: "/cases/nuwa-demo.mp4",
        alt: "女娲造人炼金术动画演示",
      },
      {
        type: "image",
        src: "/cases/nuwa-landing.png",
        alt: "女娲造人案例长图",
      },
      {
        type: "image",
        src: "/cases/nuwa-naval.png",
        alt: "Naval 思维 Skill 案例",
      },
      {
        type: "image",
        src: "/cases/nuwa-musk.png",
        alt: "Musk 思维 Skill 案例",
      },
    ],
    caseTitle: "把一个人的思维方式变成可调用能力",
    caseSummary:
      "输入人物名后完成资料研究、心智模型提炼、表达方式适配和 Skill 文件生成，最后可直接在 Codex 中作为思维顾问使用。",
    prompt: "使用女娲造人，帮我蒸馏一个张一鸣视角的 Skill",
  },
  {
    name: "三省六部",
    type: "Agent",
    description:
      "用中书规划、门下审议、尚书执行与刑部质检组织复杂多智能体协作。",
    category: "研究与智能体",
    tags: ["任务拆解", "并行协作", "质量审查"],
    icon: "省",
    tint: "#edf8f5",
    featured: true,
    caseTitle: "让复杂任务经过规划、审议、执行和复核",
    caseSummary:
      "适合复杂研发、研究综述和系统性实施任务，用角色分工减少遗漏，并通过两轮自检提高交付质量。",
    prompt: "使用三省六部模式处理这个复杂任务，并完成两轮自检",
  },
  {
    name: "演示文稿大师",
    type: "Skill",
    description:
      "从提纲或资料生成可编辑 PPTX，并完成版式、图表、渲染和视觉检查。",
    category: "内容与设计",
    tags: ["PPTX", "可编辑", "视觉质检"],
    icon: "演",
    tint: "#fff1e8",
    featured: true,
    media: [
      {
        type: "image",
        src: "/cases/presentation-style.png",
        alt: "演示文稿多风格案例",
      },
      {
        type: "image",
        src: "/cases/presentation-variants.png",
        alt: "演示文稿多主题案例",
      },
    ],
    caseTitle: "同一主题生成多种可编辑演示风格",
    caseSummary:
      "不只输出截图，而是生成可以继续修改的 PPTX；案例展示了同一内容在多个视觉家族中的完整适配。",
    prompt: "使用演示文稿技能，把这份资料制作成 12 页可编辑 PPTX",
  },
  {
    name: "PPT Master",
    type: "Skill",
    description:
      "把 PDF、DOCX、网页或主题转为原生可编辑 PPTX：保留文本、图表、形状、动画与演讲者备注。",
    category: "内容与设计",
    tags: ["PPTX", "原生可编辑", "AI 演示", "PPT Master"],
    icon: "PPT",
    tint: "#edf4ff",
    featured: true,
    cover: "/cases/ppt-master-classical-cover.png",
    caseTitle: "从源材料到可继续编辑的原生演示文稿",
    caseSummary:
      "从 PDF、DOCX、网页、Markdown 或主题出发，生成真实的 PowerPoint 对象；支持原生图表、模板复用、转场、动画与旁白。",
    prompt:
      "使用 PPT Master，把 projects/report.pdf 转成一份 10 页、16:9 的原生可编辑 PPTX，并沿用简洁商务风格。",
    author: "Hugo He",
    platform:
      "支持 Codex、Claude Code、Cursor、VS Code + Copilot 等具备 Agent 能力的工具；本地运行并导出 PPTX。",
    githubUrl: "https://github.com/hugohe3/ppt-master",
    adaptedBy: "演示人",
    installCommand: "npx skills add hugohe3/ppt-master -a codex -g -y",
    demoVideo: "/cases/ppt-master-demo.gif",
  },
  {
    name: "PPT Master",
    type: "Skill",
    description: "基于品牌、版式和 Deck 工作区生成或增强企业级原生 PPTX。",
    category: "内容与设计",
    tags: ["品牌模板", "企业演示", "版式复用"],
    icon: "P",
    tint: "#f2edff",
    media: [
      {
        type: "image",
        src: "/cases/presentation-variants.png",
        alt: "PPT Master 成果案例",
      },
    ],
    caseTitle: "把品牌规范沉淀成可复用的演示工作区",
    caseSummary:
      "适合已有母版、品牌色和企业模板的场景，持续生成一致的汇报材料。",
    prompt: "使用 PPT Master，基于我的模板生成一份项目汇报",
  },
  {
    name: "归藏社交卡片",
    type: "Skill",
    description: "把文章、脚本和产品笔记变成小红书轮播卡片与公众号封面套装。",
    category: "内容与设计",
    tags: ["小红书", "公众号", "社交卡片"],
    icon: "卡",
    tint: "#fff2e9",
    media: [
      {
        type: "image",
        src: "/cases/nuwa-naval.png",
        alt: "社交媒体知识卡片案例",
      },
      {
        type: "image",
        src: "/cases/nuwa-musk.png",
        alt: "社交媒体人物卡片案例",
      },
    ],
    caseTitle: "从长内容到适合传播的系列卡片",
    caseSummary:
      "自动规划封面、章节和信息密度，并输出适配社交平台比例的图片组。",
    prompt: "使用归藏社交卡片，把这篇文章做成 8 张小红书图文卡片",
  },
  {
    name: "立创 EDA 安全操作",
    type: "Skill",
    description:
      "安全检查和编辑立创 EDA Pro 原理图，验证网表、页面目标和修改结果。",
    category: "开发与工程",
    tags: ["EDA", "原理图", "硬件"],
    icon: "电",
    tint: "#e8f7f4",
    featured: true,
    media: [
      {
        type: "image",
        src: "/cases/lceda-1.png",
        alt: "立创 EDA 原理图案例一",
      },
      {
        type: "image",
        src: "/cases/lceda-2.png",
        alt: "立创 EDA 原理图案例二",
      },
    ],
    caseTitle: "在真实原理图上进行受控检查与修改",
    caseSummary:
      "案例包含参考样板截图，工作流会先只读检查页面和 UUID，再进行小范围修改与网表验证。",
    prompt: "使用立创 EDA 操作规范，先只读检查当前原理图并列出问题",
  },
  {
    name: "Codex Dream Skin",
    type: "Skill",
    description:
      "为 Windows Codex 应用套用可逆的沉浸式装饰皮肤，并支持修复和恢复。",
    category: "Codex 增强",
    tags: ["主题", "Windows", "可逆"],
    icon: "梦",
    tint: "#f2ecff",
    media: [
      {
        type: "image",
        src: "/cases/dream-skin.jpg",
        alt: "Codex Dream Skin 视觉参考",
      },
    ],
    caseTitle: "把 Codex 变成沉浸式创作空间",
    caseSummary:
      "通过安全、可恢复的方式增强 Codex 桌面视觉，不替换系统应用文件，可在更新后修复或一键恢复。",
    prompt: "使用 Codex Dream Skin，应用梦幻主题并保留恢复方案",
  },
  {
    name: "GPT Image",
    type: "Skill",
    description:
      "调用 GPT Image 2 完成文生图、图片编辑、海报、中文排版和 UI 概念图。",
    category: "内容与设计",
    tags: ["图片生成", "图片编辑", "中文排版"],
    icon: "图",
    tint: "#e9f5ff",
    caseTitle: "从结构化创意说明到完整视觉资产",
    caseSummary:
      "先分析用途和构图，再生成图片并检查文字、主体和风格一致性，适合网站、海报和产品素材。",
    prompt: "使用 GPT Image，生成一张蓝白科技公益平台的案例封面",
  },
  {
    name: "PS 设计",
    type: "Skill",
    description: "处理海报、展板、抠图、修图、合成、排版和打印导出。",
    category: "内容与设计",
    tags: ["修图", "海报", "排版"],
    icon: "Ps",
    tint: "#e9f4ff",
    caseTitle: "把零散图片整理成可交付的设计成品",
    caseSummary:
      "优先用确定性的本地工具完成清理和排版，需要新视觉时再进入生成式工作流。",
    prompt: "使用 PS 设计，把这些素材排成一张 A3 竖版展板",
  },
  {
    name: "小红书发布器",
    type: "Skill",
    description:
      "写作、渲染 3:4 卡片并通过保留登录状态的 Chrome 发布小红书图文。",
    category: "自动化与增长",
    tags: ["小红书", "自动发布", "内容运营"],
    icon: "红",
    tint: "#fff0f1",
    caseTitle: "从主题到图文发布的一体化流程",
    caseSummary:
      "完成内容生成、图片上传、标题正文和话题填写，并在可见界面中确认发布结果。",
    prompt: "使用小红书发布器，把这个主题做成图文笔记，先预览再发布",
  },
  {
    name: "抖音评论助手",
    type: "Agent",
    description: "按关键词搜索视频、筛选候选并在确认后发布个性化评论。",
    category: "自动化与增长",
    tags: ["抖音", "内容搜索", "审阅后执行"],
    icon: "抖",
    tint: "#f0f4f8",
    caseTitle: "先筛选，再进行可审阅的内容互动",
    caseSummary:
      "自动化只在确认过的搜索结果中执行，并带有限速、去重和成功校验。",
    prompt: "使用抖音评论助手搜索相关视频，先给我候选和评论预览",
  },
  {
    name: "自动 Skill 安装器",
    type: "Agent",
    description: "发现能力缺口后搜索、安装并验证合适的 Skill，再继续当前任务。",
    category: "Codex 增强",
    tags: ["能力发现", "自动安装", "验证"],
    icon: "装",
    tint: "#edf8f5",
    caseTitle: "任务做到一半，也能自动补齐能力",
    caseSummary:
      "扫描本地目录与 Skill 注册源，选择匹配能力并验证可用性，让任务无需因为缺少工具停下来。",
    prompt: "使用自动 Skill 安装器，检查当前任务还缺少什么能力",
  },
  {
    name: "OpenCLI",
    type: "Skill",
    description:
      "把已登录的网站和 Electron 桌面应用变成可确定执行的命令行能力，供 AI Agent 复用浏览器会话完成网页与桌面自动化。",
    category: "Codex 增强",
    tags: ["浏览器自动化", "Chrome 登录态", "CLI", "开源"],
    icon: "OC",
    tint: "#eaf2ff",
    featured: true,
    cover: "/cases/opencli-browser-bridge-gradient.png",
    caseTitle: "让 AI Agent 通过你已登录的浏览器操作真实服务",
    caseSummary:
      "OpenCLI 提供 100+ 网站适配器、浏览器基础操作和桌面应用 CDP 控制，可用于检索、填写表单、提取内容、截图及调用本地工具；不会在运行时额外消耗模型 Token。适合 Codex、Claude Code、Cursor 等支持 Skills 的 Agent 环境。",
    prompt:
      "使用 OpenCLI，打开并检查我当前已登录的网页，先告诉我将执行哪些步骤。",
    author: "jackwener（jakevin）",
    platform:
      "Codex、Claude Code、Cursor 等支持 Skills 的 AI Agent；Chrome / Electron 桌面应用",
    githubUrl: "https://github.com/jackwener/opencli",
  },
  {
    name: "STM32 HAL 开发",
    type: "Skill",
    description:
      "面向 CubeMX 与 Keil5 的模块化 BSP 固件开发、编译、烧录和验证。",
    category: "开发与工程",
    tags: ["STM32", "HAL", "嵌入式"],
    icon: "芯",
    tint: "#e8f7f4",
    caseTitle: "从外设需求到可维护的板级支持代码",
    caseSummary:
      "适合定时器、UART、GPIO 和传感器等二次开发，优先输出初学者也能维护的模块结构。",
    prompt: "使用 STM32 HAL 开发规范，为这个传感器写 BSP 驱动",
  },
  {
    name: "Android CLI",
    type: "Skill",
    description: "创建、运行和检查 Android 项目，管理模拟器、SDK 与设备截图。",
    category: "开发与工程",
    tags: ["Android", "模拟器", "SDK"],
    icon: "A",
    tint: "#e8f7f0",
    caseTitle: "在命令行中完成 Android 开发闭环",
    caseSummary:
      "从项目创建到设备运行、界面检查和官方文档查询，适合自动化移动开发任务。",
    prompt: "使用 Android CLI 创建一个最小 Android 应用并运行到模拟器",
  },
  {
    name: "Paul Graham 视角",
    type: "Agent",
    description: "用 Paul Graham 的创业、写作与产品思维框架审视问题。",
    category: "人物思维 Agent",
    tags: ["创业", "写作", "产品"],
    icon: "PG",
    tint: "#fff4e9",
    caseTitle: "用散文式推理找到问题里最不寻常的部分",
    caseSummary:
      "适合创业判断、产品方向、写作修改和人生选择，强调独立思考与用户真实需求。",
    prompt: "使用 Paul Graham 视角，审视这个创业想法哪里最不寻常",
  },
  {
    name: "Naval 视角",
    type: "Agent",
    description: "用财富、杠杆、判断力和长期主义框架分析选择。",
    category: "人物思维 Agent",
    tags: ["财富", "长期主义", "判断力"],
    icon: "N",
    tint: "#eff5ff",
    media: [
      {
        type: "image",
        src: "/cases/nuwa-naval.png",
        alt: "Naval 思维 Agent 案例",
      },
    ],
    caseTitle: "把抽象人生问题拆成杠杆与长期选择",
    caseSummary:
      "沉浸式采用 Naval 的思维系统，分析财富创造、个人自由和高质量判断。",
    prompt: "使用 Naval 视角，分析我应该如何选择这两个职业方向",
  },
  {
    name: "Elon Musk 视角",
    type: "Agent",
    description: "用第一性原理、成本拆解和极限目标审视工程与商业决策。",
    category: "人物思维 Agent",
    tags: ["第一性原理", "工程", "成本"],
    icon: "M",
    tint: "#eef3f8",
    media: [
      {
        type: "image",
        src: "/cases/nuwa-musk.png",
        alt: "Musk 思维 Agent 案例",
      },
    ],
    caseTitle: "从物理约束和成本结构重新定义问题",
    caseSummary: "适合产品、制造和高难度项目决策，主动挑战行业惯例与模糊需求。",
    prompt: "使用 Elon Musk 视角，重新拆解这个产品的成本结构",
  },
  {
    name: "张一鸣视角",
    type: "Agent",
    description: "用延迟满足、认知开放和系统化组织思维分析产品与管理。",
    category: "人物思维 Agent",
    tags: ["产品", "组织", "认知"],
    icon: "张",
    tint: "#eef5ff",
    caseTitle: "从长期变量和组织机制思考增长",
    caseSummary: "适合产品策略、组织管理与职业发展，强调事实、概率和持续学习。",
    prompt: "使用张一鸣视角，分析这个产品增长策略",
  },
  {
    name: "GitHub",
    type: "AI 应用",
    description: "在 Codex 中查看仓库、Issue 和 PR，并处理评审意见与 CI。",
    category: "已安装应用",
    tags: ["代码托管", "PR", "CI"],
    icon: "GH",
    tint: "#eef1f4",
    media: [
      { type: "image", src: "/cases/github.png", alt: "GitHub 应用图标" },
    ],
    caseTitle: "从问题定位到 PR 交付",
    caseSummary:
      "连接 GitHub 后可直接读取代码协作上下文，处理评论、修复检查并发布本地修改。",
    prompt: "使用 GitHub，检查当前 PR 的未解决评审意见",
  },
  {
    name: "Figma",
    type: "AI 应用",
    description: "把设计转成代码，也能从网页生成可编辑的 Figma 设计。",
    category: "已安装应用",
    tags: ["设计", "Design to Code", "组件库"],
    icon: "F",
    tint: "#f1edff",
    caseTitle: "设计与代码双向流动",
    caseSummary:
      "支持获取设计上下文、生成页面、维护 Code Connect，并把本地网页捕获进 Figma。",
    prompt: "使用 Figma，把这个页面转成可编辑设计",
  },
  {
    name: "HeyGen",
    type: "AI 应用",
    description: "生成数字人、讲解视频和可复用的头像与声音身份。",
    category: "已安装应用",
    tags: ["视频", "数字人", "讲解"],
    icon: "H",
    tint: "#eef6ff",
    caseTitle: "把脚本变成数字人讲解视频",
    caseSummary:
      "从画幅检查、脚本工程到人物与声音选择，生成适合产品介绍和知识传播的视频。",
    prompt: "使用 HeyGen，把这段脚本生成一条横版讲解视频",
  },
  {
    name: "Spreadsheets",
    type: "AI 应用",
    description: "创建、分析和验证 Excel、CSV 与 Google Sheets 就绪工作簿。",
    category: "已安装应用",
    tags: ["Excel", "数据分析", "表格"],
    icon: "表",
    tint: "#eaf8ef",
    media: [
      {
        type: "image",
        src: "/cases/spreadsheets.png",
        alt: "Spreadsheets 应用图标",
      },
      {
        type: "image",
        src: "/cases/analytics-dashboard.png",
        alt: "数据分析仪表盘案例",
      },
    ],
    caseTitle: "把原始数据变成可交付的工作簿",
    caseSummary:
      "可完成清洗、公式、图表、格式和结果核验，案例包含可视化分析仪表盘。",
    prompt: "使用 Spreadsheets，分析这份数据并生成带图表的 Excel",
  },
  {
    name: "Presentations",
    type: "AI 应用",
    description: "创建、编辑和验证 PowerPoint 或 Google Slides 演示文稿。",
    category: "已安装应用",
    tags: ["PowerPoint", "Slides", "演示"],
    icon: "片",
    tint: "#fff1ea",
    media: [
      {
        type: "image",
        src: "/cases/presentations.png",
        alt: "Presentations 应用图标",
      },
      { type: "image", src: "/cases/presentation-style.png", alt: "演示案例" },
    ],
    caseTitle: "结构、视觉和可编辑性同时交付",
    caseSummary: "面向正式汇报和内容展示，输出真实演示文件并通过渲染检查布局。",
    prompt: "使用 Presentations，把这份提纲制作成一套演示",
  },
  {
    name: "Sites",
    type: "AI 应用",
    description: "搭建、部署和管理落地页、门户、仪表盘与内部工具。",
    category: "已安装应用",
    tags: ["网站", "部署", "Cloudflare"],
    icon: "站",
    tint: "#eaf3ff",
    featured: true,
    media: [{ type: "image", src: "/og.png", alt: "益智集网站案例" }],
    caseTitle: "从一句需求到可访问的网站",
    caseSummary:
      "当前这座益智集平台就是使用 Sites 完成设计、开发、验证与部署的真实案例。",
    prompt: "使用 Sites，做一个蓝白色的公益 AI 工具导航",
  },
  {
    name: "Documents",
    type: "AI 应用",
    description: "创建、编辑、批注并校验 Word 与 Google Docs 就绪文档。",
    category: "已安装应用",
    tags: ["Word", "文档", "批注"],
    icon: "文",
    tint: "#eaf3ff",
    caseTitle: "从草稿到排版完成的正式文档",
    caseSummary:
      "支持结构化写作、红线修订、评论和视觉验证，适合报告、方案与正式材料。",
    prompt: "使用 Documents，把这份草稿整理成正式 Word 报告",
  },
  {
    name: "PDF",
    type: "AI 应用",
    description: "读取、创建、填写和视觉验证 PDF，包括表单与复杂排版。",
    category: "已安装应用",
    tags: ["PDF", "表单", "视觉校验"],
    icon: "PDF",
    tint: "#fff0f0",
    caseTitle: "让 PDF 从静态文件变成可处理资产",
    caseSummary: "不仅提取文本，还可处理页面渲染、表单填写和生成后的视觉检查。",
    prompt: "使用 PDF，读取这份文件并提取关键结论",
  },
  {
    name: "Browser",
    type: "AI 应用",
    description: "控制 Codex 内置浏览器完成导航、页面检查和本地网站测试。",
    category: "已安装应用",
    tags: ["浏览器", "网页操作", "测试"],
    icon: "浏",
    tint: "#eaf7ff",
    caseTitle: "在可见网页中完成受控操作",
    caseSummary: "适合依赖页面状态的任务，如登录后操作、网页测试和交互式核验。",
    prompt: "使用 Browser，打开这个页面并检查核心交互",
  },
  {
    name: "Computer Use",
    type: "AI 应用",
    description: "控制 Windows 桌面应用，处理需要真实界面的本地任务。",
    category: "已安装应用",
    tags: ["Windows", "桌面操作", "自动化"],
    icon: "控",
    tint: "#eef4f8",
    caseTitle: "跨应用完成真实桌面工作流",
    caseSummary:
      "通过可见界面操作本地软件，适合无法只靠文件或 API 完成的任务。",
    prompt: "使用 Computer Use，在这个 Windows 应用中完成设置",
  },
  {
    name: "LangChain",
    type: "Agent",
    description:
      "用统一的方式把大模型、知识库和外部工具连接起来，快速搭建能查资料、会调用工具、还能记住上下文的 AI Agent。",
    summary: "连接模型、知识库与工具的通用 Agent 开发框架。",
    category: "Agent 框架",
    tags: ["Agent", "RAG", "工具调用", "约 146k Stars"],
    icon: "LC",
    tint: "#e9f2ff",
    cover: "/cases/agent-langchain-cover.png",
    detailCover: "/cases/agent-langchain-cover.png",
    media: [{ type: "image", src: "/cases/agent-langchain-cover.png", alt: "LangGraph Studio Agent 工作流界面" }],
    demoVideo: "/cases/agent-langchain-demo.mp4",
    caseTitle: "让 AI 不只会聊天，还能完成具体工作",
    caseSummary:
      "LangChain 可以把不同模型、企业文档、搜索服务和业务工具组合在一起。开发者能用它制作知识库问答、数据分析助手、智能客服和自动化 Agent，并按需要加入记忆、结构化输出和工作流控制。",
    prompt: "",
    author: "Harrison Chase 发起，LangChain 团队维护",
    platform: "Python、JavaScript / TypeScript",
    githubUrl: "https://github.com/langchain-ai/langchain",
  },
  {
    name: "AutoGen",
    type: "Agent",
    description:
      "让多个不同职责的 AI Agent 像团队一样对话、分工和协作，适合处理需要规划、执行与复核的复杂任务。",
    summary: "微软推出的多 Agent 对话与协作框架。",
    category: "Agent 框架",
    tags: ["多智能体", "团队协作", "Python/.NET", "约 61k Stars"],
    icon: "AG",
    tint: "#e9f2ff",
    cover: "/cases/agent-autogen-cover.png",
    detailCover: "/cases/agent-autogen-cover.png",
    media: [{ type: "image", src: "/cases/agent-autogen-studio.png", alt: "AutoGen Studio 图形化原型界面" }],
    demoVideo: "/cases/agent-autogen-demo.mp4",
    caseTitle: "把复杂任务交给一支 AI 团队",
    caseSummary:
      "AutoGen 可以创建研究员、程序员、审查员等多个角色，让它们围绕同一目标沟通并分工完成任务。它支持事件驱动、代码执行、人机协作以及 Python 和 .NET，还提供 AutoGen Studio，方便用图形界面快速验证想法。",
    prompt: "",
    author: "Microsoft Research / Microsoft",
    platform: "Python、.NET、AutoGen Studio",
    githubUrl: "https://github.com/microsoft/autogen",
  },
  {
    name: "CrewAI",
    type: "Agent",
    description:
      "围绕角色和任务组织多个 AI Agent，让研究员、分析师、写作者等成员按流程共同完成一项工作。",
    summary: "面向角色、任务和流程的多 Agent 编排平台。",
    category: "Agent 框架",
    tags: ["角色编排", "任务流程", "多智能体", "约 54k Stars"],
    icon: "CR",
    tint: "#e9f2ff",
    cover: "/cases/agent-crewai-cover.png",
    detailCover: "/cases/agent-crewai-cover.png",
    media: [{ type: "image", src: "/cases/agent-crewai-studio.png", alt: "CrewAI Enterprise Crew 配置界面" }],
    demoVideo: "/cases/agent-crewai-demo.mp4",
    caseTitle: "按角色和流程组织一支 Agent 团队",
    caseSummary:
      "CrewAI 让你为每个 Agent 设定身份、目标和任务，再把它们组成一个 Crew。例如研究员负责收集信息，分析师负责判断，写作者负责整理结果；Flows 还能管理事件、状态和生产级长流程。",
    prompt: "",
    author: "João Moura 发起，CrewAI Inc. 维护",
    platform: "Python、CrewAI Enterprise",
    githubUrl: "https://github.com/crewAIInc/crewAI",
  },
  {
    name: "Second",
    type: "AI 应用",
    description:
      "为酒局交友而设计，填写个人信息后，系统会为你调制一杯独特的酒，并随机匹配同好。",
    summary: "以个性调酒为媒介的酒局交友网站。",
    category: "AI 应用网站",
    tags: ["个性调酒", "兴趣匹配", "社交", "网站"],
    icon: "SE",
    tint: "#e9f8f1",
    cover: "/cases/ai-second-cover.png",
    detailCover: "/cases/ai-second-cover.png",
    media: [
      { type: "image", src: "/cases/ai-second-preview-1.jpg", alt: "Second 个性调酒结果" },
      { type: "image", src: "/cases/ai-second-preview-2.jpg", alt: "Second 口味选择" },
      { type: "image", src: "/cases/ai-second-preview-3.jpg", alt: "Second 个人资料说明" },
      { type: "image", src: "/cases/ai-second-preview-4.jpg", alt: "Second 个人资料填写" },
    ],
    caseTitle: "让一杯专属调酒开启一次相遇",
    caseSummary:
      "为酒局交友而设计，填写个人信息，系统会根据个人信息为你调上一杯独特的酒，或柔和或刚烈；在享用调酒的同时为你随机匹配同好，制造一场或漫长或短暂的邂逅。",
    prompt: "",
    author: "Jackson",
    platform: "Web、Android",
    websiteUrl: "https://lab.xinxinyuntu.top/",
  },
  {
    name: "唐山学院新生AI服务站",
    type: "AI 应用",
    description:
      "专门为新生入学准备打造的一站式工具网站，整合校区资料、AI问答、VR校园、新生指南和实景图库。",
    summary: "面向唐山学院新生的一站式校园服务网站。",
    category: "AI 应用网站",
    tags: ["新生指南", "AI问答", "720°VR校园", "实景图库"],
    icon: "TS",
    tint: "#e9f8f1",
    cover: "/cases/ai-tangshan-cover.jpg",
    detailCover: "/cases/ai-tangshan-cover.jpg",
    media: [
      { type: "image", src: "/cases/ai-tangshan-preview-1.jpg", alt: "唐山学院 VR 校园" },
      { type: "image", src: "/cases/ai-tangshan-preview-2.jpg", alt: "唐山学院新生服务首页" },
      { type: "image", src: "/cases/ai-tangshan-preview-3.jpg", alt: "唐山学院校园实景" },
      { type: "image", src: "/cases/ai-tangshan-preview-4.jpg", alt: "唐山学院新生入学指南" },
      { type: "image", src: "/cases/ai-tangshan-preview-5.jpg", alt: "唐山学院分类指南与实拍" },
      { type: "image", src: "/cases/ai-tangshan-preview-6.jpg", alt: "唐院小智 AI 问答" },
    ],
    caseTitle: "新生一站式工具网站",
    caseSummary:
      "专门给新生做入学准备，把校区的信息全部整合在一起。内置 AI 聊天机器人，新生直接提问，AI 调用整理好的校园资料直接回复；还有 720°VR 沉浸式逛校园、完整新生指南、实景图库资料库等功能。",
    prompt: "",
    author: "Jackson",
    platform: "Web、Android",
    websiteUrl: "https://stardust.sale/tsxyai",
  },
];

const filters = ["全部", "Skill", "Agent", "AI 应用"] as const;
const filterLabels: Record<(typeof filters)[number], string> = {
  全部: "全部",
  Skill: "Skill",
  Agent: "Agent",
  "AI 应用": "AI应用",
};
const displayType = (type: Resource["type"]) =>
  type === "Skill" ? "技能" : type === "Agent" ? "智能体" : "人工智能应用";

const parseList = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const compactSummary = (value: string) => {
  const text = value.trim().replace(/\s+/g, " ");
  const firstSentence = text.match(/^.*?[。！？.!?](?:\s|$)/)?.[0] || text;
  return firstSentence.slice(0, 90);
};

const normalizeGitHubRepositoryUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() !== "github.com") return value;
    const [owner, repository] = url.pathname.split("/").filter(Boolean);
    return owner && repository
      ? `https://github.com/${owner}/${repository.replace(/\.git$/i, "")}`
      : value;
  } catch {
    return value;
  }
};

const asResource = (skill: CommunitySkill): Resource => {
  const images = parseList(skill.images_json);
  return {
    id: skill.id,
    name: skill.name,
    type: skill.resource_type === "Agent" || skill.resource_type === "AI 应用" ? skill.resource_type : "Skill",
    description: skill.intro || skill.feature,
    summary: skill.summary || compactSummary(skill.feature),
    category: skill.resource_type === "Agent" ? "公开 Agent" : skill.resource_type === "AI 应用" ? "公开 AI 应用" : "公开 Skill",
    tags: parseList(skill.tags_json),
    icon: skill.name.slice(0, 2).toUpperCase(),
    tint: "#edf4ff",
    cover: images[0],
    media: images.slice(1).map((src, index) => ({
      type: "image" as const,
      src,
      alt: `${skill.name} 预览图 ${index + 1}`,
    })),
    caseTitle: "功能介绍",
    caseSummary: skill.feature,
    prompt: skill.codex_prompt,
    author: skill.author,
    platform: skill.platform || "暂未填写",
    githubUrl: normalizeGitHubRepositoryUrl(skill.github_url),
    adaptedBy: skill.adapted_by,
    installCommand: skill.install_command,
    demoVideo: skill.demo_video,
    featured: Boolean(skill.featured),
    community: true,
    source: skill.source || "community",
  };
};

export default function Home() {
  // Keep the Kage start page available, but bypass it for now.
  const [entered, setEntered] = useState(true);
  const [active, setActive] = useState<(typeof filters)[number]>("全部");
  const [secondaryFilter, setSecondaryFilter] = useState<"全部" | "精选">("全部");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchNotice, setSearchNotice] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [searchSection, setSearchSection] = useState<"hot" | "category" | "saved">("hot");
  const [searchCategory, setSearchCategory] = useState<Resource["type"] | null>(null);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [communitySkills, setCommunitySkills] = useState<CommunitySkill[]>([]);
  const [catalogOverrides, setCatalogOverrides] = useState<CatalogOverride[]>(
    [],
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<Resource["type"]>("Skill");
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState<UploadPreview[]>([]);
  const [draggedPreview, setDraggedPreview] = useState<string | null>(null);
  const [demoPreview, setDemoPreview] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [likedSkills, setLikedSkills] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = selected || searchOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [searchOpen, selected]);

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        const [skillsResponse, overridesResponse] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/catalog-overrides"),
        ]);
        if (!active) return;
        setCommunitySkills(skillsResponse.ok ? await skillsResponse.json() : []);
        setCatalogOverrides(overridesResponse.ok ? await overridesResponse.json() : []);
      } catch {
        // Keep the last successful catalog when a background refresh fails.
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadCatalog();
    };
    void loadCatalog();
    window.addEventListener("focus", loadCatalog);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", loadCatalog);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    try {
      setHistoryIds(JSON.parse(localStorage.getItem("yizhiji-history") || "[]"));
    } catch {
      setHistoryIds([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(
      () => setHintIndex((value) => (value + 1) % 3),
      3200,
    );
    return () => window.clearInterval(timer);
  }, []);

  const managedResources = useMemo(
    () =>
      resources
        .map((item, index) => {
          const override = catalogOverrides.find(
            (entry) => entry.id === `builtin-${index}`,
          );
          if (override?.deleted) return null;
          if (!override?.data_json)
            return {
              ...item,
              id: `builtin-${index}`,
              summary: item.summary || compactSummary(item.description),
              source: "admin" as const,
            };
          try {
            return {
              ...item,
              ...JSON.parse(override.data_json),
              id: `builtin-${index}`,
              source: "admin" as const,
            } as Resource;
          } catch {
            return {
              ...item,
              id: `builtin-${index}`,
              summary: item.summary || compactSummary(item.description),
              source: "admin" as const,
            };
          }
        })
        .filter((item): item is Resource => Boolean(item)),
    [catalogOverrides],
  );

  const allResources = useMemo(
    () => [...communitySkills.map(asResource), ...managedResources],
    [communitySkills, managedResources],
  );

  useEffect(() => {
    const warmedImages: HTMLImageElement[] = [];
    const warmedVideos: HTMLVideoElement[] = [];
    const timer = window.setTimeout(() => {
      const imageSources = new Set<string>();
      const videoSources = new Set<string>();
      allResources.forEach((item) => {
        if (item.detailCover) imageSources.add(item.detailCover);
        if (item.cover) imageSources.add(item.cover);
        item.media?.forEach((media) =>
          (media.type === "video" ? videoSources : imageSources).add(media.src),
        );
        if (item.demoVideo) videoSources.add(item.demoVideo);
      });
      imageSources.forEach((src) => {
        const image = new Image();
        image.decoding = "async";
        image.fetchPriority = "low";
        image.src = src;
        warmedImages.push(image);
      });
      videoSources.forEach((src) => {
        if (src.toLowerCase().endsWith(".gif")) {
          const image = new Image();
          image.src = src;
          warmedImages.push(image);
          return;
        }
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.src = src;
        video.load();
        warmedVideos.push(video);
      });
    }, 120);
    return () => {
      window.clearTimeout(timer);
      warmedVideos.forEach((video) => {
        video.removeAttribute("src");
        video.load();
      });
    };
  }, [allResources]);

  const visible = useMemo(() => {
    return allResources
      .filter((item) => {
        const inType =
          active === "全部" || item.type === active;
        const inSecondaryFilter =
          secondaryFilter === "全部" || Boolean(item.featured);
        return inType && inSecondaryFilter;
      })
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [active, allResources, secondaryFilter]);

  const historyResources = useMemo(
    () =>
      historyIds
        .map((id) => allResources.find((item) => (item.id || item.name) === id))
        .filter((item): item is Resource => Boolean(item)),
    [allResources, historyIds],
  );

  const submitSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    const value = query.trim();
    if (!value) return;
    setSearching(true);
    setSearchOpen(true);
    setSearchNotice("");
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: value,
          items: allResources.map((item) => ({
            id: item.id || item.name,
            name: item.name,
            tags: item.tags,
            summary: item.summary || compactSummary(item.description),
            description: item.description,
            cover:
              item.cover ||
              item.media?.find((media) => media.type === "image")?.src ||
              "",
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "搜索暂时不可用。");
      const ids = new Set(
        (data.results || []).map((item: { id: string }) => item.id),
      );
      setSearchResults(
        allResources
          .filter((item) => ids.has(item.id || item.name))
          .sort((a, b) => {
            const order = (data.results || []).map(
              (item: { id: string }) => item.id,
            );
            return (
              order.indexOf(a.id || a.name) - order.indexOf(b.id || b.name)
            );
          }),
      );
      if (!data.results?.length) setSearchNotice("暂时没有结果，试试别的吧");
    } catch (error) {
      setSearchResults([]);
      setSearchNotice(
        error instanceof Error ? error.message : "搜索暂时不可用。",
      );
    } finally {
      setSearching(false);
    }
  };

  const highlightName = (name: string) => {
    const keyword = query.trim();
    const index = name.toLowerCase().indexOf(keyword.toLowerCase());
    if (!keyword || index < 0) return name;
    return (
      <>
        {name.slice(0, index)}
        <mark>{name.slice(index, index + keyword.length)}</mark>
        {name.slice(index + keyword.length)}
      </>
    );
  };

  const baseOverlayResults = query.trim() ? searchResults : allResources;
  const overlayResults = searchSection === "category" && searchCategory
    ? baseOverlayResults.filter((item) => item.type === searchCategory).slice(0, 12)
    : searchSection === "saved"
      ? baseOverlayResults.filter((item) => likedSkills.has(item.id || item.name)).slice(0, 12)
      : baseOverlayResults.slice(0, 9);

  const openResource = (item: Resource) => {
    const id = item.id || item.name;
    const nextHistory = [id, ...historyIds.filter((value) => value !== id)].slice(
      0,
      8,
    );
    setHistoryIds(nextHistory);
    localStorage.setItem("yizhiji-history", JSON.stringify(nextHistory));
    setHistoryOpen(false);
    setSelected(item);
    setMediaIndex(0);
    setCopied(false);
  };
  const currentMedia = selected?.media?.[mediaIndex];
  const copyPrompt = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const submitSkill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = new FormData(form);
    payload.delete("images");
    imagePreviews.forEach((item) =>
      payload.append("images", item.file, item.id),
    );
    const tags = String(payload.get("tags") ?? "")
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
    const cover = payload.get("cover");
    const imageCount =
      payload
        .getAll("images")
        .filter((item) => item instanceof File && item.size > 0).length +
      (cover instanceof File && cover.size > 0 ? 1 : 0);
    if (!tags.length || tags.length > 5) {
      setUploadNotice("请填写 1 至 5 个标签。 ");
      return;
    }
    if (!(cover instanceof File) || !cover.size) {
      setUploadNotice("请先上传封面。 ");
      return;
    }
    if (imageCount > 8) {
      setUploadNotice("封面和补充图片合计最多 8 张。 ");
      return;
    }
    payload.set("tags", JSON.stringify(tags));
    setUploading(true);
    setUploadNotice("");
    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        body: payload,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "提交失败，请稍后重试。");
      setCommunitySkills((items) => [result, ...items]);
      form.reset();
      setCoverPreview("");
      setImagePreviews([]);
      setDemoPreview("");
      setUploadType("Skill");
      setUploadNotice(
        "已公开发布到主页资源库，所有访问者现在都能打开详情查看。 ",
      );
    } catch (error) {
      setUploadNotice(
        error instanceof Error ? error.message : "提交失败，请稍后重试。",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!entered) return <KageStart onEnter={() => setEntered(true)} />;

  return (
    <main className="marketplace-page" id="top">
      <div className="marketplace-marquee" aria-label="SkillHub">
        <div className="marketplace-marquee-track">
          {Array.from({ length: 10 }, (_, index) => (
            <div className="marketplace-marquee-item" key={index} aria-hidden={index > 0}>
              <img className="marketplace-marquee-logo" src="/icons/logo-s-user.svg" alt="" />
              <span>免费集成分享网站</span>
            </div>
          ))}
        </div>
      </div>
      <header className={`marketplace-header${searchOpen ? " search-active" : ""}`}>
        <div className={`marketplace-topbar${searchOpen ? " search-active" : ""}`}>
          <a className="marketplace-brand" href="#top" aria-label="益智集首页">
            <img src="/icons/logo-s-user.svg" alt="" />
          </a>
          <nav className="marketplace-nav" aria-label="Main navigation">
            <a className="active" href="#library">探索 <img src="/icons/dropdown-user.svg" alt="" /></a>
            <span className="marketplace-history-slot">
              <button type="button" onClick={() => setHistoryOpen((value) => !value)}>历史</button>
              {historyOpen && (
                <aside className="history-panel" aria-label="浏览历史">
                  <div><strong>浏览历史</strong><button type="button" onClick={() => setHistoryOpen(false)}>关闭</button></div>
                  {historyResources.length ? historyResources.map((item) => (
                    <button type="button" key={item.id || item.name} onClick={() => openResource(item)}>
                      {item.cover ? <img src={item.cover} alt="" /> : <span>{item.icon}</span>}
                      <b>{item.name}</b>
                    </button>
                  )) : <p>还没有浏览记录</p>}
                </aside>
              )}
            </span>
            <a href="#library">新闻</a>
            <a href="#library">工作</a>
            <a href="#library">联系我们</a>
            <a href="#library">更多</a>
          </nav>
          <form className={`marketplace-search${searchOpen ? " search-active" : ""}`} onSubmit={submitSearch}>
            <img src="/icons/search-blue.svg" alt="" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (!event.target.value) {
                  setSearchResults([]);
                  setSearchNotice("");
                }
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder={["试试搜索想要的功能", "试试这样说“制作PPT”", "试试这样说“UI设计”"][hintIndex]}
              aria-label="搜索资源"
            />
            <button type="submit" disabled={searching || !query.trim()}>
              搜索
            </button>
            {searchOpen && (
              <>
                <button
                  type="button"
                  className="search-overlay-backdrop"
                  aria-label="关闭搜索"
                  onClick={() => setSearchOpen(false)}
                />
                <div className="marketplace-search-overlay" role="dialog" aria-modal="true" aria-label="搜索资源">
                  <div className="search-overlay-body">
                  <aside className="search-overlay-sidebar" aria-label="搜索分类">
                    <button type="button" className={searchSection === "hot" ? "active" : ""} onClick={() => { setSearchSection("hot"); setSearchCategory(null); }}><img src="/icons/search-fire.svg" alt="" />热门资源</button>
                    <button type="button" className={searchSection === "category" ? "active" : ""} onClick={() => setSearchSection("category")}><img src="/icons/search-category.svg" alt="" />按类别分类</button>
                    {searchSection === "category" && (
                      <div className="search-category-options">
                        {(["Skill", "Agent", "AI 应用"] as const).map((type) => (
                          <button type="button" className={searchCategory === type ? "active" : ""} key={type} onClick={() => setSearchCategory(type)}>{type === "AI 应用" ? "AI应用" : type}</button>
                        ))}
                      </div>
                    )}
                    <button type="button" className={searchSection === "saved" ? "active" : ""} onClick={() => setSearchSection("saved")}><img src="/icons/search-heart.svg" alt="" />收藏</button>
                  </aside>
                  <section className="search-overlay-results" aria-live="polite">
                    <div className="search-overlay-heading">
                      <h2>{searchSection === "category" ? `${searchCategory ? (searchCategory === "AI 应用" ? "AI应用" : searchCategory) : "选择类别"}` : query.trim() ? `“${query.trim()}” 的搜索结果` : "热门资源"}</h2>
                      <span>{overlayResults.length} 个结果</span>
                    </div>
                    {searching ? <p className="search-overlay-status">正在搜索…</p> : searchNotice ? <p className="search-overlay-status">{searchNotice}</p> : (
                      <div className="search-overlay-grid">
                        {overlayResults.map((item) => (
                          <button type="button" className="search-overlay-card" key={item.id || item.name} onClick={() => { openResource(item); setSearchOpen(false); }}>
                            <span className="search-overlay-cover">{item.cover ? <img src={item.cover} alt="" /> : <b>{item.icon}</b>}</span>
                            <span className="search-overlay-card-copy">
                              <strong>{highlightName(item.name)}</strong>
                            <span className="search-overlay-tags"><i className={item.type === "Agent" ? "agent" : item.type === "AI 应用" ? "ai-app" : ""}>{item.type}</i>{item.featured && <i className="featured">精选</i>}{item.tags.slice(0, 1).map((tag) => <i key={tag}>{tag}</i>)}</span>
                              <small>{item.summary || compactSummary(item.description)}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                  </div>
                </div>
              </>
            )}
          </form>
          <div className="marketplace-actions">
            <a href="/admin">登录</a>
            <button type="button" onClick={() => setUploadOpen(true)}>注册</button>
            <button
              type="button"
              className="primary"
              onClick={() => {
                setUploadOpen(true);
                setUploadNotice("");
              }}
            >
              上传资源
            </button>
            <button
              type="button"
              className="outlined"
              title="个人中心功能待定"
            >
              个人中心
            </button>
          </div>
        </div>
        <div className="marketplace-filter-rail">
          <details className="marketplace-filter">
            <summary>分类 <img src="/icons/dropdown-user.svg" alt="" /></summary>
            <div className="marketplace-filter-menu">
              {filters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={active === filter ? "active" : ""}
                  onClick={(event) => {
                    setActive(filter);
                    event.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                >
                  {filterLabels[filter]}
                </button>
              ))}
            </div>
          </details>
          <details className="marketplace-filter">
            <summary>筛选 <img src="/icons/dropdown-user.svg" alt="" /></summary>
            <div className="marketplace-filter-menu">
              {(["全部", "精选"] as const).map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={secondaryFilter === filter ? "active" : ""}
                  onClick={(event) => {
                    setSecondaryFilter(filter);
                    event.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </details>
          <button
            className="marketplace-reset"
            type="button"
            onClick={() => {
              setActive("全部");
              setSecondaryFilter("全部");
            }}
          >
            <b>重置筛选</b><img src="/icons/return-user.svg" alt="" />
          </button>
        </div>
      </header>

      <section className="library marketplace-library" id="library">
        <div className="marketplace-shell">
          <div className="marketplace-intro">
            <p className="marketplace-skill-total">目前提供 {visible.length} 个资源</p>
          </div>
          {visible.length ? (
            <div className="resource-grid">
              {visible.map((item, index) => (
                <div
                  className={`resource-card ppt-reference-card ${item.cover ? "has-cover" : ""}`}
                  key={`${item.source}-${index}-${item.name}`}
                  role="button"
                  aria-label={`查看${item.name}案例`}
                  onClick={() => openResource(item)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openResource(item);
                    }
                  }}
                >
                  <div className="card-visual">
                    {item.cover ? (
                      <img src={item.cover} alt={`${item.name} 项目封面`} />
                    ) : item.media?.[0]?.type === "image" ? (
                      <img src={item.media[0].src} alt="" />
                    ) : item.media?.[0]?.type === "video" ? (
                      <video muted playsInline preload="metadata">
                        <source src={item.media[0].src} type="video/mp4" />
                      </video>
                    ) : (
                      <div
                        className="letter-cover"
                        style={{ background: item.tint }}
                      >
                        <span>{item.icon}</span>
                        <i>{item.category}</i>
                      </div>
                    )}
                    {item.demoVideo &&
                      (item.demoVideo.toLowerCase().endsWith(".gif") ? (
                        <img
                          className="card-hover-demo"
                          src={item.demoVideo}
                          alt={`${item.name} 演示`}
                        />
                      ) : (
                        <video
                          className="card-hover-demo"
                          src={item.demoVideo}
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="metadata"
                          aria-label={`${item.name} 演示`}
                        />
                      ))}
                    {item.media?.length ? (
                      <b className="media-count">
                        {item.media.some((m) => m.type === "video")
                          ? "▶ "
                          : "▧ "}
                        {item.media.length} 个媒体
                      </b>
                    ) : null}
                    <button
                      className={`card-like ${likedSkills.has(item.id || item.name) ? "liked" : ""}`}
                      type="button"
                      aria-label={likedSkills.has(item.id || item.name) ? `取消收藏 ${item.name}` : `收藏 ${item.name}`}
                      aria-pressed={likedSkills.has(item.id || item.name)}
                      onClick={(event) => {
                        event.stopPropagation();
                        const key = item.id || item.name;
                        setLikedSkills((current) => {
                          const next = new Set(current);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        });
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21s-7.2-4.35-9.45-8.42C.62 9.08 2.25 4.75 6.42 4.1A5.47 5.47 0 0 1 12 6.48a5.47 5.47 0 0 1 5.58-2.38c4.17.65 5.8 4.98 3.87 8.48C19.2 16.65 12 21 12 21Z" />
                      </svg>
                    </button>
                    <div className="card-liquid-overlay">
                      <div className="card-liquid-copy">
                        <h3>{item.name}</h3>
                        <div className="card-liquid-tags">
                          <span className={item.type === "Agent" ? "agent-tag" : item.type === "AI 应用" ? "ai-app-tag" : "skill-tag"}>{item.type}</span>
                          {item.featured && <span className="featured-tag">精选</span>}
                        </div>
                        <p>{item.summary || item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="type-row">
                      <span>{displayType(item.type)}</span>
                      {item.featured && <em>精选</em>}
                    </div>
                    <div className="card-bottom">
                      <span className="card-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <span>⌕</span>
              <h3>暂时没找到</h3>
              <p>换个关键词，或选择其他分类试试。</p>
            </div>
          )}
        </div>
      </section>

      {selected ? (
        <PptDetail
          resource={selected}
          onClose={() => setSelected(null)}
          onCopy={copyPrompt}
          copied={copied}
        />
      ) : (
        selected && (
          <div
            className="modal-backdrop"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
          >
            <section
              className={`detail-modal ${selected.cover ? "has-cover" : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.name}详情`}
            >
              <button
                className="modal-close"
                onClick={() => setSelected(null)}
                aria-label="关闭"
              >
                ×
              </button>
              <div className="detail-media">
                {selected.cover ? (
                  <img
                    className="detail-cover"
                    src={selected.detailCover ?? selected.cover}
                    alt={`${selected.name} 项目封面`}
                    decoding="async"
                  />
                ) : currentMedia ? (
                  currentMedia.type === "image" ? (
                    <img
                      src={currentMedia.src}
                      alt={currentMedia.alt}
                      decoding="async"
                    />
                  ) : (
                    <video
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      poster={selected.cover || undefined}
                    >
                      <source src={currentMedia.src} type="video/mp4" />
                    </video>
                  )
                ) : (
                  <div
                    className="detail-placeholder"
                    style={{ background: selected.tint }}
                  >
                    <span>{selected.icon}</span>
                    <p>{selected.category}</p>
                  </div>
                )}
                {selected.media && selected.media.length > 1 && (
                  <div className="media-thumbs">
                    {selected.media.map((media, index) => (
                      <button
                        key={media.src}
                        className={index === mediaIndex ? "active" : ""}
                        onClick={() => setMediaIndex(index)}
                        aria-label={`查看媒体 ${index + 1}`}
                      >
                        {media.type === "video" ? (
                          <span>▶</span>
                        ) : (
                          <img
                            src={media.src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="detail-content">
                {selected.name === "PPT Generation" ? (
                  <>
                    <h2>{selected.name}</h2>
                    <p className="detail-desc">{selected.description}</p>
                    <div className="detail-tags">
                      {selected.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="ppt-resource-facts">
                      <div className="fact-author">
                        <i>♧</i>
                        <p>
                          <small>作者</small>
                          {selected.author}
                        </p>
                      </div>
                      <div className="fact-github">
                        <i>●</i>
                        <p>
                          <small>GitHub</small>
                          <a
                            href={selected.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            查看开源项目 →
                          </a>
                        </p>
                      </div>
                      <div className="fact-platform">
                        <i>◇</i>
                        <p>
                          <small>适用平台</small>
                          {selected.platform}
                        </p>
                      </div>
                    </div>
                    <div className="case-note">
                      <h3>{selected.caseTitle}</h3>
                      <p>{selected.caseSummary}</p>
                    </div>
                    <div className="prompt-box">
                      <small>在 Codex 中这样说</small>
                      <code>{selected.prompt}</code>
                      <button onClick={copyPrompt}>
                        {copied ? "已复制 ✓" : "✦ 复制调用方式"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-meta">
                      <span>{selected.type}</span>
                      <b>● 资源详情</b>
                    </div>
                    <h2>{selected.name}</h2>
                    <p className="detail-desc">{selected.description}</p>
                    <div className="detail-tags">
                      {selected.tags.map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                    {selected.author && (
                      <div className="resource-facts">
                        <p>
                          <span>作者</span>
                          {selected.author}
                        </p>
                        <p>
                          <span>适用平台</span>
                          {selected.platform}
                        </p>
                        <p>
                          <span>GitHub</span>
                          <a
                            href={selected.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            查看开源项目 ↗
                          </a>
                        </p>
                      </div>
                    )}
                    <div className="case-note">
                      <small>功能介绍</small>
                      <h3>{selected.caseTitle}</h3>
                      <p>{selected.caseSummary}</p>
                    </div>
                    <div className="prompt-box">
                      <small>在 Codex 中这样说</small>
                      <code>{selected.prompt}</code>
                      <button onClick={copyPrompt}>
                        {copied ? "已复制 ✓" : "复制调用方式"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        )
      )}
      {uploadOpen && (
        <div
          className="upload-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setUploadOpen(false);
          }}
        >
          <section
            className="upload-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="上传资源"
          >
            <button
              className="upload-close"
              onClick={() => setUploadOpen(false)}
              aria-label="关闭"
            >
              ×
            </button>
            <div className="upload-content">
              <h2>用户上传</h2>
              <form onSubmit={submitSkill}>
              <label className="upload-type-field">
                上传种类
                <select
                  name="resourceType"
                  value={uploadType}
                  onChange={(event) => setUploadType(event.target.value as Resource["type"])}
                >
                  <option value="Skill">Skill</option>
                  <option value="Agent">Agent</option>
                  <option value="AI 应用">AI 应用</option>
                </select>
              </label>
              <label>
                封面 <small>必须且只能上传 1 张，将作为主页卡片首图</small>
                <input
                  name="cover"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(event) =>
                    setCoverPreview(
                      event.target.files?.[0]
                        ? URL.createObjectURL(event.target.files[0])
                        : "",
                    )
                  }
                />
                {coverPreview && (
                  <span className="upload-preview">
                    <img src={coverPreview} alt="封面预览" decoding="async" />
                    <b>封面预览</b>
                  </span>
                )}
              </label>
              <label>
                {uploadType === "Skill" ? "技能名称" : `${uploadType}名称`}
                <input
                  name="name"
                  maxLength={80}
                  required
                  placeholder="例如：演示文稿大师"
                />
              </label>
              <label>
                作者
                <input
                  name="author"
                  maxLength={80}
                  required
                  placeholder="作者或团队名称"
                />
              </label>
              <label>
                GitHub 地址
                <input
                  name="githubUrl"
                  type="url"
                  required
                  placeholder="https://github.com/owner/repo"
                />
              </label>
              <label>
                适用平台
                <input
                  name="platform"
                  required
                  maxLength={500}
                  placeholder="例如：Codex、Claude Code、Cursor"
                />
              </label>
              <label>
                标签 <small>用逗号分隔，最多 5 个</small>
                <input name="tags" required placeholder="PPTX, 设计, 自动化" />
              </label>
              <label>
                一句话简介
                <textarea
                  name="summary"
                  required
                  maxLength={180}
                  placeholder="一句话说明它最适合解决什么问题…"
                />
              </label>
              <label>
                简介
                <textarea
                  name="intro"
                  required
                  maxLength={500}
                  placeholder="显示在资源卡片和详情页标题下方…"
                />
              </label>
              <label>
                功能介绍
                <textarea
                  name="feature"
                  required
                  maxLength={1200}
                  placeholder="说明这个资源可以解决什么问题…"
                />
              </label>
              {uploadType === "Skill" && (
                <label>
                  在 Codex 中怎么引用
                  <textarea
                    name="codexPrompt"
                    required
                    maxLength={800}
                    placeholder="使用这个技能，帮我…"
                  />
                </label>
              )}
              <label>
                改编者 <small>可选</small>
                <input
                  name="adaptedBy"
                  maxLength={80}
                  placeholder="例如：演示人"
                />
              </label>
              {uploadType === "Skill" && (
                <label>
                  安装到 Codex <small>可选</small>
                  <textarea
                    name="installCommand"
                    maxLength={500}
                    placeholder="例如：npx skills add owner/repository -a codex -g -y"
                  />
                </label>
              )}
              <label>
                预览图{" "}
                <small>可再上传 0–7 张；与封面合计最多 8 张，可拖动排序</small>
                <input
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    setImagePreviews((items) => [
                      ...items,
                      ...files.map((file, index) => ({
                        id: `new:${Date.now()}:${index}:${file.name}`,
                        src: URL.createObjectURL(file),
                        file,
                      })),
                    ]);
                    event.currentTarget.value = "";
                  }}
                />
                {imagePreviews.length > 0 && (
                  <span className="upload-preview-sort-list">
                    {imagePreviews.map((item, index) => (
                      <span
                        className={`upload-preview-sort-item ${draggedPreview === item.id ? "dragging" : ""}`}
                        key={item.id}
                        draggable
                        onDragStart={() => setDraggedPreview(item.id)}
                        onDragOver={(event: DragEvent<HTMLSpanElement>) => {
                          event.preventDefault();
                          if (!draggedPreview || draggedPreview === item.id)
                            return;
                          setImagePreviews((items) => {
                            const from = items.findIndex(
                              (value) => value.id === draggedPreview,
                            );
                            const to = items.findIndex(
                              (value) => value.id === item.id,
                            );
                            if (from < 0 || to < 0) return items;
                            const next = [...items];
                            const [moved] = next.splice(from, 1);
                            next.splice(to, 0, moved);
                            return next;
                          });
                        }}
                        onDragEnd={() => setDraggedPreview(null)}
                      >
                        <img
                          src={item.src}
                          alt={`预览图 ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                        <small>{index + 1}</small>
                        <button
                          type="button"
                          onClick={() =>
                            setImagePreviews((items) =>
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
                演示视频 <small>可选，GIF / MP4 / WebM，最大 60MB</small>
                <input
                  name="demoVideo"
                  type="file"
                  accept="image/gif,video/mp4,video/webm"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setDemoPreview(file ? URL.createObjectURL(file) : "");
                  }}
                />
                {demoPreview &&
                  (demoPreview.toLowerCase().endsWith(".gif") ? (
                    <img
                      className="upload-demo-preview"
                      src={demoPreview}
                      alt="演示视频预览"
                    />
                  ) : (
                    <video
                      className="upload-demo-preview"
                      src={demoPreview}
                      controls
                      muted
                      preload="metadata"
                    />
                  ))}
              </label>
              {uploadNotice && <p className="upload-notice">{uploadNotice}</p>}
              <button
                className="upload-submit"
                type="submit"
                disabled={uploading}
              >
                {uploading ? "正在公开发布…" : `公开发布 ${uploadType} →`}
              </button>
              </form>
            </div>
            <aside className="upload-visual" aria-hidden="true">
              <div className="upload-cube-scene">
                {["back", "middle", "front"].map((layer) => (
                  <div className={`upload-cube-layer ${layer}`} key={layer}>
                    {["left", "center", "right"].map((column) => (
                      <div className={`upload-cube-column ${column}`} key={column}>
                        <span /><span /><span />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="upload-social-card">
                <button type="button" className="social-wechat" aria-label="微信"><img src="/icons/social-wechat.svg" alt="" /></button>
                <button type="button" className="social-github" aria-label="GitHub"><img src="/icons/social-github.svg" alt="" /></button>
                <button type="button" className="social-qq" aria-label="QQ"><img src="/icons/social-qq.svg" alt="" /></button>
                <button type="button" className="social-phone" aria-label="电话"><img src="/icons/social-phone.svg" alt="" /></button>
              </div>
            </aside>
          </section>
        </div>
      )}
    </main>
  );
}

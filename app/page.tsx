"use client";

import { useEffect, useMemo, useState } from "react";

type Media = { type: "image" | "video"; src: string; alt: string };
type Resource = {
  name: string;
  type: "Skill" | "Agent" | "AI 应用";
  description: string;
  category: string;
  tags: string[];
  icon: string;
  tint: string;
  featured?: boolean;
  media?: Media[];
  caseTitle: string;
  caseSummary: string;
  prompt: string;
};

const resources: Resource[] = [
  { name:"女娲造人", type:"Agent", description:"从人物或模糊需求出发，深度调研并蒸馏成可运行的思维顾问 Skill。", category:"研究与智能体", tags:["深度调研","Skill 生成","多智能体"], icon:"女", tint:"#eaf2ff", featured:true, media:[{type:"video",src:"/cases/nuwa-demo.mp4",alt:"女娲造人炼金术动画演示"},{type:"image",src:"/cases/nuwa-landing.png",alt:"女娲造人案例长图"},{type:"image",src:"/cases/nuwa-naval.png",alt:"Naval 思维 Skill 案例"},{type:"image",src:"/cases/nuwa-musk.png",alt:"Musk 思维 Skill 案例"}], caseTitle:"把一个人的思维方式变成可调用能力", caseSummary:"输入人物名后完成资料研究、心智模型提炼、表达方式适配和 Skill 文件生成，最后可直接在 Codex 中作为思维顾问使用。", prompt:"使用女娲造人，帮我蒸馏一个张一鸣视角的 Skill" },
  { name:"三省六部", type:"Agent", description:"用中书规划、门下审议、尚书执行与刑部质检组织复杂多智能体协作。", category:"研究与智能体", tags:["任务拆解","并行协作","质量审查"], icon:"省", tint:"#edf8f5", featured:true, caseTitle:"让复杂任务经过规划、审议、执行和复核", caseSummary:"适合复杂研发、研究综述和系统性实施任务，用角色分工减少遗漏，并通过两轮自检提高交付质量。", prompt:"使用三省六部模式处理这个复杂任务，并完成两轮自检" },
  { name:"演示文稿大师", type:"Skill", description:"从提纲或资料生成可编辑 PPTX，并完成版式、图表、渲染和视觉检查。", category:"内容与设计", tags:["PPTX","可编辑","视觉质检"], icon:"演", tint:"#fff1e8", featured:true, media:[{type:"image",src:"/cases/presentation-style.png",alt:"演示文稿多风格案例"},{type:"image",src:"/cases/presentation-variants.png",alt:"演示文稿多主题案例"}], caseTitle:"同一主题生成多种可编辑演示风格", caseSummary:"不只输出截图，而是生成可以继续修改的 PPTX；案例展示了同一内容在多个视觉家族中的完整适配。", prompt:"使用演示文稿技能，把这份资料制作成 12 页可编辑 PPTX" },
  { name:"PPT Master", type:"Skill", description:"基于品牌、版式和 Deck 工作区生成或增强企业级原生 PPTX。", category:"内容与设计", tags:["品牌模板","企业演示","版式复用"], icon:"P", tint:"#f2edff", media:[{type:"image",src:"/cases/presentation-variants.png",alt:"PPT Master 成果案例"}], caseTitle:"把品牌规范沉淀成可复用的演示工作区", caseSummary:"适合已有母版、品牌色和企业模板的场景，持续生成一致的汇报材料。", prompt:"使用 PPT Master，基于我的模板生成一份项目汇报" },
  { name:"归藏社交卡片", type:"Skill", description:"把文章、脚本和产品笔记变成小红书轮播卡片与公众号封面套装。", category:"内容与设计", tags:["小红书","公众号","社交卡片"], icon:"卡", tint:"#fff2e9", media:[{type:"image",src:"/cases/nuwa-naval.png",alt:"社交媒体知识卡片案例"},{type:"image",src:"/cases/nuwa-musk.png",alt:"社交媒体人物卡片案例"}], caseTitle:"从长内容到适合传播的系列卡片", caseSummary:"自动规划封面、章节和信息密度，并输出适配社交平台比例的图片组。", prompt:"使用归藏社交卡片，把这篇文章做成 8 张小红书图文卡片" },
  { name:"立创 EDA 安全操作", type:"Skill", description:"安全检查和编辑立创 EDA Pro 原理图，验证网表、页面目标和修改结果。", category:"开发与工程", tags:["EDA","原理图","硬件"], icon:"电", tint:"#e8f7f4", featured:true, media:[{type:"image",src:"/cases/lceda-1.png",alt:"立创 EDA 原理图案例一"},{type:"image",src:"/cases/lceda-2.png",alt:"立创 EDA 原理图案例二"}], caseTitle:"在真实原理图上进行受控检查与修改", caseSummary:"案例包含参考样板截图，工作流会先只读检查页面和 UUID，再进行小范围修改与网表验证。", prompt:"使用立创 EDA 操作规范，先只读检查当前原理图并列出问题" },
  { name:"Codex Dream Skin", type:"Skill", description:"为 Windows Codex 应用套用可逆的沉浸式装饰皮肤，并支持修复和恢复。", category:"Codex 增强", tags:["主题","Windows","可逆"], icon:"梦", tint:"#f2ecff", media:[{type:"image",src:"/cases/dream-skin.jpg",alt:"Codex Dream Skin 视觉参考"}], caseTitle:"把 Codex 变成沉浸式创作空间", caseSummary:"通过安全、可恢复的方式增强 Codex 桌面视觉，不替换系统应用文件，可在更新后修复或一键恢复。", prompt:"使用 Codex Dream Skin，应用梦幻主题并保留恢复方案" },
  { name:"GPT Image", type:"Skill", description:"调用 GPT Image 2 完成文生图、图片编辑、海报、中文排版和 UI 概念图。", category:"内容与设计", tags:["图片生成","图片编辑","中文排版"], icon:"图", tint:"#e9f5ff", caseTitle:"从结构化创意说明到完整视觉资产", caseSummary:"先分析用途和构图，再生成图片并检查文字、主体和风格一致性，适合网站、海报和产品素材。", prompt:"使用 GPT Image，生成一张蓝白科技公益平台的案例封面" },
  { name:"PS 设计", type:"Skill", description:"处理海报、展板、抠图、修图、合成、排版和打印导出。", category:"内容与设计", tags:["修图","海报","排版"], icon:"Ps", tint:"#e9f4ff", caseTitle:"把零散图片整理成可交付的设计成品", caseSummary:"优先用确定性的本地工具完成清理和排版，需要新视觉时再进入生成式工作流。", prompt:"使用 PS 设计，把这些素材排成一张 A3 竖版展板" },
  { name:"小红书发布器", type:"Skill", description:"写作、渲染 3:4 卡片并通过保留登录状态的 Chrome 发布小红书图文。", category:"自动化与增长", tags:["小红书","自动发布","内容运营"], icon:"红", tint:"#fff0f1", caseTitle:"从主题到图文发布的一体化流程", caseSummary:"完成内容生成、图片上传、标题正文和话题填写，并在可见界面中确认发布结果。", prompt:"使用小红书发布器，把这个主题做成图文笔记，先预览再发布" },
  { name:"抖音评论助手", type:"Agent", description:"按关键词搜索视频、筛选候选并在确认后发布个性化评论。", category:"自动化与增长", tags:["抖音","内容搜索","审阅后执行"], icon:"抖", tint:"#f0f4f8", caseTitle:"先筛选，再进行可审阅的内容互动", caseSummary:"自动化只在确认过的搜索结果中执行，并带有限速、去重和成功校验。", prompt:"使用抖音评论助手搜索相关视频，先给我候选和评论预览" },
  { name:"自动 Skill 安装器", type:"Agent", description:"发现能力缺口后搜索、安装并验证合适的 Skill，再继续当前任务。", category:"Codex 增强", tags:["能力发现","自动安装","验证"], icon:"装", tint:"#edf8f5", caseTitle:"任务做到一半，也能自动补齐能力", caseSummary:"扫描本地目录与 Skill 注册源，选择匹配能力并验证可用性，让任务无需因为缺少工具停下来。", prompt:"使用自动 Skill 安装器，检查当前任务还缺少什么能力" },
  { name:"STM32 HAL 开发", type:"Skill", description:"面向 CubeMX 与 Keil5 的模块化 BSP 固件开发、编译、烧录和验证。", category:"开发与工程", tags:["STM32","HAL","嵌入式"], icon:"芯", tint:"#e8f7f4", caseTitle:"从外设需求到可维护的板级支持代码", caseSummary:"适合定时器、UART、GPIO 和传感器等二次开发，优先输出初学者也能维护的模块结构。", prompt:"使用 STM32 HAL 开发规范，为这个传感器写 BSP 驱动" },
  { name:"Android CLI", type:"Skill", description:"创建、运行和检查 Android 项目，管理模拟器、SDK 与设备截图。", category:"开发与工程", tags:["Android","模拟器","SDK"], icon:"A", tint:"#e8f7f0", caseTitle:"在命令行中完成 Android 开发闭环", caseSummary:"从项目创建到设备运行、界面检查和官方文档查询，适合自动化移动开发任务。", prompt:"使用 Android CLI 创建一个最小 Android 应用并运行到模拟器" },
  { name:"Paul Graham 视角", type:"Agent", description:"用 Paul Graham 的创业、写作与产品思维框架审视问题。", category:"人物思维 Agent", tags:["创业","写作","产品"], icon:"PG", tint:"#fff4e9", caseTitle:"用散文式推理找到问题里最不寻常的部分", caseSummary:"适合创业判断、产品方向、写作修改和人生选择，强调独立思考与用户真实需求。", prompt:"使用 Paul Graham 视角，审视这个创业想法哪里最不寻常" },
  { name:"Naval 视角", type:"Agent", description:"用财富、杠杆、判断力和长期主义框架分析选择。", category:"人物思维 Agent", tags:["财富","长期主义","判断力"], icon:"N", tint:"#eff5ff", media:[{type:"image",src:"/cases/nuwa-naval.png",alt:"Naval 思维 Agent 案例"}], caseTitle:"把抽象人生问题拆成杠杆与长期选择", caseSummary:"沉浸式采用 Naval 的思维系统，分析财富创造、个人自由和高质量判断。", prompt:"使用 Naval 视角，分析我应该如何选择这两个职业方向" },
  { name:"Elon Musk 视角", type:"Agent", description:"用第一性原理、成本拆解和极限目标审视工程与商业决策。", category:"人物思维 Agent", tags:["第一性原理","工程","成本"], icon:"M", tint:"#eef3f8", media:[{type:"image",src:"/cases/nuwa-musk.png",alt:"Musk 思维 Agent 案例"}], caseTitle:"从物理约束和成本结构重新定义问题", caseSummary:"适合产品、制造和高难度项目决策，主动挑战行业惯例与模糊需求。", prompt:"使用 Elon Musk 视角，重新拆解这个产品的成本结构" },
  { name:"张一鸣视角", type:"Agent", description:"用延迟满足、认知开放和系统化组织思维分析产品与管理。", category:"人物思维 Agent", tags:["产品","组织","认知"], icon:"张", tint:"#eef5ff", caseTitle:"从长期变量和组织机制思考增长", caseSummary:"适合产品策略、组织管理与职业发展，强调事实、概率和持续学习。", prompt:"使用张一鸣视角，分析这个产品增长策略" },
  { name:"GitHub", type:"AI 应用", description:"在 Codex 中查看仓库、Issue 和 PR，并处理评审意见与 CI。", category:"已安装应用", tags:["代码托管","PR","CI"], icon:"GH", tint:"#eef1f4", media:[{type:"image",src:"/cases/github.png",alt:"GitHub 应用图标"}], caseTitle:"从问题定位到 PR 交付", caseSummary:"连接 GitHub 后可直接读取代码协作上下文，处理评论、修复检查并发布本地修改。", prompt:"使用 GitHub，检查当前 PR 的未解决评审意见" },
  { name:"Figma", type:"AI 应用", description:"把设计转成代码，也能从网页生成可编辑的 Figma 设计。", category:"已安装应用", tags:["设计","Design to Code","组件库"], icon:"F", tint:"#f1edff", caseTitle:"设计与代码双向流动", caseSummary:"支持获取设计上下文、生成页面、维护 Code Connect，并把本地网页捕获进 Figma。", prompt:"使用 Figma，把这个页面转成可编辑设计" },
  { name:"HeyGen", type:"AI 应用", description:"生成数字人、讲解视频和可复用的头像与声音身份。", category:"已安装应用", tags:["视频","数字人","讲解"], icon:"H", tint:"#eef6ff", caseTitle:"把脚本变成数字人讲解视频", caseSummary:"从画幅检查、脚本工程到人物与声音选择，生成适合产品介绍和知识传播的视频。", prompt:"使用 HeyGen，把这段脚本生成一条横版讲解视频" },
  { name:"Spreadsheets", type:"AI 应用", description:"创建、分析和验证 Excel、CSV 与 Google Sheets 就绪工作簿。", category:"已安装应用", tags:["Excel","数据分析","表格"], icon:"表", tint:"#eaf8ef", media:[{type:"image",src:"/cases/spreadsheets.png",alt:"Spreadsheets 应用图标"},{type:"image",src:"/cases/analytics-dashboard.png",alt:"数据分析仪表盘案例"}], caseTitle:"把原始数据变成可交付的工作簿", caseSummary:"可完成清洗、公式、图表、格式和结果核验，案例包含可视化分析仪表盘。", prompt:"使用 Spreadsheets，分析这份数据并生成带图表的 Excel" },
  { name:"Presentations", type:"AI 应用", description:"创建、编辑和验证 PowerPoint 或 Google Slides 演示文稿。", category:"已安装应用", tags:["PowerPoint","Slides","演示"], icon:"片", tint:"#fff1ea", media:[{type:"image",src:"/cases/presentations.png",alt:"Presentations 应用图标"},{type:"image",src:"/cases/presentation-style.png",alt:"演示案例"}], caseTitle:"结构、视觉和可编辑性同时交付", caseSummary:"面向正式汇报和内容展示，输出真实演示文件并通过渲染检查布局。", prompt:"使用 Presentations，把这份提纲制作成一套演示" },
  { name:"Sites", type:"AI 应用", description:"搭建、部署和管理落地页、门户、仪表盘与内部工具。", category:"已安装应用", tags:["网站","部署","Cloudflare"], icon:"站", tint:"#eaf3ff", featured:true, media:[{type:"image",src:"/og.png",alt:"益智集网站案例"}], caseTitle:"从一句需求到可访问的网站", caseSummary:"当前这座益智集平台就是使用 Sites 完成设计、开发、验证与部署的真实案例。", prompt:"使用 Sites，做一个蓝白色的公益 AI 工具导航" },
  { name:"Documents", type:"AI 应用", description:"创建、编辑、批注并校验 Word 与 Google Docs 就绪文档。", category:"已安装应用", tags:["Word","文档","批注"], icon:"文", tint:"#eaf3ff", caseTitle:"从草稿到排版完成的正式文档", caseSummary:"支持结构化写作、红线修订、评论和视觉验证，适合报告、方案与正式材料。", prompt:"使用 Documents，把这份草稿整理成正式 Word 报告" },
  { name:"PDF", type:"AI 应用", description:"读取、创建、填写和视觉验证 PDF，包括表单与复杂排版。", category:"已安装应用", tags:["PDF","表单","视觉校验"], icon:"PDF", tint:"#fff0f0", caseTitle:"让 PDF 从静态文件变成可处理资产", caseSummary:"不仅提取文本，还可处理页面渲染、表单填写和生成后的视觉检查。", prompt:"使用 PDF，读取这份文件并提取关键结论" },
  { name:"Browser", type:"AI 应用", description:"控制 Codex 内置浏览器完成导航、页面检查和本地网站测试。", category:"已安装应用", tags:["浏览器","网页操作","测试"], icon:"浏", tint:"#eaf7ff", caseTitle:"在可见网页中完成受控操作", caseSummary:"适合依赖页面状态的任务，如登录后操作、网页测试和交互式核验。", prompt:"使用 Browser，打开这个页面并检查核心交互" },
  { name:"Computer Use", type:"AI 应用", description:"控制 Windows 桌面应用，处理需要真实界面的本地任务。", category:"已安装应用", tags:["Windows","桌面操作","自动化"], icon:"控", tint:"#eef4f8", caseTitle:"跨应用完成真实桌面工作流", caseSummary:"通过可见界面操作本地软件，适合无法只靠文件或 API 完成的任务。", prompt:"使用 Computer Use，在这个 Windows 应用中完成设置" },
];

const filters = ["全部", "Skill", "Agent", "AI 应用", "有案例"] as const;

export default function Home() {
  const [active, setActive] = useState<(typeof filters)[number]>("全部");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Resource | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [selected]);

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return resources.filter((item) => {
      const inType = active === "全部" || (active === "有案例" ? Boolean(item.media?.length) : item.type === active);
      const text = `${item.name} ${item.type} ${item.category} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
      return inType && (!keyword || text.includes(keyword));
    });
  }, [active, query]);

  const openResource = (item: Resource) => { setSelected(item); setMediaIndex(0); setCopied(false); };
  const currentMedia = selected?.media?.[mediaIndex];
  const copyPrompt = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top"><span className="brand-mark">益</span><span>益智集</span></a>
        <nav aria-label="主导航"><a href="#cases">案例</a><a href="#library">本地资源库</a><a href="#principles">公益原则</a></nav>
        <a className="nav-action" href="mailto:hello@yizhiji.org?subject=推荐一个 AI 工具">推荐工具 <span>↗</span></a>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span>●</span> 已接入本地 Codex 资源</div>
          <h1>不只告诉你<br />有什么，<em>还展示怎么用。</em></h1>
          <p>把你本机已经安装的 Skill、Agent 和 AI 应用整理成可搜索的公益资源库。每个重点能力都有调用方式、真实案例、图片或视频。</p>
          <label className="hero-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索本地 Skill、Agent、应用或用途..." aria-label="搜索本地资源" /><kbd>⌘ K</kbd></label>
          <div className="hero-stats"><div><b>{resources.length}</b><span>首批去重资源</span></div><i/><div><b>{resources.filter(r=>r.media?.length).length}</b><span>条含案例媒体</span></div><i/><div><b>100%</b><span>本机已安装</span></div></div>
        </div>
        <div className="hero-media" aria-label="案例媒体预览">
          <img src="/cases/nuwa-landing.png" alt="女娲造人案例" />
          <div className="floating-card card-a"><span>AGENT</span><b>女娲造人</b><small>4 个案例媒体</small></div>
          <div className="floating-card card-b"><span>SKILL</span><b>演示文稿大师</b><small>可编辑 PPTX</small></div>
          <div className="media-pill">▶ 视频案例已接入</div>
        </div>
      </section>

      <section className="case-feature shell" id="cases">
        <div className="case-video"><video controls muted playsInline preload="metadata" poster="/cases/nuwa-landing.png"><source src="/cases/nuwa-demo.mp4" type="video/mp4" />你的浏览器暂不支持视频播放。</video><span className="video-label">本地真实素材 · 视频案例</span></div>
        <div className="case-copy"><span className="section-kicker">FEATURED CASE</span><h2>一个名字，如何变成<br />可运行的思维 Agent？</h2><p>“女娲造人”会先完成资料研究，再提炼心智模型、决策启发式和表达方式，最后产出可直接调用的人物 Skill。</p><button onClick={() => openResource(resources[0])}>查看完整案例 <span>↗</span></button></div>
      </section>

      <section className="library" id="library"><div className="shell">
        <div className="section-head"><div><span className="section-kicker">LOCAL LIBRARY</span><h2>本地 Codex 能力库</h2></div><p>已去除依赖副本与重复版本，先接入最常用、最有代表性的能力。</p></div>
        <div className="toolbar"><div className="filters" role="group" aria-label="资源类型筛选">{filters.map(filter=><button key={filter} className={active===filter?"active":""} onClick={()=>setActive(filter)}>{filter}</button>)}</div><span className="result-count">显示 {visible.length} / {resources.length}</span></div>
        {visible.length ? <div className="resource-grid">{visible.map(item=><div className="resource-card" key={item.name} role="button" aria-label={`查看${item.name}案例`} onClick={()=>openResource(item)} tabIndex={0} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openResource(item)}}}>
          <div className="card-visual">{item.media?.[0]?.type === "image" ? <img src={item.media[0].src} alt="" /> : item.media?.[0]?.type === "video" ? <video muted playsInline preload="metadata"><source src={item.media[0].src} type="video/mp4" /></video> : <div className="letter-cover" style={{background:item.tint}}><span>{item.icon}</span><i>{item.category}</i></div>}{item.media?.length ? <b className="media-count">{item.media.some(m=>m.type==="video")?"▶ ":"▧ "}{item.media.length} 个媒体</b> : null}</div>
          <div className="card-body"><div className="type-row"><span>{item.type}</span><b>本机已安装</b>{item.featured&&<em>精选</em>}</div><h3>{item.name}</h3><p>{item.description}</p><div className="card-bottom"><div>{item.tags.slice(0,2).map(tag=><span key={tag}>#{tag}</span>)}</div><span className="card-arrow" aria-hidden="true">↗</span></div></div>
        </div>)}</div> : <div className="empty"><span>⌕</span><h3>暂时没找到</h3><p>换个关键词，或选择其他分类试试。</p></div>}
      </div></section>

      <section className="principles shell" id="principles"><div><span className="section-kicker">HOW WE CURATE</span><h2>不是文件列表，<br />而是能看懂的能力地图。</h2></div><div className="principle-list"><article><span>01</span><h3>真实安装状态</h3><p>只标记这台 Codex 中实际存在的 Skill、Agent 和应用。</p></article><article><span>02</span><h3>案例优先</h3><p>优先复用本地真实成果、截图和视频，不用空洞的装饰图代替案例。</p></article><article><span>03</span><h3>可直接调用</h3><p>每个详情页都提供一句可复制的 Codex 调用方式。</p></article></div></section>

      <footer className="shell"><a className="brand" href="#top"><span className="brand-mark">益</span><span>益智集</span></a><p>让每个人都能享受到 AI 带来的便利。</p><span>© 2026 益智集 · 公益开放平台</span></footer>

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="detail-modal" role="dialog" aria-modal="true" aria-label={`${selected.name}详情`}>
        <button className="modal-close" onClick={()=>setSelected(null)} aria-label="关闭">×</button>
        <div className="detail-media">
          {currentMedia ? currentMedia.type === "image" ? <img src={currentMedia.src} alt={currentMedia.alt}/> : <video controls autoPlay muted playsInline><source src={currentMedia.src} type="video/mp4"/></video> : <div className="detail-placeholder" style={{background:selected.tint}}><span>{selected.icon}</span><p>{selected.category}</p></div>}
          {selected.media && selected.media.length>1 && <div className="media-thumbs">{selected.media.map((media,index)=><button key={media.src} className={index===mediaIndex?"active":""} onClick={()=>setMediaIndex(index)} aria-label={`查看媒体 ${index+1}`}>{media.type==="video"?<span>▶</span>:<img src={media.src} alt=""/>}</button>)}</div>}
        </div>
        <div className="detail-content"><div className="detail-meta"><span>{selected.type}</span><b>● 本机已安装</b></div><h2>{selected.name}</h2><p className="detail-desc">{selected.description}</p><div className="detail-tags">{selected.tags.map(tag=><span key={tag}>#{tag}</span>)}</div><div className="case-note"><small>CASE STUDY</small><h3>{selected.caseTitle}</h3><p>{selected.caseSummary}</p></div><div className="prompt-box"><small>在 Codex 中这样说</small><code>{selected.prompt}</code><button onClick={copyPrompt}>{copied?"已复制 ✓":"复制调用方式"}</button></div></div>
      </section></div>}
    </main>
  );
}

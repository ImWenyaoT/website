# 重构设计：剥皮回归纯原厂 Starlight

- 日期：2026-06-30
- 状态：已批准，实现中
- 范围：只做「形」（站点外壳/外观），不动笔记正文

## 背景

仓库已经是 Astro + Starlight + TypeScript（迁移自 MkDocs）。但当前实现把
Starlight 的核心 chrome 几乎全部隐藏/改写，伪装成一个抄自 Vercel template 的极简
个人博客：

- `src/pages/index.astro`：自定义落地页，整页独立 HTML + 内联样式，绕过 Starlight。
- `src/pages/archive.astro`、`src/pages/tags/*`：独立 HTML 的归档/标签页。
- `src/components/StarlightHeader.astro`：替换原厂 Header（丢失搜索/主题切换/社交）。
- `src/styles/global.css` 的 `@layer starlight` 块：隐藏侧边栏、右侧 TOC、搜索框、
  主题切换，并把暗色模式强制锁死成亮色。

用户偏好「先用官方/原厂的技术栈、组件、模板」，希望站点回到 **Starlight 默认那一套**。

## 决策（用户拍板）

1. 首页形态：**普通文档页作首页**（带左侧边栏 + 右 TOC），不用 splash。
2. 主题定制度：**纯原厂默认**（系统字体 + 默认强调色），不保留 Noto Sans SC / 蓝色强调。
3. blog 功能：**全部移除**（归档/标签/RSS/schema 扩展）。

## 目标

站点 = 一个纯原厂 Starlight 文档站，首页是一篇普通文档页。本次只做形，笔记正文不动。

## 文件级变更

### 删除（皮 + blog 功能）

- `src/pages/index.astro`
- `src/pages/archive.astro`
- `src/pages/tags/index.astro`
- `src/pages/tags/[tag].astro`
- `src/pages/rss.xml.ts`
- → `src/pages/` 目录清空
- `src/components/StarlightHeader.astro`（恢复原厂 Header）
- `src/lib/blog.ts` → `src/lib/` 目录清空

### 新建

- `src/content/docs/index.md`：首页文档页。最小内容（标题 + 简短站点介绍 + 指向两篇
  导读的链接）。文案打磨留到内容阶段。

### 修改

- `astro.config.mjs`
  - 移除 `components.Header`
  - 移除 `vite.plugins: [tailwindcss()]`
  - 保留：`title`/`description`/`editLink`/`social`/`expressiveCode`/`sidebar`
    （均为官方配置；手动侧边栏顺序保留）、`mermaid` 集成、`customCss`
- `src/content.config.ts`：去掉 `extend` 里的 `pubDate`/`tags`，回到纯 `docsSchema()`
- `src/styles/global.css`：删字体 import、`@theme` 调色板、`:root`/`[data-theme]`
  语义层、整个 `@layer starlight` 覆盖块、`@layer components`、Tailwind import。
  **只保留 `.dl-*` 图示样式**，把 `var(--blog-*)` 重映射到原厂 `--sl-color-*` +
  一组最小语义色（蓝/绿/橙，用于图示区分前向/反向），亮/暗双色下都验证。
- `package.json`：移除 `@astrojs/rss`、`@astrojs/starlight-tailwind`、
  `@tailwindcss/vite`、`tailwindcss`、`typedoc`、`starlight-typedoc`、
  `typedoc-plugin-markdown`
- `README.md`：更新结构说明

### 清理

- 删根目录遗留 `docs/` 内的构建残渣（`dist`/`node_modules`/`.astro`）。`docs/` 本身
  改为正经文档目录（存放本规格）。

### 保留不动

- `src/content/docs/notes/**`（全部笔记）
- `src/components/PdfViewer.astro`（被 3 篇论文 MDX 引用）
- `public/`（favicon + 3 个 PDF）
- `.github/workflows/deploy.yml`（CI）

## 一处取舍：10 篇笔记的 `pubDate`/`tags` frontmatter

默认**不删**。理由：(1) 内容编辑属下一阶段；(2) 将来用官方插件重做 blog 时大概率还要
复用这些元数据，现在删是过早破坏。去掉 schema 扩展后，Zod 对未知字段静默忽略（不报错）
—— 实现时用 `astro check`/`build` 验证。万一该版本严格报错，再回退为「物理删掉这 10 处」
或「保留一个 passthrough」并与用户确认。

## 验证

- `pnpm install`（锁文件随依赖删除更新）
- `pnpm check`（astro check / TS strict）
- `pnpm build`（页面数下降：去掉 index/archive/tags*/rss，+1 文档首页）
- `pnpm dev` 肉眼核对：首页是带侧边栏的文档页；原厂 Header 有搜索 + 暗色切换；暗色模式
  正常；DL 笔记 SVG 在亮/暗下都正确；论文 PDF 仍可看；mermaid 正常。

## 不在本次范围（内容阶段）

- 首页文案 / 信息架构打磨
- blog 功能（归档/标签/RSS）若要，用官方/插件方式重做
- 侧边栏是否改自动生成
- 字体 / 强调色等再定制

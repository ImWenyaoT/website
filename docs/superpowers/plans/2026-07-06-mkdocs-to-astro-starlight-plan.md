# 实现计划：mkdocs-material → Astro Starlight 迁移

> 迁移已经完成；Astro/Starlight 继续作为当前平台。后续打磨方向见
> [`../../adr/0003-retain-astro-starlight.md`](../../adr/0003-retain-astro-starlight.md)。

- 日期：2026-07-06
- 分支：`migrate/astro`（已建）
- 关联 spec：[`../specs/2026-07-06-mkdocs-to-astro-starlight-design.md`](../specs/2026-07-06-mkdocs-to-astro-starlight-design.md)
- 产出方式：`request-refactor-plan`（步骤 1–6 已由 grilling + 已批 spec 完成；步骤 8「建 GitHub issue」按用户意愿改为本地计划文档——单人仓库，无需 issue）

## Problem Statement

现站是 mkdocs-material 文档站（16 页、~50 张 mermaid、6 页手绘 SVG、3 内嵌 PDF、CJK、GH Pages）。我想迁回 TypeScript 栈（Astro Starlight），同时把视觉重设计为 Vercel Geist（参考 openai-agents-js 的文档式布局，本身即 Starlight）。约束：不弄挂现有部署、不断 URL、不丢功能。

## Solution

在分支 `migrate/astro` 上把 Astro + Starlight 立于仓库根，`main` 迁移期继续 mkdocs 部署，达到平替后一次合并切换。内容迁入 `src/content/docs/` 并镜像现路径以保 URL；chrome 用 Starlight 原生（侧栏/TOC/搜索/暗亮/上下页/edit）；视觉用 Geist token 覆盖 `--sl-*`；PDF 收敛成 `<PdfViewer slug>` 深 seam。**内容/URL/功能三不变量，只改呈现。**

## Commits

每个提交都让 Astro 侧 `pnpm build` 保持绿（迁移期 mkdocs 文件仍在、inert，直到 C15 清理 + 合并）。

**阶段 0 · 脚手架**
1. **C1 scaffold**：`package.json`/`pnpm-lock`、`astro.config`（`site`/`base:'/website'`/`trailingSlash:'always'`/`build.format:'directory'` + Starlight 集成）、`tsconfig`、`src/content.config.ts`（`docsSchema`）、占位 `src/content/docs/index.mdx`、`.gitignore += node_modules/ dist/ .astro/`。mkdocs 不动。验：`pnpm install && pnpm build` 绿（单页 Starlight 站）。
2. **C2 link-check**：接入 `starlight-links-validator`——断链即构建失败（承接旧 `--strict`）。验：绿。

**阶段 1 · 设计系统**
3. **C3 tokens-light**：`src/styles/geist.css` 用 Geist light token 覆盖 `--sl-*`，经 `customCss` 引入。验：占位页呈 Geist 亮色。
4. **C4 tokens-dark**：Geist dark token（取自 `design.dark.md`）+ 焦点环 `0 0 0 2px #fff,0 0 0 4px #006bff` + 圆角 6/12/16 + 间距 4/8/…/40 + 动效 `cubic-bezier(0.175,0.885,0.32,1.1)` 150–300ms（尊重 `prefers-reduced-motion`）。验：亮/暗都是 Geist。
5. **C5 fonts**：Geist Sans/Mono 自托管（`public/fonts/` woff2 + `@font-face` + Starlight 字体变量），CJK 系统回退。验：离线加载。
6. **C6 dl-figures-css**：`.dl-*` 图示样式从旧 `extra.css` 移植进 `geist.css`，`--md-*` 依赖 → Geist/语义色（蓝/绿/橙）。验：绿（样式就绪，亮/暗留待内容页验）。

**阶段 2 · 组件与图**
7. **C7 mermaid**：客户端 Mermaid 集成（Starlight 兼容插件，免 Playwright）。验：dev 验一张图渲染 + 版本兼容。
8. **C8 pdfviewer**：`src/data/papers.ts`（slug→{arxiv_id,title}）+ `src/components/PdfViewer.astro`（据 slug 派生 arXiv 链接 + `public/paper/…` 路径，发射 `<figure class="pdf-viewer">…<iframe>`，未知 slug 构建期报错）；3 个 PDF 迁 `public/paper/`。验：样例 `<PdfViewer slug="react"/>` 渲染。

**阶段 3 · 内容迁移（按 nav 分组，每组构建绿 + 链接解析）**
9. **C9 home+about**：`index.mdx`（普通文档页作首页）、`about.mdx`；补 `title`/`sidebar`；**反转内链**（文件相对 `.md` → 路由式）。验：绿、链接解析。
10. **C10 model/neural-networks**：7 页（6 页 dl-SVG + `attention-paper` 用 `<PdfViewer slug="attention"/>`）；反转链接；验 dl-SVG 亮/暗、kebab-case SVG 属性透传、PDF 内嵌。验：绿。
11. **C11 model/rest**：`model/index` + `linear-algebra/index`。验：绿。
12. **C12 harness**：`papers/{react-paper,swe-agent-paper}`（PdfViewer）+ `harness/minimal-swe-agent`（`<Aside>` 承接 admonition + `--8<--` → 代码包含）+ `harness/{openai,anthropic}`；反转链接；验 ~34 张 mermaid + 代码包含。验：绿。

**阶段 4 · 侧边栏平替**
13. **C13 sidebar**：Starlight `sidebar` autogenerate + 各页 `sidebar.order/label` 对齐现 nav 顺序与策展标签（`"ReAct（原文）"` 等）→ nav 变派生、单一真源。验：结构 = 现导航。

**阶段 5 · 平替验收门**（非提交，检查点，见 Testing Decisions）

**阶段 6 · 切换**
14. **C14 ci**：改写 `.github/workflows/deploy.yml`：`mkdocs build` → `pnpm install --frozen-lockfile` + `pnpm build` + 传 `dist`（去 uv/mkdocs/chromium）。
15. **C15 cleanup**：删 mkdocs 残留（`mkdocs.yml`/`pyproject.toml`/`uv.lock`/`.python-version`/已迁的 `docs/` 站点内容/`site/`/caches）；`docs/` 只留工作文档（`superpowers/`/`agents/`/`topics/`）。验：`pnpm build` 仍绿、仓库纯 Astro。
16. **C16 governance**：改写 `README`（pnpm/Astro）；轻改 `AGENTS/CLAUDE`（**保留 `## Agent skills` 段**，仅更新 mkdocs 提法）。
17. **合并 `migrate/astro` → `main`（= 切换）**：核对 Actions 绿 + 各页可达 + URL 逐一对应。

## Decision Document

- 框架 = Astro **Starlight**（由参考站 openai-agents-js 本身是 Starlight、且设计可 token 覆盖修正；非裸 Astro/Next.js）。
- 内容模型 = 单 `docs` collection，frontmatter 驱动 `sidebar`（autogenerate + order/label），nav 变派生（治架构评审候选 3）。
- 渲染 = 全 `.mdx`；`<PdfViewer slug>` registry 深 seam（治候选 1）；`<Aside>` 承接 admonition；Expressive Code（Starlight 内置）承接高亮 + `--8<--`。
- Mermaid = 客户端渲染（零回归，免 Playwright）；手绘 SVG 走 MDX 通道，日后逐张升级。
- 设计 = Vercel Geist 为主 + Apple HIG 为辅，冲突 Vercel>Apple；覆盖 `--sl-*` + `geist.css`；字体自托管。
- 部署 = 留守 GH Pages，`base:'/website'`、`trailingSlash:'always'` 保尾斜杠 URL。
- 「无正文 H1」由 Starlight 从 frontmatter title 原生渲染，无需 hook（不同于 mkdocs 时代）。

## Testing Decisions

- 好测试 = 只测**外部行为**（渲染页面、内链解析、URL 对应、功能可用），不测实现细节。静态站不引入单测框架（YAGNI）。
- **自动门（CI）** = `pnpm build` + `starlight-links-validator` 坏链校验 → 断链/构建错误失败退出。前例 = 现 CI 的 `mkdocs build --strict`。
- **人工平替门**（合并前，spec §13）= 16 页逐页眼检：标题（frontmatter 派生）、侧栏结构 = 现 nav、Pagefind 中文搜索、暗/亮切换、每篇 mermaid、3 论文页 PDF 内嵌、6 页 dl-SVG 亮/暗；**URL 逐一对应**现状。
- 受测「模块」= `PdfViewer`（slug→figure/路径派生，未知 slug 报错）、侧边栏派生、内链解析——均通过构建期校验与页面眼检验证。

## Out of Scope

构建期零-JS mermaid（静态 SVG）· dl-figures 组件化（候选 4）· PDF 同地放置/人名化（候选 2）· 搬 Vercel（分支预览 + SSR）· 笔记正文文案打磨/信息架构调整 · 阅读时间（非现状功能）。

## Further Notes

- 头号风险 = **内链反转**（文件相对→路由式），逐条按目标页重推，靠坏链校验兜底（07-01 spec 反方向踩过此坑）。
- 迁移期「working」= 分支上 `pnpm build` 绿；`main` 仍部署 mkdocs，互不干扰，直到 C17 合并。
- 待定小决策（spec §16）：① 首页 = 普通文档页（推荐，随参考站与历史）；② PDF 先搬不改名，registry 留口。

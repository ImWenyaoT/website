# Website

基于 [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) 的个人知识库，沉淀 model、harness 相关笔记。视觉尽量沿用 Starlight 默认设计，仅为首页、教学图与文档阅读体验增加少量站点样式。

## 开发

```bash
pnpm install            # 装依赖
pnpm dev                # http://localhost:4321/website/
```

## 构建

```bash
pnpm build              # 唯一质量门：Astro 构建 + Starlight 坏链校验（断链/断锚点失败退出）
pnpm preview            # 本地预览 dist
```

## 部署

推送到 `main` 后，GitHub Actions 跑 `pnpm build` 并部署到 GitHub Pages（`https://imwenyaot.github.io/website/`）。

## 结构

- `src/content/docs/`：站点内容（Content Collections，`.mdx`）
  - `model/`：Model 笔记（Neural Networks + Linear Algebra）
  - `harness/`、`papers/`：Harness 笔记（minimal SWE Agent、Codex、Claude Code、ReAct/SWE-agent 原文）
- `src/components/PdfViewer.astro` + `src/data/papers.ts`：论文 PDF 内嵌组件与 registry（slug → arXiv/路径）
- `src/styles/site.css`：首页与阅读布局 + 手绘 SVG 图示（`.dl-*`）+ PDF 内嵌样式
- `public/paper/`：论文原文 PDF；`public/favicon.svg`
- `astro.config.mjs`：站点配置、侧边栏、mermaid（客户端渲染）、坏链校验
- `docs/`：仓库工作文档（`superpowers/` specs/plans、`agents/` 技能配置、`topics/` 草稿；不发布上站）

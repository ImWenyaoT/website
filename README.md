# Blog

基于 [Astro Starlight](https://starlight.astro.build/) 的个人博客与知识库，沉淀 Agent、AI Engineering、深度学习相关笔记。

采用官方 Starlight 单站点结构：Astro Starlight + MDX + Tailwind v4。

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:4321/blog/
```

## 构建

```bash
pnpm build      # 输出到 dist
```

## 部署

推送到 `main` 后，GitHub Actions 构建并部署到 GitHub Pages（`https://imwenyaot.github.io/blog/`）。

## 结构

- `src/content/docs/`：内容（Markdown / MDX 笔记）
- `src/components/`：自定义组件（如 PDF 阅读器）
- `src/styles/global.css`：设计系统（9 色 + 透明度、字体、强调色）
- `public/paper/`：论文原文 PDF
- `astro.config.mjs`：站点导航、主题与集成

# Website

基于 [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) 的中文个人知识库，沉淀 Model、Harness 与 AI coding 相关学习笔记。

## 开发

```bash
pnpm install --frozen-lockfile
pnpm dev
```

本地站点默认位于 `http://127.0.0.1:4321/website/`。

## 质量门禁

```bash
pnpm check
pnpm test
pnpm build
```

`pnpm check` 做类型检查。Vitest 锁住 16 个公开页、策展目录、内链、11 个教学图、33 个 Mermaid、3 个 PDF 和站点 `base`。`pnpm build` 负责生产构建。

## 部署

推送到 `main` 后，GitHub Actions 用锁定依赖依次执行 check、test、build，再把 `dist/` 部署到 GitHub Pages：`https://imwenyaot.github.io/website/`。

## 结构

- `src/content/docs/`：公开页面。URL 与目录镜像，首页为 `/website/`。
- `src/components/PdfViewer.astro`、`src/data/papers.ts`：三篇论文 PDF 的统一入口。
- `src/data/catalog.ts`：侧栏顺序的单一来源。
- `src/styles/content.css`：教学图、PDF 与 Mermaid 的内容样式。
- `public/paper/`：本地论文 PDF。
- `docs/adr/`、`docs/agents/`、`docs/topics/`：不发布的仓库文档。

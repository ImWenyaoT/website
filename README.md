# Website

基于 [mkdocs-material](https://github.com/squidfunk/mkdocs-material) 的个人知识库，沉淀
深度学习、AI agent 相关笔记。Python 工具链经 [uv](https://github.com/astral-sh/uv) 管理。

## 开发

```bash
uv sync                 # 装依赖
uv run mkdocs serve     # http://127.0.0.1:8000/website/
```

## 构建

```bash
uv run mkdocs build --strict   # 唯一质量门：断链/断锚点/缺页均失败
```

## 部署

推送到 `main` 后，GitHub Actions 跑 `mkdocs build --strict` 并部署到 GitHub Pages
（`https://imwenyaot.github.io/website/`）。

## 结构

- `docs/`：内容（Markdown 笔记）；`index.md` 是首页
- `docs/paper/`：论文原文 PDF（被论文页内嵌）
- `docs/stylesheets/extra.css`：DL 手绘 SVG 图示 + PDF 内嵌样式（设计系统见 `DESIGN.md`）
- `mkdocs.yml`：站点导航、主题与扩展

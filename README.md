# Website

基于 [mkdocs-material](https://github.com/squidfunk/mkdocs-material) 的个人知识库，沉淀
深度学习、AI agent 相关笔记。Python 工具链经 [uv](https://github.com/astral-sh/uv) 管理。

## 开发

```bash
uv sync                 # 装依赖（含 dev：ruff/ty/pytest）
uv run mkdocs serve     # http://127.0.0.1:8000/website/
```

## 校验与构建

```bash
uv run ruff format && uv run ruff check && uv run ty check && uv run pytest -q
uv run mkdocs build --strict
```

## 部署

推送到 `main` 后，GitHub Actions 先跑 lint（ruff/ty/pytest），再 `mkdocs build --strict`，
部署到 GitHub Pages（`https://imwenyaot.github.io/website/`）。

## 结构

- `docs/`：内容（Markdown 笔记）；`index.md` 是首页
- `docs/paper/`：论文原文 PDF（被论文页内嵌）
- `docs/stylesheets/extra.css`：DL 手绘 SVG 图示 + 阅读时间 + PDF 内嵌样式
- `hooks/reading_time.py`：mkdocs 原生 hook，合成标题 + 每页阅读时间
- `mkdocs.yml`：站点导航、主题与扩展

# Website

基于 [MkDocs](https://www.mkdocs.org/) + [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
的中文个人知识库，沉淀 Model、Harness 与 AI coding 相关学习笔记。

## 开发

```bash
UV_CACHE_DIR=.cache/uv uv sync --locked
UV_CACHE_DIR=.cache/uv uv run mkdocs serve
```

本地站点默认位于 `http://127.0.0.1:8000/website/`。

## 质量门禁

```bash
UV_CACHE_DIR=.cache/uv uv run ruff check .
UV_CACHE_DIR=.cache/uv uv run ruff format --check .
UV_CACHE_DIR=.cache/uv uv run ty check
UV_CACHE_DIR=.cache/uv uv run pytest
UV_CACHE_DIR=.cache/uv uv run mkdocs build --strict
```

Ruff 负责 Python lint 与格式，ty 负责静态类型检查；pytest 锁住公开页面集合、标题、受控 Tags、
MDX 清理、11 个教学图、51 个 Mermaid、3 个 PDF 和关键 MkDocs 配置；严格构建负责验证导航、
内链、锚点、资源与最终静态输出。

## 部署

推送到 `main` 后，GitHub Actions 使用锁定依赖运行 Ruff、ty、测试与严格构建，再把 `site/`
部署到 GitHub Pages：`https://imwenyaot.github.io/website/`。

## 结构

- `docs/`：公开 Markdown 内容与仓库内部文档。
  - `model/`：Model 笔记。
  - `harness/`、`papers/`：Harness 笔记与论文入口。
  - `paper/`：本地论文 PDF。
  - `stylesheets/extra.css`：首页、教学图与 PDF 的站点样式。
  - `adr/`、`agents/`、`superpowers/`、`topics/`：不发布的仓库文档。
- `mkdocs.yml`：站点、导航、Markdown 扩展、Tags 与严格校验配置。
- `tests/`：迁移后的内容与构建契约测试。
- `pyproject.toml`、`uv.lock`：Python 工具链及可复现依赖。

CI 固定使用 uv `0.11.29`。Ruff 使用稳定版本线；ty 仍处于 beta，因此二者都通过
`uv.lock` 固定到经过本仓库质量门禁验证的具体版本。项目不假设这些工具存在官方 LTS channel。

---
name: website-guide
description: >-
  修改 Tian "Edward" Wenyao 中文知识站前使用。覆盖 MkDocs Material、uv、导航、内容、样式、
  Tags、测试、严格构建和 GitHub Pages 部署约束。
---

# Website guide

本站使用 MkDocs Material + uv，线上地址为 `https://imwenyaot.github.io/website/`。

## 设计约束

- UI、首页和交互使用 Material 原生结构与 `--md-*` token，不维护自定义动效。
- 中文使用系统字体回退，不引入 CJK webfont。
- 教学图的语义色必须同时叠加线型或形状。
- `docs/stylesheets/extra.css` 只保留教学 SVG、PDF 和 Mermaid 尺寸样式。
- 主题、导航、Markdown 扩展、Tags 和校验集中在 `mkdocs.yml`。

## 内容约束

- 公开内容位于 `docs/model/`、`docs/harness/`、`docs/papers/` 及顶层页面。
- 内链使用相对源文件的 `.md` 路径。
- 每个 Learn 页面至少使用一个受控 Dictionary section 标签。
- `docs/adr/`、`agents/`、`superpowers/`、`topics/` 是仓库文档，不发布。

## 验证与部署

- Python 依赖只通过 uv 管理，提交 `uv.lock`；不直接使用 pip。CI 固定具体 uv 版本并运行
  `uv sync --locked`，禁止静默重写锁文件。
- 改动后运行 `UV_CACHE_DIR=.cache/uv uv run ruff check .` 和
  `UV_CACHE_DIR=.cache/uv uv run ruff format --check .`。
- 运行 `UV_CACHE_DIR=.cache/uv uv run ty check` 做静态类型检查。
- 改动后运行 `UV_CACHE_DIR=.cache/uv uv run pytest`。
- 生产门禁是 `UV_CACHE_DIR=.cache/uv uv run mkdocs build --strict`。
- CI 只有 Ruff、ty、测试和严格构建都通过后，才上传 `site/` 到 GitHub Pages。

# AGENTS.md

## TL;DR

- 请保持对话语言为中文
- 我的系统为 Mac/Linux
- 请在生成代码时添加函数级注释

## Setup commands
- 安装依赖：`uv sync`
- 本地预览：`uv run mkdocs serve`
- 严格构建：`uv run mkdocs build --strict`

## Python 质量门（改动 hooks/ 后必跑）
- `uv run ruff format`（格式化）
- `uv run ruff check`（lint）
- `uv run ty check`（类型检查）
- `uv run pytest -q`（hook 单测）

## 约定
- Python 一律经 uv，不新增 shell 脚本
- 内链用源文件相对的 `.md` 目标；`mkdocs build --strict` 必须过
- 提交身份固定 `ImWenyaoT <tianwenyao02@gmail.com>`

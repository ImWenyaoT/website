# Website

基于 [mkdocs-material](https://github.com/squidfunk/mkdocs-material) 的个人知识库，沉淀
model、harness 相关笔记。Python 工具链经 [uv](https://github.com/astral-sh/uv) 管理。

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

- `docs/model/`：Model 相关笔记，当前包含 Neural Networks 与 Linear Algebra 占位
- `docs/harness/`：Harness 相关笔记，包含 minimal SWE Agent、Codex 与 Claude Code
- `docs/paper/`：论文原文 PDF（被论文页内嵌）
- `docs/stylesheets/extra.css`：神经网络图示、Mermaid 与 PDF 内嵌样式（设计系统见 `DESIGN.md`）
- `mkdocs.yml`：站点导航、主题与扩展

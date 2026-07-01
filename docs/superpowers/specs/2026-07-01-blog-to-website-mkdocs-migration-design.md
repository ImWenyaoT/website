# 迁移设计：`blog` → `website`（Astro Starlight → mkdocs-material）

- 日期：2026-07-01
- 状态：已批准，待实现
- 范围：目录/仓库改名 + git 清史 + 技术栈整体迁移到 mkdocs-material。内容 1:1 搬运（不改笔记正文）。

## 背景

`projects/blog` 当前是 Astro + Starlight + Markdoc + Tailwind + pnpm 的文档站，部署到
GitHub Pages（`imwenyaot.github.io/blog/`，Pages source = GitHub Actions）。内容为 ~14
篇 Markdown/MDX/Markdoc 笔记（深度学习、AI agent、论文），含 3 个内嵌 PDF、Mermaid 图、
以及深度学习笔记的手绘 SVG 图示（靠自定义 CSS）。此仓库最初就是 MkDocs，中途迁到 Astro，
本次迁回官方 mkdocs-material。

内容扫描结论（决定迁移复杂度）：**无 LaTeX 数学**、**无 `:::` admonition**、唯一自定义
组件是 3 处 `PdfViewer`、内部链接是 Starlight 目录 slug 风格。

### 用户决策（已拍板）

1. **git 历史**：统一身份 + 压平重开——Astro 时代 41 个提交压成 **1 个干净初始提交**，
   全部 author+committer = `ImWenyaoT <tianwenyao02@gmail.com>`，彻底根除历史里的
   `hythmealot@gmail.com`（此邮箱会串到影子账号，属硬红线）。
2. **功能保真**：**全部保留**——① 每页阅读时间、② 论文页内嵌 PDF、③ DL 手绘 SVG 图示，
   均用 mkdocs 官方机制实现，不引第三方插件（阅读时间用原生 hook）。
3. **部署**：仍是 GitHub Pages，沿用 Actions 构建 + `upload-pages-artifact`（source =
   GitHub Actions，无需 gh-pages 分支），只把构建从 pnpm/Astro 换成 `uv`/mkdocs。

## 目标形态

纯原厂 mkdocs-material 知识库；Python 工具链一律经 **uv**；站点名沿用 `Wenyao Notes`；
导航 1:1 复刻现有 Starlight 侧边栏；部署地址变为 `imwenyaot.github.io/website/`。

## 详细设计

### A. 目录 / 仓库改名 + git 清史

- 本地目录：`mv projects/blog projects/website`。
- GitHub 远端：`gh repo rename website -R ImWenyaoT/blog`（GitHub 自动为旧名做重定向）。
- **清史（迁移完成并 `--strict` 通过后再做）**：
  1. `rm -rf .git`（连同全部旧提交与三种历史身份一并抹除，比 filter-repo 更彻底）。
  2. `git init -b main`。
  3. 锁定本地身份：`git config user.name "ImWenyaoT"`、
     `git config user.email "tianwenyao02@gmail.com"`（不依赖可能带错身份的 global config）。
  4. **防环境变量覆盖**：env 里的 `GIT_AUTHOR_*`/`GIT_COMMITTER_*` 优先级高于 local config，
     必须先 `unset GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL`，
     并对该次提交显式包一层一次性 env（`GIT_AUTHOR_EMAIL=… GIT_COMMITTER_EMAIL=… git commit …`）
     作双保险，author 与 committer 都钉死为 `ImWenyaoT <tianwenyao02@gmail.com>`。
  5. `git add -A` → **单个提交**：`初始化 website：mkdocs-material 知识库（迁移自 Astro Starlight）`。
  6. `git remote add origin https://github.com/ImWenyaoT/website.git`。
  7. `git push -f origin main`。
- 部署核对：Pages source 已是 GitHub Actions，改名后配置保留，URL 自动变
  `imwenyaot.github.io/website/`。

### B. 工程结构（uv 管理）

```
website/
├─ pyproject.toml         # deps=["mkdocs-material"]；[dependency-groups].dev=["ruff","ty"]；requires-python；[tool.ruff]/[tool.ty]
├─ uv.lock                # uv 锁定，供 CI 复现
├─ .python-version        # 固定 Python 版本（3.13），uv 自动拉取
├─ mkdocs.yml             # 站点配置 + nav（见 C）
├─ docs/                  # 站点源（mkdocs 约定根）
│  ├─ index.md            # 首页
│  ├─ about.md
│  ├─ deep-learning/*.md
│  ├─ ai-agent/index.md
│  ├─ topics/*.md
│  ├─ papers/*.md
│  ├─ paper/*.pdf         # 3 个论文 PDF（原 public/paper/）
│  ├─ assets/favicon.svg  # 原 public/favicon.*
│  ├─ stylesheets/extra.css   # 移植 notes.css 的 .dl-* 图示样式
│  └─ superpowers/specs/…     # 本设计文档；用 exclude_docs 排除，不发布
├─ hooks/reading_time.py  # 原生 hook：注入每页阅读时间
├─ .github/workflows/deploy.yml   # 见 F
├─ README.md              # 改写为 uv/mkdocs 说明
├─ AGENTS.md / CLAUDE.md  # 改写：setup=uv、无 pnpm/turbo/vitest
├─ .gitignore             # 改写为 Python/mkdocs（site/ .venv/ __pycache__/ …）
└─ LICENSE                # MIT，保留
```

命令：`uv sync` 装依赖；`uv run mkdocs serve` 本地预览；`uv run mkdocs build --strict` 构建。
Python 质量门（针对 `hooks/`）：`uv run ruff format` + `uv run ruff check` + `uv run ty check`。

**删除**全部 Astro 残留（替换而非叠加）：`astro.config.mjs`、`markdoc.config.mjs`、
`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`tsconfig.json`、`src/`、
`dist/`、`node_modules/`、`.astro/`、`public/`（内容已并入 `docs/`）、旧
`.github/workflows/deploy.yml`。

### C. `mkdocs.yml` 配置要点

- `site_name: Wenyao Notes`；`site_description: 深度学习、AI agent 与更多学习笔记。`
- `site_url: https://imwenyaot.github.io/website/`
- `repo_url: https://github.com/ImWenyaoT/website`；`repo_name: ImWenyaoT/website`
- `edit_uri: edit/main/docs/`（对应 Starlight 的 editLink）
- `exclude_docs: |`（mkdocs ≥1.5 原生）→ 排除 `superpowers/`，本设计文档不发布
- `validation:`（mkdocs ≥1.5 原生）→ 把链接/anchor/nav 问题从默认 info 提级为 warn，配合
  `--strict` 令其**失败退出**（否则断锚点/未识别链接只是静默 info）：
  ```yaml
  validation:
    nav:
      omitted_files: warn
      not_found: warn
      absolute_links: warn
    links:
      not_found: warn
      absolute_links: warn
      unrecognized_links: warn
      anchors: warn
  ```
- `theme:`
  - `name: material`
  - `language: zh`
  - `palette:` 亮/暗两组 + 手动切换（`toggle` + `scheme: default`/`slate`，跟随系统）
  - `features:` `navigation.instant`、`navigation.top`、`search.suggest`、
    `search.highlight`、`content.code.copy`、`content.action.edit`、`toc.follow`
  - `icon.repo: fontawesome/brands/github`；`favicon: assets/favicon.svg`
- `markdown_extensions:` `admonition`、`pymdownx.details`、`pymdownx.superfences`
  （含 mermaid 自定义 fence：`custom_fence name=mermaid class=mermaid format=…`）、
  `pymdownx.highlight`、`pymdownx.inlinehilite`、`attr_list`、`md_in_html`、
  `tables`、`toc: {permalink: true}`
- `extra_css: [stylesheets/extra.css]`
- `extra.social:` GitHub 链接（`https://github.com/ImWenyaoT`）
- `hooks: [hooks/reading_time.py]`
- `plugins: [search]`（内置；mermaid 客户端渲染，无需 Playwright/chromium）
- `nav:` 1:1 复刻现侧边栏：
  - Home → `index.md`
  - Deep Learning → `deep-learning/index.md`、`neural-network-structure`、`gradient-descent`、
    `backpropagation`、`gpt-transformer`、`attention`、`attention-paper`
  - AI Agent → `ai-agent/index.md`、`topics/agent-basics`、`topics/implementation-boundaries`、
    `topics/long-term-memory`、`papers/react`、`papers/react-paper`、`papers/swe-agent`、
    `papers/swe-agent-paper`
  - About → `about.md`

### D. 内容迁移映射（`src/content/docs/**` → `docs/**`）

| 源 | 目标 | 处理 |
| --- | --- | --- |
| `index.md` | `docs/index.md` | 留 `title`/`description`；两条导读链接改 `.md`（见下） |
| `about.mdoc` | `docs/about.md` | Markdoc → 纯 Markdown |
| `deep-learning/index.md` | 同路径 | 5 条 `./xxx/` 链接 → `xxx.md` |
| `deep-learning/{neural-network-structure,gradient-descent,backpropagation,gpt-transformer,attention}.md` | 同路径 | 直接迁；`\`\`\`mermaid` 保持；内链规范化 |
| `deep-learning/attention-paper.mdx` | `deep-learning/attention-paper.md` | `PdfViewer` → HTML 内嵌（见 E②） |
| `ai-agent/index.md` | 同路径 | 内链规范化 |
| `topics/{agent-basics,implementation-boundaries,long-term-memory}.md` | 同路径 | 直接迁 |
| `papers/{react,swe-agent}.md` | 同路径 | 直接迁；内链规范化 |
| `papers/{react-paper,swe-agent-paper}.mdx` | `papers/*.md` | `PdfViewer` → HTML 内嵌 |
| `public/paper/*.pdf` | `docs/paper/*.pdf` | 原样搬 |
| `public/favicon.*` | `docs/assets/` | 原样搬 |
| `src/styles/notes.css` 的 `.dl-*` | `docs/stylesheets/extra.css` | 见 E③ |

**frontmatter**：仅保留 `title`/`description`，删除 Starlight 专有键（`template`、
`sidebar`、`tableOfContents`、`hero` 等，本仓实际只有 title/description，基本无需删）。

**内部链接规范化（关键，易错）**：Starlight 链接是**路由相对**（`../attention/` 指
`/deep-learning/attention/`），mkdocs `.md` 链接是**源文件相对**。二者在"同目录兄弟页"
上不等价，必须按**目标页**逐条重推，不能机械把 `/`→`.md`。规则：每条内链改写为指向正确
目标页的源相对 `.md` 路径。示例：
- `deep-learning/gpt-transformer.md` 内 `../attention/` → `attention.md`（同目录兄弟）
- `deep-learning/index.md` 内 `./backpropagation/` → `backpropagation.md`
- `ai-agent/index.md` 内 `../topics/agent-basics/` → `../topics/agent-basics.md`
- `papers/react-paper.md` 内 `../react/` → `react.md`
- `index.md` 内 `deep-learning/` → `deep-learning/index.md`；`ai-agent/` → `ai-agent/index.md`

**安全网**：`mkdocs build --strict` 对未解析的内链/缺失 nav 页会**报错退出**，逐一清零。

### E. 三项功能保真实现

**① 每页阅读时间 + 标题保真** — `hooks/reading_time.py`，用 mkdocs 原生 `on_page_markdown`
钩子。**关键前提**：现有 17 篇内容**无正文 H1**，标题全由 frontmatter `title` 渲染（Starlight
行为）；vanilla Material 不会把 frontmatter title 自动注入正文 H1，若不处理则页面**既无可见
大标题、也无处挂阅读时间**。因此 hook 同时负责「合成标题」与「阅读时间」：
- **合成 H1**：钩子入参 `markdown` 已剥除 frontmatter，`page.meta` 保有 frontmatter。判断
  `markdown` 首个非空行是否为 `# ` 开头（只看首行，避开代码块里 `#` 注释的误判——如
  `backpropagation.md` 的 `# forward:` 在文件深处）：
  - 无 H1（当前全部情况）：在正文最前注入 `# {page.meta['title']}`，再接阅读时间行。
  - 有 H1（未来页）：在该 H1 之后插入阅读时间行。
  合成的 H1 会被 mkdocs `_set_title()` 采纳为 `page.title`，与 nav/frontmatter 一致，无双标题。
- **阅读时间**：统计 `markdown` 中 CJK 字符数与拉丁词数（正则），估时
  `minutes = max(1, ceil(cjk/350 + words/220))`；注入一行
  `⏱ 约 N 分钟阅读{ .reading-time }`（`attr_list` → `<p class="reading-time">`，muted 样式并入
  `extra.css`）。等价于原 `PageTitle.astro`「标题下加阅读时间」。
- **事件时序依据**：`on_page_markdown` 早于 `render()`/`_set_title()`，此时改 markdown 才能让
  合成 H1 被正确采纳。
- 纯标准库、无第三方依赖；函数级注释齐全；经 `ruff` 格式/lint + `ty` 类型检查。

**② 论文内嵌 PDF** — 3 个 `*-paper` 页把 `<PdfViewer src="paper/x.pdf" title=… arxiv=…/>`
换成 `md_in_html` 允许的原生 HTML：
```html
<object class="pdf-embed" data="../../paper/2405.15793.pdf#view=FitH"
        type="application/pdf" title="…">
  <p>浏览器无法内嵌 PDF，<a href="../../paper/2405.15793.pdf">点此下载/查看</a>。</p>
</object>
```
- 3 个 `*-paper` 页在目录 URL 下均为深度 2（`/deep-learning/attention-paper/`、
  `/papers/{react,swe-agent}-paper/`），到站点根 `paper/` 统一用 `../../paper/`，可复用。
- 高度靠 `.pdf-embed` 样式（并入 `extra.css`）。以 `serve` 实测 3 个 PDF 均可载。

**③ DL 手绘 SVG 图示** — `notes.css` 的 `.dl-*` 规则移植到 `docs/stylesheets/extra.css`，
经 `extra_css` 引入。原本依赖 Starlight `--sl-color-*` 变量的，改映射到 Material 的
`--md-*` 变量或一组最小语义色（蓝/绿/橙，区分前向/反向），**亮/暗双色下都验证**。
阅读时间与 `.pdf-embed` 的样式也并入此文件。

### F. 部署 CI（`.github/workflows/deploy.yml`）

沿用现有 Pages「source: Actions」（build → deploy），构建换成 uv + mkdocs：
- `on: push: branches: [main]` + `workflow_dispatch`；`permissions: pages:write, id-token:write`。
- **lint job**（先决）：`actions/checkout` → `astral-sh/setup-uv` → `uv sync --frozen` →
  `uv run ruff format --check` + `uv run ruff check` + `uv run ty check`（守住 `hooks/` 的 Python）。
- **build job**（needs: lint）：`actions/checkout` → `astral-sh/setup-uv`（带 cache）→
  `uv sync --frozen` → `uv run mkdocs build --strict`（**必须带 `--strict`**，配合 §C 的
  `validation:` 让断链/断锚点失败退出）→ `actions/upload-pages-artifact`（path: `site`）。
- **deploy job**（needs: build）：`actions/deploy-pages`。
- 相比旧 CI **去掉** pnpm/Node/Playwright chromium（mermaid 改客户端渲染），更快更简。

### G. 治理文件改写

- `README.md`：改为 mkdocs-material + uv 说明（`uv sync` / `uv run mkdocs serve` /
  `uv run mkdocs build --strict` / 部署到 `imwenyaot.github.io/website/`）。
- `AGENTS.md` / `CLAUDE.md`：现内容全是 pnpm/turbo/vitest（已失真），改写为 uv/mkdocs
  的 setup / 校验（`uv run mkdocs build --strict`）/ Python 质量门（`ruff` + `ty`）/ 风格约定；
  保留顶部三条全局偏好。（父级 `projects/CLAUDE.md` 不属本次范围，不动。）
- `.gitignore`：改为 Python/mkdocs（`site/`、`.venv/`、`__pycache__/`、`*.pyc`、`.cache/`）。
- `LICENSE`：保留。

## 执行顺序

1. 目录改名 `blog` → `website`（本地）。
2. 建 mkdocs 工程（pyproject/uv、mkdocs.yml、hooks、CI、治理文件）。
3. 迁移内容（逐文件 + 链接规范化 + PdfViewer/PDF/CSS 保真）。
4. 删除全部 Astro 残留。
5. `uv run mkdocs build --strict` 通过 + `serve` 肉眼核对（见验证）。
6. 清史：`rm -rf .git && git init` → 锁身份 → 单提交。
7. 远端改名 `gh repo rename website`；`git remote add` → `git push -f`。
8. 核对 Actions 部署绿、新 URL 可访问。

## 验证清单

- `uv run ruff format --check` + `uv run ruff check` + `uv run ty check` 全绿（`hooks/`）。
- `uv run mkdocs build --strict` exit 0（配合 §C `validation:`，抓断链/断锚点/缺页/未用文件）。
- `uv run mkdocs serve` 肉眼：**每页都有可见大标题**（来自 frontmatter，经 hook 合成 H1）；
  导航结构 = 原侧边栏；内置搜索可用；亮/暗切换正常；每篇 mermaid 正常渲染；3 个论文页 PDF
  内嵌可见可下载；DL 笔记 SVG 在亮/暗下都正确；每页阅读时间显示合理。
- push 后：GitHub Actions 绿；`imwenyaot.github.io/website/` 可访问；旧 `…/blog/` 重定向。
- **身份双查**（author 与 committer 都不能有错邮箱）：
  `git log --format='%an <%ae> | %cn <%ce>'` 每行两侧均为 `ImWenyaoT <tianwenyao02@gmail.com>`，
  全库 grep 无 `hythmealot`；`git fsck --no-reflogs` 无异常悬挂对象。

## 风险与取舍

- **内链语义差**：路由相对 vs 文件相对最易错——靠逐条按目标页重推 + `--strict` 兜底。
- **PDF 相对路径**：目录 URL 下 3 页同为深度 2，`../../paper/` 通用；以 serve 实测确认。
- **mermaid 渲染方式变化**：从 build 期静态 SVG 改为客户端 JS 渲染（Material 标准做法），
  CI 因此免装 chromium；代价是首屏由 JS 渲染（可接受）。
- **阅读时间中英混排计数**：估算值，非精确；WPM 取经验值，够用即可。
- **清史不可逆**：`rm -rf .git` 前确保 mkdocs 构建已通过；旧远端在改名后仍可经 GitHub
  重定向找回，但本地旧历史不再保留（用户已明确选择压平重开）。

## 不在本次范围

- 笔记正文内容打磨 / 信息架构调整。
- Material blog 插件（归档/标签/RSS）——如需，后续用官方插件另做。
- 社交卡片（social cards，需 cairo/imaging 依赖）——保持轻量，暂不启用。
- 站点多版本（mike）——单版本即可。

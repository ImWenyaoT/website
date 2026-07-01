# blog → website（mkdocs-material）迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `projects/blog`（Astro Starlight）改名并迁移为 `projects/website`（mkdocs-material），改 GitHub 远端名，并把 git 历史压平为单个干净初始提交。

**Architecture:** 在现有工作树内**逐任务替换**技术栈：先搭 uv/mkdocs 骨架与阅读时间 hook，再逐区搬运 Markdown 内容（规范化内链、PdfViewer→HTML、Markdoc→md），随后开 `--strict` 校验、写 CI、删除 Astro 残留；最后 `rm -rf .git && git init` 做**单提交**清史、改远端名、强推、核对部署。迁移期允许普通提交作检查点，最终会被压平。

**Tech Stack:** Python 3.13（uv 管理）、mkdocs-material、pymdown-extensions、mkdocs 原生 hook、ruff（lint/format）、ty（类型检查）、pytest（hook 单测）、GitHub Actions + Pages。

## Global Constraints

- **git 身份**：所有提交 author 与 committer 都必须是 `ImWenyaoT <tianwenyao02@gmail.com>`；历史里**绝不能**出现 `hythmealot@gmail.com`（会串到影子账号）。提交前 `unset GIT_AUTHOR_* GIT_COMMITTER_*` 并显式包一次性 env 作双保险。
- **Python 一律经 uv**：`uv sync` / `uv run <tool>`；不写 `.sh` 脚本（用户偏好）。
- **Python 质量门**：改动 `hooks/` 后必跑 `uv run ruff format` + `uv run ruff check` + `uv run ty check` + `uv run pytest`，全绿才提交。
- **构建门**：`uv run mkdocs build --strict` 必须 exit 0（配合 `validation:` 块把断链/断锚点提级为失败）。
- **替换而非叠加**：迁移完成后删除全部 Astro 残留，不留副本。
- **内链规范化**：所有站内链接改为**源文件相对的 `.md`** 目标；由目标页反推，不机械替换 `/`→`.md`。
- **中文优先**：文档/注释/提交信息用中文；代码带函数级注释。
- 站点元信息：`site_name = Wenyao Notes`；部署 `https://imwenyaot.github.io/website/`。
- 阅读时间口径（与旧 `PageTitle.astro` 一致）：剔除代码块后，中文 400 字/分钟、英文 200 词/分钟，`floor(值+0.5)`，最少 1 分钟；首页（`index.md`）不显示阅读时间。

---

### Task 1: 目录改名 + 锁定 git 身份 + uv/mkdocs 骨架

**Files:**
- Rename: `projects/blog/` → `projects/website/`
- Create: `pyproject.toml`, `.python-version`, `mkdocs.yml`, `docs/index.md`（占位）
- Delete（骨架期即清掉大块未跟踪构建物）: `node_modules/`, `dist/`, `.astro/`

**Interfaces:**
- Produces: 可运行的 `uv run mkdocs build`；工作目录变为 `projects/website/`；本地 git 身份已锁定。

- [ ] **Step 1: 改名目录并进入**

```bash
mv /home/ail510/tian_wenyao/projects/blog /home/ail510/tian_wenyao/projects/website
cd /home/ail510/tian_wenyao/projects/website
```

- [ ] **Step 2: 锁定本地 git 身份 + 清理可能污染的 env**

```bash
unset GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL
git config user.name "ImWenyaoT"
git config user.email "tianwenyao02@gmail.com"
git config user.name && git config user.email   # 期望：ImWenyaoT / tianwenyao02@gmail.com
```

- [ ] **Step 3: 删除大块未跟踪构建物（均已在旧 .gitignore 内）**

```bash
rm -rf node_modules dist .astro
```

- [ ] **Step 4: 用 uv 初始化项目骨架并加依赖**

```bash
uv init --bare --no-workspace
uv python pin 3.13
uv add "mkdocs-material"
uv add --dev ruff ty pytest
```

Expected: 生成/更新 `pyproject.toml`、`.python-version`、`uv.lock`、`.venv/`。

- [ ] **Step 5: 写最小 `mkdocs.yml`（骨架，仅 index）**

```yaml
site_name: Wenyao Notes
site_description: 深度学习、AI agent 与更多学习笔记。
site_url: https://imwenyaot.github.io/website/
repo_url: https://github.com/ImWenyaoT/website
repo_name: ImWenyaoT/website
edit_uri: edit/main/docs/

theme:
  name: material
  language: zh
  features:
    - navigation.instant
    - navigation.top
    - navigation.indexes
    - toc.follow
    - search.suggest
    - search.highlight
    - content.code.copy
    - content.action.edit
  palette:
    - media: "(prefers-color-scheme: light)"
      scheme: default
      toggle:
        icon: material/weather-night
        name: 切换到深色模式
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      toggle:
        icon: material/weather-sunny
        name: 切换到浅色模式

markdown_extensions:
  - admonition
  - attr_list
  - md_in_html
  - tables
  - footnotes
  - toc:
      permalink: true
  - pymdownx.details
  - pymdownx.highlight:
      anchor_linenums: true
  - pymdownx.inlinehilite
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format

plugins:
  - search

nav:
  - Home: index.md
```

- [ ] **Step 6: 写占位首页 `docs/index.md`**

```markdown
---
title: Wenyao Notes
description: 深度学习、AI agent 与更多学习笔记。
---

占位首页，Task 6 会替换为正式内容。
```

- [ ] **Step 7: 构建验证**

```bash
uv run mkdocs build
```
Expected: 构建成功，生成 `site/`，无 ERROR。

- [ ] **Step 8: 提交（检查点，最终会被压平）**

```bash
printf 'site/\n.venv/\n__pycache__/\n*.pyc\n.cache/\n' > .gitignore
git add -A
git commit -m "chore: 搭建 mkdocs-material + uv 骨架"
```

---

### Task 2: 阅读时间 + 标题合成 hook（TDD）

**Files:**
- Create: `hooks/reading_time.py`, `tests/test_reading_time.py`
- Modify: `pyproject.toml`（加 `[tool.ruff]` / `[tool.pytest.ini_options]`）, `mkdocs.yml`（加 `hooks:`）

**Interfaces:**
- Produces: `estimate_reading_minutes(markdown: str) -> int`；`render(markdown: str, title: str, is_home: bool) -> str`；mkdocs 钩子 `on_page_markdown`。
- Consumes: Task 1 的 mkdocs 骨架。

- [ ] **Step 1: 配置 ruff / pytest（pyproject 追加）**

在 `pyproject.toml` 末尾追加：

```toml
[tool.ruff]
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]

[tool.pytest.ini_options]
pythonpath = ["hooks"]
```

- [ ] **Step 2: 写失败的测试 `tests/test_reading_time.py`**

```python
"""reading_time hook 纯函数单测：阅读时间估算 + H1 合成/阅读时间注入。"""

from reading_time import estimate_reading_minutes, render


def test_reading_minutes_floor_at_one():
    """极短文本至少按 1 分钟计。"""
    assert estimate_reading_minutes("短") == 1


def test_reading_minutes_counts_cjk():
    """800 个中文字 / 400 = 2 分钟。"""
    assert estimate_reading_minutes("字" * 800) == 2


def test_reading_minutes_ignores_code_fences():
    """围栏代码块应被剔除：只剩 400 中文字 = 1 分钟。"""
    text = "字" * 400 + "\n```\n" + "code " * 500 + "\n```\n"
    assert estimate_reading_minutes(text) == 1


def test_render_synthesizes_h1_when_missing():
    """无正文 H1 时，用 title 合成 H1 并在其下注入阅读时间。"""
    out = render("正文内容。", title="注意力机制", is_home=False)
    assert out.startswith("# 注意力机制\n")
    assert 'class="reading-time"' in out
    assert out.rstrip().endswith("正文内容。")


def test_render_keeps_existing_h1_and_inserts_after():
    """已有 H1 时保留它，阅读时间插到 H1 之后，不再用 frontmatter 标题。"""
    out = render("# 已有标题\n\n正文。", title="frontmatter标题", is_home=False)
    assert out.startswith("# 已有标题\n")
    assert out.index('class="reading-time"') > out.index("# 已有标题")
    assert "frontmatter标题" not in out


def test_render_home_has_title_but_no_reading_time():
    """首页合成标题但不显示阅读时间。"""
    out = render("欢迎。", title="Wenyao Notes", is_home=True)
    assert out.startswith("# Wenyao Notes\n")
    assert "reading-time" not in out
```

- [ ] **Step 3: 运行测试确认失败**

```bash
uv run pytest -q
```
Expected: FAIL（`ModuleNotFoundError: No module named 'reading_time'`）。

- [ ] **Step 4: 实现 `hooks/reading_time.py`**

```python
"""mkdocs 原生 hook：为无正文 H1 的页面从 frontmatter title 合成 H1，并在标题下注入阅读时间。

现有内容全部由 frontmatter `title` 提供标题（迁移自 Astro Starlight），正文没有 H1；
vanilla Material 不会把 frontmatter title 注入正文，若不处理则页面既无可见大标题、也无处
挂阅读时间。因此本 hook 同时负责「合成 H1」与「阅读时间」。口径与旧 PageTitle.astro 一致：
剔除代码块后，中文 400 字/分钟、英文 200 词/分钟。
"""

from __future__ import annotations

import math
import re

# CJK 统计范围：中日韩统一表意(4E00-9FFF) + 扩展A(3400-4DBF)，与旧实现一致
_CJK = re.compile(r"[一-鿿㐀-䶿]")
_WORD = re.compile(r"[A-Za-z0-9]+")
_FENCED = re.compile(r"```.*?```", re.DOTALL)
_INLINE = re.compile(r"`[^`]*`")


def estimate_reading_minutes(markdown: str) -> int:
    """估算阅读时间（分钟）。先剔围栏代码块与行内代码，中英分别计数，四舍五入，最少 1 分钟。"""
    text = _INLINE.sub(" ", _FENCED.sub(" ", markdown))
    cjk = len(_CJK.findall(text))
    words = len(_WORD.findall(_CJK.sub(" ", text)))
    return max(1, int(math.floor(cjk / 400 + words / 200 + 0.5)))


def _has_leading_h1(markdown: str) -> bool:
    """判断正文首个非空行是否为 H1（只看首行，避开代码块内 `#` 注释误判）。"""
    for line in markdown.lstrip().splitlines():
        if not line.strip():
            continue
        return line.lstrip().startswith("# ")
    return False


def render(markdown: str, title: str, is_home: bool) -> str:
    """把 markdown 加工成「H1（必要时合成）+ 阅读时间行（首页除外）+ 原文」。纯函数，便于测试。"""
    minutes = estimate_reading_minutes(markdown)
    reading_line = "" if is_home else f'<p class="reading-time">约 {minutes} 分钟阅读</p>\n\n'
    if _has_leading_h1(markdown):
        head, _, rest = markdown.lstrip().partition("\n")
        return f"{head}\n\n{reading_line}{rest.lstrip()}"
    heading = f"# {title}\n\n" if title else ""
    return f"{heading}{reading_line}{markdown.lstrip()}"


def on_page_markdown(markdown, page, config, files):
    """mkdocs 钩子入口：早于 render()/_set_title()，此刻改 markdown 才能让合成 H1 被采纳。"""
    meta = getattr(page, "meta", None) or {}
    title = str(meta.get("title", ""))
    is_home = page.file.src_uri == "index.md"
    return render(markdown, title=title, is_home=is_home)
```

- [ ] **Step 5: 运行测试确认通过**

```bash
uv run pytest -q
```
Expected: 6 passed。

- [ ] **Step 6: ruff + ty 质量门**

```bash
uv run ruff format
uv run ruff check
uv run ty check
```
Expected: 全绿（format 无改动或已格式化；check/ty 无告警）。

- [ ] **Step 7: 在 `mkdocs.yml` 挂上 hook（在 `plugins:` 之前插入）**

```yaml
hooks:
  - hooks/reading_time.py
```

- [ ] **Step 8: 构建验证 + 提交**

```bash
uv run mkdocs build
git add -A
git commit -m "feat: 阅读时间与标题合成 hook（含单测，ruff/ty 通过）"
```
Expected: 首页出现 `# Wenyao Notes` 标题，无阅读时间行（首页豁免）。

---

### Task 3: 移植 `.dl-*` 图示样式 + PDF/阅读时间样式（extra.css）

**Files:**
- Create: `docs/stylesheets/extra.css`
- Modify: `mkdocs.yml`（加 `extra_css:`）

**Interfaces:**
- Produces: `.dl-*`、`.reading-time`、`.pdf-viewer/.pdf-bar/.pdf-title/.pdf-open/.pdf-frame/.pdf-fallback` 样式类，供内容页与 hook/PDF 页使用。

- [ ] **Step 1: 写 `docs/stylesheets/extra.css`（`--sl-color-*` 映射为 Material `--md-*`）**

```css
/* 深度学习笔记手绘 SVG 图示（.dl-*）+ 阅读时间 + 论文 PDF 内嵌样式。
 * 由 Astro Starlight 迁移而来：原 --sl-color-* 令牌映射到 Material --md-* 令牌
 * （随亮/暗调色自动适配）；语义色（蓝/绿/橙/灰）沿用固定 RGB。 */
:root {
  --dl-blue: 0 110 243;
  --dl-green: 28 193 53;
  --dl-orange: 243 137 0;
  --dl-gray: 130 130 135;
}

.dl-figure {
  box-sizing: border-box;
  display: block;
  width: 100%;
  max-width: 920px;
  height: auto;
  margin: 1.4rem auto 1.8rem;
  border: 1px solid var(--md-default-fg-color--lightest);
  border-radius: 0.45rem;
  background: var(--md-default-bg-color);
}
.dl-compact-figure { max-width: 560px; }
.dl-box,
.dl-token {
  fill: var(--md-default-bg-color);
  stroke: rgb(var(--dl-gray));
  stroke-width: 1.5;
}
.dl-box-accent,
.dl-token-accent {
  fill: rgb(var(--dl-blue) / 8%);
  stroke: rgb(var(--dl-blue));
  stroke-width: 1.8;
}
.dl-token-muted {
  fill: rgb(var(--dl-gray) / 10%);
  stroke: rgb(var(--dl-gray) / 72%);
  stroke-width: 1.3;
}
.dl-node {
  fill: var(--md-default-bg-color);
  stroke: rgb(var(--dl-gray));
  stroke-width: 1.5;
}
.dl-node-accent {
  fill: rgb(var(--dl-blue) / 8%);
  stroke: rgb(var(--dl-blue));
  stroke-width: 1.6;
}
.dl-label {
  fill: var(--md-default-fg-color);
  font-size: 14px;
  font-weight: 600;
}
.dl-small { fill: var(--md-default-fg-color); font-size: 11px; }
.dl-arrow,
.dl-axis {
  stroke: rgb(var(--dl-blue));
  stroke-width: 2;
  fill: none;
}
.dl-muted-arrow { stroke: rgb(var(--dl-gray)); stroke-width: 1.8; fill: none; }
.dl-back-arrow { stroke: rgb(var(--dl-orange)); stroke-width: 2; fill: none; }
.dl-thin { stroke: rgb(var(--dl-gray)); stroke-width: 1.2; fill: none; }
.dl-curve { stroke: var(--md-default-fg-color); stroke-width: 2.5; }
.dl-curve-muted { stroke: rgb(var(--dl-gray)); stroke-width: 2; }
.dl-point { fill: rgb(var(--dl-blue)); }
.dl-point-warn { fill: rgb(var(--dl-orange)); }
.dl-line-blue { stroke: rgb(var(--dl-blue)); stroke-width: 2.5; }
.dl-line-green { stroke: rgb(var(--dl-green)); stroke-width: 2.5; }
.dl-line-orange { stroke: rgb(var(--dl-orange)); stroke-width: 2.5; }
.dl-blue { fill: rgb(var(--dl-blue)); }
.dl-green { fill: rgb(var(--dl-green)); }
.dl-orange { fill: rgb(var(--dl-orange)); }
.dl-cell-on {
  fill: rgb(var(--dl-blue) / 8%);
  stroke: var(--md-default-bg-color);
  stroke-width: 2;
}
.dl-cell-off {
  fill: rgb(var(--dl-gray) / 10%);
  stroke: var(--md-default-bg-color);
  stroke-width: 2;
}

/* 阅读时间（hook 注入的 <p class="reading-time"> 段落） */
.reading-time {
  margin: 0.5rem 0 0;
  color: var(--md-default-fg-color--light);
  font-size: 0.75rem;
}

/* 论文原文 PDF 内嵌（替代旧 PdfViewer.astro） */
.pdf-viewer {
  margin: 1.5rem 0;
  border: 1px solid var(--md-default-fg-color--lightest);
  border-radius: 0.5rem;
  overflow: hidden;
}
.pdf-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--md-default-fg-color--lightest);
  font-size: 0.8rem;
}
.pdf-title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pdf-open {
  margin-inline-start: auto;
  color: var(--md-primary-fg-color);
  white-space: nowrap;
}
.pdf-frame { display: block; width: 100%; height: 80vh; border: 0; }
.pdf-fallback {
  margin: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
  color: var(--md-default-fg-color--light);
}
```

- [ ] **Step 2: 在 `mkdocs.yml` 挂上（`hooks:` 之后、`plugins:` 之前）**

```yaml
extra_css:
  - stylesheets/extra.css
```

- [ ] **Step 3: 构建验证 + 提交**

```bash
uv run mkdocs build
git add -A
git commit -m "style: 移植 DL 图示 + 阅读时间 + PDF 内嵌样式到 extra.css"
```

---

### Task 4: 迁移 Deep Learning 区（6 md + 1 PDF 页 + 3 PDF 资源）

**Files:**
- Create: `docs/deep-learning/{index,neural-network-structure,gradient-descent,backpropagation,gpt-transformer,attention,attention-paper}.md`
- Create: `docs/paper/{1706.03762,2210.03629,2405.15793}.pdf`（一次性搬全部 3 个 PDF）
- Modify: `mkdocs.yml`（nav 加 Deep Learning 区）

**Interfaces:**
- Consumes: extra.css 的 `.pdf-*`；hook 的标题合成。
- Produces: Deep Learning 全部页面 + 站点级 `docs/paper/` 资源。

- [ ] **Step 1: 搬运 PDF 资源与 6 篇普通笔记**

```bash
mkdir -p docs/deep-learning docs/paper
cp public/paper/1706.03762.pdf public/paper/2210.03629.pdf public/paper/2405.15793.pdf docs/paper/
for n in index neural-network-structure gradient-descent backpropagation gpt-transformer attention; do
  cp "src/content/docs/deep-learning/$n.md" "docs/deep-learning/$n.md"
done
```

- [ ] **Step 2: 规范化 Deep Learning 普通笔记的内链（改为 `.md` 目标）**

按下表改每个文件里的链接（左=原 slug 链接，右=新目标；同目录兄弟直接写文件名）：

| 文件 | 原链接 → 新链接 |
| --- | --- |
| `deep-learning/index.md` | `./neural-network-structure/`→`neural-network-structure.md`；`./gradient-descent/`→`gradient-descent.md`；`./backpropagation/`→`backpropagation.md`；`./gpt-transformer/`→`gpt-transformer.md`；`./attention/`→`attention.md` |
| `deep-learning/neural-network-structure.md` | `./gradient-descent/`→`gradient-descent.md` |
| `deep-learning/gradient-descent.md` | `./backpropagation/`→`backpropagation.md` |
| `deep-learning/backpropagation.md` | `./gradient-descent/`→`gradient-descent.md`；`./neural-network-structure/`→`neural-network-structure.md`；`./gpt-transformer/`→`gpt-transformer.md`（2 处） |
| `deep-learning/gpt-transformer.md` | `./attention/`→`attention.md` |
| `deep-learning/attention.md` | `./gpt-transformer/`→`gpt-transformer.md` |

- [ ] **Step 3: 清理 frontmatter（仅留 title/description）**

对上述 6 个文件，删除 frontmatter 里除 `title`/`description` 外的键（如 `pubDate`、`tags` 等）。验证：

```bash
awk '/^---$/{c++} c==1 && /^(pubDate|tags|sidebar|template):/{print FILENAME": "$0}' docs/deep-learning/*.md
```
Expected: 无输出。

- [ ] **Step 4: 从 `attention-paper.mdx` 生成 `docs/deep-learning/attention-paper.md`（PDF 内嵌）**

```markdown
---
title: Attention Is All You Need（原文）
description: Transformer 原始论文 Attention Is All You Need 的原文 PDF。
---

Vaswani et al., 2017 · arXiv [1706.03762](https://arxiv.org/abs/1706.03762)。配套笔记见 [注意力机制](attention.md)。

<figure class="pdf-viewer"><figcaption class="pdf-bar"><a class="pdf-title" href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Attention Is All You Need</a><a class="pdf-open" href="../../paper/1706.03762.pdf" target="_blank" rel="noopener">在新标签打开 ↗</a></figcaption><iframe class="pdf-frame" src="../../paper/1706.03762.pdf" title="Attention Is All You Need" loading="lazy"></iframe><p class="pdf-fallback">无法内嵌 PDF？<a href="../../paper/1706.03762.pdf" download>下载</a>。</p></figure>
```

> 注：`<figure>` 内 HTML 写成**单行、无空行**、**不带 `markdown` 属性**，确保作为原始 HTML 块被原样透传（不做 markdown 解析）；PDF 用 `../../paper/`（目录 URL 下深度 2）。此相对路径在原始 HTML 内，`--strict` 不校验，需在 Task 10 用 serve 实测确认。

- [ ] **Step 5: nav 加 Deep Learning 区（`mkdocs.yml` 的 `nav:` 下追加）**

```yaml
  - Deep Learning:
      - deep-learning/index.md
      - deep-learning/neural-network-structure.md
      - deep-learning/gradient-descent.md
      - deep-learning/backpropagation.md
      - deep-learning/gpt-transformer.md
      - deep-learning/attention.md
      - deep-learning/attention-paper.md
```

- [ ] **Step 6: 构建验证 + 提交**

```bash
uv run mkdocs build
git add -A
git commit -m "feat: 迁移 Deep Learning 区（6 笔记 + 论文 PDF 页 + 3 PDF）"
```
Expected: 构建成功；不应有 `deep-learning/*` 的 `not_found` 链接告警。

---

### Task 5: 迁移 AI Agent 区（index + 3 topics + 2 笔记 + 2 PDF 页）

**Files:**
- Create: `docs/ai-agent/index.md`, `docs/topics/{agent-basics,implementation-boundaries,long-term-memory}.md`, `docs/papers/{react,swe-agent,react-paper,swe-agent-paper}.md`
- Modify: `mkdocs.yml`（nav 加 AI Agent 区）

**Interfaces:**
- Consumes: Task 4 的 `docs/paper/*.pdf`。
- Produces: AI Agent 全部页面。

- [ ] **Step 1: 搬运普通笔记**

```bash
mkdir -p docs/ai-agent docs/topics docs/papers
cp src/content/docs/ai-agent/index.md docs/ai-agent/index.md
for n in agent-basics implementation-boundaries long-term-memory; do
  cp "src/content/docs/topics/$n.md" "docs/topics/$n.md"
done
cp src/content/docs/papers/react.md docs/papers/react.md
cp src/content/docs/papers/swe-agent.md docs/papers/swe-agent.md
```

- [ ] **Step 2: 规范化内链**

| 文件 | 原链接 → 新链接 |
| --- | --- |
| `ai-agent/index.md` | `../topics/agent-basics/`→`../topics/agent-basics.md`；`../topics/implementation-boundaries/`→`../topics/implementation-boundaries.md`；`../topics/long-term-memory/`→`../topics/long-term-memory.md`；`../papers/react/`→`../papers/react.md`；`../papers/swe-agent/`→`../papers/swe-agent.md`（含重复出现处一并替换） |
| `papers/react.md` | `../topics/agent-basics/`→`../topics/agent-basics.md` |
| `papers/swe-agent.md` | `../topics/implementation-boundaries/`→`../topics/implementation-boundaries.md` |

- [ ] **Step 3: 清理 frontmatter（仅留 title/description）**

```bash
awk '/^---$/{c++} c==1 && /^(pubDate|tags|sidebar|template):/{print FILENAME": "$0}' docs/ai-agent/index.md docs/topics/*.md docs/papers/*.md
```
删除命中键后，重跑该命令 Expected：无输出。

- [ ] **Step 4: 生成 `docs/papers/react-paper.md`（PDF 内嵌）**

```markdown
---
title: ReAct（原文）
description: ReAct 原始论文的原文 PDF。
---

Yao et al., 2022 · arXiv [2210.03629](https://arxiv.org/abs/2210.03629)。配套阅读笔记见 [ReAct](react.md)。

<figure class="pdf-viewer"><figcaption class="pdf-bar"><a class="pdf-title" href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener">ReAct: Synergizing Reasoning and Acting in Language Models</a><a class="pdf-open" href="../../paper/2210.03629.pdf" target="_blank" rel="noopener">在新标签打开 ↗</a></figcaption><iframe class="pdf-frame" src="../../paper/2210.03629.pdf" title="ReAct: Synergizing Reasoning and Acting in Language Models" loading="lazy"></iframe><p class="pdf-fallback">无法内嵌 PDF？<a href="../../paper/2210.03629.pdf" download>下载</a>。</p></figure>
```

- [ ] **Step 5: 生成 `docs/papers/swe-agent-paper.md`（PDF 内嵌）**

```markdown
---
title: SWE-agent（原文）
description: SWE-agent 原始论文的原文 PDF。
---

Yang et al., 2024 · arXiv [2405.15793](https://arxiv.org/abs/2405.15793)。配套阅读笔记见 [SWE-agent](swe-agent.md)。

<figure class="pdf-viewer"><figcaption class="pdf-bar"><a class="pdf-title" href="https://arxiv.org/abs/2405.15793" target="_blank" rel="noopener">SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering</a><a class="pdf-open" href="../../paper/2405.15793.pdf" target="_blank" rel="noopener">在新标签打开 ↗</a></figcaption><iframe class="pdf-frame" src="../../paper/2405.15793.pdf" title="SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering" loading="lazy"></iframe><p class="pdf-fallback">无法内嵌 PDF？<a href="../../paper/2405.15793.pdf" download>下载</a>。</p></figure>
```

- [ ] **Step 6: nav 加 AI Agent 区（Deep Learning 区之后）**

```yaml
  - AI Agent:
      - ai-agent/index.md
      - topics/agent-basics.md
      - topics/implementation-boundaries.md
      - topics/long-term-memory.md
      - papers/react.md
      - papers/react-paper.md
      - papers/swe-agent.md
      - papers/swe-agent-paper.md
```

- [ ] **Step 7: 构建验证 + 提交**

```bash
uv run mkdocs build
git add -A
git commit -m "feat: 迁移 AI Agent 区（index + topics + papers + 2 论文 PDF 页）"
```

---

### Task 6: 迁移首页 + About + favicon，替换占位

**Files:**
- Modify: `docs/index.md`（替换占位）
- Create: `docs/about.md`, `docs/assets/favicon.svg`, `docs/assets/favicon.ico`
- Modify: `mkdocs.yml`（nav 加 About；theme 加 favicon）

**Interfaces:**
- Consumes: Deep Learning / AI Agent 区已存在（首页与 About 的链接目标）。

- [ ] **Step 1: 替换 `docs/index.md` 为正式首页（内链改 `.md`）**

```markdown
---
title: Wenyao Notes
description: 深度学习、AI agent 与更多学习笔记。
---

我的学习笔记：从深度学习到 AI agent，之后还会陆续加线性代数、面经等内容。

左侧边栏按主题排列，或从这里开始：

- [Deep Learning 导读](deep-learning/index.md)：从最小神经网络一路到 Transformer 与注意力机制。
- [AI Agent 导读](ai-agent/index.md)：语言模型反复行动时，系统需要哪些额外结构。
```

- [ ] **Step 2: 生成 `docs/about.md`（Markdoc `aside`→Material 提示；去掉描述旧工具链的失真旁注）**

```markdown
---
title: About
description: 关于我。
---

（占位）之后在这里写自我介绍。

- GitHub：[@ImWenyaoT](https://github.com/ImWenyaoT)
```

> 说明：旧 `about.mdoc` 的 `{% aside %}` 是在演示「Markdoc 与 md/mdx 共存」，迁到 mkdocs 后该说明已失真，按 Global Constraints 的替换原则删去（页面本就是占位）。

- [ ] **Step 3: 搬 favicon 并在 theme 挂上**

```bash
mkdir -p docs/assets
cp public/favicon.svg docs/assets/favicon.svg
cp public/favicon.ico docs/assets/favicon.ico
```

在 `mkdocs.yml` 的 `theme:` 下（`name: material` 附近）加：

```yaml
  favicon: assets/favicon.svg
  icon:
    repo: fontawesome/brands/github
```

- [ ] **Step 4: nav 末尾加 About + 加 `extra.social`**

`nav:` 末尾：

```yaml
  - About: about.md
```

顶层追加：

```yaml
extra:
  social:
    - icon: fontawesome/brands/github
      link: https://github.com/ImWenyaoT
```

- [ ] **Step 5: 构建验证 + 提交**

```bash
uv run mkdocs build
git add -A
git commit -m "feat: 正式首页 + About + favicon + 社交链接"
```

---

### Task 7: 开启严格校验（validation + exclude_docs），全站 `--strict` 绿

**Files:**
- Modify: `mkdocs.yml`（加 `exclude_docs:` 与 `validation:`）

**Interfaces:**
- Consumes: Task 1-6 的全部内容与 nav。
- Produces: `mkdocs build --strict` exit 0 的可发布站点。

- [ ] **Step 1: 加 `exclude_docs`（排除设计文档，避免 omitted_files 失败）与 `validation`**

在 `mkdocs.yml` 顶层追加：

```yaml
exclude_docs: |
  superpowers/

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

- [ ] **Step 2: 跑严格构建，清零所有告警**

```bash
uv run mkdocs build --strict
```
Expected: exit 0，无 WARNING。若报 `not_found`/`anchors`，按报错定位到具体文件的链接逐一修正（对照 Task 4/5 的链接表；锚点链接 `#xxx` 需指向真实标题）。

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "build: 开启 validation + exclude_docs，mkdocs build --strict 通过"
```

---

### Task 8: CI —— GitHub Actions（uv + ruff/ty lint → strict build → Pages deploy）

**Files:**
- Create: `.github/workflows/deploy.yml`
- Delete: 旧 `.github/workflows/deploy.yml` 内容被覆盖（同名文件，直接改写）

**Interfaces:**
- Produces: push 到 main 时的 lint→build→deploy 流水线。

- [ ] **Step 1: 改写 `.github/workflows/deploy.yml`**

```yaml
name: Deploy site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up uv
        uses: astral-sh/setup-uv@v5
        with:
          enable-cache: true
      - name: Install deps
        run: uv sync --frozen
      - name: Ruff format check
        run: uv run ruff format --check
      - name: Ruff lint
        run: uv run ruff check
      - name: Type check
        run: uv run ty check
      - name: Unit tests
        run: uv run pytest -q

  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up uv
        uses: astral-sh/setup-uv@v5
        with:
          enable-cache: true
      - name: Install deps
        run: uv sync --frozen
      - name: Build (strict)
        run: uv run mkdocs build --strict
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 本地复跑 CI 等价命令确认可过**

```bash
uv sync --frozen && uv run ruff format --check && uv run ruff check && uv run ty check && uv run pytest -q && uv run mkdocs build --strict
```
Expected: 全部通过（`--frozen` 要求 `uv.lock` 与 `pyproject.toml` 一致；不一致则先 `uv lock` 再提交）。

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "ci: uv + ruff/ty/pytest lint 与 mkdocs --strict 构建部署到 Pages"
```

---

### Task 9: 治理文件改写 + 删除 Astro 残留

**Files:**
- Modify: `README.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`
- Delete: `astro.config.mjs`, `markdoc.config.mjs`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `src/`, `public/`, `.astro/`, `dist/`, `node_modules/`
- Keep: `LICENSE`, `docs/superpowers/**`

**Interfaces:**
- Produces: 干净的、只含 mkdocs 栈的工作树。

- [ ] **Step 1: 改写 `README.md`**

```markdown
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

推送到 `main` 后，GitHub Actions 先跑 lint，再 `mkdocs build --strict`，部署到 GitHub
Pages（`https://imwenyaot.github.io/website/`）。

## 结构

- `docs/`：内容（Markdown 笔记）；`index.md` 是首页
- `docs/paper/`：论文原文 PDF（被论文页内嵌）
- `docs/stylesheets/extra.css`：DL 手绘 SVG 图示 + 阅读时间 + PDF 内嵌样式
- `hooks/reading_time.py`：mkdocs 原生 hook，合成标题 + 每页阅读时间
- `mkdocs.yml`：站点导航、主题与扩展
```

- [ ] **Step 2: 改写 `AGENTS.md`（并同步同内容到 `CLAUDE.md`）**

```markdown
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
```

```bash
cp AGENTS.md CLAUDE.md
```

- [ ] **Step 3: 覆盖 `.gitignore`（Python/mkdocs）**

```gitignore
site/
.venv/
__pycache__/
*.pyc
.cache/
.ruff_cache/
```

- [ ] **Step 4: 删除全部 Astro 残留**

```bash
rm -rf astro.config.mjs markdoc.config.mjs package.json pnpm-lock.yaml pnpm-workspace.yaml \
       tsconfig.json src public .astro dist node_modules
```

- [ ] **Step 5: 确认无残留引用 + 严格构建仍绿**

```bash
grep -rIl -e astro -e pnpm -e Starlight --exclude-dir=docs --exclude-dir=.git . || echo "no astro/pnpm refs ✓"
uv run ruff check && uv run ty check && uv run pytest -q
uv run mkdocs build --strict
```
Expected: 无 astro/pnpm 引用（docs/superpowers 设计文档除外）；构建 exit 0。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "chore: 改写治理文件为 uv/mkdocs，删除全部 Astro 残留"
```

---

### Task 10: 本地全量验证（serve 肉眼核对）

**Files:** 无改动（仅观测；如发现问题就地修复并提交）

- [ ] **Step 1: 启动本地服务**

```bash
uv run mkdocs serve
```

- [ ] **Step 2: 逐项核对（浏览器 http://127.0.0.1:8000/website/）**

- [ ] 每页都有**可见大标题**（来自 frontmatter，经 hook 合成 H1）
- [ ] 左侧导航 = 原侧边栏顺序：Home → Deep Learning → AI Agent → About
- [ ] 顶部内置**搜索**可用
- [ ] 右上**亮/暗切换**正常，切换后可读
- [ ] 每篇 `mermaid` 图正常渲染（客户端）
- [ ] 3 个论文页 PDF **内嵌可见**、"在新标签打开"与"下载"链接有效
- [ ] Deep Learning 笔记的**手绘 SVG 图示**在亮/暗下都正确（配色、边框）
- [ ] 每篇笔记标题下有**阅读时间**；首页无阅读时间
- [ ] 站内互链点击可达（无 404）

- [ ] **Step 3: 如有修复则提交**

```bash
git add -A && git commit -m "fix: 本地验证发现的问题修正"   # 无问题则跳过
```

---

### Task 11: 清史 —— 压平为单个干净初始提交

> ⚠️ 不可逆。执行前务必确认 Task 7/10 的 `mkdocs build --strict` 与 serve 均通过。

**Files:** `.git/`（重建）

- [ ] **Step 1: 确认工作树干净且构建通过**

```bash
cd /home/ail510/tian_wenyao/projects/website
uv run mkdocs build --strict && echo "BUILD OK"
```

- [ ] **Step 2: 抹除旧历史并重建**

```bash
rm -rf .git
git init -b main
unset GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL
git config user.name "ImWenyaoT"
git config user.email "tianwenyao02@gmail.com"
```

- [ ] **Step 3: 单个初始提交（显式 env 双保险，author 与 committer 都钉死）**

```bash
git add -A
GIT_AUTHOR_NAME="ImWenyaoT" GIT_AUTHOR_EMAIL="tianwenyao02@gmail.com" \
GIT_COMMITTER_NAME="ImWenyaoT" GIT_COMMITTER_EMAIL="tianwenyao02@gmail.com" \
git commit -m "初始化 website：mkdocs-material 知识库（迁移自 Astro Starlight）"
```

- [ ] **Step 4: 身份双查（author + committer + fsck）**

```bash
git log --format='%an <%ae> | %cn <%ce>'
git log --format='%an%ae%cn%ce' | grep -i hythmealot && echo "❌ 发现禁用邮箱" || echo "✓ 无 hythmealot"
git fsck --no-reflogs
```
Expected: 唯一一行两侧均为 `ImWenyaoT <tianwenyao02@gmail.com>`；`✓ 无 hythmealot`；fsck 无异常。

---

### Task 12: 远端改名 + 强推 + 部署核对

> ⚠️ 外部动作（改 GitHub 仓名、force-push）。

**Files:** 无本地文件改动

**Interfaces:**
- Consumes: Task 11 的单提交、干净历史。

- [ ] **Step 1: GitHub 远端仓库改名 blog → website**

```bash
gh repo rename website -R ImWenyaoT/blog
```
Expected: 成功；GitHub 自动为旧名 `ImWenyaoT/blog` 建重定向。

- [ ] **Step 2: 设置本地 remote 并强推**

```bash
git remote add origin https://github.com/ImWenyaoT/website.git 2>/dev/null || \
  git remote set-url origin https://github.com/ImWenyaoT/website.git
git push -f origin main
```

- [ ] **Step 3: 确认 Pages source = GitHub Actions**

```bash
gh api repos/ImWenyaoT/website/pages --jq '.build_type, .html_url' 2>/dev/null || \
  echo "若无 Pages 配置，去仓库 Settings→Pages 选 Source: GitHub Actions"
```
Expected: `build_type` 为 `workflow`；`html_url` 含 `imwenyaot.github.io/website`。

- [ ] **Step 4: 核对 CI 与线上**

```bash
gh run list -R ImWenyaoT/website -L 1
```
- [ ] Actions 运行成功（lint→build→deploy 全绿）
- [ ] `https://imwenyaot.github.io/website/` 可访问，页面/PDF/图示正常
- [ ] 旧 `https://imwenyaot.github.io/blog/` 或旧仓库链接重定向
- [ ] GitHub 上提交作者显示 `ImWenyaoT`，无影子账号

---

## Self-Review

**1. Spec coverage（逐节对照）:**
- §A 改名/清史 → Task 1（改名+身份）、Task 11（清史单提交+双查+fsck）、Task 12（远端改名+强推）✓
- §B 工程结构（uv） → Task 1（uv init/add、pyproject、.python-version）✓
- §C mkdocs.yml（theme/palette/extensions/mermaid/edit_uri/exclude_docs/validation/nav/social/hooks） → Task 1/2/3/4/5/6/7 分步落齐 ✓
- §D 内容迁移映射（逐文件 + 链接规范化 + Markdoc/mdx 转换 + PDF/favicon 搬运 + frontmatter 清理） → Task 4/5/6 ✓
- §E 三项保真：① 阅读时间+标题 hook → Task 2；② PDF 内嵌 → Task 4/5；③ DL SVG extra_css → Task 3 ✓
- §F CI（lint job + strict build + deploy，去 chromium） → Task 8 ✓
- §G 治理文件（README/AGENTS/CLAUDE/.gitignore）+ 删 Astro → Task 9 ✓
- 验证清单（ruff/ty/pytest、build --strict、serve 肉眼、身份双查、线上） → Task 8/10/11/12 ✓

**2. Placeholder scan:** 无 TBD/TODO；内容页搬运用精确 cp + 链接映射表 + 完整 HTML/CSS/YAML/py 代码块；PDF 页与 hook/CSS/CI 均为完整源码。占位仅指 Task 1 的临时首页，Task 6 明确替换。✓

**3. Type consistency:** `estimate_reading_minutes(str)->int`、`render(str, str, bool)->str`、`on_page_markdown(markdown, page, config, files)` 在 Task 2 定义并被测试与 mkdocs.yml `hooks:` 一致引用；CSS 类名（`.dl-*`/`.reading-time`/`.pdf-*`）在 Task 3 定义、Task 4/5 与 hook 使用一致；PDF 相对路径统一 `../../paper/`（3 页均深度 2）。✓

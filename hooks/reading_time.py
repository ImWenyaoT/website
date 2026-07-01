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

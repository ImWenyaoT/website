"""mkdocs 原生 hook：在每页正文首个 H1 之后注入阅读时间（首页豁免）。

Material 对普通文档页没有原生阅读时间（只有 blog 插件的博文有），故用这个轻量 hook 补上。
内容页现均已有正文 H1，此 hook 只负责「算时间 + 注入」，不再合成标题。
口径与旧 PageTitle.astro 一致：剔除代码块后，中文 400 字/分钟、英文 200 词/分钟。
"""

from __future__ import annotations

import math
import re

# CJK 统计范围：中日韩统一表意(4E00-9FFF) + 扩展A(3400-4DBF)
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


def render(markdown: str, is_home: bool) -> str:
    """首页豁免；其余在正文首个 H1 之后注入一行阅读时间。纯函数，便于测试。"""
    if is_home:
        return markdown
    reading_line = f'<p class="reading-time">约 {estimate_reading_minutes(markdown)} 分钟阅读</p>'
    md = markdown.lstrip()
    if md.startswith("# "):
        head, _, rest = md.partition("\n")
        return f"{head}\n\n{reading_line}\n\n{rest.lstrip()}"
    return f"{reading_line}\n\n{md}"  # 兜底：万一无 H1 则置顶


def on_page_markdown(markdown, page, config, files):
    """mkdocs 钩子入口：内容页注入阅读时间，首页（index.md）豁免。"""
    return render(markdown, is_home=page.file.src_uri == "index.md")

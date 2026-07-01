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

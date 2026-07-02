"""reading_time hook 纯函数单测：阅读时间估算 + 注入（首页豁免）。"""

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


def test_render_inserts_reading_time_after_h1():
    """阅读时间注入到正文首个 H1 之后。"""
    out = render("# 标题\n\n正文内容。", is_home=False)
    assert out.startswith("# 标题\n")
    assert 'class="reading-time"' in out
    assert out.index('class="reading-time"') > out.index("# 标题")
    assert out.rstrip().endswith("正文内容。")


def test_render_home_exempt():
    """首页原样返回，不加阅读时间。"""
    out = render("# 标题\n\n正文。", is_home=True)
    assert "reading-time" not in out
    assert out.startswith("# 标题")

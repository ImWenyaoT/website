import re, functools, unicodedata

RE_HTML_TAGS = re.compile(r'</?[^>]*>', re.UNICODE)
RE_INVALID_SLUG_CHAR = re.compile(r'[^\w\- ]', re.UNICODE)
RE_WHITESPACE = re.compile(r'\s', re.UNICODE)

# 短 slug 的截断上限：拉丁文按词数，中文（无空格可切）按字符数兜底
SHORT_SLUG_MAX_WORDS = 5
SHORT_SLUG_MAX_CHARS = 24


def _make_slug(text, sep, **kwargs):
    """构造保留 Unicode 词（含中文）的规范化 slug。"""
    slug = unicodedata.normalize('NFC', text)
    slug = RE_HTML_TAGS.sub('', slug)
    slug = RE_INVALID_SLUG_CHAR.sub('', slug)
    slug = slug.strip().lower()
    slug = RE_WHITESPACE.sub(sep, slug)
    return slug


def _make_slug_short(text, sep, **kwargs):
    """构造短 slug：拉丁文取前若干个词；中文标题无空格时按字符数截断。"""
    slug = _make_slug(text, sep, **kwargs)
    words = [word for word in slug.split(sep) if word]
    if len(words) > 1:
        # 含分隔符（通常是拉丁文标题），取前 N 个词
        slug = sep.join(words[:SHORT_SLUG_MAX_WORDS])
    if len(slug) > SHORT_SLUG_MAX_CHARS:
        # 中英文统一按字符数兜底，避免中文标题产生超长 slug
        slug = slug[:SHORT_SLUG_MAX_CHARS].rstrip(sep)
    return slug


def slugify(**kwargs):
    """返回 MkDocs blog 插件所需的 slug 函数。"""
    if kwargs.get('short'):
        return functools.partial(_make_slug_short, **kwargs)
    return functools.partial(_make_slug, **kwargs)

"""MkDocs 构建钩子：为博客文章页末尾追加“分享到 X”按钮。

仅对正式文章页生效（URL 形如 blog/<年份>/...），列表页 / 归档页 / 分类页等不注入。
原 Material 示例里的 Facebook 分享已移除（站点读者基本不用 Facebook，
如需可按相同方式补回）。
"""
import re
import urllib.parse
from textwrap import dedent

X_INTENT_URL = "https://twitter.com/intent/tweet"

# 文章页 URL 以 "blog/<年份>/" 开头，例如 blog/2026/06/27/<slug>/。
# 以此排除 blog/(列表)、blog/page/2/、blog/archive/...、blog/category/... 等非文章页。
POST_URL_PATTERN = re.compile(r"blog/[1-9]\d*/")


def on_page_markdown(markdown, **kwargs):
    """在文章正文末尾追加“分享到 X”按钮；非文章页原样返回 markdown。"""
    page = kwargs['page']
    config = kwargs['config']
    if not POST_URL_PATTERN.match(page.url):
        return markdown

    share_url = config.site_url + page.url
    share_text = urllib.parse.quote(page.title + '\n')

    return markdown + dedent(f"""
    [Share on :simple-x:]({X_INTENT_URL}?text={share_text}&url={share_url}){{ .md-button }}
    """)

"""MkDocs 迁移后的内容、配置和静态资产契约测试。"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from typing import cast

import yaml
from mkdocs.config import load_config

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PUBLISHED_PAGES = {
    "index.md",
    "about.md",
    "tags.md",
    "model/index.md",
    "model/linear-algebra/index.md",
    "model/neural-networks/index.md",
    "model/neural-networks/neural-network-structure.md",
    "model/neural-networks/gradient-descent.md",
    "model/neural-networks/backpropagation.md",
    "model/neural-networks/gpt-transformer.md",
    "model/neural-networks/attention.md",
    "model/neural-networks/attention-paper.md",
    "papers/react-paper.md",
    "papers/swe-agent-paper.md",
    "harness/minimal-swe-agent.md",
    "harness/openai.md",
    "harness/anthropic.md",
}
LEARN_PREFIXES = ("model/", "papers/", "harness/")
ALLOWED_TAGS = {
    "The Model",
    "Sessions, Context Windows & Turns",
    "Tools & Environment",
    "Failure Modes",
    "Handoffs",
    "Memory and Steering",
    "Patterns of Work",
}


def load_page(path: str) -> tuple[dict[str, object], str]:
    """读取页面并把 YAML frontmatter 与正文分开。"""
    source = (DOCS / path).read_text(encoding="utf-8")
    match = re.match(r"\A---\n(.*?)\n---\n(.*)\Z", source, re.DOTALL)
    assert match, f"{path} 缺少 frontmatter"
    return yaml.safe_load(match.group(1)), match.group(2)


def test_published_page_set_is_complete() -> None:
    """公开内容必须完整保留 16 个旧页面并新增唯一的 Tags 索引。"""
    actual = {
        path.relative_to(DOCS).as_posix()
        for path in DOCS.rglob("*.md")
        if path.relative_to(DOCS).as_posix().startswith(LEARN_PREFIXES)
        or path.name in {"index.md", "about.md", "tags.md"}
    }
    assert actual == PUBLISHED_PAGES


def test_every_page_has_title_and_heading() -> None:
    """每个公开页面必须有可见 H1，非首页页面还必须有元数据标题。"""
    for path in PUBLISHED_PAGES:
        metadata, body = load_page(path)
        if path != "index.md":
            assert metadata["title"]
        assert re.search(r"^# .+", body, re.MULTILINE), path


def test_learn_tags_use_closed_vocabulary() -> None:
    """每个 Learn 页面必须至少有一个且只能使用受控标签。"""
    for path in PUBLISHED_PAGES:
        if not path.startswith(LEARN_PREFIXES):
            continue
        metadata, _ = load_page(path)
        tags = set(cast(list[str], metadata.get("tags", [])))
        assert tags, path
        assert tags <= ALLOWED_TAGS, path


def test_component_syntax_was_fully_removed() -> None:
    """迁移结果不得残留 Astro import、组件标签或 MDX 扩展名。"""
    sources = "\n".join((DOCS / path).read_text(encoding="utf-8") for path in PUBLISHED_PAGES)
    assert "@/components/" not in sources
    assert "<PdfViewer" not in sources
    assert not re.search(r"<[A-Z][A-Za-z]+\s*/>", sources)
    assert not list(DOCS.rglob("*.mdx"))


def test_visual_and_pdf_parity() -> None:
    """教学图、Mermaid 与论文 PDF 数量必须保持迁移前的读者能力。"""
    sources = "\n".join((DOCS / path).read_text(encoding="utf-8") for path in PUBLISHED_PAGES)
    assert sources.count('class="dl-figure') == 11
    assert sources.count("```mermaid") == 51
    assert sources.count('class="pdf-viewer"') == 3
    assert {path.name for path in (DOCS / "paper").glob("*.pdf")} == {
        "attention.pdf",
        "react.pdf",
        "swe-agent.pdf",
    }


def test_mkdocs_config_keeps_strict_contracts() -> None:
    """MkDocs 配置必须保留中文站点、严格链接和单一 Pages 产物。"""
    config = load_config(config_file=str(ROOT / "mkdocs.yml"))
    assert config["site_url"].endswith("/website/")
    assert config["theme"]["language"] == "zh"
    assert config["theme"]["favicon"] == "favicon.svg"
    assert config["nav"][0] == {"Home": "index.md"}
    assert config["nav"][-1] == {"About": "about.md"}
    for internal_path in (
        "adr/0001.md",
        "agents/domain.md",
        "superpowers/spec.md",
        "topics/note.md",
    ):
        assert config["exclude_docs"].match_file(internal_path)


def test_home_uses_material_native_surface_without_custom_motion(tmp_path: Path) -> None:
    """生成首页应使用 Material 原生结构，且本站 CSS 不再注入自定义动效。"""
    subprocess.run(
        [
            sys.executable,
            "-m",
            "mkdocs",
            "build",
            "--strict",
            "--site-dir",
            str(tmp_path),
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    home = (tmp_path / "index.html").read_text(encoding="utf-8")
    stylesheet = (tmp_path / "stylesheets/extra.css").read_text(encoding="utf-8")

    assert "home-card" not in home
    assert "home-action" not in home
    assert "transition:" not in stylesheet
    assert "animation:" not in stylesheet
    assert "@keyframes" not in stylesheet
    assert "--ds-" not in stylesheet


def test_mobile_pdf_falls_back_to_direct_access(tmp_path: Path) -> None:
    """窄屏生成站点应隐藏不可用的 PDF iframe，并保留直接访问入口。"""
    subprocess.run(
        [
            sys.executable,
            "-m",
            "mkdocs",
            "build",
            "--strict",
            "--site-dir",
            str(tmp_path),
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    page = (tmp_path / "papers" / "react-paper" / "index.html").read_text(encoding="utf-8")
    stylesheet = (tmp_path / "stylesheets" / "extra.css").read_text(encoding="utf-8")

    assert 'class="pdf-open"' in page
    assert 'class="pdf-fallback"' in page
    assert re.search(
        r"@media screen and \(max-width: 44\.9844em\).*?\.pdf-frame\s*\{\s*display:\s*none;",
        stylesheet,
        re.DOTALL,
    )

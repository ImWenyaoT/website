# Adopt MkDocs Material as the publishing platform

Use MkDocs Material with uv as the website's publishing platform. The site is a static,
Markdown-centered Chinese knowledge base; native documentation navigation, search, Tags and strict
link validation provide the required reader capabilities with less framework-specific code than
Astro and Starlight.

Treat the change as a Parity migration. Preserve the 16 existing public pages and URLs, Curated
catalog, content semantics, accessible teaching figures, Mermaid sources and PDF access. Add one
Tags index backed by the seven Dictionary sections. Keep repository-internal documents excluded
from publication.

Use Material's native homepage structures, controls, palette behavior and interaction feedback.
Keep custom CSS content-only: teaching SVGs, PDF frames and Mermaid sizing. Do not maintain custom
site motion or JavaScript. Resolve UI needs in this order: MkDocs defaults, Material's documented
features, then the smallest content-level extension. Keep Material's responsive navigation, tables
and code blocks; on narrow screens, replace embedded PDF viewing with direct open/download access.

The executable quality gates are `uv run ruff check .`, `uv run ruff format --check .`,
`uv run ty check`, `uv run pytest` and `uv run mkdocs build --strict`. Python dependencies are
managed exclusively through uv and locked in `uv.lock`; GitHub Pages deploys only the generated
`site/` directory. Do not retain a parallel Node or Astro build.

CI pins a concrete stable uv release and installs with `uv sync --locked`. Ruff follows its stable
release line. ty is still beta and has no stable API, so the repository treats the exact `uv.lock`
resolution as its compatibility boundary rather than claiming an LTS guarantee.

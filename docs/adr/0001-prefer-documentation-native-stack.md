# Prefer a documentation-native stack

> Superseded by [0003: Retain Astro and Starlight](./0003-retain-astro-starlight.md) on 2026-07-11.

Use MkDocs Material instead of Astro and Starlight for the published knowledge site. The site is a static, Markdown-centered Chinese knowledge base, so Astro's components, TypeScript surface, Node dependencies, and custom site chrome impose more maintenance than their product value justifies; the migration remains a Parity migration so post-Astro content and reader-facing improvements are preserved. Prefer relevant native Material capabilities over custom code, except where a native feature adds disproportionate build, runtime, privacy, or maintenance cost.

This choice knowingly adopts Material during its maintenance period: the project no longer receives new features and has announced critical fixes and security updates through November 2026 while its maintainers focus on Zensical. Use the latest stable Material release, upgrade dependencies proactively, commit the resulting `uv.lock`, and keep CI frozen to that reviewed lock state; a future Zensical evaluation is separate from this migration.

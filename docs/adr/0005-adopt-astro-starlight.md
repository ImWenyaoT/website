# Adopt Astro and Starlight as the publishing platform

> Supersedes [0004: Adopt MkDocs Material](./0004-adopt-mkdocs-material.md) on 2026-09-26.

Use Astro, Starlight, TypeScript, and pnpm as the publishing platform. The site stays a static, Markdown-centered Chinese knowledge base. Starlight's default chrome supplies navigation, search, theme switching, and edit links. Custom code is limited to teaching figures, PDF viewing, and Mermaid sizing.

Treat the change as a Parity migration. Preserve the 16 public pages and URLs (`base: /website`, trailing slash), the Curated catalog, content semantics, accessible teaching figures, Mermaid sources, and PDF access. Do not publish repository-internal documents.

Keep Starlight's default visual system. Do not add Geist, a custom theme, or site-wide motion. Map teaching-figure colors onto Starlight `--sl-*` tokens. On narrow screens, hide the embedded PDF frame and keep direct open and download links.

The quality gates are `pnpm check`, `pnpm test`, and `pnpm build`. Dependencies are locked in `pnpm-lock.yaml`. GitHub Pages deploys `dist/` only.

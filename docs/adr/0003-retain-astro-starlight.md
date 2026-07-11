# Retain Astro; treat Starlight as replaceable infrastructure

Keep Astro as the website's long-term platform. Do not execute the proposed parity migration back to MkDocs Material. Starlight remains the current documentation layer, but it is not an architectural invariant: retain the parts that earn their maintenance cost and replace individual surfaces when they materially limit the website.

The website should earn the additional platform surface by using it deliberately: keep Markdown-first content and static output, while using Astro components only where they materially improve navigation, teaching figures, document presentation, or reader interaction. Avoid adding React or another client framework for visual polish that CSS and Astro can provide. Do not preserve Starlight behavior merely for framework identity.

Continue refining the existing Geist and HIG-informed design system. Borrow principles from strong documentation products such as OpenAI Learn—clear information hierarchy, calm reading rhythm, purposeful navigation, and selective interactive examples—without cloning their brand, DOM, or technology stack.

The quality gate remains `pnpm test`, `pnpm check`, and `pnpm build`. Public URLs, the curated catalog, content semantics, accessible teaching figures, and PDF access remain stable while the Site chrome evolves.

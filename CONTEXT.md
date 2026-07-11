# Website

This context describes the published knowledge site and the small set of project-specific terms used when changing its structure.

## Language

**Site chrome**:
The site-level reading shell around published notes: identity, navigation, validation, and design presentation. Deployment mechanics are not part of Site chrome.
_Avoid_: App shell, layout wrapper, site config

**Curated catalog**:
The authoritative editorial grouping and reading order of published notes, independent of their filesystem directories.
_Avoid_: Sidebar config, navigation list, content tree

**Learn**:
The top-level catalog area containing all published Model and Harness notes. It is an editorial umbrella for learning material, not a course, blog, or portfolio.
_Avoid_: Blog, Work, Course

**Dictionary term**:
A canonical English AI-coding term whose meaning matches an entry in Matt Pocock's AI Coding Dictionary. Every semantically matching occurrence in body prose, lists, tables, and captions remains untranslated and links to that external entry, including repeated occurrences in the same paragraph or section. Headings are outside this occurrence rule and remain unlinked. Mixed Chinese-English prose such as “这个 model 的 context window” is intentional because visible canonical terms and Wikipedia-like outbound definition links take priority over reducing link density; the site does not mirror the entry's definition.
_Avoid_: Translated term, glossary copy, automatic keyword replacement

**Dictionary section**:
One of the seven sections maintained by the AI Coding Dictionary, reused with attribution as the closed vocabulary for tagging Learn pages. A page may belong to more than one Dictionary section.
_Avoid_: Ad hoc tag, topic synonym, category translation

**Parity migration**:
A platform change that preserves the current published content, URLs, Curated catalog, visual language, and reader-facing capabilities. It ports improvements made after the previous platform change rather than reverting repository history.
_Avoid_: Rollback, rewrite, restore

**Visual continuity**:
Preservation of the site's restrained HIG-informed design principles, emphasis, teaching semantics, and information density while refining the current Astro/Starlight Site chrome.
_Avoid_: Pixel parity, theme cloning, DOM parity

**Deep learning figure**:
A static teaching figure in the deep learning topic that explains model structure, training movement, attention flow, or matrix relationships.
_Avoid_: SVG component, diagram widget, chart

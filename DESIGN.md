# Design System —— Material default

本站以 Material for MkDocs 的页面结构、控件和主题行为为基线。Apple HIG 只作为横切原则：
易读、足够对比、减少动效、清晰焦点，以及不只依赖颜色传达信息。

## 总原则

1. 正文优先，主文字与背景对比不低于 4.5:1。
2. 语义差异同时使用颜色和线型或形状表达。
3. 动效尊重 `prefers-reduced-motion`。
4. 键盘 `:focus-visible` 保持清晰焦点环。
5. 设计决策收敛为 CSS token，避免散落硬编码。

## Tokens

- UI 使用 Material 的 `--md-*` 语义 token。
- `--ds-accent-rgb` 是链接、交互和教学图蓝色的单一真源。
- `--dl-green` 与 `--dl-orange` 仅用于教学语义，并必须叠加线型。
- 正文使用 Material 默认 Roboto；中文自然走系统 CJK 字体回退。

## 自定义边界

- 首页路径卡片、内联教学 SVG 和 PDF 阅读器允许局部样式。
- Mermaid 使用 Material 原生集成，不维护自定义运行时。
- 新颜色优先从现有强调色、透明度层级或教学语义色派生。
- 样式集中在 `docs/stylesheets/extra.css`，主题能力集中在 `mkdocs.yml`。

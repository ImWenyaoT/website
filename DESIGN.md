# Design System —— Material default

本站以 Material for MkDocs 的页面结构、控件和主题行为为基线。Apple HIG 只作为横切原则：
易读、足够对比、减少动效、清晰焦点，以及不只依赖颜色传达信息。

## 总原则

1. 正文优先，主文字与背景对比不低于 4.5:1。
2. 语义差异同时使用颜色和线型或形状表达。
3. 站点不维护自定义动效，交互反馈使用 Material 原生行为。
4. 键盘焦点、主题切换和响应式导航由 Material 管理。
5. 自定义样式只解决正文内容无法由主题表达的问题。

## Tokens

- UI 直接使用 Material 的 `--md-*` 语义 token，不覆盖主题 primitive。
- 教学图蓝色从 Material accent 派生。
- `--dl-green` 与 `--dl-orange` 仅用于教学语义，并必须叠加线型。
- 正文使用 Material 默认 Roboto；中文自然走系统 CJK 字体回退。

## 自定义边界

- 首页使用 Material 原生按钮和 Cards，不维护独立组件样式。
- 内联教学 SVG、PDF 阅读器和 Mermaid 尺寸允许最小内容样式。
- Mermaid 使用 Material 原生集成，不维护自定义运行时。
- 不增加自定义 JavaScript、动效或主题覆盖。
- 样式集中在 `docs/stylesheets/extra.css`，主题能力集中在 `mkdocs.yml`。

# Design System —— Starlight default

本站以 Starlight 的页面结构、控件和主题行为为基线。Apple HIG 只作为横切原则：易读、足够对比、减少动效、清晰焦点，以及不只依赖颜色传达信息。

## 总原则

1. 实现顺序固定为 Starlight 默认能力、Astro 组件、最小内容级 CSS。
2. 正文优先，主文字与背景对比不低于 4.5:1。
3. 语义差异同时使用颜色和线型或形状表达。
4. 站点不维护自定义动效，交互反馈使用 Starlight 原生行为。
5. 键盘焦点、主题切换和响应式导航由 Starlight 管理。
6. 自定义样式只解决正文内容无法由主题表达的问题。

## Tokens

- UI 直接使用 Starlight 的 `--sl-*` 语义 token，不覆盖主题 primitive。
- 教学图蓝色从 `--sl-color-accent` 派生。
- `--dl-green` 与 `--dl-orange` 仅用于教学语义，并必须叠加线型。
- 正文字体使用 Starlight 默认字体；中文走系统 CJK 回退。

## 自定义边界

- 首页是普通文档页，不维护独立卡片或按钮样式。
- 内联教学 SVG、PDF 阅读器和 Mermaid 尺寸允许最小内容样式。
- 样式集中在 `src/styles/content.css`。侧栏集中在 `src/data/catalog.ts`。
- 不增加站点级自定义 JavaScript 或主题覆盖。

## 响应式边界

- 导航、页内目录、搜索、表格和代码块使用 Starlight 官方响应式行为。
- 自定义教学图必须随正文宽度缩放。
- 移动端不内嵌浏览器 PDF 阅读器；保留直接打开和下载入口。

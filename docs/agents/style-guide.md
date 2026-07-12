# 项目风格规范

本项目参考 [Google Style Guides](https://github.com/google/styleguide)，并按 Astro、Starlight 与中文内容的实际约束执行。

## TypeScript 与 JavaScript

- 参考 [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)。
- 使用 `const` 和 `let`，禁止 `var`；使用严格相等比较。
- 公共函数和非直观的内部函数必须有函数级注释。
- ESLint 是静态规则的自动化入口；Astro 官方文档推荐社区维护的 `eslint-plugin-astro`，规则以 `eslint.config.js` 为准。

## Astro、HTML 与 CSS

- 参考 [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)。
- 优先使用语义化 HTML，并保持可访问性属性完整。
- 样式优先复用 Starlight 原生变量，避免无必要的全局覆盖。
- Stylelint 使用标准规则；允许按组件分组书写选择器，不强制跨组件按 specificity 排序。
- Prettier 使用 Astro 官方的 `prettier-plugin-astro`，并按官方模板为 `.astro` 文件指定 `astro` parser。
- Prettier 负责可机械化的排版，不以手工对齐覆盖格式化结果。

## Markdown 与 MDX

- 参考 [Google Markdown Style Guide](https://google.github.io/styleguide/docguide/style.html)。
- 使用 ATX 标题和围栏代码块；能准确判断语言时必须声明，无法判断的旧资料允许暂不声明。
- 标题必须唯一、完整；链接文本必须能说明目标，避免“这里”“链接”等空泛文字。
- 不使用行尾空格；需要强制换行时优先调整段落结构。
- 长篇中文 MDX、表格、链接和嵌入组件不强制按 80 字符换行。
- Markdown 与 MDX 纳入 Prettier 和 Markdownlint 自动改写。
- 适配规则允许中文长行、链接、表格和 MDX 组件；不强制 80 字符换行，也不要求 Starlight 内容页另写 H1。

## 自动化命令

- `pnpm lint`：运行 ESLint、Markdownlint 和 Stylelint。
- `pnpm format`：运行 Prettier，并自动修复 Markdown 与 CSS。
- `pnpm format:check`：验证格式，不写入文件。
- `pnpm check`：运行 Astro 类型与内容检查。
- CI 必须运行测试、Lint、格式检查、Astro 检查和构建。

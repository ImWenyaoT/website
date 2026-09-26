# Style guide

本项目参考 [Google Style Guides](https://github.com/google/styleguide)，并按 Astro、TypeScript、CSS 与中文技术内容的实际约束执行。

## Markdown 与内容

- 每个公开页面必须有 frontmatter `title`。页面标题由 Starlight 渲染，正文不再重复 H1。
- 内链使用站点根相对路由（如 `/model/neural-networks/attention/`），不要写 `.md` 文件路径。
- HTML 只用于 Markdown 难以表达的内联 SVG。论文 PDF 使用 `<PdfViewer slug>`。
- 中文正文不强制 80 字符换行；代码、表格和链接以可读性为准。

## TypeScript

- 函数必须有说明职责的注释。
- 依赖只通过 pnpm 管理，并提交 `pnpm-lock.yaml`。
- CI 使用 `pnpm install --frozen-lockfile`，禁止静默重写锁文件。
- 策展目录只写在 `src/data/catalog.ts`。论文 PDF 只写在 `src/data/papers.ts`。

## CSS

- 实现优先级为 Starlight 默认能力、最小自定义 CSS。
- 优先使用 Starlight 的 `--sl-*` 语义 token。
- 站点样式集中在 `src/styles/content.css`。
- 自定义 CSS 只服务教学 SVG、PDF 和 Mermaid 尺寸，不覆盖主题结构或注入动效。
- 移动端 PDF 只提供直接访问入口。

## 自动化

- `pnpm check`：执行 Astro 类型检查。
- `pnpm test`：运行内容、目录、内链与论文注册表契约测试。
- `pnpm build`：生成生产站点。
- CI 必须在部署前依次运行以上全部门禁。

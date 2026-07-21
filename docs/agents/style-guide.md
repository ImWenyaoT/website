# Style guide

本项目参考 [Google Style Guides](https://github.com/google/styleguide)，并按 MkDocs、Python、CSS
与中文技术内容的实际约束执行。

## Markdown 与内容

- 每个公开页面必须有 frontmatter `title` 和正文 H1。
- 内链使用相对当前源文件的 `.md` 路径，让严格构建校验文件与锚点。
- HTML 只用于 Markdown 难以表达的内联 SVG 和 PDF iframe；首页使用 Material 原生结构。
- Learn 页面必须使用 `mkdocs.yml` 中声明的封闭 Tags 词表。
- 中文正文不强制 80 字符换行；代码、表格和链接以可读性为准。

## Python 与配置

- Python 函数必须有说明职责的 docstring。
- 依赖只通过 uv 管理，并提交 `uv.lock`。
- CI 必须固定具体 uv 版本并使用 `uv sync --locked`，禁止静默重写锁文件。
- Ruff 是 Python lint 和格式的唯一入口；ty 是静态类型检查入口。
- `mkdocs.yml` 负责导航、主题、扩展、插件和严格验证，不在脚本中复制配置。

## CSS

- 实现优先级为 MkDocs 默认能力、Material 官方能力、最小自定义 CSS。
- 优先使用 Material 的 `--md-*` 语义 token。
- 站点样式集中在 `docs/stylesheets/extra.css`。
- 自定义 CSS 只服务教学 SVG、PDF 和 Mermaid 尺寸，不覆盖主题结构或注入动效。
- 响应式导航、表格和代码块不得复制 Material 已有规则；移动端 PDF 只提供直接访问入口。
- 教学图不能只靠颜色区分语义。

## 自动化

- `uv run ruff check .`：执行 Python lint。
- `uv run ruff format --check .`：验证 Python 格式，不写入文件。
- `uv run ty check`：执行 Python 静态类型检查。
- `uv run pytest`：运行内容与配置契约测试，并维持 100% 测试代码覆盖率。
- `uv run mkdocs build --strict`：验证配置、导航、链接、锚点、资源和生产构建。
- CI 必须在部署前依次运行以上全部门禁。

# 迁移设计：Astro Starlight → MkDocs Material

- 日期：2026-07-11
- 状态：已执行（2026-07-17）
- 取代：[`2026-07-06-mkdocs-to-astro-starlight-design.md`](./2026-07-06-mkdocs-to-astro-starlight-design.md)

> 2026-07-11 曾否决本方案；2026-07-17 重新采纳并完成迁移。当前决策见
> [`../../adr/0004-adopt-mkdocs-material.md`](../../adr/0004-adopt-mkdocs-material.md)。

## 1. 设计概念

把当前 Astro 7 + Starlight + TypeScript 网站迁回最新稳定版 MkDocs Material。本站是以 Markdown 为核心的静态中文知识库，Astro 的组件、TypeScript、Node 依赖与自定义 Site chrome 带来的维护成本高于实际产品价值。

这次是 **Parity migration**，不是 Git 回滚：保留 Astro 迁移后新增的内容、公开 URL、Curated catalog、教学图、PDF 人名化与读者能力，只替换平台和实现形式。旧 MkDocs 历史提交只作参考。

## 2. 范围与不变量

迁移期间冻结正文论述、页面集合和公开 URL。允许以下机械转换：

- `src/content/docs/**/*.mdx` → `docs/**/*.md`
- frontmatter `title` → 正文 H1
- Astro imports/components → 原生 Markdown、HTML 或内联 SVG
- 路由式内链 → MkDocs 可校验的 `.md` 相对链接
- 为现有 Learn 页面添加受控 tags 元数据

本次不执行全站 Dictionary term 中英改写；该工作在迁移后独立进行。迁移时只建立写作规范与正文链接样式。

## 3. 技术栈与仓库形状

- 最新稳定版 `mkdocs-material` + `jieba`
- Python/依赖统一由 `uv` 管理，提交 `uv.lock`
- 使用最新稳定依赖，主动升级；CI 固定 uv 版本并始终 `uv sync --locked`
- Ruff 负责 lint/格式，ty 负责类型检查，pytest 锁住页面、元数据、Tags、图示与资源 parity；`mkdocs build --strict` 负责配置、导航、链接和生产构建
- 在 `codex/migrate-back-to-mkdocs` 分支完成平替，`main` 在验收前继续部署 Astro
- 切换后彻底删除 Astro/Node/TypeScript 工具链与 `src/` 组件实现，不并存两套站点

MkDocs Material 已处于维护期，官方宣布关键修复与安全更新持续到 2026 年 11 月。项目知情接受这一约束；未来是否迁往 Zensical 是独立决策。

## 4. 内容与导航

顶层导航为：

1. Home
2. Learn
3. About

Learn 是纯导航分组，没有 `/learn/` 落地页。现有 Model 与 Harness 完整归入 Learn，分组、顺序和页面 URL 不变。Home 与 About 保持现有页面。

## 5. Material 原生能力

优先启用与现有内容相关且无需自定义代码的 Material 原生能力：

- 三态 palette：默认 auto，其后浅色、深色
- navigation tabs、sections、indexes、tracking、path、top、footer
- instant navigation、prefetch、progress、preview
- 跟随式 TOC
- 页面上一页/下一页
- 编辑此页与查看源码
- 代码复制、注解、普通链接 tooltip、脚注 tooltip
- 搜索建议、高亮、分享；中文搜索使用 `jieba`
- Material 原生 Mermaid 集成

不启用当前没有内容模型或成本不成比例的能力：Blog、多版本、离线模式、privacy、social cards。Tags 是明确例外，见第 9 节。

## 6. 视觉连续性

采用 Material 原生页面结构、控件、主题行为与默认字体：正文 `Roboto`，代码 `Roboto Mono`，中文走系统字体回退。

保留本站克制的 HIG 原则：

- 当前蓝色是唯一强调色，亮暗与 auto 三态从同一 token 派生
- 中性层级使用前景色透明度，不新增灰色色相
- 所有正文链接使用蓝色 + 下划线；导航、按钮和标题链接使用 Material 原生样式
- 教学图保留蓝/绿/橙语义色，同时叠加实线、虚线或点线，不能只靠颜色表达

不追求 Starlight DOM、组件边界或逐像素复刻。

## 7. 教学图、Mermaid 与 PDF

11 张 Deep learning figure 从 Astro 组件还原为 Markdown 内联 SVG，保留图形、响应式尺寸、无障碍标题和语义样式。删除组件 registry 与相关 Vitest，因为领域对象是教学图，不是组件抽象。

全部 Mermaid 源码保持不变，使用 Material 原生 `pymdownx.superfences` 集成；删除 Astro Mermaid 与 ELK 依赖，不要求渲染排版逐像素一致。

3 个论文页将 `PdfViewer.astro` 还原为原生 HTML iframe，继续使用 `react.pdf`、`attention.pdf`、`swe-agent.pdf`，保留标题、arXiv 链接、打开入口和 fallback。删除论文 registry。

## 8. 构建、CI 与切换

CI 流程：checkout → setup-uv（精确 tag 与 uv 版本）→ `uv sync --locked` → Ruff → ty → pytest → `uv run mkdocs build --strict` → 上传 `site/` → GitHub Pages 部署。

切换前执行一次完整 Parity migration 验收：

- 16 个公开页面及其 URL 逐一对应
- Home / Learn / About 顶层导航与 Learn 内 Model/Harness 顺序正确
- 所有内部链接、锚点与资源在 strict build 下零警告
- 中文搜索可检索正文
- auto/浅色/深色三态正确，auto 首访不露默认 indigo
- 全部 Mermaid、11 张教学图、3 个 PDF 正常
- 正文链接蓝色并带下划线
- 桌面与移动端逐页抽查

合并后等待 GitHub Actions 通过，再从线上 URL 验证关键页面。Git 历史保留 Astro 完整实现，必要时可通过 revert 恢复。

## 9. Tags 与 AI Coding Dictionary

启用 Material 内置 Tags 插件。把 Matt Pocock 的 AI Coding Dictionary 七个 sections 作为封闭的 Dictionary section 词表：

- The Model
- Sessions, Context Windows & Turns
- Tools & Environment
- Failure Modes
- Handoffs
- Memory and Steering
- Patterns of Work

Learn 下新增 Tags 索引页并注明 taxonomy 来源，链接上游仓库与网站。现有 14 个 Learn 页面迁移时逐页分类，每页至少一个、允许多个；Home 与 About 不加 tags。`tags_allowed` 禁止近义词与拼写漂移。

不复制 dictionary 定义、例句、页面设计或数据集。

## 10. Dictionary term 后续规则

迁移后的独立内容阶段，将 AI Coding Dictionary 作为 AI-coding vocabulary 的外部定义来源：

- 只按语义匹配，不按字符串盲目替换
- 匹配的概念统一使用 canonical English term，不翻译成中文
- 正文段落、列表、表格和图注中的每一次匹配都使用普通 Markdown 外链
- 标题、代码块、行内代码、URL、Mermaid 源码和 SVG 内部文字不改不链
- 链接使用浏览器原生当前页行为，不强制新标签页
- 不在本站镜像上游定义

如果未来人工维护成本明显升高，可以新增只报告漏链的检查器；不得在构建时自动改写正文。

## 11. 治理文档

迁移时同步更新 README、DESIGN、AGENTS/CLAUDE 中的技术栈描述、仓库专用 website-guide，以及 CI/构建说明。保留旧迁移文档作为架构历史，并明确标注已被本设计取代。

# 迁移设计：mkdocs-material → Astro Starlight（+ Geist 重设计）

> 当前平台决策仍为 Astro/Starlight；后续打磨方向见
> [`../../adr/0003-retain-astro-starlight.md`](../../adr/0003-retain-astro-starlight.md)。

- 日期：2026-07-06
- 状态：待批准
- 范围：整体技术栈从 mkdocs-material 迁回 **Astro + Starlight + TypeScript**，同时把视觉**重设计**为 Vercel Geist 主题。内容按结构 1:1 搬运（不改笔记正文的语义），只改**呈现**与**外壳**。
- 关系：本 spec **反转** [`2026-07-01-blog-to-website-mkdocs-migration-design.md`](./2026-07-01-blog-to-website-mkdocs-migration-design.md)（Starlight→mkdocs）的方向；沿用其记录的「反向链接」「.dl-* token 迁移」等经验。与 [`2026-06-30-stock-starlight-refactor-design.md`](./2026-06-30-stock-starlight-refactor-design.md) 的区别：那次是**纯原厂** Starlight；本次是 **Starlight + Geist 主题定制**。

## 1. 背景

仓库履历：MkDocs →（blog 时代）Astro + Starlight → 现状 mkdocs-material。离开 Starlight 的动因是「偏好原厂/口味摆动」，非技术撞墙——回归无技术障碍。

现状画像（决定迁移成本）：**16 篇正式内容页**；**无 LaTeX 数学**（图靠手绘内联 SVG `.dl-*`，6 页神经网络）；**Mermaid 是重依赖**（9 文件，harness 两篇各 17 张，全站约 50 张）；3 个内嵌 PDF；CJK 内容 + 搜索；Vercel Geist 设计 token 已在 `extra.css`（当前寄生 Material `--md-*`）；部署 GitHub Pages（`imwenyaot.github.io/website/`，source=Actions）。

## 2. 目标与不变量

**目标**：一个 Starlight 文档站，外观 = Vercel Geist（light/dark），布局参考 openai-agents-js 的文档式（其本身即 Starlight）。

**不变量（硬约束）——只改呈现，不改这三样**：

1. **内容**：16 页语义不变（可做链接/组件语法的机械改写，不改论述）。
2. **URL**：对外路径逐一保持（含 `base:/website`），不断链、不丢书签/SEO。
3. **功能**：现有功能全保——侧边栏导航、右 TOC、暗/亮、搜索(CJK)、代码复制、Edit-on-GitHub、Mermaid、内嵌 PDF、手绘 SVG。（阅读时间**非**现状功能，不做。）

## 3. 目标技术栈

- **Astro + Starlight**（官方文档框架），**TypeScript**，**pnpm**。
- 高亮：**Expressive Code**（Starlight 内置——复制/行高亮/文件名，承接 `pymdownx` 与 `--8<--`）。
- 搜索：**Pagefind**（Starlight 内置，CJK 分词开箱可用）。
- 图示：Mermaid 走 **Starlight 兼容的客户端渲染插件**（无需构建期 Playwright）。
- 设计：覆盖 Starlight `--sl-*` token → **Vercel Geist**；字体 **Geist Sans/Mono** 自托管。

## 4. 仓库布局与迁移策略

- 分支 **`migrate/astro`**，Astro 立在**仓库根**；`main` 迁移期继续用 mkdocs 部署，**达到平替后一次合并**（合并同时替换 CI）。
- 目标结构：

```
website/
├─ package.json / pnpm-lock.yaml
├─ astro.config.mjs            # Starlight 集成 + site/base + mermaid + expressiveCode
├─ tsconfig.json
├─ src/
│  ├─ content.config.ts        # docsSchema() 扩展（见 §5）
│  ├─ content/docs/            # 站点内容（镜像现 docs/ 树 → 保 URL）
│  ├─ components/
│  │  ├─ PdfViewer.astro       # slug + registry（见 §7）
│  │  └─ Figure.astro          # （延后）手绘 SVG 组件化通道
│  ├─ data/papers.ts           # PdfViewer registry：slug → {arxiv_id, title}
│  └─ styles/geist.css         # Geist token 覆盖 + .dl-* 图示 + 语义色（亮/暗双验）
├─ public/paper/*.pdf          # 3 个论文 PDF（原 docs/paper/）
├─ public/fonts/               # Geist woff2 自托管
├─ docs/                       # 仅保留仓库工作文档（superpowers/ agents/ 等，非站点内容）
├─ .github/workflows/deploy.yml
├─ .gitignore                  # + node_modules/ dist/ .astro/
├─ AGENTS.md / CLAUDE.md / README.md   # 改写为 pnpm/Astro
└─ LICENSE
```

- **切换时删除的 mkdocs 残留**：`mkdocs.yml`、`pyproject.toml`、`uv.lock`、`.python-version`、`.venv/`、`site/`、`.ruff_cache/`、`.pytest_cache/`、`.mypy_cache/`、以及 `docs/` 里已迁走的站点内容（`docs/model|harness|papers|paper|about.md|index.md|stylesheets|about`）。`docs/superpowers/`、`docs/agents/`、`docs/topics/`（工作文档/草稿）保留在仓库 `docs/` 下——迁移后 `docs/` 只承载工作文档，站点内容归 `src/content/docs/`（顺带治好架构评审「工作文档混入站点 docs/」的味道）。

## 5. 内容模型（Starlight Content Collection）

- 内容迁入 `src/content/docs/`，**镜像现有相对路径**以保 URL（配 `[...slug]` 默认路由 + `base:/website`）。映射：

| 现状                                                        | 目标                                           |
| ----------------------------------------------------------- | ---------------------------------------------- |
| `docs/index.md`                                             | `src/content/docs/index.mdx`（首页，见 §16-①） |
| `docs/about.md`                                             | `src/content/docs/about.mdx`                   |
| `docs/model/index.md`、`docs/model/linear-algebra/index.md` | 同路径 `.mdx`                                  |
| `docs/model/neural-networks/*.md`（7）                      | 同路径 `.mdx`                                  |
| `docs/harness/*.md`（3）+ `minimal-swe-agent-main.py`       | 同路径；.py 作代码包含源                       |
| `docs/papers/*.md`（2）                                     | 同路径 `.mdx`                                  |
| `docs/paper/*.pdf`（3）                                     | `public/paper/*.pdf`                           |

- **Schema**（`src/content.config.ts`）：以 Starlight `docsSchema()` 为基。frontmatter：
  - `title`（**Starlight 必填**；从现 `nav:` 标签/H1 给 16 页补齐，如 `"ReAct（原文）"`）
  - `description`（**已有**，直接沿用）
  - `sidebar: { order, label? }`（Starlight 原生键，承接策展顺序/标签）
- **侧边栏**：Starlight `sidebar` 用 **autogenerate**（按目录）+ frontmatter `order`/`label` 微调——nav 变**派生**产物、单一真源（治好架构评审候选 3）。分组标签（Model / Harness）用 autogenerate 的 `label` 或目录 `index` 页。
- **无正文 H1**：Starlight 原生从 frontmatter `title` 渲染页面标题，无需像 mkdocs 那样写 hook 合成 H1——白送。
- **URL 细节（保不变量的关键）**：mkdocs 输出**目录式带尾斜杠** URL（`/model/neural-networks/attention/`）。`astro.config` 配 **`trailingSlash: 'always'`** + `build.format: 'directory'` 对齐；`index.mdx` → `/model/`、根 `index.mdx` → `/website/`。逐一比对现 `nav`/文件树确认。

## 6. 内部链接反转（头号风险）

现状 mkdocs 内链是**文件相对** `.md`（如 `attention.md`、`../topics/agent-basics.md`）；Astro/Starlight 用**路由式**（`/model/neural-networks/attention/` 或站点相对）。**每条内链逐条按目标页重推**，去掉 `.md`、改成路由路径。**不可机械替换**（文件相对与路由相对在"同目录兄弟页"上不等价——这正是 07-01 spec 反方向踩过的坑）。

**兜底安全网**：Astro `build` + Starlight 链接校验（内置 broken-link 检查；必要时加 `starlight-links-validator` 插件），对未解析内链**失败退出**，逐条清零——等价于当年 mkdocs 的 `--strict`。

## 7. 内容渲染（组件 + 高亮）

- **全 `.mdx`**（Q4=B，统一心智、页页可用组件）。已核实 6 页手绘 SVG 本就 MDX 安全（成对闭合、无 `<!--`、无 `style=""` 串、无裸 `{}`）；仅需在平替构建时确认 Astro MDX 原样保留 kebab-case SVG 属性（`text-anchor`/`marker-end`；Astro HTML 优先，预期通过）。
- **组件清单**：
  - `<PdfViewer slug="react"/>` —— 深 seam。`src/data/papers.ts` 存 registry（`slug → {arxiv_id, title}`），组件据 slug 派生 arXiv 链接 + `public/paper/<…>.pdf` 路径，发射 `<figure class="pdf-viewer">…<iframe>…`。**构建期解析路径，消除现状 `../../` vs `../../../` 的深度耦合**（架构评审候选 1 原生兑现）。未知 slug → 构建期报错（fail-loud）。用于 3 个 `*-paper` 页。
  - **`<Aside>`**（Starlight 内置）承接唯一 1 处 admonition（`minimal-swe-agent`）。
  - **代码包含**：`minimal-swe-agent` 的 `--8<-- "…-main.py"` → MDX `import raw from '…?raw'` + Expressive Code，或 Expressive Code 的 file 引入。
  - **dl-SVG**：内联保留（不组件化），走 §12 延后的「逐张升级」通道。
- **高亮**：Expressive Code（Starlight 内置）——复制按钮/行高亮/文件名。

## 8. 图示（Mermaid + 手绘 SVG）

- **Mermaid**：Starlight 兼容的**客户端** mermaid 插件搬走全部 ~50 张，零回归（现状 Material 本就客户端 mermaid.js 渲染）。CI 免装 Playwright/chromium。
- **手绘 SVG 通道**：MDX 让 ```mermaid 与手绘 `<Figure>`/内联 SVG 天然共存；「哪几张升级成手绘 SVG」是**迁移之后逐张**的内容演进，不阻塞迁移。

## 9. 站点外壳（Chrome，Starlight 原生）

Starlight 默认即给（对应 Q5「都做」，近零成本）：可折叠分组**侧边栏** · 右 **TOC** · **暗/亮**自动+切换 · **Pagefind 搜索(CJK)** + Ctrl+K · 移动端导航 · **上一页/下一页** · **Edit-on-GitHub**（`editLink.baseUrl`）· social 链接 · i18n · **View Transitions**（内置）。Material 特有的悬停预览 → Astro `prefetch`；阅读进度条 → 不做（非现状功能）。

## 10. 设计系统（Vercel Geist + Apple HIG）

- **来源与优先级**：Vercel Geist（`vercel.com/design.md` + `design.dark.md`）**为主**，Apple HIG **为辅**，**冲突 Vercel > Apple**。布局参考 openai-agents-js（Starlight 默认结构即接近）。
- **实现**：覆盖 Starlight `--sl-*` token + `src/styles/geist.css`。`.dl-*` 图示样式从现 `extra.css` 移植，把寄生的 `--md-*` 依赖**改映射到 Geist token**（历史上 `--sl-*`↔`--md-*` 已来回过，有前例），亮/暗双色都验证。
- **Geist token（已取，light）**：bg `#fff`/surface `#fafafa`；文字 `#171717`/次级 `#4d4d4d`/禁用 `#8f8f8f`；边框 `#eaeaea`→hover `#c9c9c9`；强调 blue-700 `#006bff`（hover `#0059ec`）；错误 `#ea001d`；警示 `#ffa600`。**字号** 复制 16/14/13、标题 600 权重梯度；**间距** 4/8/12/16/24/32/40；**圆角** 6（控件）/12（菜单）/16（全屏）；**焦点环** `0 0 0 2px #fff, 0 0 0 4px #006bff`；**动效** `cubic-bezier(0.175,0.885,0.32,1.1)`，150–300ms，尊重 `prefers-reduced-motion`；**阴影** 三档（卡/浮层/模态）。深色档取自 `design.dark.md`（实现时拉取补全）。
- **字体**：Geist Sans/Mono 自托管（`public/fonts/` woff2 + `@font-face`），CJK 走系统回退（同现状）。

## 11. 部署与 CI

- 留守 **GitHub Pages**，source=Actions。`astro.config` 配 `site: 'https://imwenyaot.github.io'`、`base: '/website'`。
- 改写 `.github/workflows/deploy.yml`：`on: push [main]` + `workflow_dispatch`；job = checkout → `pnpm/action-setup` + setup-node(cache) → `pnpm install --frozen-lockfile` → **`pnpm build`（含链接校验，失败退出）** → `upload-pages-artifact`（path `dist`）→ `deploy-pages`。相比现 CI 去掉 uv/mkdocs。
- `.gitignore` 增 `node_modules/`、`dist/`、`.astro/`；移除仅 mkdocs 相关项。

## 12. 迁移阶段

1. **脚手架**：分支 `migrate/astro`；`pnpm create astro@latest --template starlight`（或手建）；`astro.config`（site/base/expressiveCode/mermaid/sidebar/editLink/social/customCss）；`content.config.ts`。
2. **设计层**：`geist.css`（token 覆盖 + `.dl-*` 移植 + 语义色）；Geist 字体自托管；`--sl-*` → Geist 映射，亮/暗双验。
3. **组件**：`PdfViewer.astro` + `papers.ts` registry；确认 `<Aside>`/代码包含。
4. **内容迁移**：16 页 `docs/**` → `src/content/docs/**`（`.mdx`）；补 `title` + `sidebar.order/label`；**逐条反转内链**（§6）；`<PdfViewer>` 替换 3 处；PDF → `public/paper/`。
5. **平替验证**：`pnpm build` 绿 + 链接校验零错；`pnpm dev` 16 页逐页眼检（§13）。
6. **切换**：删 mkdocs 残留；改写 CI + 治理文件；合并 `migrate/astro` → `main`；核对 Actions 绿、`imwenyaot.github.io/website/` 各页可访问、URL 逐一对应。

## 13. 验收标准（合并前）

- `pnpm build` exit 0；**Starlight/Astro 链接校验零坏链**（§6 兜底）。
- 16 页逐页眼检：每页有标题（frontmatter 派生）；侧边栏结构 = 现导航；Pagefind 搜索可用（含中文）；暗/亮切换正常；每篇 mermaid 渲染正常；3 论文页 PDF 内嵌可见可下载；6 页 dl-SVG 亮/暗都正确。
- **URL 逐一对应**现状（抽查 + 对照现 `nav`/文件树）。
- 设计核对：Geist 配色/字体/焦点环/圆角在亮/暗下与 token 一致。

## 14. 风险与缓解

- **内链反转（头号）**：文件相对→路由式，逐条按目标页重推；靠 Starlight 链接校验失败退出兜底。
- **Mermaid 客户端渲染**：首屏由 JS 渲染（同现状，可接受）；插件与 Starlight 版本兼容性在阶段 1 先验证一张。
- **PDF 相对路径**：统一放 `public/paper/`，`<PdfViewer>` 构建期解析绝对/站点相对路径，消除深度耦合。
- **MDX 保 SVG 属性**：kebab-case 属性预期原样透传；阶段 2 先验证一页 dl-SVG 亮/暗渲染无误再铺开。
- **Geist 深色对比**：暗色 token 从 `design.dark.md` 补全，逐页验证对比度 ≥ 4.5:1（沿用现状 DESIGN.md 原则）。

## 15. 明确延后

- 构建期 mermaid 出静态 SVG（零 JS）——日后可选升级。
- dl-figures 组件化（架构评审候选 4）——迁移后逐张。
- PDF 同地放置 + 人名化（架构评审候选 2）——可搭 `papers.ts` registry 顺手，或延后。
- 搬 Vercel（分支预览 + SSR）——真上 app 能力时。

## 16. 待定小决策（带推荐）

1. **首页形态**：**普通文档页作首页**（带侧边栏 + TOC）——推荐。依据：参考站 openai-agents-js 的首页即文档式 Overview；且 06-30 spec 你上次在 Starlight 上也选了普通文档页。splash/hero 落地页作为备选（想要更强门面时再上）。
2. **PDF 是否顺手同地+改名**（架构评审候选 2）：推荐**先搬不改名**（`public/paper/<arxiv_id>.pdf`），registry 留好口子，改名/同地作为迁移后独立小步。

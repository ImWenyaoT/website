---
name: website-guide
description: >-
  动手改 Tian "Edward" Wenyao 网站（projects/website，mkdocs-material + uv 的中文知识库）前必读——
  样式/配色/字体/主题/导航/内容/配置/部署 任一改动都先看这里。沉淀了 Geist×HIG 设计系统与其
  token 架构、用真实代价换来的坑（绝不引入 CJK webfont——会让滚动卡顿；Material 三态 auto
  palette 默认露 indigo；social cards 对中文站成本过高）、设计原则（HIG 有规定照 HIG、其余以
  单一真源 token 自洽、一个强调色、透明度分层、别只靠颜色）、以及 build→验证→部署 的纪律
  （uv、mkdocs build --strict、curl/grep 核对产物与线上、提交身份钉死、CI action 钉精确 tag）。
  凡触碰本站就用它，省去重踩那些花了很多轮才解决的问题。
---

# Working on the Tian "Edward" Wenyao website

个人知识库,`projects/website`,**mkdocs-material + uv**,全中文内容(深度学习 / AI agent 笔记)。
线上 `https://imwenyaot.github.io/website/`,GitHub Pages(source = GitHub Actions)。

本站经过很多轮打磨,下面的坑与约定都是用真实返工换来的。**动手前读完,基本能省一整轮。**

## 设计系统(Geist × HIG)

完整规范见仓库根目录 **`DESIGN.md`**。这里只记最容易违背的三条:

- **一个强调色,单一真源。** 改颜色**只动** `docs/stylesheets/extra.css` 里的 `--ds-accent-rgb`
  (`:root` 浅色 + `[data-md-color-scheme="slate"]` 深色各一处);链接、UI 交互、图示蓝**全站自动
  跟随**。别再到处写死 hex——那正是「不自洽」,也是之前"两个蓝"返工的根因。
- **中性靠透明度,不加灰。** 主/次/弱文字用 `--md-default-fg-color`(`--light`/`--lighter`/
  `--lightest`)——即黑白的透明度层级(等同 Apple label 与 Geist `grayAlpha` 的做法)。
- **图示语义色是豁免项,但要叠线型。** 手绘 SVG(`.dl-*`)用蓝(=强调色)/绿/橙区分前向/反向;
  颜色之外**必须**再叠线型(前向实线、反向虚线),因为「别只靠颜色」是 HIG 无障碍硬要求。

## ⚠️ 必踩不可的坑(别重蹈)

**1. 绝不引入 CJK webfont。** 中文字库(Noto Sans SC 之类)会被 Google Fonts 切成 ~300 个 unicode
子集、按字重下载,触发几十个字体请求 + fallback 换字重排 → **滚动卡顿**。我们试过、量过(317
个 `@font-face`)、砍字重也无效(仍 ~300),最终回退。**规则:拉丁用 webfont(现在是 Geist,纯拉丁、
仅 5 个 @font-face),中文交给系统字体**——Material 回退链的 `-apple-system` 在 Mac 上就是苹方
(Apple 自家字体)。换字体只改 `mkdocs.yml` 的 `theme.font`,且**只选纯拉丁字体**。

**2. Material 三态 auto palette 的 indigo 陷阱。** 无 `scheme` 的 auto 档(`media: "(prefers-color-scheme)"`)
默认 `primary=indigo`;首访 / auto 模式下 palette 里 named `primary: white` **不会生效**(它只在该档
被显式选中时才作用)。所以顶栏配色必须用 **CSS 按 `[data-md-color-scheme]` 强制**(见 extra.css 的
`--md-primary-fg-color` 覆盖),不能只靠 palette 的 named primary,否则 auto 模式露出 indigo。

**3. social cards 对中文站不划算。** 需要 `mkdocs-material[imaging]` + 渲染时下载**整套 Noto CJK
字体(几十 MB)**,首次构建卡 2 分钟、CI 每次都要缓存这堆字体。已评估并撤销,别再加。

**4. `!!python/name:...` 的 IDE 报错是假阳性。** mermaid superfences 那行的 YAML tag,编辑器会标红
「Unresolved tag」,但 mkdocs 自己的 loader 能解析它;只要 `build --strict` 绿就无事,忽略这个红。

## 设计原则(用户拍板,反复强调)

- **HIG 有规定的照 HIG**(正文对比 ≥ 4.5:1、别只靠颜色、克制用色);**它没规定的实现细节,以我们
  自己的 token 体系「自洽」为准**——不生搬硬套某规范的数字。
- **自洽 = 变量化。** 把设计决策收敛到单一真源、处处派生,不到处写死值。
- **加新颜色前先自问**:能不能用「现有强调色 + 透明度」或「现有语义色」表达?能就别引入新色相。
- **视觉/配色取舍别空口问**:直接改、部署到线上让用户看(用户在**远程服务器**,本地 `127.0.0.1`
  他的浏览器连不上,别让他看本地 serve——推到线上 URL 才看得到)。

## 工作流纪律

- **Python 一律 uv**:`uv sync` / `uv run mkdocs serve` / `uv run mkdocs build --strict`。改了
  `hooks/` 就跑 `uv run ruff format && uv run ruff check && uv run ty check && uv run pytest`。**不写 .sh 脚本。**
- **构建门**:`uv run mkdocs build --strict` 必须 exit 0;它配合 `mkdocs.yml` 的 `validation:` 块
  把断链/断锚点提级为失败。**`exclude_docs: superpowers/` 别删**(否则设计/计划文档被当"缺页"而失败)。
- **实测不臆测。** 字体、性能这类结论别靠猜:用 `curl` 量(`@font-face` 数、payload 大小)、用
  `grep` 核对**构建产物** `site/`;声称"改好了"之前先验证产物,推送后再验证**线上**。
- **git 身份钉死** `ImWenyaoT <tianwenyao02@gmail.com>`(绝不用 `hythmealot@gmail.com`,会串到影子
  账号)。提交用 `git -c user.name="ImWenyaoT" -c user.email="tianwenyao02@gmail.com" commit ...`。
- **CI action 钉精确 tag**(如 `astral-sh/setup-uv@v8.2.0`、`actions/checkout@v7.0.0`)。移动大版本别名
  (`@v8`)可能根本不存在 → CI resolve 失败;用 `gh api repos/<owner>/<repo>/git/ref/tags/<tag>` 先确认存在。
- **部署核对闭环**:`git push` → `gh run view <id>` 轮询到 CI 绿 → `curl` 线上 URL 确认新内容真的生效
  (Pages 有 CDN 传播延迟,别只看 CI 绿就宣布完成)。

## 改什么去哪改(速查)

- **颜色 / 样式 / 图示**:`docs/stylesheets/extra.css`(token 在 `:root` 与两个 `[data-md-color-scheme]`)。
- **字体 / 主题 / 导航 / markdown 扩展 / palette / validation**:`mkdocs.yml`。
- **每页标题 + 阅读时间**:`hooks/reading_time.py`(原生 hook;内容页普遍无正文 H1,靠它从 frontmatter
  `title` 合成 H1 再挂阅读时间;首页豁免阅读时间)。
- **内容**:`docs/**`。**内链用源文件相对的 `.md` 路径**(不是目录 slug),否则 `--strict` 报断链。
  mermaid 用 ```mermaid 围栏(客户端渲染);论文 PDF 用原生 HTML `<iframe class="pdf-frame">` 内嵌,
  路径 `../../paper/xxx.pdf`(目录 URL 下三个论文页同为深度 2)。
- **CI**:`.github/workflows/deploy.yml`(lint → build --strict → deploy 三段)。

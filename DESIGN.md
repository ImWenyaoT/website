# Design System —— Vercel Geist

本站直接采用 **Vercel 的开源设计系统 Geist**:字体(Geist Sans/Mono)与配色(Geist Light/Dark)
都取自 Vercel 官方,再叠几条无障碍/自洽守则。**配色逐字取自** `vercel.com/design.md`(浅色)
与 `vercel.com/design.dark.md`(深色)。

## 总原则

1. **配色/字体以 Vercel Geist 为准**;它没规定的实现细节,以本 token 体系「自洽」为准。
2. **无障碍守则(必守)**:正文对背景对比 **≥ 4.5:1**;**别只靠颜色**区分(叠线型/形状);克制用色。
3. **单一真源,处处派生**——设计决策变量化,不到处写死 hex(自洽 = variableize)。
4. **一个强调色**贯穿全站(theme + 图示),中性靠**黑白 + 透明度层级**。

## Tokens

### 排版
- 正文/标题 = **Geist Sans**;代码 = **Geist Mono**(`mkdocs.yml` → `theme.font`)。均 Vercel 开源
  (OFL)、已上 Google Fonts、**纯拉丁**;中文经 Material 回退链走**系统 CJK**(macOS=苹方)→ 轻量无卡顿。
- 行距 1.7(CJK 舒展)、克制粗体层级(h1/h2=700, h3=600)。
- **不设 `-webkit-font-smoothing: antialiased`**——它把字削细,深色模式夜间可读性变差。

### 颜色(直接取自 Vercel Geist Light / Dark）
`--ds-accent-rgb` 是**唯一强调色的单一真源**;链接、UI、图示蓝全由它派生(改一处即全站)。

| 角色 | Material 变量 | 浅色 (design.md) | 深色 (design.dark.md) |
|---|---|---|---|
| 页面底 | `--md-default-bg-color` | `#ffffff` | `#000000` |
| 主文字 | `--md-default-fg-color` | `#171717` | `#ededed` |
| 次要文字 | `--md-default-fg-color--light` | `#4d4d4d` | `#a0a0a0` |
| 弱文字 | `--md-default-fg-color--lighter` | `#8f8f8f` | `#878787` |
| 边框/分隔 | `--md-default-fg-color--lightest` | `#ebebeb` | `#2e2e2e` |
| 顶栏底 | `--md-primary-fg-color` | `#ffffff` | `#000000` |
| 顶栏文字 | `--md-primary-bg-color` | `#171717` | `#ededed` |
| 代码底 | `--md-code-bg-color` | `#fafafa` | `#1a1a1a` |
| 强调/链接 blue-700 | `--ds-accent-rgb` | `#006bff`(`0 107 255`) | `#006efe`(`0 110 254`) |

- **语义色(仅图示)**:`--dl-green`(正向/成功)、`--dl-orange`(反向/警示)。图示不受「一个蓝」约束,
  但**必须叠线型**(前向实线/反向虚线)满足「别只靠颜色」。
- **代码高亮**:功能性多色,豁免。

### 分隔
- 统一 `1px var(--md-default-fg-color--lightest)` 发丝线(图示框、PDF 框、顶栏滚动分隔同一 token)。

## 改色/改字的正确姿势
- 换强调色:只改 `docs/stylesheets/extra.css` 的 `--ds-accent-rgb`(两档各一处),全站(含图示)自动跟随。
- 改明/暗配色:改两个 `[data-md-color-scheme]` 块里的 `--md-*`(值取自 Vercel `design[.dark].md`)。
- 换字体:改 `mkdocs.yml` 的 `theme.font`。**勿引入 CJK webfont**(几十 MB、会卡),中文交给系统字体。
- 新增颜色前先问:能不能用「现有强调色 + 透明度」或「现有语义色」表达?能就别加新色相。

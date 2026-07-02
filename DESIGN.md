# Design System —— Geist × Apple HIG

本站的设计系统:**结构取自 Apple HIG,执行取自 Vercel Geist**。二者同源(都脱胎于
Swiss/国际主义排版,Geist 明确受 SF Pro/Mono 启发),融合后自洽。

## 总原则

1. **HIG 有规定的照 HIG**;它没规定的实现细节,以**本 token 体系「自洽」**为准。
   - 硬约束(必守):正文对背景对比 **≥ 4.5:1**;**别只靠颜色**区分(叠线型/形状);克制用色。
2. **单一真源,处处派生**——设计决策变量化,不到处写死 hex(自洽 = variableize)。
3. **一个强调色**贯穿全站(theme + 图示),其余靠**黑白 + 透明度**分层。

## Tokens

### 排版
- 正文/标题:**Geist Sans**;代码:**Geist Mono**(`mkdocs.yml` → `theme.font`)。
- 均为 Vercel 开源字体(OFL)、已上 Google Fonts、**纯拉丁**;中文经 Material 回退链走
  **系统 CJK**(macOS = 苹方)。→ 轻量,无 CJK webfont 卡顿。
- 行距 1.7(CJK 舒展)、抗锯齿、克制粗体层级(h1/h2=700, h3=600)——HIG 排版原则。

### 颜色
- **强调色(唯一)**:`--ds-accent-rgb` 单一真源。
  - 浅色 = **Vercel 蓝 `#0070f3`**(`0 112 243`,对比 4.53:1,刚好过 HIG 4.5:1)。
  - 深色 = `#3291ff`(`50 145 255`,slate 档覆盖)。
  - 派生:`--md-accent-fg-color`、`--md-typeset-a-color`(链接)、`--dl-blue`(图示蓝)全部 = 强调色。
- **中性**:黑/白,借 Material 的 `--md-default-fg-color--light/--lighter/--lightest`(即透明度层级
  —— 等同 HIG label 与 Geist `grayAlpha` 的做法)表达主/次/弱。
- **顶栏 chrome**:浅色=白顶栏+墨黑字;深色=近黑顶栏+浅字(HIG 极简 chrome)。
- **语义色(仅图示)**:`--dl-green`(正向/成功)、`--dl-orange`(反向/警示)——HIG semantic colors。
  图示不受「一个蓝」约束,但**必须叠线型**(前向实线/反向虚线)满足「别只靠颜色」。
- **代码高亮**:功能性多色,豁免。

### 分隔
- 统一 `1px var(--md-default-fg-color--lightest)` 发丝线(图示框、PDF 框、顶栏滚动分隔同一 token)。

## 改色/改字的正确姿势
- 换强调色:只改 `docs/stylesheets/extra.css` 的 `--ds-accent-rgb`(两档各一处),全站(含图示)自动跟随。
- 换字体:改 `mkdocs.yml` 的 `theme.font`。**勿引入 CJK webfont**(几十 MB、会卡),中文交给系统字体。
- 新增颜色前先问:能不能用「现有强调色 + 透明度」或「现有语义色」表达?能就别加新色相。

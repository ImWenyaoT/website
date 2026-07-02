# Design System —— Vercel Geist × Apple HIG

本站设计系统的两个权威来源:
- **Vercel Geist**——具体 token(字体/配色/圆角/动效/焦点),逐字取自
  `https://vercel.com/design.md`(浅色)与 `https://vercel.com/design.dark.md`(深色)。
- **Apple HIG**——横切原则(易读、对比、减少动效、焦点管理、别只靠颜色),见
  `https://developer.apple.com/design/human-interface-guidelines`。

## 总原则(HIG)
1. **易读优先**:正文对背景对比 **≥ 4.5:1**;别为「精致」牺牲对比/字重(如 `-webkit-font-smoothing: antialiased` 会削细字、深色更糟——**禁用**)。
2. **别只靠颜色**:前向/反向等区分要叠**线型/形状**(图示前向实线、反向虚线)。
3. **减少动效**:尊重 `prefers-reduced-motion`(Material 默认已尊重)。
4. **焦点管理**:键盘 `:focus-visible` 要有清晰焦点环(见下)。
5. **单一真源,处处派生**(自洽 = variableize):决策变量化,别到处写死 hex。

## Tokens

### 颜色(直接取自 Vercel Geist Light / Dark)
`--ds-accent-rgb` 是**唯一强调色单一真源**;链接/UI/图示蓝全由它派生(改一处即全站)。

| 角色 | Material 变量 | 浅色 | 深色 |
|---|---|---|---|
| 页面底 | `--md-default-bg-color` | `#ffffff` | `#000000` |
| 主文字 | `--md-default-fg-color` | `#171717` | `#ededed` |
| 次要 / 弱文字 | `--md-default-fg-color--light` / `--lighter` | `#4d4d4d` / `#8f8f8f` | `#a0a0a0` / `#878787` |
| 边框/分隔 | `--md-default-fg-color--lightest` | `#ebebeb` | `#2e2e2e` |
| 顶栏底 / 文字 | `--md-primary-fg-color` / `-bg-color` | `#ffffff` / `#171717` | `#000000` / `#ededed` |
| 代码底 | `--md-code-bg-color` | `#fafafa` | `#1a1a1a` |
| 强调/链接 blue-700 | `--ds-accent-rgb` | `#006bff` (`0 107 255`) | `#006efe` (`0 110 254`) |

- **语义色(仅图示)**:`--dl-green`(正向)、`--dl-orange`(反向)+ 叠线型;代码高亮多色豁免。

### 排版
- 正文/标题 = **Geist Sans**,代码 = **Geist Mono**(`mkdocs.yml` → `theme.font`);纯拉丁,中文走系统 CJK。
- 行距 1.7(CJK 舒展)、克制粗体层级(h1/h2=700, h3=600)。字号沿用 Material 默认(比 Vercel copy-14 大,更利阅读)。

### 间距 / 圆角 / 动效 / 焦点(Vercel Geist 规范,按需取用)
- **间距**:4px 基数(4/8/12/16/24/32/40/64/96);组内 8、组间 16、区块间 32–40。
- **圆角**:控件/卡片 6px、菜单/浮层 12px、全屏 16px、胶囊 9999px。
- **动效**:`cubic-bezier(.175,.885,.32,1.1)`;状态 ~150ms、浮层 200ms、覆盖层 300ms。尊重 reduced-motion。
- **焦点环**:`:focus-visible` 用 `outline: 2px solid var(--ds-accent); outline-offset: 2px`(强调色环 + 2px 间隙)。
- **分隔线**:统一 `1px var(--md-default-fg-color--lightest)`(图示框/PDF 框/顶栏滚动发丝线同 token)。

## 改色/改字的正确姿势
- 换强调色:只改 `extra.css` 的 `--ds-accent-rgb`(两档各一处),全站(含图示)自动跟随。
- 改明/暗配色:改两个 `[data-md-color-scheme]` 块的 `--md-*`(值取自 Vercel `design[.dark].md`)。
- 换字体:改 `mkdocs.yml` 的 `theme.font`;**勿引 CJK webfont**(几十 MB、会卡),中文交给系统字体。
- 加新颜色前先问:能不能用「现有强调色 + 透明度」或「现有语义色」表达?能就别加新色相。

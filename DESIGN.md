# Design System —— Starlight × Geist × Apple HIG

本站设计系统的三个来源:
- **Starlight**——亮色、暗色与强调色基础 token，保持框架默认值。
- **Vercel Geist**——拉丁字体、间距、圆角、动效与焦点细节。
- **Apple HIG**——横切原则(易读、对比、减少动效、焦点管理、别只靠颜色),见
  `https://developer.apple.com/design/human-interface-guidelines`。

## 总原则(HIG)
1. **易读优先**:正文对背景对比 **≥ 4.5:1**;别为「精致」牺牲对比/字重(如 `-webkit-font-smoothing: antialiased` 会削细字、深色更糟——**禁用**)。
2. **别只靠颜色**:前向/反向等区分要叠**线型/形状**(图示前向实线、反向虚线)。
3. **减少动效**:尊重 `prefers-reduced-motion`(Material 默认已尊重)。
4. **焦点管理**:键盘 `:focus-visible` 要有清晰焦点环(见下)。
5. **单一真源,处处派生**(自洽 = variableize):决策变量化,别到处写死 hex。

## Tokens

### 颜色
站点 UI 不覆盖 `--sl-color-*` primitive token，直接使用 Starlight 默认亮暗配色与强调色。自定义组件只引用语义 token，不写死另一套站点 palette。

- **语义色(仅教学图)**：`--dl-blue`、`--dl-green`、`--dl-orange`，并叠加线型；代码高亮多色豁免。

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
- 改站点配色：优先保持 Starlight 默认 token；确有必要时只覆盖语义 token，不重写整套 primitive palette。
- 换字体：修改 `src/site/siteStyles.ts`；**勿引 CJK webfont**，中文交给系统字体。
- 加新颜色前先问:能不能用「现有强调色 + 透明度」或「现有语义色」表达?能就别加新色相。

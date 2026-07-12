# Design System —— Starlight default

本站以 **Starlight 默认设计**为基线：配色、字体、基础控件和主题行为均不另建品牌层。Apple HIG 只作为横切原则（易读、对比、减少动效、焦点管理、别只靠颜色），见
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

- 字体使用 Starlight 默认字体栈，中文自然走系统 CJK 字体。
- 正文行距为中文阅读做轻量优化，其余字号和字重尽量沿用 Starlight。

### 自定义边界

- 首页路径卡片、教学图和 PDF 可以有局部样式，但必须引用 Starlight 语义 token。
- 高频导航只允许短促状态反馈，所有动效尊重 `prefers-reduced-motion`。
- 焦点环使用 Starlight 强调色，信息不能只靠颜色表达。

## 改色/改字的正确姿势

- 改站点配色：优先保持 Starlight 默认 token；确有必要时只覆盖语义 token，不重写整套 primitive palette。
- 字体保持 Starlight 默认；不额外引入 webfont。
- 加新颜色前先问:能不能用「现有强调色 + 透明度」或「现有语义色」表达?能就别加新色相。

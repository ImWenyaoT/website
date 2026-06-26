# Agent Notes

这里记录我对 agent 论文、代码和系统设计的理解。形式更接近个人技术 blog：每篇文章只解决一个问题，尽量写清楚上下文、判断和可复用结论。

当前主线是从 ReAct 读到 SWE-agent：先理解语言模型如何在 `Thought -> Action -> Observation` 循环里行动，再理解为什么真实软件工程任务需要专门的 Agent-Computer Interface。

## 文章

| 标题 | 主题 | 状态 |
| --- | --- | --- |
| [读法：三遍读论文](reading-route.md) | 如何把论文读成可复用笔记 | 可复习 |
| [ReAct：推理和行动交替](papers/react.md) | agent loop 的基本范式 | 可复习 |
| [SWE-agent：给语言模型设计电脑界面](papers/swe-agent.md) | ACI 与 coding agent | 可复习 |
| [Agent 基本概念](topics/agent-basics.md) | ReAct、CoT、Act-only、ACI 的关系 | 持续更新 |
| [实现与 provider 边界](topics/implementation-boundaries.md) | 哪些能替换，哪些不该重写 | 持续更新 |
| [长期记忆](topics/long-term-memory.md) | memory、session、compact 的区别 | 草稿 |

## 写作原则

- 先写自己的理解，再补原文证据。
- 不把对话逐字搬进笔记；只沉淀稳定概念、判断和反例。
- 每篇文章保留一个明确主题，不把所有内容塞进首页。
- 代码和论文原文可以作为证据，但正文要尽量转成可复用解释。

## 资料位置

论文 PDF 不放在笔记目录下，统一保存在 `docs/paper/`。笔记页面引用原文要点时优先摘出关键句和段落含义，而不是只留一个下载链接。

这个站点以后会继续扩展，不只服务 ReAct 和 SWE-agent。

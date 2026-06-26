# Agent Notes

Agent Notes 是我整理 agent 论文、代码和系统设计的地方。它不是访谈记录，也不是论文摘要库，而是把读到的机制、边界和判断沉淀成以后能复用的笔记。

当前主线是从 ReAct 读到 SWE-agent：先理解语言模型如何在 `Thought -> Action -> Observation` 循环里行动，再理解为什么真实软件工程任务需要专门的 Agent-Computer Interface。

## 为什么这样写

这个站点参考 OpenAI Agents SDK 文档的组织方式：入口页先给概念地图，再给最小组件，最后告诉读者下一步应该去哪一页。区别是这里不是 SDK 手册，而是个人学习笔记，所以正文会保留更多“我如何理解”和“这个边界为什么重要”。

写作时遵守三个约束：

1. 先写自己的理解，再补原文证据。
2. 不把对话逐字搬进笔记，只保留稳定结论。
3. 每篇文章只解决一个问题，避免把所有内容堆到首页。

## 基本组件

| 组件 | 用途 |
| --- | --- |
| 读法 | 统一每篇论文的阅读输出形状，避免越读越散。 |
| 论文笔记 | 记录一篇论文的核心问题、机制和边界。 |
| 主题笔记 | 把多次阅读中反复出现的概念抽出来，例如 agent loop、provider boundary、memory。 |
| 原文材料 | PDF 保存在 `docs/paper/`，页面中只摘关键原文抓手和自己的理解。 |

## 入门起点

如果第一次打开这个站点，按这个顺序读：

1. [快速开始](reading-route.md)：了解笔记怎样从论文里抽取问题、机制和边界。
2. [Agent 基本概念](topics/agent-basics.md)：先建立 `agent loop -> feedback -> interface` 这条主线。
3. [ReAct](papers/react.md)：理解推理和行动为什么要交替。
4. [SWE-agent](papers/swe-agent.md)：理解为什么 coding agent 需要 ACI。

## 路径选择

| 如果你想要... | 接下来读 |
| --- | --- |
| 快速知道站点怎么读 | [快速开始](reading-route.md) |
| 理解 ReAct、CoT、Act-only 的关系 | [Agent 基本概念](topics/agent-basics.md) |
| 读 ReAct 论文的核心贡献 | [ReAct：推理和行动交替](papers/react.md) |
| 读 SWE-agent 论文的接口贡献 | [SWE-agent：给语言模型设计电脑界面](papers/swe-agent.md) |
| 判断换模型时哪些代码该动 | [实现与 provider 边界](topics/implementation-boundaries.md) |
| 理解 memory、session、compact 的区别 | [长期记忆](topics/long-term-memory.md) |

这个站点以后会继续扩展，不只服务 ReAct 和 SWE-agent。

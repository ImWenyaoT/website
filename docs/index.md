---
description: AI study notes organized by topics, articles, and papers.
---

# Wenyao's AI Notes

从第一性原理、图解和代码化表达出发，整理 AI Agent、Deep Learning 和 AI Engineering 的长期学习笔记。

[开始阅读](./notes/index.md){ .md-button .md-button--primary }
[查看 Topics](./notes/reading-route.md){ .md-button }

## 概述

这个站点不是新闻流，也不是论文摘要库。它更像一套个人学习系统：把一个概念拆到能用图、伪代码和例子复述为止。

```mermaid
flowchart LR
  Notes["AI Notes"] --> Agent["Topic: AI Agent"]
  Notes --> DL["Topic: Deep Learning"]
  Agent --> Runtime["Articles: loop / tools / memory"]
  Agent --> Papers["Papers: ReAct / SWE-agent"]
  DL --> NN["Articles: neural networks"]
  DL --> OPT["Articles: optimization / backprop"]
  DL --> TFM["Articles: Transformer / attention"]
```

## 起点选择

| 起点 | 适合你在想什么 | 下一步 |
| --- | --- | --- |
| [AI Agent](./notes/ai-agent/index.md) | LLM 怎样通过工具、环境反馈和 runtime loop 行动。 | 从 agent loop 读到 ReAct 和 SWE-agent。 |
| [Deep Learning](./notes/deep-learning/index.md) | 神经网络为什么能训练，Transformer 和注意力到底在做什么。 | 从神经网络结构读到 GPT 和 attention。 |

## 写作原则

| 原则 | 含义 |
| --- | --- |
| First principles first | 先问这个概念为什么必须存在，再谈术语。 |
| Diagrams before prose | 能用图解释的地方，不堆长段文字。 |
| Code as notation | 用 PyTorch-like 代码替代一部分公式。 |
| Reusable notes | 笔记要能复习、引用和继续扩展。 |

## 路径选择

| 如果你想要... | 读这个 |
| --- | --- |
| 快速了解站点结构 | [快速开始：如何读这些笔记](./notes/reading-route.md) |
| 理解 agent 的基本循环 | [AI Agent Topic](./notes/ai-agent/index.md) |
| 从深度学习基础补到 Transformer | [Deep Learning Topic](./notes/deep-learning/index.md) |
| 看一篇具体论文笔记 | [ReAct](./notes/papers/react.md) |

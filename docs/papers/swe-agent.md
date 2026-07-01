---
title: SWE-agent：给语言模型设计电脑界面
description: SWE-agent 把 Agent-Computer Interface 放到 coding agent 中心，用接口设计降低模型在真实仓库里的失败率。
---

SWE-agent 的核心不是“让模型会写代码”，而是把接口设计放到 coding agent 的中心。论文提出 Agent-Computer Interface，把模型能用的命令、电脑返回的反馈、上下文管理和防错机制都视为影响 agent 表现的变量。

## 原文抓手

摘要里有一句很关键：LM agents 是 “a new category of end users”。

这句话解释了为什么不能简单让模型使用人类的 shell。人类能从嘈杂输出、空输出、隐式状态和复杂命令里恢复；语言模型经常不能。它需要更适合自己的电脑界面。

## 我的理解

SWE-agent 把 ReAct 的循环搬进真实代码仓库：

| ReAct 结构 | 软件工程里的含义 |
| --- | --- |
| Thought | 定位 bug、形成修改计划、决定验证方式。 |
| Action | 搜索、查看、编辑、运行测试。 |
| Observation | 文件内容、命令输出、测试失败、guardrail 反馈。 |

问题在于，软件工程任务的 Action 空间太大。Shell 很强，但对语言模型来说也很危险：输出可能太长，成功时可能没有反馈，编辑命令可能难以恢复。

## ACI 改变了什么

ACI 至少改变三件事：

1. **动作空间**：从任意 shell 命令收敛到搜索、查看、编辑、验证等更稳定的动作。
2. **反馈格式**：让每轮行动产生更明确、简洁、可用于下一轮推理的结果。
3. **错误恢复**：通过 guardrails 和结构化编辑减少坏状态扩散。

所以 ACI 不是“包装几个命令”，而是改变 agent loop 的输入输出条件。

## 和人类工具的差异

人类 IDE 的目标是提高人的操作效率。ACI 的目标是降低模型在长上下文、弱状态感和不稳定编辑中的失败率。

这也是为什么 file viewer、edit command、guardrails 看起来不复杂，但会显著影响 agent 表现：它们减少了模型不擅长处理的噪音和隐式状态。

## 关联笔记

- [ReAct：推理和行动交替](react.md)
- [实现与 provider 边界](../topics/implementation-boundaries.md)

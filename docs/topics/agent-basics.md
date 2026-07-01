---
title: Agent 基本概念
description: 把 agent 理解为可迭代状态更新的系统，并厘清 CoT、Tool use、ReAct、ACI 的区别。
---

我现在把 agent 先理解成：会根据环境反馈继续行动的系统。它和一次性问答模型的区别，不是是否调用工具，而是是否存在可迭代的状态更新。

## 最小循环

| 阶段 | 作用 |
| --- | --- |
| Thought | 当前假设、计划、异常处理、下一步意图。 |
| Action | 接触环境，例如搜索、点击、读文件、编辑、运行测试。 |
| Observation | 环境把事实、状态、错误或结果返回给模型。 |
| Update | 模型根据观察修正计划，继续下一轮或结束。 |

这个结构来自 ReAct，但可以迁移到很多 agent 系统里。

## 几个容易混淆的概念

### CoT

Chain-of-thought 主要发生在模型内部。它可以让推理更有步骤，但如果事实前提错了，后续推理仍然可能自洽地错下去。

### Tool use

工具调用让模型能接触外部系统，但工具本身不保证模型有计划。没有状态跟踪时，工具调用可能只是局部试错。

### ReAct

ReAct 的关键是把推理和行动交替起来。它不是工具调用的别名，而是一种轨迹组织方式。

### ACI

ACI 是语言模型使用电脑的接口层。它关心模型能做什么动作、收到什么反馈、如何避免错误扩散。

## 从 ReAct 到 SWE-agent

ReAct 先说明 agent loop 为什么重要。SWE-agent 进一步说明：当 loop 进入真实代码仓库时，接口设计会决定模型能不能稳定行动。

这条主线可以写成：

```text
agent loop -> external feedback -> interface design -> coding agent
```

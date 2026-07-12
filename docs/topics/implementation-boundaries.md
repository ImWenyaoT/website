---
description: 区分模型 provider 适配与 agent 方法机制，避免“换模型”演变成无必要的大重构。
---

# 实现与 provider 边界

读 ReAct 和 SWE-agent 代码时，一个重要判断是：哪些部分只是模型 provider，哪些部分是论文方法或系统机制。

## 可以替换的部分

模型调用层通常可以替换。比如从旧 Completion API 切到现代 Chat Completions，或者用 OpenAI-compatible API 接 DeepSeek，本质上是在替换 provider。

这类变化应该集中在：

- `base_url`
- `api_key`
- `model`
- 请求和响应适配
- streaming / non-streaming 语义

## 不应该轻易重写的部分

下面这些是方法本身，不应该因为换 provider 就顺手重写：

| 系统      | 不应随意重写的机制                                                              |
| --------- | ------------------------------------------------------------------------------- |
| ReAct     | Thought/Action/Observation 轨迹、环境 wrapper、prompt 格式、任务停止条件。      |
| SWE-agent | ACI、action parser、file viewer、edit command、guardrails、trajectory、replay。 |

如果把 provider 迁移和 agent 机制重写混在一起，就很难判断效果变化来自哪里。

## DeepSeek 的位置

在当前本地学习约定里，DeepSeek 按 OpenAI-compatible provider 处理。它应该改变模型调用配置，而不是改变 ReAct 的展示方式、SWE-agent 的 agent loop 或 ACI 设计。

换句话说：

```text
DeepSeek = provider option
ReAct/SWE-agent = agent mechanism
```

这条边界能防止“只是换模型”演变成一次无必要的大重构。

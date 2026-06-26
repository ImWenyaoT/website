# ReAct Agent 学习笔记（从对话整理）

## 1. ReAct 是什么

ReAct = Reasoning + Acting 的交替式 Agent 框架。

核心思想：
> 让 LLM 在“思考(Thought)”与“行动(Action)”之间循环，并通过环境反馈(Observation)持续修正推理。

---

## 2. ReAct Agent 的本质结构

ReAct agent 是一个 runtime loop：

```
Thought -> Action -> Observation -> Thought -> Action -> ...
```

伪代码：
```python
state = question

while True:
    thought, action = LLM(state)

    if action == "final":
        break

    observation = tool(action)

    state = state + thought + action + observation
```

---

## 3. 核心组件

### (1) LLM
- 决策核心（policy）
- 生成 Thought + Action

### (2) Tools (Action Space)
- search
- calculator
- API / DB / shell

LLM 不执行工具，只“提出调用请求”

---

### (3) Runtime (Agent Loop)
负责：
- 解析 LLM 输出（parse）
- 执行 tool
- 拼接 observation 回 context

```text
LLM → parser → tool executor → observation → LLM
```

---

### (4) Observation
- 工具返回结果
- 作为下一步 reasoning 的输入

本质：state update signal

---

## 4. ReAct vs CoT vs Tool Calling

| 方法 | 本质 |
|------|------|
| CoT | 一次性推理展开 |
| Tool Calling | 单步函数调用 |
| ReAct | 交替式闭环控制系统 |

---

## 5. parse 在系统中的作用

parse = 把 LLM 输出转为结构化 action

```python
output -> Action(tool="search", args="Tokyo")
```

### ReAct vs SWE-agent

- ReAct: regex / prompt parsing（弱结构）
- SWE-agent: 强约束 command DSL（强结构）

---

## 6. Agent 基本概念（ReAct论文）

- Agent: 能感知环境 + 做决策 + 执行动作的系统
- Environment: 工具/外部世界
- Action space: LLM 可调用工具集合
- Observation: 工具反馈
- Trajectory: 完整执行轨迹

---

## 7. 第一性理解

ReAct 的本质不是 prompt 技巧，而是：

> 把 LLM 从 stateless function 变成 stateful control loop

---

## 8. 工程本质总结

ReAct =
```
LLM (policy generator)
+ runtime loop (controller)
+ tools (environment)
```

---

## 9. 关键洞察

- reasoning 和 action 被绑定在同一 token stream
- observation 直接影响后续 reasoning
- 不需要训练，仅靠 prompt 即可形成 agent

---

## 10. 后续延伸（SWE-agent）

ReAct → SWE-agent 的演进关键：

- 从 prompt parsing → structured interface (ACI)
- 从 heuristic parsing → strict command grammar
- 从 demo agent → engineering-grade agent runtime

---

## 一句话总结

ReAct = LLM-driven observe-think-act loop，
是现代 agent runtime 的最小闭环原型。

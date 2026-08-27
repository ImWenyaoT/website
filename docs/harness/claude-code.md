---
title: "Claude Code 架构深度解析"
description: "Claude Code 生产级 Agent 设计剖析：Ink TUI、QueryEngine 循环、AST 语法树拦截、单层 Subagent 与多级 Context 压缩。"
---
# Claude Code 架构深度解析

**Claude Code** 是 Anthropic 官方打造的生产级命令行编码 Agent，采用 TypeScript 构建，底层依托 Anthropic Messages API（原生支持 Tool Call 与 Extended Thinking）。

在 Harness 工程体系中，Claude Code 代表了**「客户端重度掌控（Client-heavy Control）」**的设计典范：不把推理与状态完全托付给远端托管运行时，而是在本地客户端建立严密的响应式事件流、多级 Cache 友好压缩流水线、语法树安全拦截与单层 Subagent 隔离体系。

```mermaid
flowchart TB
    User["用户任务 / Prompt"] --> TUI["Ink TUI (React on Terminal)<br/>流式渲染 · 差异预览 · 交互式审批"]
    
    TUI --> QE["QueryEngine (主控状态机)<br/>Async Generator · 错误自愈 · 恢复分支"]

    subgraph Core["Claude Code Harness 核心体系"]
        direction TB
        AST["Tree-sitter AST 审批<br/>危险命令语法树分析与防注入"]
        Sub["单层 Subagent 调度<br/>独立 Context 空间 · 用后即抛"]
        Context["多级 Context 压缩流水线<br/>截断 → 微调 → 观察折叠 → Compact"]
        Tools["厚契约 ACI Tool 集<br/>Read · Write · Edit (唯一性断言) · Grep"]
    end

    QE --> Core
    Core <--> Model["Claude 3.7 Sonnet / Thinking Model"]
```

---

## 1. 核心循环与流程控制：`QueryEngine`

Claude Code 的主循环并非朴素的轮询机制，而是一个基于 TypeScript **Async Generator (`while(true)`)** 的响应式状态机：

```mermaid
sequenceDiagram
    participant UI as Ink TUI
    participant QE as QueryEngine
    participant M as Claude Model
    participant AST as Tree-sitter Guard
    participant T as Tools Executor

    UI->>QE: 提交用户任务 (Task)
    loop 状态机推进（直至任务收敛或超限）
        QE->>QE: 执行前置 Context 压缩 (保护 KV Cache 命中)
        QE->>M: Messages API 流式调用 (携带 thinking block)
        M-->>QE: 流式 Yield Tokens (正文与思维链)
        QE-->>UI: 实时响应式渲染 Thinking 与中间步骤
        
        alt 产生 Tool Call
            QE->>AST: AST 语法树解析与危险度检测
            alt 命中敏感命令
                AST->>UI: 触发终端交互式审批弹窗
                UI-->>QE: 用户确认批准
            end
            QE->>T: 并发/串行执行受控 Tool
            T-->>QE: 结果回填消息队列 (带 tool_use_id)
        else 无 Tool Call
            QE->>QE: 触发 Stop Hooks 钩子
            QE-->>UI: 优雅收尾并返回结果 (Completed)
        end
    end
```

### 关键设计哲学

1. **将错误视为正常状态流（Error as State）**：
   - **Token 截断恢复**：当 Model 输出达到最大长度导致截断时，状态机自动升档发起续写，而非向用户报错。
   - **HTTP 413 反应式自愈**：遇到 Payload 过大错误时，立即在内存中触发紧急 Context 压缩并透明重试。
   - **工具异常回填**：命令执行失败或路径不存在时，统一封装为 `<tool_use_error>` 消息回传给 Model，引导其在下一 Turn 主动自纠。
2. **否定模型自报，依托行为真值**：
   - 循环是否继续推进**完全不依赖 Model 返回的 `stop_reason`**，而是严格以当前 Turn 是否产生了实际的 Tool Call 作为唯一判据。

---

## 2. 交互与可观测性：Ink TUI (React on Terminal)

为什么长程编码 Agent 必须是**事件驱动（Event-Driven）**架构？因为解决真实软件工程缺陷是一个**长耗时、高异步、随时可打断且需要人类在关键分歧点参与决策**的过程。

- **思维链全透明（Visible Thinking）**：将 `thinking` 作为一个明文 content block 实时以流式方式渲染，使用户对 Model 的推理假设与决策链条建立确定性心智。
- **结构化差异预览（Unified Diff View）**：在文件落地修改前生成高亮色彩的 Git 风格 Diff 预览，并提供实时的终端交互式按键审批。
- **超大输出隔离降噪**：终端命令输出超出安全阈值时，自动落盘至临时文件，仅在 Context 中保留头部摘要与行数提示，引导 Model 使用 `Read` 按需分页定位。

---

## 3. Context 工程与 KV Cache 治理

在大 Model 的调用成本与延迟模型中，**KV Cache 命中率直接决定了 50% 以上的 API 费用与首字延迟（TTFT）**。Claude Code 设计了严格保护稳定前缀的**多级渐进压缩流水线**：

```mermaid
flowchart TD
    Raw["Context 接近 Token 预算安全水位"] --> S1["Level 1：截断超大 Tool 观察结果"]
    S1 --> Check1{"Token 水位是否恢复正常?"}
    Check1 -->|"是"| Done["压缩完成（完全保留前缀 Cache）"]
    Check1 -->|"否"| S2["Level 2：清除最早期的闲置上下文消息"]
    
    S2 --> Check2{"Token 水位是否恢复正常?"}
    Check2 -->|"是"| Done
    Check2 -->|"否"| S3["Level 3：按 tool_use_id 微压缩（折叠冗余观察）"]

    S3 --> Check3{"Token 水位是否恢复正常?"}
    Check3 -->|"是"| Done
    Check3 -->|"否"| S4["Level 4：终极总结式 Compact（重写历史生成 Checkpoint）"]
    S4 --> Done
```

> [!TIP]
> **设计取舍**：全局总结式 Compact 会彻底破坏已缓存的 Prompt 历史，导致后续所有请求的 KV Cache 从改写点全面击穿。因此，Claude Code 优先执行局部的“观察剪枝”，万不得已才进行全局重写。

---

## 4. 安全边界：Tree-sitter 语法树拦截与沙箱

传统的正则表达式黑白名单极易被复杂的 Shell 语法特性（反引号子 Shell、环境变量拼接、管道注入）所绕过。Claude Code 在客户端集成了 **Tree-sitter** 进行深度 AST 分析：

```mermaid
flowchart LR
    Cmd["Model 输出 Shell 命令"] --> AST["Tree-sitter 解析为抽象语法树 (AST)"]
    AST --> NodeCheck{"检查 AST 语法节点"}
    
    NodeCheck -->|"命令替换 `...` / $(...)"| Prompt["⚠️ 高危操作：强制提升至人类交互审批"]
    NodeCheck -->|"eval / curl | sh / 危险重定向"| Prompt
    NodeCheck -->|"安全只读命令 (ls, git diff, pytest)"| Sandbox["自动放行并套入系统原生沙箱 (Seatbelt/Bubblewrap)"]
```

同时，文件系统层面配置了不可绕过的**系统调用级防护**：
- 严格禁止写入 `.claude/`、项目根级配置与系统敏感目录。
- 文件读写系统调用强制携带 `O_NOFOLLOW` 标志，从操作系统底层杜绝利用软链接（Symlink）逃逸出工作区。

---

## 5. 任务分解：单层用后即抛的 Subagent

在多 Agent 协同体系中，最容易失控的 failure mode 是**无限递归派生与 Context 爆炸**。Claude Code 采用了优雅的**结构性单层封顶**策略：

```mermaid
flowchart TB
    Parent["主 Agent (维持全局主线与最终交付)"] -->|"派发轻量调研/排查任务"| Sub["Subagent (局部探索)"]
    
    subgraph SubEnv["Subagent 隔离运行环境"]
        Sub --> T_Read["受限只读 Tool：Read / Grep / Glob"]
        Sub -.->|"🚫 默认剥夺 Agent 派生工具"| NoNest["物理阻断递归派生能力"]
    end

    Sub -->|"执行收敛，仅回传一份精炼结构化报告"| Report["调研结论报告"]
    Report --> Parent
```

- **噪声强隔离**：Subagent 在代码库内翻找文件、尝试失败路径时产生的数百行中间输出全部封印在子 Context 内，随着 Subagent 结束直接被垃圾回收。
- **类型系统级防死锁**：在组装 Subagent 的 Tool 清单时物理剔除 `Agent` 工具本身，从根源上杜绝了无限派生导致的死循环与资源耗尽。




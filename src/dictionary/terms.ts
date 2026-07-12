/**
 * Describes one canonical AI Coding Dictionary term and its review candidates.
 */
export interface DictionaryTerm {
  canonical: string;
  url: string;
  aliases: string[];
}

const dictionaryBaseUrl = 'https://www.aihero.dev/ai-coding-dictionary';

/**
 * Creates a canonical Dictionary term with a stable upstream URL.
 */
function term(canonical: string, slug: string, aliases: string[]): DictionaryTerm {
  return { canonical, url: `${dictionaryBaseUrl}/${slug}`, aliases };
}

/**
 * Canonical terms whose aliases are approved for Model and Harness prose.
 */
export const dictionaryTerms: DictionaryTerm[] = [
  term('AI', 'ai', ['AI', '人工智能']),
  term('agent mode', 'agent-mode', ['agent mode']),
  term('agent', 'agent', ['Agent', 'agent', '智能体']),
  term('attention budget', 'attention-budget', ['attention budget']),
  term('attention degradation', 'attention-degradation', ['attention degradation']),
  term('autocompact', 'autocompact', ['auto-compact', 'autocompact', '自动压缩']),
  term('automated check', 'automated-check', ['automated check', '自动化检查']),
  term('automated review', 'automated-review', ['automated review', '自动化审查']),
  term('cache tokens', 'cache-tokens', ['cache tokens', '缓存 token']),
  term('compaction', 'compaction', ['compaction', 'context compression', '上下文压缩']),
  term('context pointer', 'context-pointer', ['context pointer']),
  term('context window', 'context-window', ['context window', '上下文窗口']),
  term('contextual knowledge', 'contextual-knowledge', ['contextual knowledge']),
  term('context', 'context', ['context', '上下文']),
  term('environment', 'environment', ['environment', '运行环境']),
  term('effort', 'effort', ['reasoning effort', 'effort']),
  term('filesystem', 'filesystem', ['filesystem', '文件系统']),
  term('hallucination', 'hallucination', ['hallucination', '幻觉']),
  term('handoff artifact', 'handoff-artifact', ['handoff artifact', '交接产物']),
  term('handoff', 'handoff', ['handoff', '交接']),
  term('harness', 'harness', ['Harness', 'harness']),
  term('human in the loop', 'human-in-the-loop', ['human in the loop', 'human-in-the-loop', '人类在环']),
  term('human review', 'human-review', ['human review', '人工审查']),
  term('inference', 'inference', ['inference']),
  term('input tokens', 'input-tokens', ['input tokens', '输入 token']),
  term('knowledge cutoff', 'knowledge-cutoff', ['knowledge cutoff', '知识截止时间']),
  term('MCP', 'mcp', ['MCP']),
  term('memory system', 'memory-system', ['memory system', 'Memory', '长期记忆', '记忆系统']),
  term('model provider request', 'model-provider-request', ['model provider request']),
  term('model provider', 'model-provider', ['model provider', '模型提供商']),
  term('model', 'model', ['Model', 'model', '模型']),
  term('next-token prediction', 'next-token-prediction', ['next-token prediction', '下一个 token 预测']),
  term('non-determinism', 'non-determinism', ['non-determinism', '非确定性']),
  term('output tokens', 'output-tokens', ['output tokens', '输出 token']),
  term('parameters', 'parameters', ['parameters', '模型参数']),
  term('parametric knowledge', 'parametric-knowledge', ['parametric knowledge', '参数化知识']),
  term('permission mode', 'permission-mode', ['permission mode', '权限模式']),
  term('permission request', 'permission-request', ['permission request', '权限请求']),
  term('prefix cache', 'prefix-cache', ['prefix cache', '前缀缓存']),
  term('primary source', 'primary-source', ['primary source', '一手来源']),
  term('progressive disclosure', 'progressive-disclosure', ['progressive disclosure', '渐进式披露', '渐进披露']),
  term('sandbox', 'sandbox', ['Sandbox', 'sandbox', '沙箱']),
  term('secondary source', 'secondary-source', ['secondary source', '二手来源']),
  term('session', 'session', ['Session', 'session', '会话']),
  term('skill', 'skill', ['Skill', 'skill', '技能']),
  term('stateful', 'stateful', ['stateful', '有状态']),
  term('stateless', 'stateless', ['stateless', '无状态']),
  term('subagent', 'subagent', ['subagent', 'sub-agent', '子智能体']),
  term('system prompt', 'system-prompt', ['system prompt', '系统提示词']),
  term('ticket', 'ticket', ['Ticket', 'ticket']),
  term('tool call', 'tool-call', ['tool call', '工具调用']),
  term('tool result', 'tool-result', ['tool result', '工具结果']),
  term('tool', 'tool', ['Tool', 'tool', '工具']),
  term('token', 'token', ['Token', 'token']),
  term('training', 'training', ['training', '训练']),
  term('turn', 'turn', ['Turn', 'turn', '轮次']),
];

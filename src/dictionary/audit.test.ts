import { describe, expect, it } from 'vitest';
import { auditDictionaryTerms } from './audit';
import { dictionaryTerms, type DictionaryTerm } from './terms';

const terms: DictionaryTerm[] = [
  {
    canonical: 'model',
    url: 'https://www.aihero.dev/ai-coding-dictionary/model',
    aliases: ['model', '模型'],
  },
  {
    canonical: 'context window',
    url: 'https://www.aihero.dev/ai-coding-dictionary/context-window',
    aliases: ['context window', '上下文窗口'],
  },
];

describe('Dictionary term audit', () => {
  it('keeps canonical terms, URLs, and aliases unique', () => {
    const canonicals = dictionaryTerms.map((term) => term.canonical);
    const urls = dictionaryTerms.map((term) => term.url);

    expect(new Set(canonicals).size).toBe(canonicals.length);
    expect(new Set(urls).size).toBe(urls.length);
    expect(dictionaryTerms.every((term) => term.aliases.length > 0)).toBe(true);
    expect(
      dictionaryTerms.every((term) =>
        term.url.startsWith('https://www.aihero.dev/ai-coding-dictionary/'),
      ),
    ).toBe(true);
  });
  it('reports every unlinked semantic candidate in body prose', () => {
    const source = '这个模型的上下文窗口决定模型能读取多少内容。';

    expect(auditDictionaryTerms(source, terms)).toEqual([
      { canonical: 'model', matched: '模型', line: 1, column: 3 },
      { canonical: 'context window', matched: '上下文窗口', line: 1, column: 6 },
      { canonical: 'model', matched: '模型', line: 1, column: 13 },
    ]);
  });

  it('ignores headings, code, existing links, Mermaid, and JSX', () => {
    const source = `# 模型与 context window

[model](https://www.aihero.dev/ai-coding-dictionary/model) 使用 \`context window\`。

\`\`\`mermaid
flowchart LR
  模型 --> context window
\`\`\`

<svg><text>模型</text></svg>
`;

    expect(auditDictionaryTerms(source, terms)).toEqual([]);
  });

  it('audits prose nested inside MDX components and HTML captions', () => {
    const source = `<Aside>这个模型需要人工判断。</Aside>

<figure><figcaption>模型结构</figcaption></figure>
`;

    expect(auditDictionaryTerms(source, terms)).toEqual([
      { canonical: 'model', matched: '模型', line: 1, column: 10 },
      { canonical: 'model', matched: '模型', line: 3, column: 21 },
    ]);
  });

  it('prefers a compound term over a nested shorter alias', () => {
    const source = '扩大 context window。';
    const nestedTerms: DictionaryTerm[] = [
      ...terms,
      {
        canonical: 'context',
        url: 'https://www.aihero.dev/ai-coding-dictionary/context',
        aliases: ['context'],
      },
    ];

    expect(auditDictionaryTerms(source, nestedTerms)).toEqual([
      { canonical: 'context window', matched: 'context window', line: 1, column: 4 },
    ]);
  });

  it('does not split Model Context Protocol into component concepts', () => {
    const source = 'MCP (Model Context Protocol，模型上下文协议)';
    const mcpTerms: DictionaryTerm[] = [
      ...terms,
      {
        canonical: 'context',
        url: 'https://www.aihero.dev/ai-coding-dictionary/context',
        aliases: ['context', '上下文'],
      },
      {
        canonical: 'MCP',
        url: 'https://www.aihero.dev/ai-coding-dictionary/mcp',
        aliases: ['MCP'],
      },
    ];

    expect(auditDictionaryTerms(source, mcpTerms).map((hit) => hit.canonical)).toEqual(['MCP']);
  });
});

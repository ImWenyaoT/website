import { describe, expect, it } from 'vitest';
import { auditDictionaryTerms, linkDictionaryTerms } from './audit';
import type { DictionaryTerm } from './terms';

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

  it('links every body occurrence while preserving excluded content', () => {
    const source = `# 模型

这个模型的上下文窗口属于 model。

\`模型\` 与 [model](https://www.aihero.dev/ai-coding-dictionary/model)
`;

    expect(linkDictionaryTerms(source, terms)).toBe(`# 模型

这个 [model](https://www.aihero.dev/ai-coding-dictionary/model) 的 [context window](https://www.aihero.dev/ai-coding-dictionary/context-window) 属于 [model](https://www.aihero.dev/ai-coding-dictionary/model)。

\`模型\` 与 [model](https://www.aihero.dev/ai-coding-dictionary/model)
`);
  });

  it('does not insert spaces before Chinese punctuation', () => {
    const punctuationTerms: DictionaryTerm[] = [
      ...terms,
      {
        canonical: 'tool',
        url: 'https://www.aihero.dev/ai-coding-dictionary/tool',
        aliases: ['工具'],
      },
    ];

    expect(linkDictionaryTerms('工具、模型。', punctuationTerms)).toBe(
      '[tool](https://www.aihero.dev/ai-coding-dictionary/tool)、[model](https://www.aihero.dev/ai-coding-dictionary/model)。',
    );
  });
});

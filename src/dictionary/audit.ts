import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import type { DictionaryTerm } from './terms';

export interface DictionaryAuditHit {
  canonical: string;
  matched: string;
  line: number;
  column: number;
}

interface MdastNode {
  type: string;
  value?: string;
  lang?: string | null;
  children?: MdastNode[];
  position?: {
    start: { line: number; column: number; offset?: number };
    end: { line: number; column: number; offset?: number };
  };
}

const excludedNodeTypes = new Set([
  'heading',
  'link',
  'linkReference',
  'code',
  'inlineCode',
  'definition',
  'html',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxFlowExpression',
  'mdxTextExpression',
  'yaml',
]);

const protectedPhrases = ['Model Context Protocol', '模型上下文协议'];

/**
 * Returns source ranges where component words belong to a larger proper name.
 */
function protectedRanges(value: string): Array<{ start: number; end: number }> {
  const lowerValue = value.toLowerCase();
  return protectedPhrases.flatMap((phrase) => {
    const ranges: Array<{ start: number; end: number }> = [];
    let cursor = 0;
    while ((cursor = lowerValue.indexOf(phrase.toLowerCase(), cursor)) >= 0) {
      ranges.push({ start: cursor, end: cursor + phrase.length });
      cursor += phrase.length;
    }
    return ranges;
  });
}

/**
 * Returns whether an ASCII alias is bounded by non-word characters.
 */
function hasAsciiBoundaries(value: string, start: number, length: number): boolean {
  const before = value[start - 1] ?? '';
  const after = value[start + length] ?? '';
  return !/[A-Za-z0-9_-]/.test(before) && !/[A-Za-z0-9_-]/.test(after);
}

/**
 * Converts a character offset inside a text node to a source line and column.
 */
function sourcePosition(node: MdastNode, value: string, offset: number): { line: number; column: number } {
  const prefix = value.slice(0, offset);
  const lines = prefix.split('\n');
  const lineOffset = lines.length - 1;
  return {
    line: (node.position?.start.line ?? 1) + lineOffset,
    column: lineOffset === 0 ? (node.position?.start.column ?? 1) + offset : (lines.at(-1)?.length ?? 0) + 1,
  };
}

/**
 * Finds every unlinked Dictionary term candidate in MDX body content.
 */
export function auditDictionaryTerms(source: string, terms: DictionaryTerm[]): DictionaryAuditHit[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source) as MdastNode;
  const aliases = terms
    .flatMap((term) => term.aliases.map((alias) => ({ term, alias })))
    .sort((left, right) => right.alias.length - left.alias.length);
  const hits: DictionaryAuditHit[] = [];

  /**
   * Walks eligible prose nodes while preserving exclusion boundaries.
   */
  function visit(node: MdastNode, excluded = false): void {
    const nextExcluded = excluded || excludedNodeTypes.has(node.type) || (node.type === 'code' && node.lang === 'mermaid');
    if (!nextExcluded && node.type === 'text' && node.value) {
      let cursor = 0;
      const lowerValue = node.value.toLowerCase();
      const protectedSourceRanges = protectedRanges(node.value);
      while (cursor < node.value.length) {
        const protectedRange = protectedSourceRanges.find((range) => cursor >= range.start && cursor < range.end);
        if (protectedRange) {
          cursor = protectedRange.end;
          continue;
        }
        const candidate = aliases.find(({ alias }) => {
          if (!lowerValue.startsWith(alias.toLowerCase(), cursor)) return false;
          return /[A-Za-z0-9]/.test(alias) ? hasAsciiBoundaries(node.value ?? '', cursor, alias.length) : true;
        });
        if (!candidate) {
          cursor += 1;
          continue;
        }
        const position = sourcePosition(node, node.value, cursor);
        hits.push({
          canonical: candidate.term.canonical,
          matched: node.value.slice(cursor, cursor + candidate.alias.length),
          ...position,
        });
        cursor += candidate.alias.length;
      }
    }
    node.children?.forEach((child) => visit(child, nextExcluded));
  }

  visit(tree);
  return hits;
}

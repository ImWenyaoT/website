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

/**
 * Returns whether an ASCII alias is bounded by non-word characters.
 */
function hasAsciiBoundaries(value: string, start: number, length: number): boolean {
  const before = value[start - 1] ?? '';
  const after = value[start + length] ?? '';
  return !/[A-Za-z0-9_-]/.test(before) && !/[A-Za-z0-9_-]/.test(after);
}

/**
 * Adds readable spacing when a canonical English link replaces Chinese prose.
 */
function linkedValue(source: string, start: number, end: number, canonical: string, url: string, alias: string): string {
  const link = `[${canonical}](${url})`;
  if (!/[\u3400-\u9fff]/u.test(alias)) return link;
  const before = source[start - 1] ?? '';
  const after = source[end] ?? '';
  const leading = /[A-Za-z0-9\u3400-\u9fff]/u.test(before) ? ' ' : '';
  const trailing = /[A-Za-z0-9\u3400-\u9fff]/u.test(after) ? ' ' : '';
  return `${leading}${link}${trailing}`;
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
      while (cursor < node.value.length) {
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

/**
 * Rewrites eligible MDX body occurrences as canonical outbound Dictionary links.
 */
export function linkDictionaryTerms(source: string, terms: DictionaryTerm[]): string {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source) as MdastNode;
  const aliases = terms
    .flatMap((term) => term.aliases.map((alias) => ({ term, alias })))
    .sort((left, right) => right.alias.length - left.alias.length);
  const replacements: Array<{ start: number; end: number; value: string }> = [];

  /**
   * Collects replacements from eligible text nodes without touching excluded syntax.
   */
  function visit(node: MdastNode, excluded = false): void {
    const nextExcluded = excluded || excludedNodeTypes.has(node.type) || (node.type === 'code' && node.lang === 'mermaid');
    if (!nextExcluded && node.type === 'text' && node.value && node.position?.start.offset !== undefined) {
      let cursor = 0;
      const lowerValue = node.value.toLowerCase();
      while (cursor < node.value.length) {
        const candidate = aliases.find(({ alias }) => {
          if (!lowerValue.startsWith(alias.toLowerCase(), cursor)) return false;
          return /[A-Za-z0-9]/.test(alias) ? hasAsciiBoundaries(node.value ?? '', cursor, alias.length) : true;
        });
        if (!candidate) {
          cursor += 1;
          continue;
        }
        const start = node.position.start.offset + cursor;
        replacements.push({
          start,
          end: start + candidate.alias.length,
          value: linkedValue(
            source,
            start,
            start + candidate.alias.length,
            candidate.term.canonical,
            candidate.term.url,
            candidate.alias,
          ),
        });
        cursor += candidate.alias.length;
      }
    }
    node.children?.forEach((child) => visit(child, nextExcluded));
  }

  visit(tree);
  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce((result, replacement) => {
      return `${result.slice(0, replacement.start)}${replacement.value}${result.slice(replacement.end)}`;
    }, source);
}

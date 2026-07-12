import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { satteri } from '@astrojs/markdown-satteri';
import { describe, expect, it } from 'vitest';
import { renderStaticMermaid, staticMermaid } from './staticMermaid';

/**
 * Recursively returns all MDX files in a directory.
 */
function mdxFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? mdxFiles(path) : path.endsWith('.mdx') ? [path] : [];
  });
}

/**
 * Extracts Mermaid fenced blocks from published MDX source.
 */
function mermaidBlocks(source: string): string[] {
  return [...source.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((match) => match[1] ?? '');
}

describe('Static Mermaid integration', () => {
  it('renders every published Mermaid block to inline SVG at build time', () => {
    const contentRoot = join(process.cwd(), 'src/content/docs');
    const diagrams = mdxFiles(contentRoot).flatMap((file) =>
      mermaidBlocks(readFileSync(file, 'utf8')),
    );

    expect(diagrams).toHaveLength(51);
    for (const diagram of diagrams) {
      const html = renderStaticMermaid(diagram);
      expect(html).toContain('<figure class="mermaid-static"');
      expect(html).toContain('<svg');
      expect(html).not.toContain('<script');
      expect(html).not.toContain('class="mermaid"');
    }
  });

  it('registers a build-time Markdown plugin and ignores other code fences', () => {
    const integration = staticMermaid();
    const setup = integration.hooks?.['astro:config:setup'];
    let updatedConfig: Record<string, unknown> | undefined;

    expect(setup).toBeTypeOf('function');
    setup?.({
      config: {
        markdown: {
          processor: satteri({ mdastPlugins: [{ name: 'existing-markdown-plugin' }] }),
        },
      },
      updateConfig(config: Record<string, unknown>) {
        updatedConfig = config;
      },
      logger: { info() {} },
    } as never);

    const processor = (updatedConfig as { markdown: { processor: ReturnType<typeof satteri> } })
      .markdown.processor;
    const plugins = processor.options?.mdastPlugins ?? [];
    const plugin = plugins.at(-1) as unknown as {
      code(node: {
        lang?: string | null;
        value: string;
      }): { type: 'html'; value: string } | undefined;
    };

    expect(plugins).toHaveLength(2);
    expect(plugin.code({ lang: 'ts', value: 'const value = 1;' })).toBeUndefined();
    expect(plugin.code({ lang: 'mermaid', value: 'flowchart LR\n  A --> B' })).toMatchObject({
      type: 'html',
    });
  });

  it('labels supported diagram types accurately for assistive technology', () => {
    expect(renderStaticMermaid('flowchart LR\n  A --> B')).toContain('aria-label="流程图"');
    expect(renderStaticMermaid('sequenceDiagram\n  A->>B: hello')).toContain('aria-label="序列图"');
    expect(renderStaticMermaid('stateDiagram-v2\n  [*] --> Ready')).toContain(
      'aria-label="状态图"',
    );
    expect(renderStaticMermaid('classDiagram\n  class User')).toContain('aria-label="图表"');
  });

  it('fails loudly when Astro is not using a valid Satteri processor', () => {
    const setup = staticMermaid().hooks?.['astro:config:setup'];
    const baseContext = { updateConfig() {}, logger: { info() {} } };

    expect(() => setup?.({ ...baseContext, config: { markdown: {} } } as never)).toThrow(
      "static-mermaid requires Astro's Satteri Markdown processor.",
    );

    expect(() =>
      setup?.({
        ...baseContext,
        config: { markdown: { processor: { name: 'satteri' } } },
      } as never),
    ).not.toThrow();
  });
});

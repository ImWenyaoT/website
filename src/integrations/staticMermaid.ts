import type { AstroIntegration } from 'astro';
import { satteri, type SatteriProcessorOptions } from '@astrojs/markdown-satteri';
import { renderMermaidSVG } from 'beautiful-mermaid';

/**
 * Returns an accessible Chinese label for the Mermaid diagram type.
 */
function diagramLabel(source: string): string {
  const declaration = source.trimStart().toLowerCase();
  if (declaration.startsWith('sequencediagram')) return '序列图';
  if (declaration.startsWith('statediagram')) return '状态图';
  if (declaration.startsWith('flowchart') || declaration.startsWith('graph')) return '流程图';
  return '图表';
}

/**
 * Renders one Mermaid definition as theme-aware, inline static SVG.
 */
export function renderStaticMermaid(source: string): string {
  const svg = renderMermaidSVG(source, {
    bg: 'var(--sl-color-bg)',
    fg: 'var(--sl-color-text)',
    accent: 'var(--sl-color-accent)',
    border: 'var(--sl-color-gray-5)',
    transparent: true,
  });
  return `<figure class="mermaid-static" aria-label="${diagramLabel(source)}">${svg}</figure>`;
}

/**
 * Returns a Satteri plugin that replaces Mermaid fences during Markdown compilation.
 */
function staticMermaidPlugin() {
  return {
    name: 'static-mermaid',
    code(node: { lang?: string | null; value: string }) {
      if (node.lang !== 'mermaid') return;
      return { type: 'html' as const, value: renderStaticMermaid(node.value) };
    },
  };
}

/**
 * Adds build-time Mermaid rendering to Astro's Markdown processor.
 */
export function staticMermaid(): AstroIntegration {
  return {
    name: 'static-mermaid',
    hooks: {
      'astro:config:setup': ({ config, updateConfig, logger }) => {
        const processor = config.markdown?.processor;
        if (processor?.name !== 'satteri') {
          throw new Error("static-mermaid requires Astro's Satteri Markdown processor.");
        }

        const options = (processor.options ?? {}) as SatteriProcessorOptions;
        updateConfig({
          markdown: {
            processor: satteri({
              ...options,
              mdastPlugins: [...(options.mdastPlugins ?? []), staticMermaidPlugin()],
            }),
          },
        });
        logger.info('Enabled build-time SVG rendering');
      },
    },
  };
}

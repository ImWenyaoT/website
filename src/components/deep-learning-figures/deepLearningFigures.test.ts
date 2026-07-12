import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const neuralNetworkDocsDir = join(process.cwd(), 'src/content/docs/model/neural-networks');
const figuresDir = join(process.cwd(), 'src/components/deep-learning-figures');

/**
 * Converts a project alias import into the file path used by inventory checks.
 */
function figureNames(): string[] {
  return readdirSync(figuresDir)
    .filter((file) => file.endsWith('Figure.astro'))
    .map((file) => file.replace('.astro', ''))
    .sort();
}

/**
 * Reads every neural-network MDX page that can host a deep learning figure.
 */
function readNeuralNetworkDocs(): string[] {
  return [
    'index.mdx',
    'neural-network-structure.mdx',
    'gradient-descent.mdx',
    'backpropagation.mdx',
    'gpt-transformer.mdx',
    'attention.mdx',
  ].map((file) => readFileSync(join(neuralNetworkDocsDir, file), 'utf8'));
}

describe('Deep learning figures', () => {
  it('tracks the migrated figure inventory behind one module', () => {
    expect(figureNames()).toEqual([
      'AttentionFlowFigure',
      'AttentionHeatmapFigure',
      'BackpropagationGraphFigure',
      'CausalMaskFigure',
      'GradientDescentPathFigure',
      'LearningRateComparisonFigure',
      'MinimalMlpFigure',
      'NeuronComputationFigure',
      'NextTokenShiftFigure',
      'TrainingLoopFigure',
      'TransformerPipelineFigure',
    ]);
  });

  it('records compact figures explicitly', () => {
    const compactFigures = figureNames().filter((name) =>
      readFileSync(join(figuresDir, `${name}.astro`), 'utf8').includes('dl-compact-figure'),
    );

    expect(compactFigures).toEqual(['AttentionHeatmapFigure', 'CausalMaskFigure']);
  });

  it('keeps neural-network MDX pages from owning raw dl-figure SVG implementation', () => {
    const docs = readNeuralNetworkDocs();

    expect(docs.every((doc) => !doc.includes('<svg class="dl-figure'))).toBe(true);
    for (const figure of figureNames()) {
      expect(docs.some((doc) => doc.includes(`<${figure} />`))).toBe(true);
    }
  });
});

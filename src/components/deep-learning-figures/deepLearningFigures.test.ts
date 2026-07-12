import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { deepLearningFigures } from './registry';

const neuralNetworkDocsDir = join(process.cwd(), 'src/content/docs/model/neural-networks');

/**
 * Converts a project alias import into the file path used by inventory checks.
 */
function pathForImport(importPath: string): string {
  return join(process.cwd(), importPath.replace('@/', 'src/'));
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
    expect(deepLearningFigures).toHaveLength(11);
    expect(deepLearningFigures.map((figure) => figure.name)).toEqual([
      'TrainingLoopFigure',
      'NeuronComputationFigure',
      'MinimalMlpFigure',
      'GradientDescentPathFigure',
      'LearningRateComparisonFigure',
      'BackpropagationGraphFigure',
      'NextTokenShiftFigure',
      'TransformerPipelineFigure',
      'CausalMaskFigure',
      'AttentionFlowFigure',
      'AttentionHeatmapFigure',
    ]);
  });

  it('keeps figure titles unique and addressable', () => {
    const titles = deepLearningFigures.map((figure) => figure.title);

    expect(new Set(titles).size).toBe(titles.length);
    expect(
      deepLearningFigures.every((figure) => existsSync(pathForImport(figure.importPath))),
    ).toBe(true);
  });

  it('records compact figures explicitly', () => {
    expect(
      deepLearningFigures
        .filter((figure) => figure.size === 'compact')
        .map((figure) => figure.name),
    ).toEqual(['CausalMaskFigure', 'AttentionHeatmapFigure']);
  });

  it('keeps neural-network MDX pages from owning raw dl-figure SVG implementation', () => {
    const docs = readNeuralNetworkDocs();

    expect(docs.every((doc) => !doc.includes('<svg class="dl-figure'))).toBe(true);
    for (const figure of deepLearningFigures) {
      expect(docs.some((doc) => doc.includes(`<${figure.name} />`))).toBe(true);
    }
  });
});

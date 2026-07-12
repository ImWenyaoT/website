import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Recursively returns files beneath a generated output directory.
 */
async function generatedFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(root, entry.name);
      return entry.isDirectory() ? generatedFiles(path) : Promise.resolve([path]);
    }),
  );
  return nested.flat();
}

/**
 * Fails when the built site regresses to client-rendered Mermaid diagrams.
 */
async function main(): Promise<void> {
  const files = await generatedFiles('dist');
  const html = (
    await Promise.all(
      files.filter((file) => file.endsWith('.html')).map((file) => readFile(file, 'utf8')),
    )
  ).join('\n');
  const scripts = (
    await Promise.all(
      files.filter((file) => file.endsWith('.js')).map((file) => readFile(file, 'utf8')),
    )
  ).join('\n');
  const staticFigures = html.match(/<figure class="mermaid-static"/g)?.length ?? 0;

  if (staticFigures !== 51) throw new Error(`Expected 51 static diagrams, found ${staticFigures}.`);
  if (html.includes('<pre class="mermaid"')) {
    throw new Error('Found a client-rendered Mermaid container in generated HTML.');
  }
  if (/mermaid\.render|registerLayoutLoaders|cytoscape/i.test(scripts)) {
    throw new Error('Found Mermaid runtime or layout code in generated JavaScript.');
  }
  if (!/--bg:\s*var\(--sl-color-bg\)/.test(html) || !/--fg:\s*var\(--sl-color-text\)/.test(html)) {
    throw new Error('Static diagrams are missing Starlight theme variables.');
  }

  process.stdout.write(`Verified ${staticFigures} static diagrams with no Mermaid runtime.\n`);
}

await main();

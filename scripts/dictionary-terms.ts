import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { auditDictionaryTerms } from '../src/dictionary/audit.ts';
import { dictionaryTerms } from '../src/dictionary/terms.ts';

const contentRoots = [
  'src/content/docs/model',
  'src/content/docs/harness',
  'src/content/docs/papers',
];

/**
 * Recursively returns MDX files beneath a content root.
 */
async function mdxFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(root, entry.name);
      return entry.isDirectory()
        ? mdxFiles(path)
        : Promise.resolve(path.endsWith('.mdx') ? [path] : []);
    }),
  );
  return nested.flat();
}

/**
 * Reports Dictionary term candidates in published Model and Harness prose.
 */
async function main(): Promise<void> {
  const files = (await Promise.all(contentRoots.map(mdxFiles))).flat().sort();
  let totalHits = 0;

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const hits = auditDictionaryTerms(source, dictionaryTerms);
    totalHits += hits.length;
    for (const hit of hits) {
      process.stdout.write(
        `${file}:${hit.line}:${hit.column} ${hit.matched} -> ${hit.canonical}\n`,
      );
    }
  }

  process.stdout.write(
    `Found ${totalHits} candidate occurrence(s) across ${files.length} file(s).\n`,
  );
  if (totalHits > 0) process.exitCode = 1;
}

await main();

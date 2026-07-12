import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = process.cwd();

/**
 * Reads a repository document through its project-relative path.
 */
function readDocument(path: string): string {
  return readFileSync(join(repositoryRoot, path), 'utf8');
}

describe('Documentation governance', () => {
  it('marks obsolete migration documents as non-executable historical records', () => {
    const obsoleteDocuments = [
      'docs/superpowers/specs/2026-07-01-blog-to-website-mkdocs-migration-design.md',
      'docs/superpowers/plans/2026-07-01-blog-to-website-mkdocs-migration.md',
      'docs/superpowers/specs/2026-07-11-astro-to-mkdocs-material-design.md',
    ];

    for (const document of obsoleteDocuments) {
      const source = readDocument(document).slice(0, 800);
      expect(source).toContain('不再执行');
      expect(source).toContain('0003-retain-astro-starlight.md');
    }
  });

  it('keeps the current platform decision explicit in the active ADR', () => {
    const adr = readDocument('docs/adr/0003-retain-astro-starlight.md');

    expect(adr).toContain("Keep Astro as the website's long-term platform.");
    expect(adr).toContain('Do not execute the proposed parity migration back to MkDocs Material.');
  });
});

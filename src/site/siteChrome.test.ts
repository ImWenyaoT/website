import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteChrome } from './siteChrome';

/**
 * Collects curated published-note slugs from nested sidebar items.
 */
function collectSidebarSlugs(items: unknown[]): string[] {
  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    if ('slug' in item && typeof item.slug === 'string') return [item.slug];
    if ('items' in item && Array.isArray(item.items)) return collectSidebarSlugs(item.items);
    return [];
  });
}

/**
 * Collects direct sidebar links from nested sidebar items.
 */
function collectSidebarLinks(items: unknown[]): string[] {
  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    if ('link' in item && typeof item.link === 'string') return [item.link];
    if ('items' in item && Array.isArray(item.items)) return collectSidebarLinks(item.items);
    return [];
  });
}

/**
 * Returns possible content collection paths for a Starlight slug.
 */
function contentPathsForSlug(slug: string): string[] {
  return [
    join(process.cwd(), 'src/content/docs', `${slug}.mdx`),
    join(process.cwd(), 'src/content/docs', slug, 'index.mdx'),
  ];
}

/**
 * Returns possible content collection paths for a direct Starlight link.
 */
function contentPathsForLink(link: string): string[] {
  const slug = link.replace(/^\/|\/$/g, '') || 'index';
  return contentPathsForSlug(slug);
}

/**
 * Checks whether any candidate path resolves to a published note.
 */
function hasPublishedNote(paths: string[]): boolean {
  return paths.some(existsSync);
}

describe('Site chrome', () => {
  it('exposes the published site identity through one interface', () => {
    expect(siteChrome()).toMatchObject({
      title: 'Tian "Edward" Wenyao',
      description: 'Model、Harness 与更多学习笔记。',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
    });
  });

  it('loads the site styles and strict link validation adapters', () => {
    const chrome = siteChrome();

    expect(chrome.customCss).toEqual(['./src/styles/site.css']);
    expect(chrome.plugins).toHaveLength(1);
    expect(chrome.plugins?.[0]?.name).toBe('starlight-links-validator');
  });

  it('keeps curated published notes visible in sidebar order', () => {
    const chrome = siteChrome();

    expect(collectSidebarSlugs(chrome.sidebar ?? [])).toEqual([
      'model',
      'model/neural-networks',
      'model/neural-networks/neural-network-structure',
      'model/neural-networks/gradient-descent',
      'model/neural-networks/backpropagation',
      'model/neural-networks/gpt-transformer',
      'model/neural-networks/attention',
      'model/neural-networks/attention-paper',
      'model/linear-algebra',
      'papers/react-paper',
      'papers/swe-agent-paper',
      'harness/minimal-swe-agent',
      'harness/openai',
      'harness/anthropic',
    ]);
  });

  it('points sidebar entries at existing published notes', () => {
    const chrome = siteChrome();
    const sidebar = chrome.sidebar ?? [];
    const slugs = collectSidebarSlugs(sidebar);
    const links = collectSidebarLinks(sidebar);

    expect(slugs.map(contentPathsForSlug).every(hasPublishedNote)).toBe(true);
    expect(links.map(contentPathsForLink).every(hasPublishedNote)).toBe(true);
  });

  it('keeps every paper registry entry backed by a PDF and published MDX usage', async () => {
    const { papers } = await import('../data/papers');
    const publishedSource =
      readFileSync(
        join(process.cwd(), 'src/content/docs/model/neural-networks/attention-paper.mdx'),
        'utf8',
      ) +
      readFileSync(join(process.cwd(), 'src/content/docs/papers/react-paper.mdx'), 'utf8') +
      readFileSync(join(process.cwd(), 'src/content/docs/papers/swe-agent-paper.mdx'), 'utf8');

    for (const slug of Object.keys(papers)) {
      expect(existsSync(join(process.cwd(), 'public/paper', `${slug}.pdf`))).toBe(true);
      expect(publishedSource).toContain(`<PdfViewer slug="${slug}" />`);
    }
  });

  it('does not allow Dictionary audit failures to be ignored by CI', () => {
    const workflow = readFileSync(join(process.cwd(), '.github/workflows/deploy.yml'), 'utf8');
    const auditStep = workflow.match(/- name: Audit Dictionary terms[\s\S]*?(?=\n\s+- name:)/)?.[0];

    expect(auditStep).toBeDefined();
    expect(auditStep).not.toContain('continue-on-error');
    expect(auditStep).toContain('run: pnpm dictionary:audit');
  });
});

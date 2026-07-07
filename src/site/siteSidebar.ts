import type { StarlightUserConfig } from '@astrojs/starlight/types';

/**
 * Returns the curated sidebar for the published notes.
 */
export function siteSidebar(): NonNullable<StarlightUserConfig['sidebar']> {
  return [
    { label: 'Home', link: '/' },
    {
      label: 'Model',
      items: [
        { slug: 'model' },
        {
          label: 'Neural Networks',
          items: [
            { slug: 'model/neural-networks' },
            { slug: 'model/neural-networks/neural-network-structure' },
            { slug: 'model/neural-networks/gradient-descent' },
            { slug: 'model/neural-networks/backpropagation' },
            { slug: 'model/neural-networks/gpt-transformer' },
            { slug: 'model/neural-networks/attention' },
            { slug: 'model/neural-networks/attention-paper' },
          ],
        },
        {
          label: 'Linear Algebra',
          items: [{ slug: 'model/linear-algebra' }],
        },
      ],
    },
    {
      label: 'Harness',
      items: [
        { slug: 'papers/react-paper' },
        { slug: 'papers/swe-agent-paper' },
        { slug: 'harness/minimal-swe-agent' },
        { slug: 'harness/openai' },
        { slug: 'harness/anthropic' },
      ],
    },
    { label: 'About', link: '/about/' },
  ];
}

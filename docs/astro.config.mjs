// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import mermaid from 'astro-mermaid';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages：site = 用户页域名，base = 仓库名
  site: 'https://imwenyaot.github.io',
  base: '/blog',

  integrations: [
    // astro-mermaid 必须在 starlight 之前，把 ```mermaid``` 代码块转成图（客户端渲染）
    mermaid({ theme: 'default', autoTheme: true }),
    starlight({
      title: 'Wenyao Notes',
      description: 'AI notes, code, papers, and systems.',
      customCss: ['./src/styles/global.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/ImWenyaoT',
        },
      ],
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
      },
      // 手动排序：按阅读顺序而非字母序
      sidebar: [
        {
          label: 'Deep Learning',
          items: [
            { label: 'Topic 导读', slug: 'notes/deep-learning' },
            'notes/deep-learning/neural-network-structure',
            'notes/deep-learning/gradient-descent',
            'notes/deep-learning/backpropagation',
            'notes/deep-learning/gpt-transformer',
            'notes/deep-learning/attention',
            'notes/deep-learning/attention-paper',
          ],
        },
        {
          label: 'AI Agent',
          items: [
            { label: 'Topic 导读', slug: 'notes/ai-agent' },
            'notes/topics/agent-basics',
            'notes/topics/implementation-boundaries',
            'notes/topics/long-term-memory',
          ],
        },
        {
          label: 'Papers',
          items: [
            'notes/papers/react',
            'notes/papers/react-paper',
            'notes/papers/swe-agent',
            'notes/papers/swe-agent-paper',
          ],
        },
      ],
    }),
    mdx({ gfm: true, optimize: true }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});

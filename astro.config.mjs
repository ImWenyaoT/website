// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import mermaid from 'astro-mermaid';

// 迁移目标（见 docs/superpowers/specs/2026-07-06-mkdocs-to-astro-starlight-design.md）：
// - site + base：GitHub Pages 项目站 https://imwenyaot.github.io/website/
// - trailingSlash:'always' + build.format:'directory'：对齐 mkdocs 的目录式尾斜杠 URL，保不变量
export default defineConfig({
  site: 'https://imwenyaot.github.io',
  base: '/website',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    // 客户端 Mermaid（懒加载 + 随亮/暗切换主题）。放 starlight 之前，
    // 由它把 ```mermaid 围栏转为客户端渲染容器，绕过 Expressive Code。
    mermaid({ theme: 'neutral', autoTheme: true }),
    starlight({
      title: 'Tian "Edward" Wenyao',
      description: 'Model、Harness 与更多学习笔记。',
      // 坏链校验：承接旧 mkdocs `--strict`，断链/断锚点即构建失败退出（迁移头号风险=内链反转）。
      // errorOnRelativeLinks:false —— 内链用相对路径（base 无关，站在 /website 下仍正确），
      // 验证器仍会校验它们解析到真实页面，安全网不丢。
      plugins: [starlightLinksValidator({ errorOnRelativeLinks: false })],
      // Geist 设计系统：先自托管字体（Fontsource variable），再 token/图示样式
      customCss: [
        '@fontsource-variable/geist/index.css',
        '@fontsource-variable/geist-mono/index.css',
        './src/styles/geist.css',
      ],
      // 侧边栏：显式复现旧 mkdocs 的话题式分组（跨目录，autogenerate 无法表达）。
      // 叶子用 slug → 标签自动取页面 title（结构显式、标签仍从 title 派生）。
      sidebar: [
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
      ],
    }),
  ],
});

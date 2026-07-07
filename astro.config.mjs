// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import { siteChrome } from './src/site/siteChrome.ts';

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
    starlight(siteChrome()),
  ],
});

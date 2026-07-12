// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { staticMermaid } from './src/integrations/staticMermaid.ts';
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
    // 构建期把 Mermaid 围栏转换为主题感知的静态 SVG，切页时无需客户端重绘。
    staticMermaid(),
    starlight(siteChrome()),
  ],
});

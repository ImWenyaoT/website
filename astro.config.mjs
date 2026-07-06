// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// 迁移目标（见 docs/superpowers/specs/2026-07-06-mkdocs-to-astro-starlight-design.md）：
// - site + base：GitHub Pages 项目站 https://imwenyaot.github.io/website/
// - trailingSlash:'always' + build.format:'directory'：对齐 mkdocs 的目录式尾斜杠 URL，保不变量
export default defineConfig({
  site: 'https://imwenyaot.github.io',
  base: '/website',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    starlight({
      title: 'Tian "Edward" Wenyao',
      description: 'Model、Harness 与更多学习笔记。',
      // 坏链校验：承接旧 mkdocs `--strict`，断链/断锚点即构建失败退出（迁移头号风险=内链反转）
      plugins: [starlightLinksValidator()],
      // Geist 设计系统：先自托管字体（Fontsource variable），再 token/图示样式
      customCss: [
        '@fontsource-variable/geist/index.css',
        '@fontsource-variable/geist-mono/index.css',
        './src/styles/geist.css',
      ],
    }),
  ],
});

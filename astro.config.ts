import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import mermaid from "astro-mermaid";

import { sidebar } from "./src/data/catalog";

/** 发布站：GitHub Pages 子路径 /website，目录式 URL 带尾斜杠。 */
export default defineConfig({
  site: "https://imwenyaot.github.io",
  base: "/website",
  trailingSlash: "always",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  build: {
    format: "directory",
  },
  integrations: [
    starlight({
      title: 'Tian "Edward" Wenyao',
      description: "Model 与 Harness 的结构化笔记：从原理到可验证的工程实践。",
      defaultLocale: "root",
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      favicon: "/favicon.svg",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/ImWenyaoT",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/ImWenyaoT/website/edit/main/",
      },
      customCss: ["./src/styles/content.css"],
      sidebar,
    }),
    mermaid({ autoTheme: true }),
  ],
});

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import mermaid from "astro-mermaid";

import { sidebar } from "./src/data/catalog";

/** 发布站：GitHub Pages 子路径 /website，目录式 URL 带尾斜杠。 */
export default defineConfig({
  site: "https://imwenyaot.github.io",
  base: "/website",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [
    starlight({
      title: 'Tian "Edward" Wenyao',
      description: "Model、Harness 与更多学习笔记。",
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

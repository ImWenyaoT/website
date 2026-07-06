import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// 单 docs collection（Starlight 约定）。schema 后续可 extend 增自有 frontmatter 键；
// 现阶段用原厂 docsSchema()（含 title 必填、description、sidebar.order/label）。
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};

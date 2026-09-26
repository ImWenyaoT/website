/** 已发布论文原文。slug 是页面与 PDF 文件之间的唯一接头。 */
export const papers = {
  attention: {
    title: "Attention Is All You Need",
    arxivId: "1706.03762",
    file: "attention.pdf",
  },
  react: {
    title: "ReAct: Synergizing Reasoning and Acting in Language Models",
    arxivId: "2210.03629",
    file: "react.pdf",
  },
  "swe-agent": {
    title: "SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering",
    arxivId: "2405.15793",
    file: "swe-agent.pdf",
  },
} as const;

export type PaperSlug = keyof typeof papers;

export type Paper = (typeof papers)[PaperSlug];

/**
 * 按 slug 取论文。未知 slug 直接抛错，避免静默生成坏的 PDF 地址。
 */
export function requirePaper(slug: string): Paper {
  if (!isPaperSlug(slug)) {
    throw new Error(`未知论文 slug：${slug}`);
  }
  return papers[slug];
}

/**
 * 拼出 base 下的 PDF 路径。调用方传入站点 base，页面深度不再影响地址。
 */
export function paperAssetPath(baseUrl: string, file: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${base}paper/${file}`;
}

/** slug 是否落在论文注册表里。 */
function isPaperSlug(slug: string): slug is PaperSlug {
  return Object.prototype.hasOwnProperty.call(papers, slug);
}

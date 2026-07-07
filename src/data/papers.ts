/**
 * 论文 registry：slug → 元数据。
 * <PdfViewer slug> 据此派生 arXiv 链接与本地 PDF 路径——把旧站三处逐字手抄的
 * <figure class="pdf-viewer"> 及深度耦合的 ../../ 路径收敛成单一真源（架构评审候选 1）。
 * PDF 已人名化（候选 2 落地）：文件名 = slug（public/paper/<slug>.pdf，由 PdfViewer 派生）；
 * arxivId 现仅用于 arXiv abs 链接。
 */
export interface Paper {
  /** arXiv id，用于派生 arXiv abs 链接（PDF 文件名走 slug，不再用 id） */
  arxivId: string;
  /** 论文标题（用于 caption 链接文本与 iframe title） */
  title: string;
}

export const papers = {
  react: {
    arxivId: '2210.03629',
    title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
  },
  'swe-agent': {
    arxivId: '2405.15793',
    title: 'SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering',
  },
  attention: {
    arxivId: '1706.03762',
    title: 'Attention Is All You Need',
  },
} satisfies Record<string, Paper>;

export type PaperSlug = keyof typeof papers;

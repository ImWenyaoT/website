/** 侧栏里的一个页面链接。href 为站点根相对路径，含首尾斜杠；首页为 /。 */
export interface NavLink {
  label: string;
  link: string;
}

/** 侧栏分组。分组本身不是页面。 */
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export type NavItem = NavLink | NavGroup;

/**
 * 策展目录。顺序对齐原 mkdocs nav：Home / Learn→Model|Harness / About。
 * 论文页在文件系统里不在 harness/ 下，但仍归入 Harness 分组。
 */
export const sidebar: NavItem[] = [
  { label: "Home", link: "/" },
  {
    label: "Learn",
    items: [
      {
        label: "Model",
        items: [
          { label: "Model", link: "/model/" },
          {
            label: "Neural Networks",
            items: [
              { label: "Neural Networks", link: "/model/neural-networks/" },
              {
                label: "神经网络的结构",
                link: "/model/neural-networks/neural-network-structure/",
              },
              {
                label: "梯度下降法",
                link: "/model/neural-networks/gradient-descent/",
              },
              {
                label: "反向传播算法",
                link: "/model/neural-networks/backpropagation/",
              },
              {
                label: "GPT 是什么？直观讲解 Transformer",
                link: "/model/neural-networks/gpt-transformer/",
              },
              {
                label: "直观解释注意力机制，Transformer 的核心",
                link: "/model/neural-networks/attention/",
              },
              {
                label: "Attention Is All You Need（原文）",
                link: "/model/neural-networks/attention-paper/",
              },
            ],
          },
          { label: "Linear Algebra", link: "/model/linear-algebra/" },
        ],
      },
      {
        label: "Harness",
        items: [
          { label: "Harness 核心篇", link: "/harness/" },
          { label: "ReAct（原文）", link: "/papers/react-paper/" },
          { label: "SWE-agent（原文）", link: "/papers/swe-agent-paper/" },
          { label: "Claude Code 架构解析", link: "/harness/claude-code/" },
          { label: "DeepSeek-Harness 实战", link: "/harness/deepseek/" },
        ],
      },
    ],
  },
  { label: "About", link: "/about/" },
];

/**
 * 深度优先收集侧栏页面链接。分组标签不产生 URL。
 */
export function collectLinks(items: readonly NavItem[]): string[] {
  const links: string[] = [];
  for (const item of items) {
    links.push(...linksFromItem(item));
  }
  return links;
}

/**
 * 把一条侧栏链接换成可能的内容文件。目录页优先 index.mdx，否则是同名 mdx。
 */
export function contentFileCandidates(link: string): readonly string[] {
  if (link === "/") {
    return ["src/content/docs/index.mdx"];
  }
  const slug = link.replace(/^\/|\/$/g, "");
  return [
    `src/content/docs/${slug}/index.mdx`,
    `src/content/docs/${slug}.mdx`,
  ];
}

/** 展开单个侧栏节点。未知形状在编译期失败。 */
function linksFromItem(item: NavItem): string[] {
  if (isGroup(item)) {
    return collectLinks(item.items);
  }
  if (isLink(item)) {
    return [item.link];
  }
  const unreachable: never = item;
  throw new Error(`未知侧栏项：${JSON.stringify(unreachable)}`);
}

/** 分组节点带 items，且本身没有 link。 */
function isGroup(item: NavItem): item is NavGroup {
  return "items" in item;
}

/** 页面节点带 link。 */
function isLink(item: NavItem): item is NavLink {
  return "link" in item;
}

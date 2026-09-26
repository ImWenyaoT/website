/** 侧栏里的一个页面链接。href 为站点根相对路径，含首尾斜杠；首页为 /。 */
export interface NavLink {
  label: string;
  link: string;
}

/** 侧栏分组。分组本身不是页面；可选默认折叠。 */
export interface NavGroup {
  label: string;
  collapsed?: boolean;
  items: NavItem[];
}

export type NavItem = NavLink | NavGroup;

/**
 * 策展目录：两层主线平铺（Model / Harness），去掉 Learn 套娃与「分组名=首页名」叠层。
 * 侧栏用短 label；页面标题仍在各自 frontmatter。
 * 论文页在文件系统里不在 harness/ 下，但仍归入 Harness。
 */
export const sidebar: NavItem[] = [
  { label: "Home", link: "/" },
  {
    label: "Model",
    items: [
      { label: "导读", link: "/model/" },
      {
        label: "Neural Networks",
        collapsed: true,
        items: [
          { label: "导读", link: "/model/neural-networks/" },
          {
            label: "网络结构",
            link: "/model/neural-networks/neural-network-structure/",
          },
          {
            label: "梯度下降",
            link: "/model/neural-networks/gradient-descent/",
          },
          {
            label: "反向传播",
            link: "/model/neural-networks/backpropagation/",
          },
          {
            label: "Transformer",
            link: "/model/neural-networks/gpt-transformer/",
          },
          {
            label: "注意力机制",
            link: "/model/neural-networks/attention/",
          },
          {
            label: "Attention 原文",
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
      { label: "导读", link: "/harness/" },
      { label: "ReAct 原文", link: "/papers/react-paper/" },
      { label: "SWE-agent 原文", link: "/papers/swe-agent-paper/" },
      { label: "Claude Code", link: "/harness/claude-code/" },
      { label: "DeepSeek-Harness", link: "/harness/deepseek/" },
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

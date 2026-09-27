import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { collectLinks } from "../src/data/catalog";
import { sidebar } from "../src/data/catalog";

const DOCS = "src/content/docs";

/** 列出已发布 mdx 的仓库相对路径。 */
function publishedFiles(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.name.endsWith(".mdx")) {
        found.push(path);
      }
    }
  };
  walk(DOCS);
  return found.sort();
}

/** 拆开 frontmatter 与正文。 */
function splitPage(source: string): { meta: string; body: string } {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/);
  if (!match) {
    throw new Error("缺少 frontmatter");
  }
  return { meta: match[1] ?? "", body: match[2] ?? "" };
}

describe("published pages", () => {
  const files = publishedFiles();
  const sources = files.map((file) => readFileSync(file, "utf8"));
  const joined = sources.join("\n");

  it("publishes exactly the curated 16 pages", () => {
    expect(files).toHaveLength(16);
    expect(collectLinks(sidebar)).toHaveLength(files.length);
  });

  it("gives every page a title and drops MkDocs-only markup", () => {
    for (const source of sources) {
      const { meta, body } = splitPage(source);
      expect(meta).toMatch(/^title:/m);
      expect(meta).not.toMatch(/^hide:/m);
      expect(body).not.toContain(".md-button");
      expect(body).not.toContain('class="pdf-viewer"');
      expect(body).not.toMatch(/\]\([^)]+\.md/);
    }
  });

  it("keeps teaching figures, mermaid, and three pdf viewers", () => {
    expect(joined.match(/class="dl-figure/g)?.length).toBe(11);
    expect(joined.match(/```mermaid/g)?.length).toBe(33);
    expect(joined.match(/<PdfViewer /g)?.length).toBe(3);
  });

  it("points internal links at curated routes", () => {
    const routes = new Set(collectLinks(sidebar));
    for (const source of sources) {
      const { body } = splitPage(source);
      for (const match of body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
        const href = (match[2] ?? "").split("#")[0]?.split("?")[0] ?? "";
        if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
          continue;
        }
        expect(href.startsWith("/"), href).toBe(true);
        expect(routes.has(href), href).toBe(true);
      }
    }
  });
});

describe("content css", () => {
  const css = readFileSync("src/styles/content.css", "utf8");

  it("maps teaching styles onto Starlight tokens without custom motion", () => {
    expect(css).toContain("var(--sl-color-accent)");
    expect(css).toContain("content-visibility: auto");
    expect(css).toContain("contain-intrinsic-size:");
    expect(css).toContain("--sl-font:");
    expect(css).toContain("PingFang SC");
    expect(css).not.toContain("--md-");
    expect(css).not.toContain("--ds-");
    expect(css).not.toContain("transition:");
    expect(css).not.toContain("animation:");
    expect(css).not.toContain("@keyframes");
  });

  it("hides embedded pdf frames on narrow screens", () => {
    expect(css).toMatch(
      /@media screen and \(max-width: 44\.9844em\)[\s\S]*\.pdf-frame\s*\{\s*display:\s*none;/,
    );
  });
});

describe("astro config", () => {
  const config = readFileSync("astro.config.ts", "utf8");

  it("publishes under the website base with trailing slashes", () => {
    expect(config).toContain('site: "https://imwenyaot.github.io"');
    expect(config).toContain('base: "/website"');
    expect(config).toContain('trailingSlash: "always"');
    expect(config).toContain("prefetchAll: true");
    expect(relative(".", join("src", "styles", "content.css"))).toBe(
      "src/styles/content.css",
    );
  });
});

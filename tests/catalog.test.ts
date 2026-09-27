import { existsSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  collectLinks,
  contentFileCandidates,
  sidebar,
} from "../src/data/catalog";
import { paperAssetPath, papers, requirePaper } from "../src/data/papers";

describe("catalog", () => {
  it("keeps the 16 curated pages and their source files", () => {
    const links = collectLinks(sidebar);
    expect(links).toHaveLength(16);
    expect(new Set(links).size).toBe(16);
    for (const link of links) {
      const candidates = contentFileCandidates(link);
      const found = candidates.filter((file) => existsSync(file));
      expect(found, link).toHaveLength(1);
    }
  });

  it("keeps Model and Harness as top-level tracks without a Learn shell", () => {
    const labels = sidebar.map((item) => item.label);
    expect(labels).toEqual(["Home", "Model", "Harness", "About"]);

    const model = sidebar.find((item) => item.label === "Model");
    expect(model && "items" in model).toBe(true);
    if (!model || !("items" in model)) {
      return;
    }
    expect(model.items[0]).toEqual({ label: "导读", link: "/model/" });
    const networks = model.items.find((item) => item.label === "Neural Networks");
    expect(networks && "items" in networks && networks.collapsed).toBe(true);

    const harness = sidebar.find((item) => item.label === "Harness");
    expect(harness && "items" in harness).toBe(true);
    if (!harness || !("items" in harness)) {
      return;
    }
    expect(harness.items.map((item) => ("link" in item ? item.link : ""))).toEqual([
      "/harness/",
      "/papers/react-paper/",
      "/papers/swe-agent-paper/",
      "/harness/claude-code/",
      "/harness/deepseek/",
    ]);
  });
});

describe("papers", () => {
  it("resolves every registered slug to a public pdf", () => {
    for (const slug of Object.keys(papers)) {
      const paper = requirePaper(slug);
      expect(paper.file.endsWith(".pdf")).toBe(true);
      expect(existsSync(`public/paper/${paper.file}`)).toBe(true);
      expect(paperAssetPath("/website/", paper.file)).toBe(
        `/website/paper/${paper.file}`,
      );
    }
  });

  it("adds a slash when base has none", () => {
    expect(paperAssetPath("/website", "react.pdf")).toBe("/website/paper/react.pdf");
  });

  it("rejects unknown slugs", () => {
    expect(() => requirePaper("missing")).toThrow(/未知论文 slug/);
  });
});

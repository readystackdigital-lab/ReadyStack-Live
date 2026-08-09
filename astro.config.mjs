// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

// Real <lastmod> for blog posts, read straight from frontmatter at build time.
// updatedDate wins when present, otherwise publishedDate.
const POSTS_DIR = fileURLToPath(new URL('./src/content/posts', import.meta.url));
/** @type {Map<string, string>} */
const postDates = new Map();
for (const file of fs.readdirSync(POSTS_DIR)) {
  if (!file.endsWith('.md')) continue;
  const src = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
  if (/^draft:\s*true/m.test(src)) continue;
  const date =
    src.match(/^updatedDate:\s*"?(\d{4}-\d{2}-\d{2})/m)?.[1] ??
    src.match(/^publishedDate:\s*"?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (date) postDates.set(`/blog/${file.replace(/\.md$/, '')}`, date);
}

const newestPost = [...postDates.values()].sort().pop();

/** @type {Record<string, [number, ChangeFreqEnum]>} */
// Crawl-budget tiers: conversion pages first, legal boilerplate last.
const TIERS = {
  '/': [1.0, ChangeFreqEnum.WEEKLY],
  '/estimate': [0.9, ChangeFreqEnum.MONTHLY],
  '/packages': [0.9, ChangeFreqEnum.MONTHLY],
  '/services': [0.9, ChangeFreqEnum.MONTHLY],
  '/contact': [0.8, ChangeFreqEnum.MONTHLY],
  '/blog': [0.8, ChangeFreqEnum.WEEKLY],
  '/how-it-works': [0.7, ChangeFreqEnum.MONTHLY],
  '/faqs': [0.7, ChangeFreqEnum.MONTHLY],
  '/social': [0.7, ChangeFreqEnum.MONTHLY],
  '/privacy': [0.2, ChangeFreqEnum.YEARLY],
  '/terms': [0.2, ChangeFreqEnum.YEARLY],
  '/acceptable-use': [0.2, ChangeFreqEnum.YEARLY],
};

// Pages CMS writes "Heading 1" as a Markdown H1, so post bodies arrive with the
// title repeated at the top and every section as another H1. The template
// already renders the one H1 a page should have: drop the repeated title and
// demote the rest to H2.
function fixBodyHeadings() {
  /** @param {{ children: { type: string, depth?: number }[] }} tree */
  return (tree) => {
    const first = tree.children[0];
    if (first && first.type === 'heading' && first.depth === 1) {
      tree.children.shift();
    }
    for (const node of tree.children) {
      if (node.type === 'heading' && node.depth === 1) node.depth = 2;
    }
  };
}

export default defineConfig({
  site: 'https://readystackdigital.com',
  output: 'static',
  trailingSlash: 'ignore',
  markdown: {
    remarkPlugins: [fixBodyHeadings],
  },
  integrations: [
    sitemap({
      serialize(item) {
        const route = new URL(item.url).pathname.replace(/\/$/, '') || '/';

        const postDate = postDates.get(route);
        if (postDate) {
          item.lastmod = `${postDate}T00:00:00.000Z`;
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.7;
          return item;
        }

        // The listing changes every time a post ships.
        if (route === '/blog' && newestPost) {
          item.lastmod = `${newestPost}T00:00:00.000Z`;
        }

        const tier = TIERS[route];
        if (tier) {
          item.priority = tier[0];
          item.changefreq = tier[1];
        }
        return item;
      },
    }),
  ],
});

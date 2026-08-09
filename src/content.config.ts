import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts authored via Pages CMS (https://pagescms.org), configured in .pages.yml.
// Each entry is a Markdown file under src/content/posts/ — frontmatter for the
// fields below, the `body` (rich-text) field as the Markdown file body.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // YAML parses unquoted dates (e.g. 2026-06-05) into Date objects, and
    // Keystatic writes them unquoted — normalise back to a YYYY-MM-DD string.
    publishedDate: z.preprocess(
      (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
      z.string(),
    ),
    // Optional: set when a post is materially revised, so search engines see a
    // fresh dateModified / sitemap lastmod without faking the published date.
    updatedDate: z.preprocess(
      // Pages CMS can write an empty/null value when the field is left blank.
      (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v || undefined),
      z.string().optional(),
    ),
    excerpt: z.string().optional(),
    coverImage: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { posts };

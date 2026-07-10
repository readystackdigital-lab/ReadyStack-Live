// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://readystackdigital.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      serialize(item) {
        // Prioritise the cost calculator as a key conversion page
        if (item.url.replace(/\/$/, '').endsWith('/estimate')) {
          item.changefreq = 'monthly';
          item.priority = 0.9;
          item.lastmod = new Date().toISOString();
        }
        return item;
      },
    }),
  ],
});

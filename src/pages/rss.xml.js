import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => data.draft === false)).sort(
    (a, b) => new Date(b.data.publishedDate).valueOf() - new Date(a.data.publishedDate).valueOf(),
  );

  return rss({
    title: 'ReadyStack Digital Blog',
    description:
      'Practical guides on websites, SEO, business email, security and social content for small businesses in Australia.',
    site: context.site,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: new Date(post.data.publishedDate),
      link: `/blog/${post.id}`,
    })),
    customData: '<language>en-au</language>',
  });
}

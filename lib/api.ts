import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import PostType from '../types/post';

const postsDirectory = join(process.cwd(), '_posts');

export function getPostSlugs(): string[] {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string, fields: string[] = []): PostType {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const post: PostType = {
    slug: realSlug,
    title: data.title || "",
    postDate: data.postDate || new Date().toISOString(),
    lastmod: data.lastmod || new Date().toISOString(),
    coverImage: data.coverImage || "",
    excerpt: data.excerpt || "",
    ogImage: data.ogImage || "",
    content,
    tags: data.tags || [],
  };

  return post;
}

export function getAllPosts(fields: string[] = []): PostType[] {
  const slugs = getPostSlugs();
  // sort posts by date in descending order
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => (post1.postDate > post2.postDate ? -1 : 1));
  return posts;
}

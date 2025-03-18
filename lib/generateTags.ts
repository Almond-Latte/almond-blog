// lib/generateTags.ts
import type Post from 'types/post';

export type Tag = { path: string; name: string };

export function generateTagsFromPosts(posts: Post[]): Tag[] {
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagSet.add(tag.toLowerCase());
    });
  });

  const tags: Tag[] = Array.from(tagSet).map((tag) => ({
    path: tag, 
    name: tag[0].toUpperCase() + tag.slice(1), 
  }));

  return tags;
}
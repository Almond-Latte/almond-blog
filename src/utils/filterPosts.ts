import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

/** HTB writeup かどうか判定 */
export function isHtbWriteup(post: BlogPost): boolean {
	return post.data.htbStatus != null;
}

/** Active な HTB writeup かどうか判定 */
export function isActiveWriteup(post: BlogPost): boolean {
	return post.data.htbStatus === 'active';
}

/** RSS 用：Active writeup を除外 */
export function getRssPosts(posts: BlogPost[]): BlogPost[] {
	return posts.filter((post) => !isActiveWriteup(post));
}

import type { Tag } from 'lib/tag';

type PostType = {
  slug: string;
  title: string;
  postDate: string;
  updateDate: string;
  coverImage: string;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;
  tags: string[];
};

export default PostType;

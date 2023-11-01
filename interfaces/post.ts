import type TableOfContent from './tableOfContent';

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
  tableOfContents: TableOfContent[];
};

export default PostType;

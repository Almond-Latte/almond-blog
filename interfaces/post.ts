import type TableOfContent from './tableOfContent';

type PostType = {
  slug: string;
  title: string;
  date: string;
  content: string;
  tableOfContents: TableOfContent[];
};

export default PostType;

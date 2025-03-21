import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeImageSize from '../lib/imgSize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify'
import rehypeCodeTitles from 'rehype-code-titles';
import rehypePrism from 'rehype-prism-plus';
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkAdmonitions from './remark-admonitions';
import { remark } from 'remark'

export const markdownToHtml = async (markdownContent: string): Promise<string> => {
  const result = unified()
  .use(remarkParse) // Parse markdown.
  .use(remarkGfm) // Support GFM (tables, autolinks, tasklists, strikethrough).
  .use(remarkMath) // math
  .use(remarkAdmonitions)
  .use(remarkRehype, { allowDangerousHtml: true }) // Turn it into HTML.
  .use(rehypeKatex) // katex
  .use(rehypeRaw) // raw HTML
  .use(rehypeImageSize) // get image size
  .use(rehypeSlug)
  .use(rehypeCodeTitles) // add code block titles
  .use(rehypePrism) // syntax hightlighting
  .use(rehypeStringify) // Serialize HTML.
  .processSync(markdownContent)
  .toString();
  return result;
};

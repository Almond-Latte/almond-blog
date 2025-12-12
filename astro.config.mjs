// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';

// https://astro.build/config
export default defineConfig({
	site: 'https://almond-latte.com',
	integrations: [
		expressiveCode({
			themes: ['dracula'],
			plugins: [pluginLineNumbers()],
			defaultProps: {
				showLineNumbers: false,
			},
			styleOverrides: {
				borderRadius: '8px',
				codeFontFamily: 'monospace',
			},
			frames: {
				removeCommentsWhenCopyingTerminalFrames: false,
			},
		}),
		mdx(),
		sitemap(),
	],
	markdown: {
		remarkPlugins: [remarkMath, remarkGithubBlockquoteAlert],
		rehypePlugins: [rehypeKatex],
	},
});

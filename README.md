# <img width="15" alt="icon" src="https://github.com/Almond-Latte/almond-blog/assets/147462539/d2aaba74-2559-4328-a495-51203a49238e">  almond-blog 

<img width="1893" alt="logo" src="https://github.com/Almond-Latte/almond-blog/assets/147462539/ceb3c63d-65ca-4613-aeb4-e10b4d96dc85">


[個人的な技術ブログ](https://almond-latte.com/)のソースコードです。

<h3 align="left">Languages and Tools:</h3>
<p align="left"> 
 <a href="https://nextjs.org/" target="_blank" rel="noreferrer"> <img src="https://cdn.worldvectorlogo.com/logos/nextjs-2.svg" alt="nextjs" width="40" height="40"/> </a><a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="40" height="40"/></p>

# 🚀 特徴

## Next.js + TypeScript製
[Next.js](https://nextjs.org/)とTypeScriptにより実装されています。

Next.jsは、Reactベースのフレームワークで、サーバーサイドレンダリング（SSR）や静的サイト生成（SSG）をサポートしています。
これによりパフォーマンスやSEO向上を図ることができます。

また、言語にはよりモダンなTypeScriptを採用しています。これは自身の学習のためです。サイトの性能には影響しません。


## SSGによる記事ページ生成
SSG(Static Site Generation)により静的な記事ページを生成しています。

SSGはサイトのビルド時にあらかじめHTMLファイルを生成し、これらを静的ファイルとして配信する方法です。これにより高速で安定したページリロードを可能にします。

## Markdownパーサー
Markdownパーサーにより、Markdownで書かれた記事をHTMLに変換しています。
Markdownパーサーの実装は以下のように行われています。
```ts
export const markdownToHtml = async (markdownContent: string): Promise<string> => {
  const result = unified()
  .use(remarkParse) // Parse markdown.
  .use(remarkGfm) // Support GFM (tables, autolinks, tasklists, strikethrough).
  .use(remarkRehype) // Turn it into HTML.
  .use(rehypeSlug)
  .use(rehypeCodeTitles) // add code block titles
  .use(rehypePrism) // syntax hightlighting
  .use(rehypeStringify) // Serialize HTML.
  .processSync(markdownContent)
  .toString();
  return result;
};
```

## Syntax Highglighting
上記のMarddownパーサーでは、HTMLに変換した後にHTML解析を行って[Prism.js](https://prismjs.com/)によるシンタックスハイライティングを行っています。

## SSRによるサイトマップ生成
SSR(Server Side Rendering)によりリアルタイムで動的なサイトマップ生成を行います。
サイトマップは https://almond-latte.com/sitemap.xml から取得できます。

## タグ機能
ブログ記事のタイトル下にあるタグをクリックすることで同じタグがついた記事を検索できます。

![image](https://github.com/Almond-Latte/almond-blog/assets/147462539/684e5ad0-4f4d-4d90-8e8c-7538cd7fac65)


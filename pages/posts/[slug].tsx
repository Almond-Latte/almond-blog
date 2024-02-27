import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Container from '../../components/container';
import PostBody from '../../components/post-body';
import PostTableOfContent from '../../components/post-tableOfContent';
import Header from '../../components/header';
import PostHeader from '../../components/post-header';
import Layout from '../../components/layout';
import { getPostBySlug, getAllPosts } from '../../lib/api';
import PostTitle from '../../components/post-title';
import Head from 'next/head';
import markdownToHtml from 'zenn-markdown-html';
import type PostType from '../../interfaces/post';
import type TableOfContent from '../../interfaces/tableOfContent';
import { JSDOM } from 'jsdom';
import type {} from 'typed-query-selector';
import tocStyles from '../../styles/tableOfContent-styles.module.css';
import { Alexandria } from 'next/font/google';
import { Tags, Tag, tagIconStyle } from 'lib/tag';
import Link from 'next/link';
import SectionSeparator from 'components/section-separator';

type Props = {
  post: PostType;
  morePosts: PostType[];
  preview?: boolean;
};

export default function Post({ post, /*morePosts,*/ preview }: Props) {
  const router = useRouter();
  const title = post.title;
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  if (typeof document !== 'undefined') {
    // intersectionの監視対象
    const contents = document.querySelectorAll('h1,h2');
    const toc = document.querySelectorAll('.toc');
    const tocMap = new Map();

    contents.forEach((content, i) => {
      // タイトルはスキップする
      if (i > 0) {
        tocMap.set(content, toc.item(i - 1));
        tocMap.set(toc.item(i - 1), content);
      }
    });

    const options = {
      root: null,
      rootMargin: '-1px 0px -99% 0px',
    };

    const intersectCallback = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          const currentActiveIndex = document.querySelector(`.${tocStyles.active}`);
          if (currentActiveIndex !== null) {
            currentActiveIndex.classList.remove(`${tocStyles.active}`);
          }
          tocMap.get(entry.target).classList.add(`${tocStyles.active}`);
        }
      });
    };

    const observer = new IntersectionObserver(intersectCallback, options);

    // コンテンツをIntersectionObserverに登録
    contents.forEach((content, i) => {
      // タイトルはスキップする
      if (i > 0) {
        observer.observe(content);
      }
    });
  }

  // ----------- タグを表示する ---------------
  const TagIcon = (tag: Tag, index: number) => (
    <div style={tagIconStyle.box} key={index}>
      <Link href={`/tags/${tag.path}`}>
        <button style={tagIconStyle.btn}>
          #{tag.name}
        </button>
      </Link>
    </div>
  );

  // ------- タグ解析 ---------
  const postTags = Tags.filter((tag: Tag) => (
    post.tags ? post.tags.includes(tag.name) : false
  ));

  return (
    <Layout preview={preview}>
      <div className='border-b'>
        <Container>
          <Header />
        </Container>
      </div>
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <PostHeader
              title={post.title}
              postDate={post.postDate}
              updateDate={post.updateDate}
            />
            <article>
              <Head>
                <title>{title}</title>
                <meta name='description' content='blog' />
              </Head>
              <div className='max-w-screen-xl mx-auto' id='article'>
                <div className='lg:flex justify-center'>
                  <div className='p-4 mb-20 bg-white znc'>
                    {postTags.map((pt) => (TagIcon(pt, 1)))}
                    <PostBody content={post.content} />
                  </div>
                  <PostTableOfContent tableOfContents={post.tableOfContents} />
                </div>
              </div>
            </article>
          </>
        )}
      </Container>
    </Layout>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'postDate',
    'updateDate',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
    'tags',
  ]);
  const content = markdownToHtml(post.content || '');

  // HTML(string)をHTML(DOM)に変換
  const domHtml = new JSDOM(content).window.document;

  // DOMから目次を検索，{hタグレベル，タイトル名，リンク先}，を取得する
  const elements = domHtml.querySelectorAll<HTMLElement>('h1, h2');
  const tableOfContents: TableOfContent[] = [];
  elements.forEach((element) => {
    const level = element.tagName;
    const title = element.innerHTML.split('</a> ')[1];
    const href = '#' + element.id;
    const record = { level: level, title: title, href: href };
    tableOfContents.push(record);
  });

  return {
    props: {
      post: {
        ...post,
        content,
        tableOfContents: tableOfContents,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug']);
  
  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}

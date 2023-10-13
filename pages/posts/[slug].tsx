import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import PostTableOfContent from '../../components/post-tableOfContent'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import markdownToHtml from 'zenn-markdown-html'
import type PostType from '../../interfaces/post'
import type TableOfContent from '../../interfaces/tableOfContent'
import { JSDOM } from "jsdom"

type Props = {
  post: PostType;
  morePosts: PostType[];
  preview?: boolean;
}

export default function Post({ post, morePosts, preview }: Props) {
  const router = useRouter()
  const title = post.title
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-16 znc">
              <Head>
                <title>{title}</title>
                <meta name="description" content="blog" />
              </Head>
              <div className='max-w-screen-lg mx-auto px-6 py-6' id='article'>
                <div className='flex flex-row'>
                  <div className='p-4 shadow-md rounded-xl mb-6 bg-white'>
                    <PostHeader
                     title={post.title}
                     date={post.date}
                    />
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
  )
}

type Params = {
  params: {
    slug: string
  }
}


export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ])
  const content = await markdownToHtml(post.content || '')

  // HTML(string)をHTML(DOM)に変換
  const domHtml = new JSDOM(content).window.document;

  // DOMから目次を検索，{hタグレベル，タイトル名，リンク先}，を取得する
  const elements = domHtml.querySelectorAll<HTMLElement>("h2, h3")
  const tableOfContents: TableOfContent[] = [];
  elements.forEach((element) => {
    const level = element.tagName;
    const title = element.innerHTML.split("</a> ")[1];
    const href = "#"+ element.id;
    console.log(href)
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
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}

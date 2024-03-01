import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Container from '../../components/container';
import PostBody from '../../components/post-body';
import PostHeader from '../../components/post-header';
import Layout from '../../components/layout';
import { getPostBySlug, getAllPosts } from '../../lib/api';
import PostTitle from '../../components/post-title';
import PostTOC from "components/post-toc"
import Head from 'next/head';
import { markdownToHtml } from 'lib/markdown-to-html';
import type PostType from '../../interfaces/post';
import type {} from 'typed-query-selector';
import { Tags, Tag, tagIconStyle } from 'lib/tag';
import Link from 'next/link';

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
                  <div className='p-4 mb-20 znc'>
                    {postTags.map((pt) => (TagIcon(pt, 1)))}
                    <PostBody content={post.content} />
                  </div>
                  <div className='sidebar hidden lg:block'>
                    <PostTOC />
                  </div>
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

  const content = await markdownToHtml(post.content);

  return {
    props: {
      post: {
        ...post,
        content,
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

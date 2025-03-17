// app/posts/[slug]/page.tsx

import Container from 'components/container';
import PostBody from 'components/post-body';
import PostHeader from 'components/post-header';
import Layout from 'components/SectionLayout';
import { getPostBySlug, getAllPosts } from 'lib/api';
import PostTOC from "components/post-toc"
import { markdownToHtml } from 'lib/markdown-to-html';
import type {} from 'typed-query-selector';
import PostTags from 'components/post-tags';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getAllPosts(['slug']);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, ["title", "excerpt"]);
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, [
    'title',
    'postDate',
    'lastmod',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
    'tags',
  ]);

  if (!post.slug) {
    notFound();
  }

  const content = await markdownToHtml(post.content);

  return (
    <Layout>
      <Container>
        <PostHeader
          title={post.title}
          postDate={post.postDate}
          lastmod={post.lastmod}
        />
        <div className="max-w-screen-xl mx-auto">
          <div className="lg:flex justify-center">
            <div className="p-8 mb-20">
              <div className="max-w-2xl">
                <PostTags tags={post.tags} />
                <PostBody content={content} />
              </div>
            </div>
            <aside className="hidden lg:block w-80">
              <PostTOC />
            </aside>
          </div>
        </div>
      </Container>
    </Layout>
  )
}

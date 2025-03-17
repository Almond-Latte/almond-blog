import Container from '../components/container';
import MoreStories from '../components/more-stories';
import HeroPost from '../components/hero-post';
import Intro from '../components/intro';
import Layout from '../components/SectionLayout';
import { getAllPosts } from '../lib/api';
import Head from 'next/head';
import Post from '../types/post';

export default async function Page() {
  const allPosts: Post[] = await getAllPosts([
    "title",
    "postDate",
    "lastmod",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);

  const heroPost = allPosts[0];
  const morePosts = allPosts.slice(1);

  return (
    <>
      <Layout>
        <Head>
          <title>Almond Latte&apos;s Blog</title>
        </Head>
        <Container>
          <Intro />
        </Container>
        <Container>
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              postDate={heroPost.postDate}
              lastmod={heroPost.lastmod}
              coverImage={heroPost.coverImage}
              excerpt={heroPost.excerpt}
              slug={heroPost.slug}
            />
          )}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </Layout>
    </>
  );
}

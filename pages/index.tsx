import Container from '../components/container';
import MoreStories from '../components/more-stories';
import HeroPost from '../components/hero-post';
import Intro from '../components/intro';
import Layout from '../components/layout';
import { getAllPosts } from '../lib/api';
import Head from 'next/head';
import Post from '../interfaces/post';
import { he } from 'date-fns/locale';

type Props = {
  allPosts: Post[];
};

export default function Index({ allPosts }: Props) {
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
              updateDate={heroPost.updateDate}
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

export const getStaticProps = async () => {
  const allPosts = getAllPosts([
    'title',
    'postDate',
    'updateDate',
    'slug',
    'author',
    'coverImage',
    'excerpt',
  ]);

  return {
    props: { allPosts },
  };
};

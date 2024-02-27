import { GetStaticPaths } from "next";
import { Tags, Tag } from "lib/tag";
import Container from 'components/container';
import Layout from 'components/layout';
import { getAllPosts } from 'lib/api';
import Head from 'next/head';
import Post from 'interfaces/post';
import { usePathname } from "next/navigation";
import ErrorPage from "next/error";
import SectionSeparator from "components/section-separator";
import PostPreview from "components/post-preview";
import Header from "components/header";

type Props = {
  allPosts: Post[];
};
export default function TaggedPost({ allPosts }: Props) {
  const path = usePathname().split('/')[2]
  const tag: (Tag | undefined) = Tags.find((t) => (t.path === path))
  if (tag === undefined) {
    return <ErrorPage statusCode={404} />;
  }
  const taggedPosts = [...allPosts.filter((post) => post.tags.includes(tag.name))]
     
  return (
    <Layout>
      <div className='border-b'>
        <Container>
          <Header />
        </Container>
      </div>
      <Container>
      <h2 className='m-8 text-3xl font-bold text-gray-800 text-center'>Posts tagged with <a className='text-amber-600'># {tag.name}</a></h2>
      <div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-5 xl:grid-cols-3 2xl:grid-cols-4 mb-32'>
        {taggedPosts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            postDate={post.postDate}
            updateDate={post.updateDate}
            coverImage={post.coverImage}
            excerpt={post.excerpt}
            slug={post.slug}
          />
        ))}
      </div>
      </Container>
    </Layout>
  );
}

type Params = {
  params: {
    tag: string;
  };
};

export async function getStaticProps( { params }: Params) {
  const allPosts = getAllPosts([
    'title',
    'postDate',
    'updateDate',
    'slug',
    'author',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  return {
    props: { allPosts },
  };
};

export async function getStaticPaths() {
    return {
      paths: Tags.map((tag) => {
        return {
          params: {
            tag: tag.path,
          },
        };
      }),
      fallback: false,
    };
}

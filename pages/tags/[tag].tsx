import { Tags, Tag } from "lib/tag";
import Container from 'components/container';
import Layout from 'components/layout';
import { getAllPosts } from 'lib/api';
import Post from 'interfaces/post';
import { usePathname } from "next/navigation";
import ErrorPage from "next/error";
import PostPreview from "components/post-preview";

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
      <Container>
      <h2 className='m-24 text-3xl font-bold text-gray-800 text-center'>Posts tagged with <a className='text-amber-600'># {tag.name}</a></h2>
      <div className="divide-y divide-gray-200">
        {taggedPosts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            postDate={post.postDate}
            lastmod={post.lastmod}
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
    'lastmod',
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

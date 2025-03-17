import PostPreview from './post-preview';
import type Post from '../types/post';
import SectionSeparator from './section-separator';

type Props = {
  posts: Post[];
};

const MoreStories = ({ posts }: Props) => {
  return (
    <section className='p-5'>
      <SectionSeparator />
      <h2 className='mb-8 text-3xl font-bold text-gray-800 text-center'>Archive</h2>
      <div className='divide-y divide-gray-300'>
      {posts.map((post) => (
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
    </section>
  );
};

export default MoreStories;

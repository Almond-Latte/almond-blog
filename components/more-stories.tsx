import PostPreview from './post-preview';
import type Post from '../interfaces/post';
import SectionSeparator from './section-separator';

type Props = {
  posts: Post[];
};

const MoreStories = ({ posts }: Props) => {
  return (
    <section className='p-5'>
      <SectionSeparator />
      <h2 className='mb-8 text-3xl font-bold text-gray-800 text-center'>Archive</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-5 xl:grid-cols-3 2xl:grid-cols-4 mb-32'>
        {posts.map((post) => (
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
    </section>
  );
};

export default MoreStories;

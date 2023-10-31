import PostPreview from './post-preview';
import type Post from '../interfaces/post';

type Props = {
  posts: Post[];
};

const MoreStories = ({ posts }: Props) => {
  return (
    <section className='px-5'>
      <h2 className='mb-8 text-6xl font-bold'>その他の記事</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-32 gap-y-20 md:gap-y-32 mb-32'>
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            postDate={post.postDate}
            updateDate={post.updateDate}
            slug={post.slug}
          />
        ))}
      </div>
    </section>
  );
};

export default MoreStories;

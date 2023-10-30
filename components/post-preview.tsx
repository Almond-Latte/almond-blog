import PostDate from './post-date';
import Link from 'next/link';

type Props = {
  title: string;
  postDate: string;
  updateDate: string;
  slug: string;
};

const PostPreview = ({ title, postDate, updateDate, slug }: Props) => {
  return (
    <div>
      <h3 className='text-3xl mb-3 leading-snug'>
        <Link as={`/posts/${slug}`} href='/posts/[slug]' className='hover:underline'>
          {title}
        </Link>
      </h3>
      <div className='text-lg mb-4'>
        <PostDate postDate={postDate} updateDate={updateDate} />
      </div>
    </div>
  );
};

export default PostPreview;

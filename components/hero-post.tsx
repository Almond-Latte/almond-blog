import PostDate from './post-date';
// import CoverImage from './cover-image';
import Link from 'next/link';

type Props = {
  title: string;
  postDate: string;
  updateDate: string;
  slug: string;
};

const HeroPost = ({ title, postDate, updateDate, slug }: Props) => {
  return (
    <section>
      <div className='md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28'>
        <div>
          <h3 className='mb-4 text-4xl lg:text-5xl leading-tight'>
            <Link as={`/posts/${slug}`} href='/posts/[slug]' className='hover:underline'>
              {title}
            </Link>
          </h3>
          <div className='mb-4 md:mb-0 text-lg'>
            <PostDate postDate={postDate} updateDate={updateDate} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroPost;

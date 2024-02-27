import PostDate from './post-date';
// import CoverImage from './cover-image';
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  title: string;
  excerpt: string;
  postDate: string;
  updateDate: string;
  coverImage: string;
  slug: string;
};

const HeroPost = ({ title, excerpt, postDate, updateDate, coverImage, slug }: Props) => {
  return (
    <section className='p-5'>
      <div className='w-full max-w-screen flex-row rounded-xl bg-white bg-clip-border text-zinc-700 shadow-md'>
        <div className='p-6'>
          <h6 className='mb-4 text-base antialiased font-semibold text-amber-600'>NEW POST</h6>
          <a href={`/posts/${slug}`}>
            <h4 className='block mb-2 font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900'>
              {title}
            </h4>
          </a>
          <p className='block mb-8 font-sans text-base antialiased font-normal leading-relaxed text-gray-700'>
            {excerpt}
          </p>
          <div className='flex justify-end'>
            <a className='inline-block' href={`/posts/${slug}`}>
              <button
                className='flex items-center gap-2 px-6 py-3 text-xs font-bold text-center text-amber-600 align-middle transition-all rounded-lg hover:bg-amber-500/10'
                type='button'
              >
                READ MORE
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke-width='2'
                  stroke='currentColor'
                  aria-hidden='true'
                  className='w-4 h-4'
                >
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    d='M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3'
                  ></path>
                </svg>
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroPost;

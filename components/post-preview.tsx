import PostDate from './post-date';
import Link from 'next/link';
import Image from 'next/image';
import imagess from '../public/assets/blog/coverImage/UbuntuServerSetup2023.svg';
import dynamic from 'next/dynamic';
import Container from './container';
import { sl } from 'date-fns/locale';

type Props = {
  title: string;
  postDate: string;
  lastmod: string;
  coverImage: string;
  excerpt: string;
  slug: string;
};

const PostPreview = ({
  title,
  postDate,
  lastmod,
  coverImage = '/assets/blog/coverImage/noImage.svg',
  excerpt,
  slug,
}: Props) => {
  return (
    <div className='py-5'>
      <div className='w-full rounded-lg bg-white text-zinc-700'>
        <div className='p-5'>
          <a href={`/posts/${slug}`}>
            <h5 className='font-bold text-2xl traking-tight mb-2 line-clamp-2'>{title}</h5>
          </a>
          <p className='font-normal mb-3 line-clamp-3'>{excerpt}</p>
          <div className='text-center mb-4'>
            <PostDate postDate={postDate} lastmod={lastmod} />
          </div>
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
    </div>
  );
};

export default PostPreview;

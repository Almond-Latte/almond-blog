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
  updateDate: string;
  coverImage: string;
  excerpt: string;
  slug: string;
};

const PostPreview = ({
  title,
  postDate,
  updateDate,
  coverImage = '/assets/blog/coverImage/noImage.svg',
  excerpt,
  slug,
}: Props) => {
  return (
    <div className='max-w-md mx-auto'>
      <div className='bg-white shadow-md border border-gray-200 rounded-lg max-w-sm mb-5'>
        <a href={`/posts/${slug}`}>
          <Image
            src={coverImage}
            alt=''
            width={1920}
            height={1080}
            layout='responsive'
            className='rounded-lg'
          />
        </a>
        <div className='p-5'>
          <a href={`/posts/${slug}`}>
            <h5 className='text-zinc-700 font-bold text-2xl tracking-tight mb-2 line-clamp-2'>
              {title}
            </h5>
          </a>
          <p className='font-normal text-gray-700 mb-3 line-clamp-3'>{excerpt}</p>
          <div className='text-lg  mb-4 text-center'>
            <PostDate postDate={postDate} updateDate={updateDate} />
          </div>
          <a
            className='flex gap-2 px-6 w-40 py-3 text-xs font-bold text-amber-600 transition-all rounded-lg hover:bg-amber-500/10'
            href={`/posts/${slug}`}
          >
            READ MORE
            <svg
              className='w-3.5 h-3.5 ml-2'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 14 10'
            >
              <path
                stroke='currentColor'
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M1 5h12m0 0L9 1m4 4L9 9'
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;

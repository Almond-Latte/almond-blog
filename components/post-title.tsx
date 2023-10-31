import { ReactNode } from 'react';
import Image from 'next/image';

type Props = {
  children?: ReactNode;
};

const PostTitle = ({ children }: Props) => {
  return (
    <div className='flex justify-center'>
      <img src='/favicon/android-chrome-192x192.png' className='w-12 h-12 mx-4 rounded-full' />
      <h1 className='text-3xl font-bold text-zinc-800 my-auto'>{children}</h1>
    </div>
  );
};

export default PostTitle;

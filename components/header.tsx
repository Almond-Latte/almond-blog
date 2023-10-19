import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <div className='mb-5 mt-5'>
      <Link href='/'>
        <Image src='/favicon/icon.png' alt='Logo' width={300} height={100} />
      </Link>
    </div>
  );
};

export default Header;

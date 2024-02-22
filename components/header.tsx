import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <div className='pl-8 pb-3 pt-3'>
      <Link href='/'>
        <Image src='/favicon/logo.png' alt='Logo' width={200} height={32} />
      </Link>
    </div>
  );
};

export default Header;

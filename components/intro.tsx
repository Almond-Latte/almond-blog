import Image from 'next/image';
const Intro = () => {
  return (
    <section className='flex flex-col items-center pt-20 mb-16 '>
      <Image src='/favicon/logo_alpha.png' alt='Logo' width={400} height={116} />
      <h4 className='text-center text-lg  md:pl-8'>いっぱんだいがくせいの技術ブログ</h4>
    </section>
  );
};

export default Intro;

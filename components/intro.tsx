import Image from 'next/image';
const Intro = () => {
  return (
    <section className='flex-col flex items-center mt-16 mb-16 '>
      <Image src='/favicon/icon.png' alt='Logo' width={300} height={100} />
      <h4 className='text-center md:text-left text-lg mt-5 md:pl-8'>
        いっぱんだいがくせいの技術ブログ
      </h4>
    </section>
  );
};

export default Intro;

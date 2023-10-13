import Image from 'next/image';
const Intro = () => {
  return (
    <section className='flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12'>
      <Image src='/favicon/icon.png' alt='Logo' width={300} height={100} />
      <h4 className='text-center md:text-left text-lg mt-5 md:pl-8'>
        いっぱんだいがくせいの技術ブログ
      </h4>
    </section>
  );
};

export default Intro;

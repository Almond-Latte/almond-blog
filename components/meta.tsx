import Head from 'next/head';

const Meta = () => {
  return (
    <Head>
      <link rel='apple-touch-icon' sizes='180x180' href='/favicon/apple-touch-icon.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon/favicon-16x16.png' />
      <link rel='manifest' href='/favicon/site.webmanifest' />
      <link rel='mask-icon' href='/favicon/safari-pinned-tab.svg' color='##ffc40d' />
      <link rel='shortcut icon' href='/favicon/favicon.ico' />
      <meta name='msapplication-TileColor' content='#ffc40d' />
      <meta name='msapplication-config' content='/favicon/browserconfig.xml' />
      <meta name='theme-color' content='#ffffff' />
      <link rel='alternate' type='application/rss+xml' href='/feed.xml' />
      <meta
        name='description'
        content='日常生活で気になったことや技術的な備忘録を残していくブログ。普段は大学でマルウェア検出の研究をしています。機械学習や競プロ、Linuxに興味があります。'
      />
    </Head>
  );
};

export default Meta;

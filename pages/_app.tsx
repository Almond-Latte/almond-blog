import { AppProps } from 'next/app';
import '../styles/index.css';
import 'zenn-content-css';
import React, { useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  useEffect(() => {
    import('zenn-embed-elements'); // 数式をブラウザでレンダリングできるように
  }, []);
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
};
export default MyApp;

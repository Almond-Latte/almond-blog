import { AppProps } from 'next/app';
import '../styles/index.css';
import '../styles/prism.css';
import 'zenn-content-css';
import React, { useEffect } from 'react';
import { Inter, Source_Code_Pro } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const code = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
  display: 'swap',
});

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  useEffect(() => {
    import('zenn-embed-elements'); // 数式をブラウザでレンダリングできるように
  }, []);
  return (
    <main className={`${inter.className} ${code.variable}`}>
      <Component {...pageProps} />
    </main>
  );
};
export default MyApp;

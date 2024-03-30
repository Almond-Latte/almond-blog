import { AppProps } from 'next/app';
import 'github-markdown-css/github-markdown-light.css';
import '../styles/prism.css';
import '../styles/index.css';
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
  return (
    <main className={`${inter.className} ${code.variable}`}>
      <Component {...pageProps} />
    </main>
  );
};
export default MyApp;

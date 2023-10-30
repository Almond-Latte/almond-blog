import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='jp'>
      <Head>
        <script src='https://embed.zenn.studio/js/listen-embed-event.js' defer />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

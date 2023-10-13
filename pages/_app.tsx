import { AppProps } from 'next/app'
import '../styles/index.css'
import 'zenn-content-css'
import { useEffect } from 'react'
import { Noto_Sans_JP } from 'next/font/google'

const notojp = Noto_Sans_JP({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap'
})

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    import("zenn-embed-elements"); // 数式をブラウザでレンダリングできるように
  }, []);
  return (
    <main className={notojp.className}>
      <Component {...pageProps} />
    </main>
  )
}

import { AppProps } from 'next/app'
import '../styles/index.css'
import 'zenn-content-css'
import { useEffect } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
})

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    import("zenn-embed-elements"); // 数式をブラウザでレンダリングできるように
  }, []);
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  )
}

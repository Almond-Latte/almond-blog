// app/layout.tsx
import 'github-markdown-css/github-markdown-light.css';
import '../styles/prism.css';
import '../styles/index.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Almond Latte&apos;s Blog',
  description: '大学生の技術ブログ',
  openGraph: {
    title: 'Almond Latte&apos;s Blog',
    description: '大学生の技術ブログ',
    url: 'https://almond-latte.com',
    images: [
      {
        url: 'https://almond-latte.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Almond Latte&apos;s Blog',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="jp">
      <body>{children}</body>
    </html>
  )
}

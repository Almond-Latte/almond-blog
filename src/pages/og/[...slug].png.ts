import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title, pubDate: post.data.pubDate, htbStatus: post.data.htbStatus },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, pubDate, htbStatus } = props as { title: string; pubDate: Date; htbStatus?: string };
  const isHtb = htbStatus != null;

  // Load bundled font to avoid network dependency during build.
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Bold.otf');
  const fontBuffer = fs.readFileSync(fontPath);
  const fontData = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength
  );

  const formattedDate = pubDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Load logo as base64
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  const defaultCard = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5c9a8 0%, #e8a878 100%)',
        padding: '40px',
      },
      children: {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', gap: '16px' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '64px',
                        fontWeight: 700,
                        color: '#1a1a2e',
                        lineHeight: 1.4,
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                      },
                      children: title,
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                children: [
                  {
                    type: 'div',
                    props: { style: { fontSize: '24px', color: '#6b7280' }, children: formattedDate },
                  },
                  {
                    type: 'img',
                    props: { src: logoBase64, style: { height: '56px' } },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  };

  const htbCard = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(150deg, #2c3e50 0%, #34495e 50%, #2c3530 100%)',
        padding: '40px',
      },
      children: {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #344250 0%, #3b4d62 100%)',
            borderRadius: '24px',
            padding: '48px',
            border: '1px solid rgba(159, 239, 0, 0.12)',
          },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', gap: '16px' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '64px',
                        fontWeight: 700,
                        color: '#f0f4f8',
                        lineHeight: 1.4,
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                      },
                      children: title,
                    },
                  },
                  // Green accent line
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '400px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #9fef00, rgba(159, 239, 0, 0.2))',
                        borderRadius: '2px',
                      },
                      children: '',
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                children: [
                  {
                    type: 'div',
                    props: { style: { fontSize: '24px', color: '#94a3b8' }, children: formattedDate },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 18px',
                        background: '#f5f0e8',
                        borderRadius: '14px',
                      },
                      children: {
                        type: 'img',
                        props: { src: logoBase64, style: { height: '56px' } },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  };

  const svg = await satori(
    isHtb ? htbCard : defaultCard,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

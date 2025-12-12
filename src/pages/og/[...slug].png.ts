import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { loadDefaultJapaneseParser } from 'budoux';
import satori from 'satori';
import sharp from 'sharp';

const parser = loadDefaultJapaneseParser();

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title, pubDate: post.data.pubDate },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, pubDate } = props as { title: string; pubDate: Date };

  // Fetch Noto Sans JP font from Google Fonts
  const fontResponse = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap'
  );
  const css = await fontResponse.text();
  const fontUrlMatch = css.match(/src: url\(([^)]+)\)/);

  let fontData: ArrayBuffer;
  if (fontUrlMatch) {
    const fontUrl = fontUrlMatch[1];
    const fontRes = await fetch(fontUrl);
    fontData = await fontRes.arrayBuffer();
  } else {
    // Fallback: use a simple font if Google Fonts fails
    throw new Error('Failed to load font');
  }

  const formattedDate = pubDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Use BudouX to parse the title into segments for natural line breaking
  const titleSegments = parser.parse(title);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #e67e22 0%, #c45d00 100%)',
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
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '64px',
                          fontWeight: 700,
                          color: '#1a1a2e',
                          lineHeight: 1.4,
                          display: 'flex',
                          flexWrap: 'wrap',
                        },
                        children: titleSegments.map((segment) => ({
                          type: 'span',
                          props: {
                            style: { display: 'block' },
                            children: segment,
                          },
                        })),
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '24px',
                          color: '#6b7280',
                        },
                        children: formattedDate,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '28px',
                          fontWeight: 700,
                          color: '#e67e22',
                        },
                        children: 'Almond Blog',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
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

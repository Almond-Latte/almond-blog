// app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import generateSitemapXml from '@/lib/generate-sitemap';

export async function GET() {
  const xml = await generateSitemapXml();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}

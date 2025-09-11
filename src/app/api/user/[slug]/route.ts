// file: src/app/api/user/[slug]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  // `params.slug` 就是你访问的路径中动态的部分
  // 例如，访问 /api/user/john，则 params.slug = 'john'
  // 访问 /api/user/profile，则 params.slug = 'profile'

  return NextResponse.json({
    message: `You requested data for: ${params.slug}`,
    slug: params.slug
  });
}
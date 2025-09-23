import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路由
const protectedRoutes = [
  '/strategy-log',
];

// API路由需要认证
const protectedApiRoutes = [
  '/api/strategy-log',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是受保护的页面路由
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // 检查是否是受保护的API路由
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isProtectedApiRoute) {
    // 检查Authorization header (用于API路由)
    const authHeader = request.headers.get('authorization');

    // 检查cookie中的token (用于页面路由)
    const token = request.cookies.get('auth_token')?.value;

    // 如果都没有token，返回401错误（对于所有受保护路由）
    if (!authHeader && !token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', code: 401 },
        { status: 401 }
      );
    }

    // 如果有Authorization header，验证token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // 这里可以添加token验证逻辑，但由于是中间件，我们会在API路由中处理
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

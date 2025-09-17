import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 处理 GET 请求
export function GET(request: NextRequest) {
  return NextResponse.json({ name: 'John Doe' });
}

// // 处理 POST 请求
// export function POST(request: NextRequest) {
//   // ... 处理 POST 逻辑
//   return NextResponse.json({ received: true });
// }
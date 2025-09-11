// file: src/app/api/user/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequest } from '@/app/lib/validateRequest';
import {klinesSchema} from '@/app/lib/schemas';
// 处理 GET 请求
export async function GET(request: NextRequest) {
    let resData;
     // 校验请求
  const { data, errorResponse } = await validateRequest(request, klinesSchema);
  if (errorResponse) return errorResponse;
    const {symbol, interval, limit} = data;
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      if (!response.ok) {
        resData = {
          ok: false,
          description: `API请求失败: ${response.status} - ${response.statusText}`
        };
      }
      resData = await response.json();
      resData.ok = true;
    } catch (error) {
      resData = {
        ok: false,
        description: `错误信息: ${(error as Error).message}`
      };
    } finally {
        return NextResponse.json(resData);
    }
}

// // 处理 POST 请求
// export function POST(request: NextRequest) {
//   // ... 处理 POST 逻辑
//   return NextResponse.json({ received: true });
// }
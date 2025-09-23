// file: src/app/api/user/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequest } from '@/app/lib/validateRequest';
import {klinesSchema} from '@/app/lib/schemas';
import { ApiResponseUtil } from '@/lib/api-response';
// 处理 GET 请求
export async function GET(request: NextRequest) {
     // 校验请求
  const { data, errorResponse } = await validateRequest(request, klinesSchema);
  if (errorResponse) return errorResponse;
    const {symbol, interval, limit} = data;
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );

      const resData = await response.json();
      if (resData.code===0) {
        return NextResponse.json(ApiResponseUtil.error('Binance API error', resData.msg || 'Unknown error', 400));
      } else {
        return NextResponse.json(ApiResponseUtil.success({ klines: resData }, 'Klines data retrieved successfully'));
      }
    } catch (error) {
      return NextResponse.json(ApiResponseUtil.serverError((error as Error).message));
    }
}
// 配置该函数优先在东京和新加坡运行
export const config = {
  regions: ['hkg1','sin1','hnd1','icn1']
};
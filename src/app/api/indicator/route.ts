import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { KLineTableData } from '../KLineDate';
import { Query } from '../../db/getLocalCryptoData';
import {qwenMax, deepseek} from '../qwen_max'
import { calculateIndicators } from './calculate';
import { number } from 'zod/v4';
import { ApiResponseUtil } from '@/lib/api-response';

function chunkArray<T>(arr: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }
  
  return arr.reduce((result: T[][], item: T, index: number) => {
    const chunkIndex = Math.floor(index / size);
    
    if (!result[chunkIndex]) {
      result[chunkIndex] = []; // 初始化新分块
    }
    
    result[chunkIndex].push(item);
    return result;
  }, []);
}

async function collectData(data: KLineTableData[][]) {
    const ai_results = [];
    const ai_results_map = new Map<number, any>();
    for (const item of data) {
        const res = calculateIndicators(item);
        ai_results_map.set(item[0]['id'], await qwenMax(JSON.stringify(res)));
    }
    // console.log('ai_results_map', ai_results_map);
    // 这里可以添加数据收集的逻辑
    return { message: '数据收集完成', results: Array.from(ai_results_map.values()) };
}
// 处理 GET 请求
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const tableName = searchParams.get('tableName');
    const offset = searchParams.get('offset') || '1';
    if (!tableName) {
        return NextResponse.json(ApiResponseUtil.error('Missing tableName parameter', undefined, 400), { status: 400 });
    }
    try {
        const query = Query<KLineTableData>(tableName);

        const data = await query.limit(74 * Number(offset)).get();
        // 如果数据量大于74条，分块处理
        if (data.length > 74) {
            const chunkedData = chunkArray(data, 74);
            const collectionResult = await collectData(chunkedData);
            return NextResponse.json(ApiResponseUtil.success(collectionResult, 'Data collected and processed successfully'));
        } else {
            // 直接处理
            const _res = calculateIndicators(data);
            return NextResponse.json(ApiResponseUtil.success({data, ..._res, res_qwen:{}, res_deepseek: {}}, 'Indicators calculated successfully'));
        }
    } catch (error) {
        return NextResponse.json(ApiResponseUtil.serverError((error as Error).message), { status: 500 });
    }
}

// // 处理 POST 请求
// export function POST(request: NextRequest) {
//   // ... 处理 POST 逻辑
//   return NextResponse.json({ received: true });
// }
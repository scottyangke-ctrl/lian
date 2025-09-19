// file: src/app/api/reactnativeApp/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { qwenMax } from '../qwen_max';

// 设置CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

// 处理OPTIONS预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// 处理POST请求
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const { klineData, model } = await request.json();

    const system_content = `
      你是一个经验丰富的加密货币分析师,我会以JSON数组的格式给你k线数据,请你根据这些数据来分析,
      请从各个维度进行分析,给出你的结论和建议.包括但不限于以下内容:
      趋势分析,支撑位和阻力位,技术指标分析,成交量分析,形态分析,风险评估等.
      你需要给出一个综合的结论和建议,告诉我接下来12小时内是买入还是卖出,以及买入或卖出的点位.
      你需要给出一个风险评估,告诉我这个建议的风险有多大.
      你需要给出一个置信度,告诉我你对这个建议有多大的把握.
      请用markdown格式返回。
    `;
    
    const aiResult = await qwenMax(
      JSON.stringify(klineData),
      model,
      system_content,
      { type: "text" }
    );

    return new NextResponse(
      JSON.stringify({
        status: 'success',
        message: 'Request processed successfully',
        data: aiResult.choices[0].message.content,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: 'Internal server error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
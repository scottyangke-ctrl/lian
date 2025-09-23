import { NextResponse } from 'next/server';
import { strategyLogService } from './service';
import { z } from 'zod';
import { ApiResponseUtil } from '@/lib/api-response';

// 使用 Zod 定义创建新日志时请求体的验证 schema
const createLogSchema = z.object({
  strategy_id: z.number(),
  action: z.string().min(1, { message: "Action is required" }),
  message: z.string().optional(),
  details: z.any().optional(),
});
/**
 * 验证请求中的认证token
 */
export async function authenticateRequest(request: Request): Promise<any> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  return token === process.env.PASSWORD
}
/**
 * @handler GET
 * @description 处理获取策略日志的 GET 请求。
 * @param {Request} request - Next.js 的请求对象。
 * @returns {NextResponse} 返回日志列表。
 */
export async function GET(request: Request) {
  try {
    // 验证用户认证
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(ApiResponseUtil.error('Authentication required', undefined, 401), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get('strategy_id');
    const id = searchParams.get('id');

    if (id) {
      // 获取单个日志
      const log = await strategyLogService.getLogById(Number(id));
      if (log) {
        return NextResponse.json(ApiResponseUtil.success(log));
      }
      return NextResponse.json(ApiResponseUtil.notFound(`Log with id ${id} not found`), { status: 404 });
    } else if (strategyId) {
      // 获取特定策略的日志
      const logs = await strategyLogService.getLogsForStrategy(Number(strategyId));
      return NextResponse.json(ApiResponseUtil.success(logs));
    } else {
      // 获取所有日志
      const logs = await strategyLogService.getAllLogs();
      return NextResponse.json(ApiResponseUtil.success(logs));
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(ApiResponseUtil.serverError(errorMessage), { status: 500 });
  }
}

/**
 * @handler POST
 * @description 处理创建新日志的 POST 请求。
 * @param {Request} request - Next.js 的请求对象。
 * @returns {NextResponse} 返回新创建的日志。
 */
export async function POST(request: Request) {
  try {
    // 验证用户认证
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(ApiResponseUtil.error('Authentication required', undefined, 401), { status: 401 });
    }

    const body = await request.json();
    const validation = createLogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(ApiResponseUtil.validationError(validation.error.errors), { status: 400 });
    }
    const newLog = await strategyLogService.createStrategyLog(validation.data);
    return NextResponse.json(ApiResponseUtil.success(newLog, 'Log created successfully'), { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(ApiResponseUtil.serverError(errorMessage), { status: 500 });
  }
}

/**
 * @handler DELETE
 * @description 处理删除日志的 DELETE 请求。
 * @param {Request} request - Next.js 的请求对象。
 * @returns {NextResponse} 返回成功消息。
 */
export async function DELETE(request: Request) {
    try {
      // 验证用户认证
      const user = await authenticateRequest(request);
      if (!user) {
        return NextResponse.json(ApiResponseUtil.error('Authentication required', undefined, 401), { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      const strategyId = searchParams.get('strategy_id');

      if (id) {
        // 删除单个日志
        const result = await strategyLogService.deleteLogById(Number(id));
        if (result) {
          return NextResponse.json(ApiResponseUtil.success(null, 'Log deleted successfully'));
        }
        return NextResponse.json(ApiResponseUtil.notFound(`Log with id ${id} not found`), { status: 404 });
      } else if (strategyId) {
        // 删除特定策略的所有日志
        const result = await strategyLogService.deleteLogsForStrategy(Number(strategyId));
        return NextResponse.json(ApiResponseUtil.success(null, `${result.count} logs deleted successfully`));
      } else {
        return NextResponse.json(ApiResponseUtil.error('Either id or strategy_id is required', undefined, 400), { status: 400 });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return NextResponse.json(ApiResponseUtil.serverError(errorMessage), { status: 500 });
    }
  }

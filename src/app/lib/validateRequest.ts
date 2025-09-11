// src/lib/validateRequest.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export const validateRequest = async <T extends z.ZodTypeAny>(
  req: NextRequest,
  schema: T
): Promise<{ 
  data: z.infer<T>, 
  errorResponse?: NextResponse 
}> => {
  try {
    let input: any;
    
    // 根据请求方法处理数据
    if (req.method === 'GET') {
      const params = Object.fromEntries(req.nextUrl.searchParams);
      input = params;
    } else {
      input = await req.json();
    }

    // 执行校验
    const data = await schema.parseAsync(input);
    return { data };
  } catch (error) {
    // 统一错误格式
    let errors = [];
    if (error instanceof z.ZodError) {
      errors = error.issues.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message
      }));
    } else {
      errors = [{ path: '', message: 'Unknown validation error' }];
    }
    return {
      data: undefined as unknown as z.infer<T>,
      errorResponse: NextResponse.json({
        code: 'VALIDATION_ERROR',
        errors
      }, { status: 400 })
    };
  }
};
/**
 * 统一的API响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

/**
 * API响应工具类
 */
export class ApiResponseUtil {
  /**
   * 创建成功的响应
   */
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * 创建失败的响应
   */
  static error(message: string, error?: string, code?: number): ApiResponse {
    return {
      success: false,
      message,
      error,
      code,
    };
  }

  /**
   * 创建未找到的响应
   */
  static notFound(message: string = 'Resource not found'): ApiResponse {
    return this.error(message, undefined, 404);
  }

  /**
   * 创建验证错误的响应
   */
  static validationError(errors: any[]): ApiResponse {
    return this.error('Validation failed', JSON.stringify(errors), 400);
  }

  /**
   * 创建服务器错误的响应
   */
  static serverError(error?: string): ApiResponse {
    return this.error('Internal server error', error, 500);
  }
}

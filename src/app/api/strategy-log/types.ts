/**
 * @interface StrategyLog
 * @description 定义了策略执行日志的数据结构。
 */
export interface StrategyLog {
  id?: number; // 日志的唯一标识符
  strategy_id: number; // 关联的策略ID
  timestamp?: Date; // 日志记录时间
  action: string; // 执行的动作，如 'execute', 'error', 'start', 'stop' 等
  message?: string | null; // 日志消息
  details?: any; // JSON对象，存储额外的日志详情
}

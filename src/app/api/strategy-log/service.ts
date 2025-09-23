import { db } from '@/db';
import { StrategyLog } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { StrategyLog as StrategyLogType } from './types';

/**
 * @service strategyLogService
 * @description 提供了与策略日志（StrategyLog）相关的数据库操作服务。
 */
export const strategyLogService = {
  /**
   * @method getLogsForStrategy
   * @description 获取特定策略的所有日志。
   * @param {number} strategyId - 策略的ID。
   * @returns {Promise<StrategyLogType[]>} 返回该策略的所有日志数组。
   */
  async getLogsForStrategy(strategyId: number): Promise<StrategyLogType[]> {
    return db.select().from(StrategyLog).where(eq(StrategyLog.strategy_id, strategyId)).orderBy(desc(StrategyLog.timestamp));
  },

  /**
   * @method createStrategyLog
   * @description 为一个策略创建一个新的日志条目。
   * @param {Omit<StrategyLogType, 'id' | 'timestamp'>} data - 创建日志所需的数据。
   * @returns {Promise<StrategyLogType>} 返回新创建的日志对象。
   */
  async createStrategyLog(data: Omit<StrategyLogType, 'id' | 'timestamp'>): Promise<StrategyLogType> {
    const result = await db.insert(StrategyLog).values({
      ...data,
      details: data.details || {},
    }).returning();
    return result[0];
  },

   /**
   * @method deleteLogsForStrategy
   * @description 删除特定策略的所有日志。
   * @param {number} strategyId - 策略的ID。
   * @returns {Promise<{ count: number }>} 返回被删除的日志数量。
   */
  async deleteLogsForStrategy(strategyId: number): Promise<{ count: number }> {
    const result = await db.delete(StrategyLog).where(eq(StrategyLog.strategy_id, strategyId));
    return { count: result.length };
  },

  /**
   * @method deleteLogById
   * @description 根据ID删除单个日志。
   * @param {number} id - 日志的ID。
   * @returns {Promise<boolean>} 返回是否成功删除。
   */
  async deleteLogById(id: number): Promise<boolean> {
    try {
      await db.delete(StrategyLog).where(eq(StrategyLog.id, id));
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * @method getAllLogs
   * @description 获取所有日志。
   * @returns {Promise<StrategyLogType[]>} 返回所有日志数组。
   */
  async getAllLogs(): Promise<StrategyLogType[]> {
    return db.select().from(StrategyLog).orderBy(desc(StrategyLog.timestamp));
  },

  /**
   * @method getLogById
   * @description 根据ID获取单个日志。
   * @param {number} id - 日志的ID。
   * @returns {Promise<StrategyLogType | null>} 返回日志对象或null。
   */
  async getLogById(id: number): Promise<StrategyLogType | null> {
    const result = await db.select().from(StrategyLog).where(eq(StrategyLog.id, id));
    return result[0] || null;
  },
};

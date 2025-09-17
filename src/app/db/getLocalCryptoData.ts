import { Database, Statement } from 'sqlite3';

// 基础查询条件类型
type WhereCondition<T> = {
  [K in keyof T]?:
    | T[K] // 等于
    | { $eq?: T[K] } // 等于
    | { $ne?: T[K] } // 不等于
    | { $gt?: T[K] } // 大于
    | { $gte?: T[K] } // 大于等于
    | { $lt?: T[K] } // 小于
    | { $lte?: T[K] } // 小于等于
    | { $in?: T[K][] } // 包含
    | { $nin?: T[K][] } // 不包含
    | { $like?: string } // 模糊匹配
    | { $null?: boolean } // 是否为null
};

// 排序方向
type OrderDirection = 'ASC' | 'DESC';

// 连接条件类型
type JoinCondition = {
  table: string;
  on: string;
  type?: 'INNER' | 'LEFT' | 'RIGHT';
};

class QueryBuilder<T extends Record<string, any>> {
  private db: Database;
  private table: string;
  
  // 查询选项
  private selectFields: string[] = ['*'];
  private whereConditions: string[] = [];
  private whereParams: any[] = [];
  private orderBy: string = '';
  private limitValue: number | null = null;
  private offsetValue: number | null = null;
  private joinClauses: string[] = [];

  constructor(db: Database, table: string) {
    this.db = db;
    this.table = table;
  }

  // 选择特定字段
  select<K extends keyof T>(...fields: K[]): this {
    this.selectFields = fields as string[];
    return this;
  }

  // 添加WHERE条件
  where(conditions: WhereCondition<T>): this {
    Object.entries(conditions).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const [operator, val] = Object.entries(value)[0];
        
        switch (operator) {
          case '$eq':
            this.addCondition(`${key} = ?`, val);
            break;
          case '$ne':
            this.addCondition(`${key} != ?`, val);
            break;
          case '$gt':
            this.addCondition(`${key} > ?`, val);
            break;
          case '$gte':
            this.addCondition(`${key} >= ?`, val);
            break;
          case '$lt':
            this.addCondition(`${key} < ?`, val);
            break;
          case '$lte':
            this.addCondition(`${key} <= ?`, val);
            break;
          case '$in':
            const placeholders = (val as any[]).map(() => '?').join(',');
            this.addCondition(`${key} IN (${placeholders})`, ...(val as any[]));
            break;
          case '$nin':
            const ninPlaceholders = (val as any[]).map(() => '?').join(',');
            this.addCondition(`${key} NOT IN (${ninPlaceholders})`, ...(val as any[]));
            break;
          case '$like':
            this.addCondition(`${key} LIKE ?`, val);
            break;
          case '$null':
            this.addCondition(`${key} IS ${val ? '' : 'NOT '}NULL`);
            break;
        }
      } else {
        // 直接等于的情况
        this.addCondition(`${key} = ?`, value);
      }
    });
    return this;
  }

  // 添加排序
  orderByField(field: keyof T, direction: OrderDirection = 'ASC'): this {
    this.orderBy = `ORDER BY ${field as string} ${direction}`;
    return this;
  }

  // 添加分页
  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  // 添加偏移
  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  // 添加JOIN
  join(join: JoinCondition): this {
    const type = join.type || 'INNER';
    this.joinClauses.push(`${type} JOIN ${join.table} ON ${join.on}`);
    return this;
  }

  // 执行查询
  async get(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const sql = this.buildQuery();
      this.db.all(sql, this.whereParams, (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  // 获取第一条记录
  async first(): Promise<T | null> {
    this.limit(1);
    const results = await this.get();
    return results[0] || null;
  }

  // 构建SQL查询语句
  private buildQuery(): string {
    let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.table}`;

    if (this.joinClauses.length > 0) {
      sql += ` ${this.joinClauses.join(' ')}`;
    }

    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    if (this.orderBy) {
      sql += ` ${this.orderBy}`;
    }

    if (this.limitValue !== null) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue !== null) {
      sql += ` OFFSET ${this.offsetValue}`;
    }

    return sql;
  }

  // 添加条件辅助方法
  private addCondition(condition: string, ...params: any[]): void {
    this.whereConditions.push(condition);
    this.whereParams.push(...params);
  }
}

// 使用示例
interface User {
  id: number;
  name: string;
  age: number;
  email: string | null;
  createdAt: Date;
}

// 初始化数据库
const db = new Database('/home/yang/文档/client_crypto_project/binance_data.db');



export const Query = <T extends Record<string, any>>(tableName: string) => new QueryBuilder<T>(db, tableName);

// Query<User>('users'); // Example usage
// // 关闭数据库连接（在应用退出时调用）
// db.close((err) => {
//   if (err) {
//     console.error('关闭数据库连接时出错:', err.message);
//   } else {
//     console.log('数据库连接已关闭。');
//   }
// });
// 创建查询实例
// const userQuery = new QueryBuilder<User>(db, 'users');

// // 复杂查询示例
// userQuery
//   .select('id', 'name', 'email')
//   .where({
//     age: { $gte: 18, $lte: 30 },
//     email: { $ne: null, $like: '%@gmail.com' },
//     name: { $in: ['Alice', 'Bob'] }
//   })
//   .orderByField('createdAt', 'DESC')
//   .limit(10)
//   .offset(5)
//   .join({
//     table: 'profiles',
//     on: 'users.id = profiles.user_id',
//     type: 'LEFT'
//   })
//   .get()
//   .then(users => {
//     console.log('查询结果:', users);
//   })
//   .catch(err => {
//     console.error('查询错误:', err);
//   });

// // 简单查询示例
// userQuery
//   .where({ id: 1 })
//   .first()
//   .then(user => {
//     console.log('单个用户:', user);
//   });
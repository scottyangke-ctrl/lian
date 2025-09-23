import { pgTable, serial, text, integer, real, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['active', 'inactive']);
export const sideEnum = pgEnum('side', ['BUY', 'SELL']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

export const User = pgTable('User', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  is_active: integer('is_active').default(1).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  last_login: timestamp('last_login'),
});

export const EMAStrategy = pgTable('EMAStrategy', {
  id: serial('id').primaryKey(),
  strategy_name: text('strategy_name'),
  symbol: text('symbol').notNull(),
  emaPeriod: integer('emaPeriod').default(50).notNull(),
  quantity: real('quantity').notNull(),
  priceOffset: real('priceOffset').notNull(),
  interval: text('interval').notNull(),
  side: sideEnum('side').notNull(),
  checkInterval: integer('checkInterval').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  status: statusEnum('status').notNull(),
});

export const StrategyLog = pgTable('StrategyLog', {
  id: serial('id').primaryKey(),
  strategy_id: integer('strategy_id').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  action: text('action').notNull(),
  message: text('message'),
  details: jsonb('details'),
});

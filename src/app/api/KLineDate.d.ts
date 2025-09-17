// 定义类型
export declare type KlineData = [
  number, // 开盘时间
  string, // 开盘价
  string, // 最高价
  string, // 最低价
  string, // 收盘价
  string, // 成交量
  number, // 收盘时间
  string, // 成交额
  number, // 交易数
  string, // 忽略
  string, // 忽略
  string  // 忽略
];

export interface KLineTableData {
  id: number;
  open_time: number;
  close_time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quote_volume: number;
  trade_count: number;
  taker_buy_volume: number;
  taker_buy_quote_volume: number;
  ignore: string;
}
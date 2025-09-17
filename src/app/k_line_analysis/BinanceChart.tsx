'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Select, InputNumber, Button, Card, Row, Col, Spin, notification } from 'antd';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { KlineData } from '../api/KLineDate'; // 导入K线数据类型
import PriceChart from '../../components/PriceChart'; // 导入价格图表组件
import VolumeChart from '../../components/VolumeChart'; // 导入成交量图表组件
// 导入组件
import RSICard from '../../components/RSICard';
import OBVCard from '../../components/OBVCard';
import StochasticCard from '../../components/StochasticCard';
import EMAComparisonCard from '../../components/EMAComparisonCard';
import EMAMACard from '../../components/EMAMACard';
import MACDCard from '../../components/MACDCard';
import BollingerBandsCard from '../../components/BollingerBandsCard';
const { Option } = Select;



type IndicatorStatus = '超买' | '超卖' | '正常' | '未知';
type TrendStatus = '上升' | '下降' | '未知';

interface IndicatorValues {
  rsi: {
    value: number | null;
    status: IndicatorStatus;
  };
  obv: {
    value: number | null;
    trend: TrendStatus;
  };
  stochastic: {
    k: number | null;
    d: number | null;
    status: IndicatorStatus;
  };
  ema: {
    short: number | null;
    long: number | null;
    status: '多头排列' | '空头排列' | '未知';
  };
}

interface SymbolOption {
  value: string;
  label: string;
}

interface IntervalOption {
  value: string;
  label: string;
}

interface AnalysisReport {
  symbol: string;
  interval: string;
  klines: KlineData[];
  indicators: IndicatorValues;
  volumeAnalysis: {
    averageVolume: number;
    maxVolume: number;
    minVolume: number;
    volumeStd: number;
    highVolumeCandles: number[];
    volumeTrend: TrendStatus;
  };
  priceAnalysis: {
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
    priceStd: number;
    priceChange: number;
    priceChangePercent: number;
  };
  notableEvents: string[];
  timestamp: number;
}

const BinanceChart: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [interval, setInterval] = useState<string>('1h');
  const [limit, setLimit] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingReport, setSendingReport] = useState<boolean>(false);
  const [klinesData, setKlinesData] = useState<KlineData[]>([]);
  const [indicators, setIndicators] = useState<IndicatorValues>({
    rsi: { value: null, status: '未知' },
    obv: { value: null, trend: '未知' },
    stochastic: { k: null, d: null, status: '未知' },
    ema: { short: null, long: null, status: '未知' }
  });
  // 添加状态存储EMA/MA设置
  const [emaMaType, setEmaMaType] = useState<'EMA' | 'MA'>('EMA');
  const [emaMaPeriod, setEmaMaPeriod] = useState<number>(20);
  // 处理EMA/MA设置变化
  const handleEmaMaSettingsChange = (type: 'EMA' | 'MA', period: number) => {
    setEmaMaType(type);
    setEmaMaPeriod(period);
  };
  // EMA周期状态
  const [emaShortPeriod, setEmaShortPeriod] = useState<number>(12);
  const [emaLongPeriod, setEmaLongPeriod] = useState<number>(26);
  // 添加状态存储MACD设置
  const [macdFastPeriod, setMacdFastPeriod] = useState<number>(12);
  const [macdSlowPeriod, setMacdSlowPeriod] = useState<number>(26);
  const [macdSignalPeriod, setMacdSignalPeriod] = useState<number>(9);

  // 处理MACD设置变化
  const handleMacdSettingsChange = (fast: number, slow: number, signal: number) => {
    setMacdFastPeriod(fast);
    setMacdSlowPeriod(slow);
    setMacdSignalPeriod(signal);
  };
  // 添加状态存储布林带设置
const [bbPeriod, setBbPeriod] = useState<number>(20);
const [bbDeviation, setBbDeviation] = useState<number>(2);

// 处理布林带设置变化
const handleBbSettingsChange = (period: number, deviation: number) => {
  setBbPeriod(period);
  setBbDeviation(deviation);
};

// 添加状态存储指标设置
const [rsiPeriod, setRsiPeriod] = useState<number>(14);
const [stochKPeriod, setStochKPeriod] = useState<number>(14);
const [stochDPeriod, setStochDPeriod] = useState<number>(3);
// 处理指标设置变化
const handleRsiSettingsChange = (period: number) => {
  setRsiPeriod(period);
};

const handleStochSettingsChange = (kPeriod: number, dPeriod: number) => {
  setStochKPeriod(kPeriod);
  setStochDPeriod(dPeriod);
};
// 添加状态存储EMA对比设置
const [emaPeriod1, setEmaPeriod1] = useState<number>(12);
const [emaPeriod2, setEmaPeriod2] = useState<number>(26);

// 处理EMA对比设置变化
const handleEMAComparisonSettingsChange = (period1: number, period2: number) => {
  setEmaPeriod1(period1);
  setEmaPeriod2(period2);
};
  // 时间周期与默认条数映射
  const intervalLimitMap: Record<string, number> = {
    '30m': 300,
    '1h': 200,
    '2h': 150,
    '4h': 100,
  };

  // 处理时间周期变化
  const handleIntervalChange = (value: string) => {
    setInterval(value);

    // 如果新周期在映射表中，则更新条数
    if (intervalLimitMap[value]) {
      setLimit(intervalLimitMap[value]);
    }
  };

  // 处理条数变化（确保不小于30）
  const handleLimitChange = (value: number | null) => {
    if (value === null) return;
    setLimit(Math.max(30, value)); // 确保最小30条
  };
  // 使用useCallback缓存图表实例创建函数
  const createPriceChart = useCallback((ctx: CanvasRenderingContext2D, dates: string[], closes: number[]) => {
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: '收盘价',
            data: closes,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '价格走势',
            font: { size: 16 }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            type: 'category',
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          }
        }
      }
    });
  }, []);

  const createVolumeChart = useCallback((ctx: CanvasRenderingContext2D, dates: string[], volumes: number[]) => {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: '成交量',
            data: volumes,
            backgroundColor: 'rgba(46, 204, 113, 0.6)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '成交量',
            font: { size: 16 }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            type: 'category',
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          }
        }
      }
    });
  }, []);
  // 支持的交易对和时间周期
  const symbols: SymbolOption[] = [
    { value: 'BTCUSDC', label: 'BTC/USDC' },
    { value: 'ETHUSDC', label: 'ETH/USDC' },
    { value: 'BNBUSDC', label: 'BNB/USDC' },
    { value: 'SOLUSDC', label: 'SOL/USDC' },
    { value: 'XRPUSDC', label: 'XRP/USDC' }
  ];

  const intervals: IntervalOption[] = [
    { value: '30m', label: '30分钟' },
    { value: '1h', label: '1小时' },
    { value: '2h', label: '2小时' },
    { value: '4h', label: '4小时' },
    { value: '6h', label: '6小时' },
    { value: '8h', label: '8小时' },
    { value: '12h', label: '12小时' },
    { value: '1d', label: '1天' },
    { value: '2d', label: '2天' },
    { value: '4d', label: '4天' },
    { value: '1w', label: '1周' }
  ];

  // 获取K线数据（添加重试逻辑）
  const fetchData = useCallback(async (retryCount = 0) => {
    if (retryCount > 3) {
      notification.error({ message: '数据加载失败', description: '多次尝试后仍无法获取数据，请检查网络连接' });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${location.origin}/api/binance?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} - ${response.statusText}`);
      }
      const { klines, ok }: { klines: KlineData[]; ok: boolean } = await response.json();
      if (!ok) {
        throw new Error('返回的K线数据无效');
      }
      if (klines.length === 0) {
        throw new Error('返回的K线数据为空');
      }

      setKlinesData(klines);
      processData(klines);
    } catch (error) {
      console.error('获取数据时出错:', error);
      notification.error({
        message: '数据获取失败',
        description: `错误信息: ${(error as Error).message}`
      });
      // 重试逻辑
      setTimeout(() => fetchData(retryCount + 1), 1000);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, limit]);

  // 处理K线数据（添加数据验证）
  const processData = useCallback((data: KlineData[]) => {
    if (!data || data.length === 0) {
      console.warn('无效的K线数据');
      return;
    }

    try {
      // 提取时间戳并转换为日期（添加错误处理）
      const timestamps = data.map(k => k[0]);
      const dates = timestamps.map(timestamp => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.warn(`无效的时间戳: ${timestamp}`);
          return '无效时间';
        }
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      });

      // 提取价格数据（添加数值验证）
      const closes = data.map(k => {
        const close = parseFloat(k[4]);
        if (isNaN(close)) {
          console.warn(`无效的收盘价: ${k[4]}`);
          return 0;
        }
        return close;
      });

      // 提取成交量数据（添加数值验证）
      const volumes = data.map(k => {
        const volume = parseFloat(k[5]);
        if (isNaN(volume)) {
          console.warn(`无效的成交量: ${k[5]}`);
          return 0;
        }
        return volume;
      });

      // 计算指标
      calculateIndicators(closes, volumes);
    } catch (error) {
      console.error('处理数据时出错:', error);
    }
  }, [createPriceChart, createVolumeChart]);

  // 计算技术指标（添加数值验证）
  const calculateIndicators = useCallback((closes: number[], volumes: number[]) => {
    try {
      // 计算RSI
      const rsi = calculateRSI(closes);
      const rsiStatus: IndicatorStatus = rsi > 70 ? '超买' : rsi < 30 ? '超卖' : '正常';

      // 计算OBV
      const obv = calculateOBV(closes, volumes);
      const obvPrev = closes.length > 1 ? calculateOBV(closes.slice(0, -1), volumes.slice(0, -1)) : 0;
      const obvChange = obv - obvPrev;
      const obvTrend: TrendStatus = obvChange > 0 ? '上升' : '下降';

      // 计算随机指标
      const stochastic = calculateStochastic(closes);
      const stochasticStatus: IndicatorStatus =
        (stochastic.k > 80 && stochastic.d > 80) ? '超买' :
          (stochastic.k < 20 && stochastic.d < 20) ? '超卖' : '正常';

      // 计算EMA
      const ema12 = calculateEMA(closes, 12);
      const ema26 = calculateEMA(closes, 26);
      const emaStatus = ema12 > ema26 ? '多头排列' : '空头排列';





      // 提取收盘价
      // const closes = klinesData.map(k => parseFloat(k[4])).filter(v => !isNaN(v));

      // 更新指标状态
      setIndicators({
        rsi: { value: rsi, status: rsiStatus },
        obv: { value: obv, trend: obvTrend },
        stochastic: { ...stochastic, status: stochasticStatus },
        ema: { short: ema12, long: ema26, status: emaStatus }
      });
    } catch (error) {
      console.error('计算指标时出错:', error);
    }
  }, []);

  // RSI计算函数（添加边界检查）
  const calculateRSI = (closes: number[], period: number = 14): number => {
    if (closes.length < period + 1) {
      console.warn(`需要至少${period + 1}个数据点计算RSI`);
      return 50;
    }

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      gains += Math.max(change, 0);
      losses += Math.max(-change, 0);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const currentGain = Math.max(change, 0);
      const currentLoss = Math.max(-change, 0);

      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  // OBV计算函数（添加空值检查）
  const calculateOBV = (closes: number[], volumes: number[]): number => {
    if (closes.length === 0) return 0;
    if (closes.length < 2) return volumes[0] || 0;

    let obv = volumes[0];

    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        obv += volumes[i];
      } else if (closes[i] < closes[i - 1]) {
        obv -= volumes[i];
      }
    }

    return obv;
  };

  // 随机指标计算函数（添加边界检查）
  const calculateStochastic = (
    closes: number[],
    kPeriod: number = 14,
    dPeriod: number = 3
  ): { k: number, d: number } => {
    if (closes.length < kPeriod + dPeriod) {
      console.warn(`需要至少${kPeriod + dPeriod}个数据点计算随机指标`);
      return { k: 50, d: 50 };
    }

    const kValues: number[] = [];
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const periodCloses = closes.slice(i - kPeriod + 1, i + 1);
      const high = Math.max(...periodCloses);
      const low = Math.min(...periodCloses);

      if (high - low === 0) {
        kValues.push(50);
      } else {
        const k = 100 * (closes[i] - low) / (high - low);
        kValues.push(Number(k.toFixed(2))); // 保留两位小数
      }
    }

    const dValues: number[] = [];
    for (let i = dPeriod - 1; i < kValues.length; i++) {
      const periodK = kValues.slice(i - dPeriod + 1, i + 1);
      const d = periodK.reduce((sum, val) => sum + val, 0) / dPeriod;
      dValues.push(Number(d.toFixed(2))); // 保留两位小数
    }

    return {
      k: kValues[kValues.length - 1] || 50,
      d: dValues[dValues.length - 1] || 50
    };
  };

  // EMA计算函数（添加边界检查）
  const calculateEMA = (data: number[], period: number): number => {
    if (data.length === 0) return 0;
    if (data.length < period) {
      console.warn(`需要至少${period}个数据点计算EMA`);
      return data[data.length - 1] || 0;
    }

    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }

    return Number(ema.toFixed(2)); // 保留两位小数
  };

  // 生成分析报告（添加数据验证）
  const generateAnalysisReport = useCallback((): AnalysisReport => {
    if (klinesData.length === 0) {
      throw new Error('没有可用的K线数据');
    }

    const closes = klinesData.map(k => parseFloat(k[4])).filter(v => !isNaN(v));
    const volumes = klinesData.map(k => parseFloat(k[5])).filter(v => !isNaN(v));

    if (closes.length === 0 || volumes.length === 0) {
      throw new Error('无效的K线数据，无法生成报告');
    }

    // 价格分析
    const averagePrice = closes.reduce((sum, val) => sum + val, 0) / closes.length;
    const maxPrice = Math.max(...closes);
    const minPrice = Math.min(...closes);
    const priceStd = Math.sqrt(closes.reduce((sum, val) => sum + Math.pow(val - averagePrice, 2), 0) / closes.length);
    const priceChange = closes[closes.length - 1] - closes[0];
    const priceChangePercent = (priceChange / closes[0]) * 100;

    // 成交量分析
    const averageVolume = volumes.reduce((sum, val) => sum + val, 0) / volumes.length;
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);
    const volumeStd = Math.sqrt(volumes.reduce((sum, val) => sum + Math.pow(val - averageVolume, 2), 0) / volumes.length);

    // 高成交量K线
    const volumeThreshold = averageVolume + 2 * volumeStd;
    const highVolumeCandles: number[] = [];
    volumes.forEach((vol, index) => {
      if (vol > volumeThreshold) {
        highVolumeCandles.push(index);
      }
    });

    // 成交量趋势
    const recentVolumes = volumes.slice(-5);
    const volumeTrend: TrendStatus = recentVolumes.length >= 2 &&
      recentVolumes[recentVolumes.length - 1] > recentVolumes[0] ? '上升' : '下降';

    // 值得注意的事件
    const notableEvents: string[] = [];

    if (indicators.rsi.status === '超买') {
      notableEvents.push('RSI指标显示超买状态，可能面临回调风险');
    } else if (indicators.rsi.status === '超卖') {
      notableEvents.push('RSI指标显示超卖状态，可能出现反弹机会');
    }

    if (indicators.stochastic.status === '超买') {
      notableEvents.push('随机指标显示超买状态，短期可能面临调整');
    } else if (indicators.stochastic.status === '超卖') {
      notableEvents.push('随机指标显示超卖状态，短期可能出现反弹');
    }

    if (indicators.ema.status === '多头排列') {
      notableEvents.push('EMA指标显示多头排列，市场处于上升趋势');
    } else if (indicators.ema.status === '空头排列') {
      notableEvents.push('EMA指标显示空头排列，市场处于下降趋势');
    }

    if (Math.abs(priceChangePercent) > 5) {
      notableEvents.push(`价格在分析周期内${priceChangePercent > 0 ? '上涨' : '下跌'}了${Math.abs(priceChangePercent).toFixed(2)}%，波动较大`);
    }

    if (highVolumeCandles.length > 0) {
      notableEvents.push(`检测到${highVolumeCandles.length}根异常高成交量K线，可能表示重要市场事件`);
    }

    return {
      symbol,
      interval,
      klines: klinesData,
      indicators,
      volumeAnalysis: {
        averageVolume,
        maxVolume,
        minVolume,
        volumeStd,
        highVolumeCandles,
        volumeTrend
      },
      priceAnalysis: {
        averagePrice,
        maxPrice,
        minPrice,
        priceStd,
        priceChange,
        priceChangePercent
      },
      notableEvents,
      timestamp: Date.now()
    };
  }, [klinesData, indicators, symbol, interval]);

  // 发送报告到后端（添加错误处理）
  const sendReportToBackend = useCallback(async () => {
    setSendingReport(true);
    try {
      const report = generateAnalysisReport();

      // 替换为您的实际后端API地址
      const backendUrl = 'https://your-backend-api.com/analysis-reports';

      const response = await axios.post(backendUrl, report, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
        notification.success({
          message: '报告提交成功',
          description: '分析报告已成功发送到后端服务器'
        });
      } else {
        throw new Error(`后端返回错误状态码: ${response.status}`);
      }
    } catch (error) {
      console.error('发送报告时出错:', error);
      notification.error({
        message: '报告提交失败',
        description: `错误信息: ${(error as Error).message}`
      });
    } finally {
      setSendingReport(false);
    }
  }, [generateAnalysisReport]);

  // 组件挂载时获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // 处理EMA周期变化
  const handleEmaPeriodsChange = (short: number, long: number) => {
    setEmaShortPeriod(short);
    setEmaLongPeriod(long);
  };
  // 提取收盘价
  const closes = klinesData.map(k => parseFloat(k[4])).filter(v => !isNaN(v));
  // 提取收盘价和成交量
  // const closes = klinesData.map(k => parseFloat(k[4]));
  
  const volumes = klinesData.map(k => parseFloat(k[5]));


  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">binance 最新K线AI分析</h1>

      {/* 控制面板 */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">交易对</label>
          <Select
            value={symbol}
            onChange={(value) => setSymbol(value)}
            className="w-full"
            options={symbols}
          />
        </div>

        <div className="min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">时间周期</label>
          <Select
            value={interval}
            onChange={handleIntervalChange} // 使用新的处理函数
            className="w-full"
          >
            {intervals.map(i => (
              <Option key={i.value} value={i.value}>
                {i.label}
                {intervalLimitMap[i.value] && (
                  <span className="text-xs text-gray-500 ml-2">
                    (默认{intervalLimitMap[i.value]}条)
                  </span>
                )}
              </Option>
            ))}
          </Select>
        </div>

        <div className="min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            数据条数
            <span className="text-xs text-gray-500 ml-1">(最小50条)</span>
          </label>
          <InputNumber
            value={limit}
            onChange={handleLimitChange} // 使用新的处理函数
            min={50} // 设置最小值为50
            max={500}
            className="w-full"
          />
        </div>

        <Button
          type="primary"
          onClick={() => fetchData()}
          className="self-end"
          loading={loading}
        >
          获取数据
        </Button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">正在加载数据...</p>
        </div>
      )}

      {/* 图表区域 */}
      {!loading && klinesData.length > 0 && (
        <div className="space-y-6">
          {/* 价格图表 */}
          <PriceChart data={klinesData} title="价格走势图" height={400} />
          {/* 成交量图表 */}
          <VolumeChart data={klinesData} title="成交量柱状图" height={400} />
          {/* 指标卡片 */}
          <Row gutter={[16, 16]}>
             <Col xs={24} sm={12} md={8}>
              <RSICard 
                closes={closes} 
                defaultPeriod={rsiPeriod}
                onSettingsChange={handleRsiSettingsChange}
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <OBVCard 
                closes={closes}
                volumes={volumes}
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <StochasticCard 
                closes={closes} 
                defaultKPeriod={stochKPeriod}
                defaultDPeriod={stochDPeriod}
                onSettingsChange={handleStochSettingsChange}
              />
            </Col>

            <Col xs={24} sm={24} md={12}>
              <EMAComparisonCard 
                closes={closes} 
                defaultPeriod1={emaPeriod1}
                defaultPeriod2={emaPeriod2}
                onSettingsChange={handleEMAComparisonSettingsChange}
              />
            </Col>
            <Col xs={24} sm={24} md={12}>
              <EMAMACard
                closes={closes}
                defaultType={emaMaType}
                defaultPeriod={emaMaPeriod}
                onSettingsChange={handleEmaMaSettingsChange}
              />
            </Col>
            <Col xs={24} sm={24} md={12}>
              <MACDCard 
                closes={closes} 
                defaultFastPeriod={macdFastPeriod}
                defaultSlowPeriod={macdSlowPeriod}
                defaultSignalPeriod={macdSignalPeriod}
                onSettingsChange={handleMacdSettingsChange}
              />
            </Col>
          <Col xs={24} sm={24} md={12}>
            <BollingerBandsCard 
              closes={closes} 
              defaultPeriod={bbPeriod}
              defaultDeviation={bbDeviation}
              onSettingsChange={handleBbSettingsChange}
            />
          </Col>
          </Row>

          {/* 分析报告 */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">深度分析报告</h2>
              <Button
                type="primary"
                onClick={sendReportToBackend}
                loading={sendingReport}
                className="bg-blue-600 hover:bg-blue-700"
              >
                提交报告到后端
              </Button>
            </div>

            <div className="space-y-6">
              {/* 价格分析 */}
              <Card title="价格分析" className="rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">平均价格</p>
                    <p className="text-xl font-medium">${generateAnalysisReport().priceAnalysis.averagePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">最高价格</p>
                    <p className="text-xl font-medium">${generateAnalysisReport().priceAnalysis.maxPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">最低价格</p>
                    <p className="text-xl font-medium">${generateAnalysisReport().priceAnalysis.minPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">涨跌幅</p>
                    <p className={`text-xl font-medium ${generateAnalysisReport().priceAnalysis.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {generateAnalysisReport().priceAnalysis.priceChange >= 0 ? '+' : '-'}
                      {Math.abs(generateAnalysisReport().priceAnalysis.priceChange).toFixed(2)}
                      ({Math.abs(generateAnalysisReport().priceAnalysis.priceChangePercent).toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </Card>

              {/* 成交量分析 */}
              <Card title="成交量分析" className="rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">平均成交量</p>
                    <p className="text-xl font-medium">{generateAnalysisReport().volumeAnalysis.averageVolume.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">最大成交量</p>
                    <p className="text-xl font-medium">{generateAnalysisReport().volumeAnalysis.maxVolume.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">最小成交量</p>
                    <p className="text-xl font-medium">{generateAnalysisReport().volumeAnalysis.minVolume.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">成交量趋势</p>
                    <p className={`text-xl font-medium ${generateAnalysisReport().volumeAnalysis.volumeTrend === '上升' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {generateAnalysisReport().volumeAnalysis.volumeTrend}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 重要事件 */}
            {generateAnalysisReport().notableEvents.length > 0 && (
              <Card title="关键市场事件" className="mt-6 rounded-lg shadow-sm">
                <ul className="list-disc pl-5 space-y-2">
                  {generateAnalysisReport().notableEvents.map((event, index) => (
                    <li key={index} className="text-gray-700">
                      {index + 1}. {event}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BinanceChart;
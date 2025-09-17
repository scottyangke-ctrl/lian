import ccxt, { Exchange, OHLCV } from 'ccxt';
import { 
    SMA, EMA, RSI, MACD, Stochastic, BollingerBands, 
    ATR, ADX, OBV, WilliamsR, CCI 
} from 'technicalindicators';

// 配置参数
const EXCHANGE = 'binance';
const SYMBOL = 'BTC/USDT';
const TIMEFRAME = '1h'; // 1小时K线
const DATA_POINTS = 200; // 获取的数据点数
const RSI_PERIOD = 14;
const MACD_SETTINGS = { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 };
const BB_PERIOD = 20;
const STOCHASTIC_SETTINGS = { period: 14, signalPeriod: 3 };

// 创建交易所实例
const exchange: Exchange = new ccxt[EXCHANGE]({
    enableRateLimit: true,
    timeout: 15000,
});

// 主函数
async function analyzeMarket() {
    try {
        console.log(`连接 ${EXCHANGE} 交易所...`);
        
        // 加载市场数据
        await exchange.loadMarkets();
        console.log(`已加载市场数据，支持 ${Object.keys(exchange.markets).length} 个交易对`);
        
        // 获取K线数据
        console.log(`获取 ${SYMBOL} ${TIMEFRAME} K线数据...`);
        const ohlcv: OHLCV[] = await exchange.fetchOHLCV(SYMBOL, TIMEFRAME, undefined, DATA_POINTS);
        
        if (ohlcv.length < DATA_POINTS) {
            console.warn(`警告: 只获取到 ${ohlcv.length} 条数据，少于请求的 ${DATA_POINTS} 条`);
        }
        
        // 提取各数据序列
        const closes: number[] = ohlcv.map(candle => candle[4]) as number[]; // 收盘价
        const opens: number[] = ohlcv.map(candle => candle[1]) as number[];  // 开盘价
        const highs: number[] = ohlcv.map(candle => candle[2]) as number[];  // 最高价
        const lows: number[] = ohlcv.map(candle => candle[3]) as number[];   // 最低价
        const volumes: number[] = ohlcv.map(candle => candle[5]) as number[]; // 成交量

        // 计算技术指标
        console.log('\n计算技术指标...');
        
        // 1. 移动平均线
        const sma = SMA.calculate({ period: BB_PERIOD, values: closes });
        const ema = EMA.calculate({ period: BB_PERIOD, values: closes }).filter((v): v is number => v !== undefined);
        
        // 2. 相对强弱指数 (RSI)
        const rsi = RSI.calculate({ values: closes, period: RSI_PERIOD });
        
        // 3. MACD
        const macd = MACD.calculate({
            values: closes,
            fastPeriod: MACD_SETTINGS.fastPeriod,
            slowPeriod: MACD_SETTINGS.slowPeriod,
            signalPeriod: MACD_SETTINGS.signalPeriod,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });
        
        // 4. 布林带
        const bb = BollingerBands.calculate({
            values: closes,
            period: BB_PERIOD,
            stdDev: 2
        });
        
        // 5. 随机指标
        const stochastic = Stochastic.calculate({
            high: highs,
            low: lows,
            close: closes,
            period: STOCHASTIC_SETTINGS.period,
            signalPeriod: STOCHASTIC_SETTINGS.signalPeriod
        });
        
        // 6. 平均真实波幅 (ATR)
        const atr = ATR.calculate({
            high: highs,
            low: lows,
            close: closes,
            period: 14
        });
        
        // 7. 平均方向指数 (ADX)
        const adx = ADX.calculate({
            high: highs,
            low: lows,
            close: closes,
            period: 14
        });
        
        // 8. 能量潮指标 (OBV)
        const obv = OBV.calculate({ close: closes, volume: volumes });
        
        // 9. 威廉指标
        const williamsR = WilliamsR.calculate({
            high: highs,
            low: lows,
            close: closes,
            period: 14
        });
        
        // 10. 商品通道指数 (CCI)
        const cci = CCI.calculate({
            high: highs,
            low: lows,
            close: closes,
            period: 20
        });
        
        // 获取最新值
        const lastIndex = closes.length - 1;
        const lastClose = closes[lastIndex];
        const lastSMA = sma[sma.length - 1];
        const lastEMA = ema[ema.length - 1];
        const lastRSI = rsi[rsi.length - 1];
        const lastMACD = macd[macd.length - 1];
        const lastBB = bb[bb.length - 1];
        const lastStochastic = stochastic[stochastic.length - 1];
        const lastATR = atr[atr.length - 1];
        const lastADX = adx[adx.length - 1];
        const lastOBV = obv[obv.length - 1];
        const lastWilliamsR = williamsR[williamsR.length - 1];
        const lastCCI = cci[cci.length - 1];
        
        // 打印结果
        console.log('\n===== 最新市场分析 =====');
        console.log(`交易对: ${SYMBOL}`);
        console.log(`时间框架: ${TIMEFRAME}`);
        console.log(`最新收盘价: ${lastClose}`);
        const lastTimestamp = ohlcv[lastIndex][0];
        console.log(`时间: ${lastTimestamp !== undefined ? new Date(lastTimestamp).toLocaleString() : 'N/A'}`);
        
        console.log('\n--- 趋势指标 ---');
        console.log(`SMA(${BB_PERIOD}): ${lastSMA?.toFixed(2) || 'N/A'}`);
        console.log(`EMA(${BB_PERIOD}): ${lastEMA?.toFixed(2) || 'N/A'}`);
        console.log(`ADX(14): ${lastADX?.adx?.toFixed(2) || 'N/A'} (${getADXStrength(lastADX?.adx)})`);
        
        console.log('\n--- 动量指标 ---');
        console.log(`RSI(${RSI_PERIOD}): ${lastRSI?.toFixed(2) || 'N/A'} (${getRSILevel(lastRSI)})`);
        console.log(`MACD: ${lastMACD?.MACD?.toFixed(2) || 'N/A'}, Signal: ${lastMACD?.signal?.toFixed(2) || 'N/A'}, Histogram: ${lastMACD?.histogram?.toFixed(2) || 'N/A'}`);
        console.log(`Stochastic K: ${lastStochastic?.k?.toFixed(2) || 'N/A'}, D: ${lastStochastic?.d?.toFixed(2) || 'N/A'}`);
        console.log(`Williams %R: ${lastWilliamsR?.toFixed(2) || 'N/A'}`);
        console.log(`CCI(20): ${lastCCI?.toFixed(2) || 'N/A'}`);
        
        console.log('\n--- 波动率指标 ---');
        console.log(`布林带: 上轨 ${lastBB?.upper?.toFixed(2) || 'N/A'}, 中轨 ${lastBB?.middle?.toFixed(2) || 'N/A'}, 下轨 ${lastBB?.lower?.toFixed(2) || 'N/A'}`);
        console.log(`ATR(14): ${lastATR?.toFixed(2) || 'N/A'}`);
        
        console.log('\n--- 成交量指标 ---');
        console.log(`OBV: ${lastOBV?.toFixed(2) || 'N/A'}`);
        
        // 生成交易信号
        console.log('\n===== 交易信号 =====');
        generateTradingSignals(
            lastClose,
            lastSMA,
            lastRSI,
            lastMACD,
            lastStochastic,
            lastBB
        );
        
    } catch (error) {
        console.error('分析过程中出错:', error);
    }
}

// 生成交易信号
function generateTradingSignals(
    price: number,
    sma: number | undefined,
    rsi: number | undefined,
    macd: any,
    stochastic: any,
    bb: any
) {
    if (!sma || !rsi || !macd || !stochastic || !bb) {
        console.log('指标数据不足，无法生成信号');
        return;
    }
    
    const signals: string[] = [];
    
    // 1. 趋势信号
    if (price > sma) {
        signals.push('价格在SMA上方 - 看涨趋势');
    } else {
        signals.push('价格在SMA下方 - 看跌趋势');
    }
    
    // 2. RSI信号
    if (rsi > 70) {
        signals.push('RSI > 70 - 超买警告');
    } else if (rsi < 30) {
        signals.push('RSI < 30 - 超卖机会');
    }
    
    // 3. MACD信号
    if (macd.histogram > 0 && macd.MACD > macd.signal) {
        signals.push('MACD柱状图正值且MACD线在信号线上方 - 看涨动量');
    } else if (macd.histogram < 0 && macd.MACD < macd.signal) {
        signals.push('MACD柱状图负值且MACD线在信号线下方 - 看跌动量');
    }
    
    // 4. 随机指标信号
    if (stochastic.k < 20 && stochastic.d < 20) {
        signals.push('随机指标超卖 - 潜在买入机会');
    } else if (stochastic.k > 80 && stochastic.d > 80) {
        signals.push('随机指标超买 - 潜在卖出机会');
    }
    
    // 5. 布林带信号
    if (price > bb.upper) {
        signals.push('价格突破布林带上轨 - 超买可能回调');
    } else if (price < bb.lower) {
        signals.push('价格跌破布林带下轨 - 超卖可能反弹');
    }
    
    // 打印所有信号
    if (signals.length > 0) {
        console.log('检测到以下交易信号:');
        signals.forEach((signal, index) => {
            console.log(`${index + 1}. ${signal}`);
        });
    } else {
        console.log('无明显交易信号，市场可能处于盘整状态');
    }
}

// 辅助函数：获取RSI水平描述
function getRSILevel(rsi: number | undefined): string {
    if (rsi === undefined) return 'N/A';
    if (rsi >= 70) return '超买';
    if (rsi >= 60) return '强势';
    if (rsi >= 40) return '中性';
    if (rsi >= 30) return '弱势';
    return '超卖';
}

// 辅助函数：获取ADX强度描述
function getADXStrength(adx: number | undefined): string {
    if (adx === undefined) return 'N/A';
    if (adx >= 40) return '极强趋势';
    if (adx >= 25) return '强趋势';
    if (adx >= 20) return '趋势';
    return '无趋势或弱趋势';
}

// 执行分析
analyzeMarket();
import { 
    SMA, EMA, RSI, MACD, Stochastic, BollingerBands, 
    ATR, ADX, OBV, WilliamsR, CCI 
} from 'technicalindicators';
import type { KlineData as KLineData, KLineTableData} from '../KLineDate.d.ts';
import { Query } from '@/app/db/getLocalCryptoData.js';
// export interface KLineData {
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//     volume: number;
//     [key: string]: any; // Add other fields if needed
// }

// 指标计算参数
const BB_PERIOD = 20;
const RSI_PERIOD = 14;
const MACD_SETTINGS = { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 };
const STOCHASTIC_SETTINGS = { period: 14, signalPeriod: 3 };

// 计算技术指标
export function calculateIndicators(data: KLineTableData[]) {
    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);

    // 1. 移动平均线 (SMA 和 EMA)
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

    // 10. 顺势指标 (CCI)
    const cci = CCI.calculate({
        high: highs,
        low: lows,
        close: closes,
        period: 20
    });

    return {
        sma,
        ema,
        rsi,
        macd,
        bb,
        stochastic,
        atr,
        adx,
        obv,
        williamsR,
        cci
    };
}
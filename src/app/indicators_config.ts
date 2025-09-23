export default {
    EMA: 
        {
          symbol: 'ETHUSDC',
          interval: '5m',
          emaPeriod: 50,    // ✅ 支持EMA25
          quantityUSDT: 30,        // U本位下单30USDT
          side: 'BUY',
          priceOffset: 15,
          checkInterval: 50000,
      },
    KDJ: 
        {
          symbol: 'ETHUSDC',
          interval: '5m',
          kdjPeriod: 14,    // ✅ 支持KDJ14
          quantityUSDT: 30,        // U本位下单30USDT
          side: 'BUY',
          priceOffset: 15,
          checkInterval: 50000,
      }
}
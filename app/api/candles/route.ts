import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '5m';
    const env = getEnv();
    const symbol = env.SYMBOL.replace('/', '');
    
    console.log(`Generating clean ${timeframe} candlestick data for:`, symbol);
    
    // Zaman dilimine göre mum sayısını hesapla
    const getCandleCount = (tf: string): number => {
      switch (tf) {
        case '1m': return 1440; // 24 saat
        case '5m': return 288;  // 24 saat
        case '1h': return 24;   // 24 saat
        case '4h': return 6;    // 24 saat
        case '12h': return 2;   // 24 saat
        case '1d': return 1;    // 24 saat
        default: return 288;
      }
    };

    // Zaman dilimine göre mum süresini hesapla
    const getCandleDuration = (tf: string): number => {
      switch (tf) {
        case '1m': return 1 * 60 * 1000;
        case '5m': return 5 * 60 * 1000;
        case '1h': return 60 * 60 * 1000;
        case '4h': return 4 * 60 * 60 * 1000;
        case '12h': return 12 * 60 * 60 * 1000;
        case '1d': return 24 * 60 * 60 * 1000;
        default: return 5 * 60 * 1000;
      }
    };
    
    const candleCount = getCandleCount(timeframe);
    const candleDuration = getCandleDuration(timeframe);
    
    // Simüle edilmiş mum verileri oluştur
    const candles = [];
    const basePrice = 4250;
    const now = Date.now();
    
    for (let i = candleCount - 1; i >= 0; i--) {
      const timestamp = now - (i * candleDuration);
      
      // Daha gerçekçi fiyat hareketi - trend takibi
      const trend = Math.sin(i * 0.1) * 50; // Yumuşak trend
      const noise = (Math.random() - 0.5) * 20; // Küçük rastgele hareket
      const priceChange = trend + noise;
      
      const open = basePrice + priceChange;
      const close = open + (Math.random() - 0.5) * 10; // Küçük kapanış değişimi
      
      // High ve Low daha gerçekçi
      const bodySize = Math.abs(close - open);
      const high = Math.max(open, close) + Math.random() * bodySize * 0.5;
      const low = Math.min(open, close) - Math.random() * bodySize * 0.5;
      
      // Volume daha gerçekçi
      const volume = 500 + Math.random() * 1000;
      
      candles.push({
        time: timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat(volume.toFixed(2))
      });
    }
    
    console.log(`Generated ${candles.length} clean ${timeframe} candles for 24h`);
    
    return NextResponse.json({
      success: true,
      data: {
        candles,
        symbol: env.SYMBOL,
        interval: timeframe,
        lastUpdated: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Candles API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

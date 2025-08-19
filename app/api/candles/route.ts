import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function GET() {
  try {
    const env = getEnv();
    const symbol = env.SYMBOL.replace('/', '');
    
    console.log('Generating clean 5-minute candlestick data for:', symbol);
    
    // Son 24 saat için 5 dakikalık mum verisi (288 mum) - daha düzenli
    const candles = [];
    const basePrice = 4250;
    const now = Date.now();
    
    // 24 saat = 1440 dakika, 5 dakikalık aralıklarla = 288 mum
    for (let i = 287; i >= 0; i--) {
      const timestamp = now - (i * 5 * 60 * 1000); // 5 dakika aralıklarla
      
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
    
    console.log(`Generated ${candles.length} clean 5-minute candles for 24h`);
    
    return NextResponse.json({
      success: true,
      data: {
        candles,
        symbol: env.SYMBOL,
        interval: '5m',
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

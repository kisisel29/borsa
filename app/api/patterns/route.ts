import { NextResponse } from 'next/server';
import { CandlestickPatternService } from '@/services/candlestickPatternService';

export async function GET() {
  try {
    const symbol = 'ETH/USDT';
    const currentTime = Date.now();
    
    console.log('Generating simulated candles for pattern detection');
    
    // Simüle edilmiş mum verileri oluştur
    const candles = [];
    const basePrice = 4250;
    const now = Date.now();
    
    for (let i = 287; i >= 0; i--) {
      const timestamp = now - (i * 5 * 60 * 1000);
      const priceChange = (Math.random() - 0.5) * 100;
      const open = basePrice + priceChange;
      const close = open + (Math.random() - 0.5) * 20;
      const high = Math.max(open, close) + Math.random() * 15;
      const low = Math.min(open, close) - Math.random() * 15;
      const volume = Math.random() * 1000 + 100;
      
      candles.push({
        time: timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat(volume.toFixed(2))
      });
    }
    
    // Pattern servisini kullanarak pattern'leri tespit et
    const patternService = new CandlestickPatternService();
    const patterns = patternService.detectPatterns(candles, currentTime);
    
    console.log(`Detected ${patterns.length} candlestick patterns at ${new Date(currentTime).toLocaleTimeString()}`);
    
    return NextResponse.json({
      success: true,
      data: {
        patterns,
        totalCandles: candles.length,
        completedCandles: patterns.length > 0 ? candles.length - 1 : candles.length, // Son mum henüz oluşuyorsa
        lastUpdated: new Date().toISOString(),
        currentTime: new Date(currentTime).toISOString(),
      },
    });

  } catch (error) {
    console.error('Patterns API error:', error);
    return NextResponse.json(
      { error: 'Failed to detect patterns', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

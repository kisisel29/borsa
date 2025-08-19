import { NextResponse } from 'next/server';
import { CandlestickPatternService } from '@/services/candlestickPatternService';
import { getEnv } from '@/lib/env';

export async function GET() {
  try {
    const env = getEnv();
    const symbol = env.SYMBOL.replace('/', '');
    
    // Doğrudan Binance API'sinden mum verilerini al
    const limit = 288;
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=${limit}`;
    
    console.log('Fetching candles for patterns from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mum verilerini dönüştür
    const candles = data.map((candle: any) => ({
      time: candle[0], // timestamp
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
    
    // Pattern servisini kullanarak pattern'leri tespit et
    const patternService = new CandlestickPatternService();
    const patterns = patternService.detectPatterns(candles);
    
    console.log(`Detected ${patterns.length} candlestick patterns`);
    
    return NextResponse.json({
      success: true,
      data: {
        patterns,
        totalCandles: candles.length,
        lastUpdated: new Date().toISOString(),
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

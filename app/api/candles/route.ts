import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function GET() {
  try {
    const env = getEnv();
    const symbol = env.SYMBOL.replace('/', '');
    
    // Son 24 saat için 5 dakikalık mum verisi (288 mum)
    const limit = 288;
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=${limit}`;
    
    console.log('Fetching candles from:', url);
    
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
    
    console.log(`Fetched ${candles.length} candles`);
    
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

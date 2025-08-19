import { NextResponse } from 'next/server';
import { CandlestickPatternService } from '@/services/candlestickPatternService';

export async function GET() {
  try {
    // Önce mum verilerini al
    const candlesResponse = await fetch('http://localhost:3003/api/candles');
    const candlesResult = await candlesResponse.json();
    
    if (!candlesResult.success) {
      throw new Error('Failed to fetch candles data');
    }
    
    const candles = candlesResult.data.candles;
    
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

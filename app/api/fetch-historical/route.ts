import { NextResponse } from 'next/server';
import { DataService } from '@/services/dataService';
import { getEnv } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const env = getEnv();
    const { symbol = env.SYMBOL, timeframe = env.TIMEFRAME, limit = 1000 } = await request.json();
    
    console.log(`Fetching historical data for ${symbol} ${timeframe}, limit: ${limit}`);
    
    const dataService = new DataService();
    
    // Fetch historical data
    const candles = await dataService.fetchLatestCandles(symbol, timeframe, limit);
    
    if (candles.length === 0) {
      return NextResponse.json(
        { error: 'No historical data available' },
        { status: 400 }
      );
    }
    
    // Store candles
    await dataService.storeCandles(candles, symbol, timeframe);
    
    await dataService.cleanup();
    
    console.log(`Successfully stored ${candles.length} candles for ${symbol} ${timeframe}`);
    
    return NextResponse.json({
      success: true,
      data: {
        candlesCount: candles.length,
        symbol,
        timeframe,
        firstCandle: candles[0],
        lastCandle: candles[candles.length - 1],
      },
    });
    
  } catch (error) {
    console.error('Historical data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

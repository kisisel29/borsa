import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { DataService } from '@/services/dataService';

export async function GET() {
  try {
    console.log('Fetch-data API called');
    const env = getEnv();
    
    const symbol = env.SYMBOL.replace('/', '');
    const proxyUrl = 'http://localhost:3004/api/binance';
    // Timestamp ekleyerek cache'i bypass et
    const timestamp = Date.now();
    const url = `${proxyUrl}/api/v3/ticker/24hr?symbol=${symbol}&timestamp=${timestamp}`;
    
    console.log('Fetching from:', url);
    
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
    const currentPrice = parseFloat(data.lastPrice);
    
    console.log('Price fetched successfully:', currentPrice, 'at', new Date().toISOString());
    console.log('24h change:', data.priceChange, 'Change percent:', data.priceChangePercent + '%');

    return NextResponse.json({
      success: true,
      data: {
        currentPrice,
        symbol: env.SYMBOL,
        lastUpdated: new Date().toISOString(),
        priceChange: data.priceChange,
        priceChangePercent: data.priceChangePercent,
      },
    });

  } catch (error) {
    console.error('Fetch data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

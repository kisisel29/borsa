import { prisma } from '@/lib/prisma';
import { getEnv } from '@/lib/env';

export class DataService {
  private env = getEnv();

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `https://api.binance.com${endpoint}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  }

  async fetchLatestCandles(symbol: string, timeframe: string, limit = 100): Promise<number[][]> {
    try {
      console.log(`Fetching latest ${limit} candles for ${symbol} ${timeframe}`);
      
      const symbolFormatted = symbol.replace('/', '');
      const interval = this.convertTimeframe(timeframe);
      const endpoint = `/api/v3/klines?symbol=${symbolFormatted}&interval=${interval}&limit=${limit}`;
      
      const data = await this.makeRequest(endpoint);
      
      const ohlcv = data.map((candle: any) => [
        candle[0], // timestamp
        parseFloat(candle[1]), // open
        parseFloat(candle[2]), // high
        parseFloat(candle[3]), // low
        parseFloat(candle[4]), // close
        parseFloat(candle[5])  // volume
      ]);
      
      console.log(`Fetched ${ohlcv.length} candles`);
      return ohlcv;
    } catch (error) {
      console.error('Error fetching candles:', error);
      throw new Error(`Failed to fetch candles: ${error}`);
    }
  }

  async storeCandles(ohlcv: number[][], symbol: string, timeframe: string): Promise<void> {
    try {
      const candleData = ohlcv.map(([timestamp, open, high, low, close, volume]) => ({
        exchange: this.env.EXCHANGE,
        symbol,
        timeframe,
        time: new Date(timestamp),
        open: open,
        high: high,
        low: low,
        close: close,
        volume: volume,
      }));

      await prisma.candle.createMany({
        data: candleData,
        skipDuplicates: true,
      });

      console.log(`Stored ${candleData.length} candles for ${symbol}`);
    } catch (error) {
      console.error('Error storing candles:', error);
    }
  }

  async getStoredCandles(
    symbol: string,
    timeframe: string,
    from?: Date,
    to?: Date,
    limit?: number
  ) {
    const where: any = {
      symbol,
      timeframe,
      exchange: this.env.EXCHANGE,
    };

    if (from || to) {
      where.time = {};
      if (from) where.time.gte = from;
      if (to) where.time.lte = to;
    }

    return await prisma.candle.findMany({
      where,
      orderBy: { time: 'asc' },
      take: limit,
    });
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const symbolFormatted = symbol.replace('/', '');
      const endpoint = `/api/v3/ticker/24hr?symbol=${symbolFormatted}`;
      
      const data = await this.makeRequest(endpoint);
      return parseFloat(data.lastPrice);
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw error;
    }
  }

  private convertTimeframe(timeframe: string): string {
    const mapping: { [key: string]: string } = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w'
    };
    
    return mapping[timeframe] || '1h';
  }

  async cleanup() {
    // Artık gerekli değil
  }
}
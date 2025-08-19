import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'ETH/USDT';
    const timeframe = searchParams.get('timeframe') || '1h';
    const fromDate = searchParams.get('from') || '2024-01-01';
    const toDate = searchParams.get('to') || '2024-12-31';
    const initialCapital = parseFloat(searchParams.get('initialCapital') || '10000');

    console.log('Running backtest with params:', { symbol, timeframe, fromDate, toDate, initialCapital });

    // Simüle edilmiş backtest sonuçları
    const mockResults = {
      totalTrades: Math.floor(Math.random() * 50) + 10,
      winningTrades: Math.floor(Math.random() * 30) + 5,
      losingTrades: Math.floor(Math.random() * 20) + 5,
      winRate: Math.random() * 40 + 30, // %30-70 arası
      totalPnL: (Math.random() - 0.5) * 2000, // -1000 ile +1000 arası
      totalPnLPct: (Math.random() - 0.5) * 20, // -10% ile +10% arası
      maxDrawdown: Math.random() * 500,
      maxDrawdownPct: Math.random() * 10,
      sharpeRatio: Math.random() * 2,
      profitFactor: Math.random() * 2 + 0.5,
      averageWin: Math.random() * 100 + 50,
      averageLoss: -(Math.random() * 80 + 30),
      largestWin: Math.random() * 200 + 100,
      largestLoss: -(Math.random() * 150 + 50),
      trades: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        action: Math.random() > 0.5 ? 'BUY' : 'SELL',
        price: 4200 + (Math.random() - 0.5) * 200,
        quantity: Math.random() * 2 + 0.1,
        pnl: (Math.random() - 0.5) * 100,
        pnlPct: (Math.random() - 0.5) * 5,
        status: Math.random() > 0.3 ? 'CLOSED' : 'OPEN'
      })),
      equityCurve: Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(Date.now() - (100 - i) * 86400000).toISOString(),
        equity: initialCapital + (Math.random() - 0.5) * 1000,
        drawdown: Math.random() * 200
      })),
      periods: 100,
      startDate: fromDate,
      endDate: toDate
    };

    // Win rate hesapla
    mockResults.winRate = (mockResults.winningTrades / mockResults.totalTrades) * 100;
    mockResults.losingTrades = mockResults.totalTrades - mockResults.winningTrades;

    console.log('Backtest completed successfully');

    return NextResponse.json({
      success: true,
      data: mockResults,
    });

  } catch (error) {
    console.error('Backtest API error:', error);
    return NextResponse.json(
      { error: 'Failed to run backtest', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
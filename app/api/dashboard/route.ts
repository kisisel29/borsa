import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DataService } from '@/services/dataService';
import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const env = getEnv();
    const dataService = new DataService();

    // Get current price
    const currentPrice = await dataService.getCurrentPrice(env.SYMBOL);

    // Get latest signal
    const latestSignal = await prisma.signal.findFirst({
      where: { symbol: env.SYMBOL },
      orderBy: { timestamp: 'desc' },
    });

    // Get open positions
    const openPositions = await prisma.position.findMany({
      where: { 
        symbol: env.SYMBOL,
        isOpen: true 
      },
      orderBy: { openTime: 'desc' },
    });

    // Get recent trades (last 10)
    const recentTrades = await prisma.trade.findMany({
      where: { 
        symbol: env.SYMBOL,
        isBacktest: false 
      },
      orderBy: { entryTime: 'desc' },
      take: 10,
    });

    // Calculate portfolio metrics
    const allTrades = await prisma.trade.findMany({
      where: { 
        symbol: env.SYMBOL,
        isBacktest: false 
      },
    });

    const totalTrades = allTrades.length;
    const winningTrades = allTrades.filter(trade => trade.pnl && trade.pnl > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    const totalPnL = allTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalPnLPct = totalPnL / env.INITIAL_CAPITAL * 100;

    // Calculate available capital (simplified)
    const usedCapital = openPositions.reduce((sum, pos) => sum + (pos.openPrice * pos.size), 0);
    const availableCapital = env.INITIAL_CAPITAL + totalPnL - usedCapital;

    // Get chart data (last 100 candles)
    const candles = await dataService.getStoredCandles(env.SYMBOL, env.TIMEFRAME, undefined, undefined, 100);
    const chartData = candles.map(candle => ({
      time: candle.time.toISOString(),
      price: candle.close,
    }));

    await dataService.cleanup();

    return NextResponse.json({
      success: true,
      data: {
        currentPrice,
        symbol: env.SYMBOL,
        latestSignal,
        openPositions,
        recentTrades,
        portfolio: {
          initialCapital: env.INITIAL_CAPITAL,
          availableCapital,
          totalPnL,
          totalPnLPct,
          totalTrades,
          winRate,
        },
        chartData,
        lastUpdated: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { BacktestService } from '@/services/backtestService';
import { DataService } from '@/services/dataService';
import { getEnv } from '@/lib/env';
// import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const env = getEnv();
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const symbol = searchParams.get('symbol') || env.SYMBOL;
    const timeframe = searchParams.get('timeframe') || env.TIMEFRAME;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const initialCapital = parseFloat(searchParams.get('initialCapital') || env.INITIAL_CAPITAL.toString());
    
    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to parameters are required' },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    logger.info(`Backtest requested for ${symbol} from ${fromDate} to ${toDate}`);

    // First, ensure we have enough historical data
    const dataService = new DataService();
    
    try {
      // Fetch historical data if needed
      logger.info('Fetching historical data for backtest...');
      const historicalCandles = await dataService.fetchLatestCandles(symbol, timeframe, 1000);
      await dataService.storeCandles(historicalCandles, symbol, timeframe);
      logger.info(`Stored ${historicalCandles.length} candles for backtest`);
    } catch (dataError) {
      logger.warn('Could not fetch additional data, proceeding with existing data');
    }

    // Strategy parameters
    const strategyParams = {
      emaFast: env.EMA_FAST,
      emaSlow: env.EMA_SLOW,
      rsiPeriod: env.RSI_PERIOD,
      rsiLow: env.RSI_LO,
      rsiHigh: env.RSI_HI,
      macdFast: env.MACD_FAST,
      macdSlow: env.MACD_SLOW,
      macdSignal: env.MACD_SIGNAL,
    };

    const riskParams = {
      stopLossPct: env.SL_PCT,
      takeProfitPct: env.TP_PCT,
      maxPositionSizePct: env.MAX_POSITION_SIZE_PCT,
    };

    const backtestService = new BacktestService();
    
    const results = await backtestService.runBacktest({
      symbol,
      timeframe,
      fromDate,
      toDate,
      initialCapital,
      strategyParams,
      riskParams,
    });

    await dataService.cleanup();

    logger.info(`Backtest API completed: ${results.totalTrades} trades`);

    return NextResponse.json({
      success: true,
      data: results,
    });
    
  } catch (error) {
    logger.error('Backtest API error:', error);
    return NextResponse.json(
      { error: 'Backtest failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
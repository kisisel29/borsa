import { NextResponse } from 'next/server';
import { StrategyEngine } from '@/services/strategyEngine';
import { DataService } from '@/services/dataService';
import { getEnv } from '@/lib/env';
// import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const env = getEnv();
    const dataService = new DataService();
    const strategyEngine = new StrategyEngine();

    // Get latest candles for signal generation
    const candles = await dataService.getStoredCandles(env.SYMBOL, env.TIMEFRAME, undefined, undefined, 100);
    
    if (candles.length === 0) {
      return NextResponse.json(
        { error: 'No data available for signal generation' },
        { status: 400 }
      );
    }

    // Get current price
    const currentPrice = await dataService.getCurrentPrice(env.SYMBOL);

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

    // Generate signal
    const signal = strategyEngine.generateSignal(candles, strategyParams, currentPrice);

    // Store signal in database
    try {
      await prisma.signal.create({
        data: {
          symbol: env.SYMBOL,
          action: signal.action,
          price: currentPrice,
          confidence: signal.confidence,
          timestamp: new Date(),
          reasoning: signal.reasoning,
        },
      });
    } catch (dbError) {
      logger.warn('Could not store signal in database:', dbError);
    }

    await dataService.cleanup();

    logger.info(`Signal generated: ${signal.action} at ${currentPrice} (confidence: ${signal.confidence})`);

    return NextResponse.json({
      success: true,
      data: {
        signal,
        currentPrice,
        symbol: env.SYMBOL,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Signal generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

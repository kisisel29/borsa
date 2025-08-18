import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/services/dataService';
import { StrategyEngine } from '@/services/strategyEngine';
import { PaperBroker } from '@/services/paperBroker';
import { prisma } from '@/lib/prisma';
import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { CandleData } from '@/services/indicatorService';

export async function POST(request: NextRequest) {
  try {
    const env = getEnv();
    
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== env.CRON_SECRET) {
      logger.warn('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Starting cron job: fetch and process signals');

    const dataService = new DataService();
    const strategyEngine = new StrategyEngine();
    const paperBroker = new PaperBroker(env.INITIAL_CAPITAL);

    try {
      // 1. Fetch latest market data
      const ohlcv = await dataService.fetchLatestCandles(env.SYMBOL, env.TIMEFRAME, 100);
      await dataService.storeCandles(ohlcv, env.SYMBOL, env.TIMEFRAME);

      // 2. Get stored candles for analysis
      const dbCandles = await dataService.getStoredCandles(env.SYMBOL, env.TIMEFRAME, undefined, undefined, 200);
      
      if (dbCandles.length < 50) {
        logger.warn('Not enough historical data for analysis');
        return NextResponse.json({ 
          success: true, 
          message: 'Not enough historical data, skipping signal generation' 
        });
      }

      // Convert Prisma candles to CandleData format
      const candles: CandleData[] = dbCandles.map(candle => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      }));

      // 3. Get current price
      const currentPrice = await dataService.getCurrentPrice(env.SYMBOL);

      // 4. Check stop loss and take profit for open positions
      await paperBroker.checkStopLossAndTakeProfit(env.SYMBOL, currentPrice);

      // 5. Generate signal
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

      const signal = strategyEngine.generateSignal(candles, strategyParams, currentPrice);

      // 6. Store signal in database
      await prisma.signal.create({
        data: {
          symbol: env.SYMBOL,
          action: signal.action,
          price: signal.price,
          timestamp: new Date(),
          emaFast: signal.indicators.emaFast,
          emaSlow: signal.indicators.emaSlow,
          rsi: signal.indicators.rsi,
          macdValue: signal.indicators.macdValue,
          macdSignal: signal.indicators.macdSignal,
          macdHist: signal.indicators.macdHistogram,
          notes: signal.reasoning.join('; '),
        },
      });

      // 7. Execute trading logic
      let actionTaken = 'No action';

      if (signal.action === 'BUY' && signal.confidence > 0.6) {
        const openPositions = await paperBroker.getOpenPositions(env.SYMBOL);
        
        if (openPositions.length === 0) {
          const result = await paperBroker.openPosition(
            signal,
            {
              stopLossPct: env.SL_PCT,
              takeProfitPct: env.TP_PCT,
              maxPositionSizePct: env.MAX_POSITION_SIZE_PCT,
            },
            env.SYMBOL
          );
          
          if (result.success) {
            actionTaken = `Opened LONG position: ${result.message}`;
          } else {
            actionTaken = `Failed to open position: ${result.message}`;
          }
        } else {
          actionTaken = 'Position already open, skipping';
        }
      } else if (signal.action === 'SELL') {
        const openPositions = await paperBroker.getOpenPositions(env.SYMBOL);
        
        for (const position of openPositions) {
          if (position.side === 'LONG') {
            const result = await paperBroker.closePosition(
              position.id,
              currentPrice,
              'Signal reversal'
            );
            
            if (result.success) {
              actionTaken = `Closed LONG position: ${result.message}`;
            }
          }
        }
      }

      logger.info(`Cron job completed. Signal: ${signal.action}, Action: ${actionTaken}`);

      return NextResponse.json({
        success: true,
        data: {
          signal: {
            action: signal.action,
            confidence: signal.confidence,
            price: signal.price,
            reasoning: signal.reasoning,
          },
          actionTaken,
          timestamp: new Date().toISOString(),
        },
      });

    } finally {
      await dataService.cleanup();
    }

  } catch (error) {
    logger.error('Cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
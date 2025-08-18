import { IndicatorService, IndicatorValues, CandleData } from './indicatorService';
import { logger } from '@/lib/logger';

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface StrategyParams {
  emaFast: number;
  emaSlow: number;
  rsiPeriod: number;
  rsiLow: number;
  rsiHigh: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
}

export interface SignalResult {
  action: SignalType;
  confidence: number; // 0-1
  price: number;
  indicators: IndicatorValues;
  reasoning: string[];
}

export class StrategyEngine {
  private indicatorService: IndicatorService;

  constructor() {
    this.indicatorService = new IndicatorService();
  }

  generateSignal(
    candles: CandleData[],
    params: StrategyParams,
    currentPrice: number
  ): SignalResult {
    if (candles.length < Math.max(params.emaSlow, params.rsiPeriod, params.macdSlow) + 10) {
      return {
        action: 'HOLD',
        confidence: 0,
        price: currentPrice,
        indicators: this.getEmptyIndicators(),
        reasoning: ['Insufficient historical data for analysis'],
      };
    }

    // Calculate indicators
    const indicators = this.indicatorService.calculateIndicators(candles, {
      emaFast: params.emaFast,
      emaSlow: params.emaSlow,
      rsiPeriod: params.rsiPeriod,
      macdFast: params.macdFast,
      macdSlow: params.macdSlow,
      macdSignal: params.macdSignal,
    });

    // Get latest values
    const latest = indicators[indicators.length - 1];
    const previous = indicators[indicators.length - 2];

    if (!this.hasRequiredIndicators(latest)) {
      return {
        action: 'HOLD',
        confidence: 0,
        price: currentPrice,
        indicators: latest,
        reasoning: ['Missing required indicator values'],
      };
    }

    // Strategy logic
    const reasoning: string[] = [];
    let buySignals = 0;
    let sellSignals = 0;
    let confidence = 0;

    // EMA Crossover Strategy
    if (latest.emaFast! > latest.emaSlow!) {
      if (previous?.emaFast! <= previous?.emaSlow!) {
        buySignals += 3;
        reasoning.push(`EMA Golden Cross: Fast(${latest.emaFast!.toFixed(2)}) > Slow(${latest.emaSlow!.toFixed(2)})`);
      } else {
        buySignals += 1;
        reasoning.push(`EMA Bullish: Fast > Slow`);
      }
    } else {
      if (previous?.emaFast! >= previous?.emaSlow!) {
        sellSignals += 3;
        reasoning.push(`EMA Death Cross: Fast(${latest.emaFast!.toFixed(2)}) < Slow(${latest.emaSlow!.toFixed(2)})`);
      } else {
        sellSignals += 1;
        reasoning.push(`EMA Bearish: Fast < Slow`);
      }
    }

    // RSI Strategy
    if (latest.rsi! < params.rsiLow) {
      buySignals += 2;
      reasoning.push(`RSI Oversold: ${latest.rsi!.toFixed(2)} < ${params.rsiLow}`);
    } else if (latest.rsi! > params.rsiHigh) {
      sellSignals += 2;
      reasoning.push(`RSI Overbought: ${latest.rsi!.toFixed(2)} > ${params.rsiHigh}`);
    } else if (latest.rsi! > 50) {
      buySignals += 1;
      reasoning.push(`RSI Bullish: ${latest.rsi!.toFixed(2)} > 50`);
    } else {
      sellSignals += 1;
      reasoning.push(`RSI Bearish: ${latest.rsi!.toFixed(2)} < 50`);
    }

    // MACD Strategy
    if (latest.macdHistogram! > 0) {
      if (previous?.macdHistogram! <= 0) {
        buySignals += 2;
        reasoning.push(`MACD Bullish Crossover: Histogram ${latest.macdHistogram!.toFixed(4)}`);
      } else {
        buySignals += 1;
        reasoning.push(`MACD Bullish: Histogram > 0`);
      }
    } else {
      if (previous?.macdHistogram! >= 0) {
        sellSignals += 2;
        reasoning.push(`MACD Bearish Crossover: Histogram ${latest.macdHistogram!.toFixed(4)}`);
      } else {
        sellSignals += 1;
        reasoning.push(`MACD Bearish: Histogram < 0`);
      }
    }

    // Determine signal
    let action: SignalType = 'HOLD';
    
    if (buySignals >= 4 && buySignals > sellSignals + 1) {
      action = 'BUY';
      confidence = Math.min(buySignals / 6, 1);
    } else if (sellSignals >= 4 && sellSignals > buySignals + 1) {
      action = 'SELL';
      confidence = Math.min(sellSignals / 6, 1);
    } else {
      confidence = 0.3;
      reasoning.push(`Signals mixed: Buy(${buySignals}) vs Sell(${sellSignals})`);
    }

    logger.debug(`Signal generated: ${action} with confidence ${confidence.toFixed(2)}`);

    return {
      action,
      confidence,
      price: currentPrice,
      indicators: latest,
      reasoning,
    };
  }

  private hasRequiredIndicators(indicators: IndicatorValues): boolean {
    return (
      indicators.emaFast !== null &&
      indicators.emaSlow !== null &&
      indicators.rsi !== null &&
      indicators.macdValue !== null &&
      indicators.macdSignal !== null &&
      indicators.macdHistogram !== null
    );
  }

  private getEmptyIndicators(): IndicatorValues {
    return {
      emaFast: null,
      emaSlow: null,
      rsi: null,
      macdValue: null,
      macdSignal: null,
      macdHistogram: null,
    };
  }
}
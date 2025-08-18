import { EMA, RSI, MACD } from 'technicalindicators';
import { logger } from '@/lib/logger';

export interface CandleData {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValues {
  emaFast: number | null;
  emaSlow: number | null;
  rsi: number | null;
  macdValue: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
}

export class IndicatorService {
  calculateEMA(prices: number[], period: number): number[] {
    try {
      return EMA.calculate({ period, values: prices });
    } catch (error) {
      logger.error(`Error calculating EMA(${period}):`, error);
      return [];
    }
  }

  calculateRSI(prices: number[], period: number = 14): number[] {
    try {
      return RSI.calculate({ period, values: prices });
    } catch (error) {
      logger.error(`Error calculating RSI(${period}):`, error);
      return [];
    }
  }

  calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): Array<{ MACD: number; signal: number; histogram: number }> {
    try {
      return MACD.calculate({
        values: prices,
        fastPeriod,
        slowPeriod,
        signalPeriod,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });
    } catch (error) {
      logger.error(`Error calculating MACD(${fastPeriod},${slowPeriod},${signalPeriod}):`, error);
      return [];
    }
  }

  calculateIndicators(
    candles: CandleData[],
    params: {
      emaFast: number;
      emaSlow: number;
      rsiPeriod: number;
      macdFast: number;
      macdSlow: number;
      macdSignal: number;
    }
  ): IndicatorValues[] {
    if (candles.length === 0) {
      return [];
    }

    const closePrices = candles.map(c => c.close);
    
    // Calculate indicators
    const emaFastValues = this.calculateEMA(closePrices, params.emaFast);
    const emaSlowValues = this.calculateEMA(closePrices, params.emaSlow);
    const rsiValues = this.calculateRSI(closePrices, params.rsiPeriod);
    const macdValues = this.calculateMACD(
      closePrices,
      params.macdFast,
      params.macdSlow,
      params.macdSignal
    );

    // Combine results - align with the original candle array
    const results: IndicatorValues[] = [];
    const maxStartIndex = Math.max(
      params.emaSlow - 1,
      params.rsiPeriod - 1,
      params.macdSlow - 1
    );

    for (let i = 0; i < candles.length; i++) {
      const result: IndicatorValues = {
        emaFast: null,
        emaSlow: null,
        rsi: null,
        macdValue: null,
        macdSignal: null,
        macdHistogram: null,
      };

      // EMA Fast
      const emaFastIndex = i - (params.emaFast - 1);
      if (emaFastIndex >= 0 && emaFastIndex < emaFastValues.length) {
        result.emaFast = emaFastValues[emaFastIndex];
      }

      // EMA Slow
      const emaSlowIndex = i - (params.emaSlow - 1);
      if (emaSlowIndex >= 0 && emaSlowIndex < emaSlowValues.length) {
        result.emaSlow = emaSlowValues[emaSlowIndex];
      }

      // RSI
      const rsiIndex = i - (params.rsiPeriod - 1);
      if (rsiIndex >= 0 && rsiIndex < rsiValues.length) {
        result.rsi = rsiValues[rsiIndex];
      }

      // MACD
      const macdIndex = i - (params.macdSlow - 1);
      if (macdIndex >= 0 && macdIndex < macdValues.length) {
        const macdData = macdValues[macdIndex];
        result.macdValue = macdData.MACD;
        result.macdSignal = macdData.signal;
        result.macdHistogram = macdData.histogram;
      }

      results.push(result);
    }

    logger.debug(`Calculated indicators for ${candles.length} candles`);
    return results;
  }

  getLatestIndicator(indicators: IndicatorValues[]): IndicatorValues | null {
    if (indicators.length === 0) return null;
    return indicators[indicators.length - 1];
  }
}
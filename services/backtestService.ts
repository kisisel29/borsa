import { DataService } from './dataService';
import { StrategyEngine, StrategyParams } from './strategyEngine';
import { PaperBroker } from './paperBroker';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface BacktestParams {
  symbol: string;
  timeframe: string;
  fromDate: Date;
  toDate: Date;
  initialCapital: number;
  strategyParams: StrategyParams;
  riskParams: {
    stopLossPct: number;
    takeProfitPct: number;
    maxPositionSizePct: number;
  };
}

export interface BacktestResults {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPct: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  trades: any[];
  equityCurve: Array<{ timestamp: Date; equity: number; drawdown: number }>;
  periods: number;
  startDate: Date;
  endDate: Date;
}

export class BacktestService {
  private dataService: DataService;
  private strategyEngine: StrategyEngine;

  constructor() {
    this.dataService = new DataService();
    this.strategyEngine = new StrategyEngine();
  }

  async runBacktest(params: BacktestParams): Promise<BacktestResults> {
    logger.info(`Starting backtest for ${params.symbol} from ${params.fromDate} to ${params.toDate}`);

    // Get historical data
    const candles = await this.dataService.getStoredCandles(
      params.symbol,
      params.timeframe,
      params.fromDate,
      params.toDate
    );

    if (candles.length === 0) {
      throw new Error('No historical data found for the specified period');
    }

    logger.info(`Backtesting with ${candles.length} candles`);

    // Initialize backtest state
    let currentCapital = params.initialCapital;
    let openPosition: any = null;
    const trades: any[] = [];
    const equityCurve: Array<{ timestamp: Date; equity: number; drawdown: number }> = [];
    let maxEquity = params.initialCapital;
    let maxDrawdown = 0;

    // Process each candle
    for (let i = 50; i < candles.length; i++) { // Start from 50 to have enough data for indicators
      const currentCandle = candles[i];
      const historicalCandles = candles.slice(0, i + 1);
      const currentPrice = currentCandle.close;

      // Generate signal
      const signal = this.strategyEngine.generateSignal(
        historicalCandles,
        params.strategyParams,
        currentPrice
      );

      // Execute trading logic
      if (!openPosition && (signal.action === 'BUY' || signal.action === 'SELL')) {
        // Open new position
        if (signal.confidence > 0.5) { // Only trade on high confidence signals
          const positionSize = (currentCapital * params.riskParams.maxPositionSizePct) / currentPrice;
          
          openPosition = {
            side: signal.action === 'BUY' ? 'LONG' : 'SHORT',
            entryTime: currentCandle.time,
            entryPrice: currentPrice,
            size: positionSize,
            stopLoss: signal.action === 'BUY' 
              ? currentPrice * (1 - params.riskParams.stopLossPct)
              : currentPrice * (1 + params.riskParams.stopLossPct),
            takeProfit: signal.action === 'BUY'
              ? currentPrice * (1 + params.riskParams.takeProfitPct)
              : currentPrice * (1 - params.riskParams.takeProfitPct),
          };
        }
      } else if (openPosition) {
        // Check for exit conditions
        let shouldClose = false;
        let exitReason = '';

        // Check stop loss and take profit
        if (openPosition.side === 'LONG') {
          if (currentPrice <= openPosition.stopLoss) {
            shouldClose = true;
            exitReason = 'Stop Loss';
          } else if (currentPrice >= openPosition.takeProfit) {
            shouldClose = true;
            exitReason = 'Take Profit';
          } else if (signal.action === 'SELL' && signal.confidence > 0.6) {
            shouldClose = true;
            exitReason = 'Signal Reversal';
          }
        }

        if (shouldClose) {
          // Calculate PnL
          const pnl = openPosition.side === 'LONG'
            ? (currentPrice - openPosition.entryPrice) * openPosition.size
            : (openPosition.entryPrice - currentPrice) * openPosition.size;
          
          const pnlPct = (pnl / (openPosition.entryPrice * openPosition.size)) * 100;
          
          // Update capital
          currentCapital += pnl;

          // Record trade
          const trade = {
            side: openPosition.side,
            entryTime: openPosition.entryTime,
            exitTime: currentCandle.time,
            entryPrice: openPosition.entryPrice,
            exitPrice: currentPrice,
            size: openPosition.size,
            pnl,
            pnlPct,
            stopLoss: openPosition.stopLoss,
            takeProfit: openPosition.takeProfit,
            notes: exitReason,
            symbol: params.symbol,
            isBacktest: true,
          };

          trades.push(trade);
          openPosition = null;
        }
      }

      // Update equity curve
      let unrealizedPnL = 0;
      if (openPosition && openPosition.side === 'LONG') {
        unrealizedPnL = (currentPrice - openPosition.entryPrice) * openPosition.size;
      }

      const currentEquity = currentCapital + unrealizedPnL;
      maxEquity = Math.max(maxEquity, currentEquity);
      const drawdown = maxEquity - currentEquity;
      const drawdownPct = (drawdown / maxEquity) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdownPct);

      equityCurve.push({
        timestamp: currentCandle.time,
        equity: currentEquity,
        drawdown: drawdownPct,
      });
    }

    // Store backtest trades in database
    for (const trade of trades) {
      await prisma.trade.create({
        data: {
          side: trade.side,
          entryTime: trade.entryTime,
          exitTime: trade.exitTime,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          size: trade.size,
          pnl: trade.pnl,
          pnlPct: trade.pnlPct,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          symbol: trade.symbol,
          notes: trade.notes,
          isBacktest: true,
        },
      });
    }

    // Calculate performance metrics
    const results = this.calculateMetrics(trades, params.initialCapital, equityCurve, params);
    
    logger.info(`Backtest completed: ${results.totalTrades} trades, ${results.totalPnLPct.toFixed(2)}% return`);
    
    return results;
  }

  private calculateMetrics(
    trades: any[],
    initialCapital: number,
    equityCurve: Array<{ timestamp: Date; equity: number; drawdown: number }>,
    params: BacktestParams
  ): BacktestResults {
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalPnLPct = (totalPnL / initialCapital) * 100;
    
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;
    
    const averageWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
    
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0;
    
    const maxDrawdown = equityCurve.length > 0 ? Math.max(...equityCurve.map(e => e.drawdown)) : 0;
    const maxDrawdownAmount = (maxDrawdown / 100) * Math.max(...equityCurve.map(e => e.equity));
    
    // Simple Sharpe ratio approximation (annualized)
    const returns = equityCurve.map((e, i) => 
      i === 0 ? 0 : (e.equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity
    ).slice(1);
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const returnStd = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    
    const sharpeRatio = returnStd > 0 ? (avgReturn * 252) / (returnStd * Math.sqrt(252)) : 0; // Assuming daily data

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalPnL,
      totalPnLPct,
      maxDrawdown: maxDrawdownAmount,
      maxDrawdownPct: maxDrawdown,
      sharpeRatio,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      trades,
      equityCurve,
      periods: equityCurve.length,
      startDate: params.fromDate,
      endDate: params.toDate,
    };
  }
}
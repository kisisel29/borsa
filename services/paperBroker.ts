import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { SignalResult } from './strategyEngine';

export interface OpenPositionResult {
  success: boolean;
  positionId?: string;
  message: string;
}

export interface ClosePositionResult {
  success: boolean;
  tradeId?: string;
  pnl?: number;
  pnlPct?: number;
  message: string;
}

export class PaperBroker {
  private initialCapital: number;

  constructor(initialCapital: number = 10000) {
    this.initialCapital = initialCapital;
  }

  async openPosition(
    signal: SignalResult,
    riskParams: {
      stopLossPct: number;
      takeProfitPct: number;
      maxPositionSizePct: number;
    },
    symbol: string = 'ETH/USDT'
  ): Promise<OpenPositionResult> {
    try {
      // Check if there's already an open position
      const existingPosition = await prisma.position.findFirst({
        where: { symbol, isOpen: true },
      });

      if (existingPosition) {
        return {
          success: false,
          message: 'Position already open for this symbol',
        };
      }

      // Calculate position size based on available capital
      const availableCapital = await this.getAvailableCapital();
      const maxPositionValue = availableCapital * riskParams.maxPositionSizePct;
      const positionSize = maxPositionValue / signal.price;

      // Calculate stop loss and take profit
      const entryPrice = signal.price;
      let stopLoss: number | null = null;
      let takeProfit: number | null = null;

      if (signal.action === 'BUY') {
        stopLoss = entryPrice * (1 - riskParams.stopLossPct);
        takeProfit = entryPrice * (1 + riskParams.takeProfitPct);
      }

      // Create position
      const position = await prisma.position.create({
        data: {
          side: signal.action === 'BUY' ? 'LONG' : 'SHORT',
          openTime: new Date(),
          openPrice: entryPrice,
          size: positionSize,
          stopLoss,
          takeProfit,
          symbol,
          isOpen: true,
        },
      });

      logger.info(`Opened ${signal.action} position: ${positionSize} ${symbol} @ $${signal.price}`);

      return {
        success: true,
        positionId: position.id,
        message: `Opened ${signal.action} position: ${positionSize.toFixed(6)} ${symbol}`,
      };
    } catch (error) {
      logger.error('Error opening position:', error);
      return {
        success: false,
        message: `Failed to open position: ${error}`,
      };
    }
  }

  async closePosition(
    positionId: string,
    currentPrice: number,
    reason: string = 'Manual close'
  ): Promise<ClosePositionResult> {
    try {
      const position = await prisma.position.findUnique({
        where: { id: positionId },
      });

      if (!position || !position.isOpen) {
        return {
          success: false,
          message: 'Position not found or already closed',
        };
      }

      const exitPrice = currentPrice;
      const entryPrice = position.openPrice;
      const size = position.size;

      // Calculate PnL
      let pnl: number;
      if (position.side === 'LONG') {
        pnl = (exitPrice - entryPrice) * size;
      } else {
        pnl = (entryPrice - exitPrice) * size;
      }

      const pnlPct = (pnl / (entryPrice * size)) * 100;

      // Create trade record
      const trade = await prisma.trade.create({
        data: {
          side: position.side,
          entryTime: position.openTime,
          exitTime: new Date(),
          entryPrice: entryPrice,
          exitPrice: exitPrice,
          size: size,
          pnl: pnl,
          pnlPct: pnlPct,
          stopLoss: position.stopLoss,
          takeProfit: position.takeProfit,
          symbol: position.symbol,
          notes: reason,
          isBacktest: false,
        },
      });

      // Close position
      await prisma.position.update({
        where: { id: positionId },
        data: { isOpen: false },
      });

      logger.info(`Closed position: PnL ${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)`);

      return {
        success: true,
        tradeId: trade.id,
        pnl: pnl,
        pnlPct: pnlPct,
        message: `Position closed. PnL: $${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)`,
      };
    } catch (error) {
      logger.error('Error closing position:', error);
      return {
        success: false,
        message: `Failed to close position: ${error}`,
      };
    }
  }

  async checkStopLossAndTakeProfit(symbol: string, currentPrice: number) {
    const openPositions = await prisma.position.findMany({
      where: { symbol, isOpen: true },
    });

    for (const position of openPositions) {
      let shouldClose = false;
      let reason = '';

      if (position.side === 'LONG') {
        if (position.stopLoss && currentPrice <= position.stopLoss) {
          shouldClose = true;
          reason = 'Stop Loss triggered';
        } else if (position.takeProfit && currentPrice >= position.takeProfit) {
          shouldClose = true;
          reason = 'Take Profit triggered';
        }
      }

      if (shouldClose) {
        await this.closePosition(position.id, currentPrice, reason);
      }
    }
  }

  async getOpenPositions(symbol?: string) {
    const where: any = { isOpen: true };
    if (symbol) where.symbol = symbol;

    return await prisma.position.findMany({
      where,
      orderBy: { openTime: 'desc' },
    });
  }

  async getTradeHistory(symbol?: string, limit: number = 50) {
    const where: any = { isBacktest: false };
    if (symbol) where.symbol = symbol;

    return await prisma.trade.findMany({
      where,
      orderBy: { exitTime: 'desc' },
      take: limit,
    });
  }

  async getAvailableCapital(): Promise<number> {
    // Calculate available capital (initial - used in open positions)
    const openPositions = await prisma.position.findMany({
      where: { isOpen: true },
    });

    let usedCapital = 0;
    for (const position of openPositions) {
      usedCapital += position.openPrice * position.size;
    }

    return Math.max(0, this.initialCapital - usedCapital);
  }
}
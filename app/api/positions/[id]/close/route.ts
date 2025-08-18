import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DataService } from '@/services/dataService';
import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const env = getEnv();
    const dataService = new DataService();
    const positionId = params.id;

    // Get current price
    const currentPrice = await dataService.getCurrentPrice(env.SYMBOL);

    // Find the position
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    if (!position.isOpen) {
      return NextResponse.json(
        { error: 'Position is already closed' },
        { status: 400 }
      );
    }

    // Calculate PnL
    let pnl = 0;
    let pnlPct = 0;

    if (position.side === 'LONG') {
      pnl = (currentPrice - position.openPrice) * position.size;
      pnlPct = ((currentPrice - position.openPrice) / position.openPrice) * 100;
    }

    // Close the position
    await prisma.position.update({
      where: { id: positionId },
      data: {
        isOpen: false,
        unrealizedPnl: pnl,
      },
    });

    // Create trade record
    await prisma.trade.create({
      data: {
        side: position.side,
        entryTime: position.openTime,
        exitTime: new Date(),
        entryPrice: position.openPrice,
        exitPrice: currentPrice,
        size: position.size,
        pnl: pnl,
        pnlPct: pnlPct,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        notes: 'Manual close',
        symbol: position.symbol,
        isBacktest: false,
      },
    });

    await dataService.cleanup();

    logger.info(`Position ${positionId} closed manually. PnL: ${pnl.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      data: {
        positionId,
        pnl,
        pnlPct,
        closePrice: currentPrice,
      },
    });

  } catch (error) {
    logger.error('Close position API error:', error);
    return NextResponse.json(
      { error: 'Failed to close position', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

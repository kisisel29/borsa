import { NextResponse } from 'next/server';
import { DataService } from '@/services/dataService';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('Test endpoint called');
    
    const dataService = new DataService();
    
    // Test current price
    const currentPrice = await dataService.getCurrentPrice('ETH/USDT');
    
    await dataService.cleanup();
    
    return NextResponse.json({
      success: true,
      data: {
        currentPrice,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    logger.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

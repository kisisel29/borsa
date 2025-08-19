import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basit bir test - her çağrıda farklı fiyat döndür
    const basePrice = 4260;
    const randomChange = Math.random() * 20 - 10; // -10 ile +10 arası rastgele değişim
    const currentPrice = basePrice + randomChange;
    
    console.log('Test price generated:', currentPrice);

    return NextResponse.json({
      success: true,
      data: {
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        symbol: 'ETH/USDT',
        lastUpdated: new Date().toISOString(),
        priceChange: randomChange.toFixed(2),
        priceChangePercent: (randomChange / basePrice * 100).toFixed(2),
      },
    });

  } catch (error) {
    console.error('Test price API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test price' },
      { status: 500 }
    );
  }
}

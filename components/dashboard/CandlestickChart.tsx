'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, ColorType } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  symbol: string;
  currentPrice?: number;
}

export function CandlestickChart({ symbol, currentPrice }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandles = async () => {
    try {
      const response = await fetch('/api/candles');
      const result = await response.json();
      
      if (result.success) {
        setCandles(result.data.candles);
      } else {
        console.error('Failed to fetch candles:', result.error);
      }
    } catch (error) {
      console.error('Error fetching candles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandles();
    
    // 3 saniyede bir mum verilerini güncelle
    const interval = setInterval(fetchCandles, 3000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#374151', style: LineStyle.Dotted },
        horzLines: { color: '#374151', style: LineStyle.Dotted },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      rightPriceScale: {
        borderColor: '#374151',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        visible: true,
        autoScale: true,
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 3, // Mumlar arası mesafe
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        visible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#3B82F6',
          width: 1,
          style: LineStyle.Solid,
          labelVisible: true,
        },
        horzLine: {
          color: '#3B82F6',
          width: 1,
          style: LineStyle.Solid,
          labelVisible: true,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderDownColor: '#EF4444',
      borderUpColor: '#10B981',
      wickDownColor: '#EF4444',
      wickUpColor: '#10B981',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // Mum verilerini grafik formatına dönüştür
    const chartData = candles.map(candle => ({
      time: candle.time / 1000 as any,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(chartData);
    
    // Grafiği son 50 mumu gösterecek şekilde ayarla
    const visibleRange = chart.timeScale().getVisibleRange();
    if (visibleRange) {
      const lastIndex = chartData.length - 1;
      const startIndex = Math.max(0, lastIndex - 50);
      chart.timeScale().setVisibleRange({
        from: chartData[startIndex].time,
        to: chartData[lastIndex].time,
      });
    }

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles]);

  // Canlı fiyat güncellemesi için son mumu güncelle
  useEffect(() => {
    if (currentPrice && candlestickSeriesRef.current && candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      const updatedCandle = {
        time: lastCandle.time / 1000 as any,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, currentPrice),
        low: Math.min(lastCandle.low, currentPrice),
        close: currentPrice,
      };
      
      candlestickSeriesRef.current.update(updatedCandle);
    }
  }, [currentPrice, candles]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{symbol} 5m Candlesticks (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading candlestick data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (candles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{symbol} 5m Candlesticks (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No candlestick data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{symbol} 5m Candlesticks (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full" />
      </CardContent>
    </Card>
  );
}

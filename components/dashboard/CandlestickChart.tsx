'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';

interface CandlestickChartProps {
  symbol: string;
  currentPrice: number | null;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function CandlestickChart({ symbol, currentPrice }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Her 3 saniyede bir mum verilerini güncelle
  useEffect(() => {
    const fetchCandles = async () => {
      try {
        console.log('🔄 Fetching candlestick data...');
        const response = await fetch('/api/candles');
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Candles updated:', result.data.candles.length, 'candles');
          setCandles(result.data.candles);
          setLastUpdate(new Date());
          setLoading(false);
          setError(null);
          
          // Mum verileri güncellendiğinde sinyal ve pattern'leri de güncelle
          await updateSignalsAndPatterns();
        } else {
          console.log('❌ Candles error:', result.error);
          setError(result.error);
          setLoading(false);
        }
      } catch (err) {
        console.log('❌ Candles fetch failed:', err);
        setError('Failed to fetch candlestick data');
        setLoading(false);
      }
    };

    // İlk yükleme
    fetchCandles();

    // Her 3 saniyede bir güncelle
    const interval = setInterval(fetchCandles, 3000);

    return () => clearInterval(interval);
  }, []);

  // Sinyal ve pattern güncelleme fonksiyonu
  const updateSignalsAndPatterns = async () => {
    try {
      console.log('🎯 Updating signals and patterns...');
      
      // Sinyal güncelle
      const signalResponse = await fetch('/api/signals');
      if (signalResponse.ok) {
        console.log('✅ Signal updated');
      }
      
      // Pattern güncelle
      const patternResponse = await fetch('/api/patterns');
      if (patternResponse.ok) {
        console.log('✅ Patterns updated');
      }
    } catch (error) {
      console.error('❌ Failed to update signals/patterns:', error);
    }
  };

  // Grafik oluşturma ve güncelleme
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

  // Son mumu güncel fiyatla güncelle
  useEffect(() => {
    if (candlestickSeriesRef.current && currentPrice && candles.length > 0) {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {symbol} 5m Candlesticks (24h)
          </h3>
          <div className="text-sm text-gray-500">
            Loading...
          </div>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {symbol} 5m Candlesticks (24h)
          </h3>
          <div className="text-sm text-red-500">
            Error: {error}
          </div>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-red-500">Failed to load chart data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {symbol} 5m Candlesticks (24h)
        </h3>
        <div className="text-sm text-gray-500">
          Last update: {lastUpdate.toLocaleTimeString()}
          {currentPrice && (
            <span className="ml-2 text-green-500">
              Current: ${currentPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-96" />
    </div>
  );
}

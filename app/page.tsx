'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SignalCard } from '@/components/dashboard/SignalCard';
import { PositionCard } from '@/components/dashboard/PositionCard';
import { CandlestickChart } from '@/components/dashboard/CandlestickChart';
import { CandlestickPatternsCard } from '@/components/dashboard/CandlestickPatternsCard';
import { TradesTable } from '@/components/dashboard/TradesTable';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Download, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardData {
  currentPrice: number;
  symbol: string;
  latestSignal: any;
  openPositions: any[];
  recentTrades: any[];
  portfolio: {
    initialCapital: number;
    availableCapital: number;
    totalPnL: number;
    totalPnLPct: number;
    totalTrades: number;
    winRate: number;
  };
  chartData: Array<{ time: string; price: number }>;
  lastUpdated: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [latestSignal, setLatestSignal] = useState<any>(null);
  const [lastSignalPrice, setLastSignalPrice] = useState<number | null>(null);

  const fetchLivePrice = async () => {
    try {
      console.log('🔄 Fetching live price...');
      const response = await fetch('/api/test-price');
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Live price updated:', result.data.currentPrice);
        const newPrice = result.data.currentPrice;
        setCurrentPrice(newPrice);
        setLastUpdated(result.data.lastUpdated);
        
        // Fiyat değiştiğinde sinyal üret
        if (lastSignalPrice === null || Math.abs(newPrice - lastSignalPrice) > 5) {
          generateSignal(newPrice);
          setLastSignalPrice(newPrice);
        }
      } else {
        console.log('❌ Live price error:', result.error);
      }
    } catch (err) {
      console.log('❌ Live price fetch failed:', err);
    }
  };

  const generateSignal = async (price: number) => {
    try {
      console.log('🎯 Generating signal for price:', price);
      const response = await fetch('/api/signals');
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Signal generated:', result.data.signal.action);
        setLatestSignal(result.data.signal);
        toast.success(`Signal: ${result.data.signal.action} at $${price.toFixed(2)}`);
      } else {
        console.log('❌ Signal generation failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Signal generation error:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching dashboard data...');
      const response = await fetch('/api/dashboard');
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const result = await response.json();
      console.log('📊 Dashboard result:', result);
      
      if (result.success) {
        setData(result.data);
        // Dashboard'dan gelen fiyatı da set et
        if (!currentPrice) {
          setCurrentPrice(result.data.currentPrice);
          setLastUpdated(result.data.lastUpdated);
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('📊 Dashboard fetch error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMarketData = async () => {
    try {
      setFetchingData(true);
      await fetchLivePrice(); // Canlı veriyi manuel olarak yenile
      await fetchDashboardData(); // Dashboard'u yenile
      toast.success('Market data updated!');
    } catch (error) {
      console.error('Market data fetch error:', error);
      toast.error('Failed to fetch market data');
    } finally {
      setFetchingData(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const toggleAutoUpdate = () => {
    setAutoUpdate(!autoUpdate);
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      const response = await fetch(`/api/positions/${positionId}/close`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Position closed successfully');
        await fetchDashboardData();
      } else {
        throw new Error('Failed to close position');
      }
    } catch (error) {
      toast.error('Failed to close position');
    }
  };

  // Otomatik fiyat güncellemesi
  useEffect(() => {
    if (autoUpdate) {
      const interval = setInterval(fetchLivePrice, 3000); // 3 saniyede bir
      setAutoUpdateInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        setAutoUpdateInterval(null);
      }
    }
  }, [autoUpdate]);

  useEffect(() => {
    console.log('🏠 Dashboard component mounted');
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <div className="text-lg font-medium">Loading Dashboard...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch the latest data</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium text-red-500">Failed to load dashboard data</div>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Canlı fiyatı kullan, yoksa dashboard verisini kullan
  const displayPrice = currentPrice || data.currentPrice;
  const displayLastUpdated = lastUpdated || data.lastUpdated;

  console.log('🎯 Display price:', displayPrice, 'Current price:', currentPrice, 'Data price:', data.currentPrice);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span>Crypto Trading Bot</span>
            </h1>
            <p className="text-muted-foreground">
              ETH/USDT Paper Trading Dashboard
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(displayLastUpdated).toLocaleTimeString()}
              {currentPrice && currentPrice !== data.currentPrice && (
                <span className="ml-2 text-green-500">🔄 Live</span>
              )}
              {autoUpdate && (
                <span className="ml-2 text-blue-500">⏱️ Auto</span>
              )}
            </div>
            <Button
              onClick={toggleAutoUpdate}
              variant="outline"
              size="sm"
              className={autoUpdate ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              {autoUpdate ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {autoUpdate ? 'Auto On' : 'Auto Off'}
            </Button>
            <Button
              onClick={fetchLivePrice}
              disabled={fetchingData}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className={`h-4 w-4 mr-2 ${fetchingData ? 'animate-spin' : ''}`} />
              {fetchingData ? 'Fetching...' : 'Fetch Price'}
            </Button>
            <Button
              onClick={fetchMarketData}
              disabled={fetchingData}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${fetchingData ? 'animate-spin' : ''}`} />
              {fetchingData ? 'Updating...' : 'Update All'}
            </Button>
            <Button
              onClick={async () => {
                try {
                  await generateSignal(displayPrice);
                  await fetchDashboardData();
                } catch (error) {
                  toast.error('Signal generation failed');
                }
              }}
              variant="outline"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Generate Signal
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Current Price */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">Current Price</div>
              <div className="text-4xl font-bold">
                ${displayPrice.toLocaleString()}
              </div>
              <div className="text-sm opacity-80">{data.symbol}</div>
              {currentPrice && currentPrice !== data.currentPrice && (
                <div className="text-xs text-green-200 mt-1">
                  🔄 Live Update
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Total Portfolio</div>
              <div className="text-2xl font-bold">
                ${(data.portfolio.initialCapital + data.portfolio.totalPnL).toLocaleString()}
              </div>
              <div className={`text-sm ${data.portfolio.totalPnL >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                {data.portfolio.totalPnL >= 0 ? '+' : ''}${data.portfolio.totalPnL.toFixed(2)} ({data.portfolio.totalPnLPct >= 0 ? '+' : ''}{data.portfolio.totalPnLPct.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Available Capital"
            value={`$${data.portfolio.availableCapital.toLocaleString()}`}
            description="Available for trading"
            icon="dollar"
          />
          <MetricCard
            title="Total Trades"
            value={data.portfolio.totalTrades.toString()}
            description="All time trades"
            icon="chart"
          />
          <MetricCard
            title="Win Rate"
            value={`${data.portfolio.winRate.toFixed(2)}%`}
            description="Success rate"
            icon="target"
          />
          <MetricCard
            title="Open Positions"
            value={data.openPositions.length.toString()}
            description="Active positions"
            icon="trending"
          />
        </div>

        {/* Chart and Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CandlestickChart symbol={data.symbol} currentPrice={displayPrice} />
          </div>
          <div className="space-y-6">
            <SignalCard signal={latestSignal || data.latestSignal} currentPrice={displayPrice} />
            <CandlestickPatternsCard currentPrice={displayPrice} />
            <PositionCard 
              positions={data.openPositions} 
              onClosePosition={handleClosePosition}
            />
          </div>
        </div>

        {/* Recent Trades */}
        <TradesTable trades={data.recentTrades} />
      </div>
    </div>
  );
}
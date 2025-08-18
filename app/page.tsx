'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SignalCard } from '@/components/dashboard/SignalCard';
import { PositionCard } from '@/components/dashboard/PositionCard';
import { PriceChart } from '@/components/dashboard/PriceChart';
import { TradesTable } from '@/components/dashboard/TradesTable';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Download } from 'lucide-react';
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

// Canlı veri hook'u
function useLivePrice(refreshInterval = 5000) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);

  const fetchLivePrice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching live price...');
      const response = await fetch('/api/fetch-data');
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Live price updated:', result.data.currentPrice);
        setCurrentPrice(result.data.currentPrice);
        setLastUpdated(result.data.lastUpdated);
        setLastFetchTime(Date.now());
        setUpdateCount(prev => prev + 1); // Görsel güncelleme için
      } else {
        console.log('❌ Live price error:', result.error);
        setError(result.error || 'Veri çekilemedi');
      }
    } catch (err) {
      console.log('❌ Live price fetch failed:', err);
      setError('Bağlantı hatası');
      console.error('Live price fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Live price hook initialized, interval:', refreshInterval);
    // İlk yükleme
    fetchLivePrice();

    // Çoklu interval kullanarak tarayıcı optimizasyonunu bypass et
    const intervals: NodeJS.Timeout[] = [];
    
    // Ana interval
    const mainInterval = setInterval(fetchLivePrice, refreshInterval);
    intervals.push(mainInterval);
    
    // Yedek interval (farklı zamanlama)
    const backupInterval = setInterval(fetchLivePrice, refreshInterval + 100);
    intervals.push(backupInterval);
    
    // Daha sık kontrol (her 2 saniyede)
    const fastInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLivePrice();
      }
    }, 2000);
    intervals.push(fastInterval);

    // Her saniye kontrol (en agresif)
    const aggressiveInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        fetchLivePrice();
      }
    }, 1000);
    intervals.push(aggressiveInterval);

    console.log('⏰ Multiple intervals set');

    // Sayfa görünür olduğunda da güncelle
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Page became visible, fetching price...');
        fetchLivePrice();
      }
    };

    // Focus/blur event'leri
    const handleFocus = () => {
      console.log('🎯 Window focused, fetching price...');
      fetchLivePrice();
    };

    const handleBlur = () => {
      console.log('👻 Window blurred');
    };

    // Mouse move event'i (kullanıcı aktif olduğunu gösterir)
    const handleMouseMove = () => {
      // Mouse hareketi varsa fiyatı güncelle
      if (Date.now() - lastFetchTime > refreshInterval) {
        fetchLivePrice();
      }
    };

    // Key press event'i
    const handleKeyPress = () => {
      if (Date.now() - lastFetchTime > refreshInterval) {
        fetchLivePrice();
      }
    };

    // Scroll event'i
    const handleScroll = () => {
      if (Date.now() - lastFetchTime > refreshInterval) {
        fetchLivePrice();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('scroll', handleScroll);

    return () => {
      console.log('🧹 All intervals cleared');
      intervals.forEach(clearInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [refreshInterval, lastFetchTime]);

  return {
    currentPrice,
    lastUpdated,
    isLoading,
    error,
    updateCount,
    refresh: fetchLivePrice,
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);


  // Canlı fiyat hook'u - her 5 saniyede bir güncelleme
  const { currentPrice: livePrice, lastUpdated: liveLastUpdated, isLoading: liveLoading, error: liveError, updateCount, refresh: refreshLivePrice } = useLivePrice(5000);

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
      await refreshLivePrice(); // Canlı veriyi manuel olarak yenile
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

  useEffect(() => {
    console.log('🏠 Dashboard component mounted');
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Debug: Live price değişikliklerini izle
  useEffect(() => {
    if (livePrice) {
      console.log('💰 Live price changed to:', livePrice);
    }
  }, [livePrice]);

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
  const displayPrice = livePrice || data.currentPrice;
  const displayLastUpdated = liveLastUpdated || data.lastUpdated;

  console.log('🎯 Display price:', displayPrice, 'Live price:', livePrice, 'Data price:', data.currentPrice, 'Update count:', updateCount);

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
              {liveLoading && <span className="ml-2 text-blue-500">🔄</span>}
              <span className="ml-2 text-green-500">Updates: {updateCount}</span>
            </div>
            <Button
              onClick={fetchMarketData}
              disabled={fetchingData}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className={`h-4 w-4 mr-2 ${fetchingData ? 'animate-spin' : ''}`} />
              {fetchingData ? 'Fetching...' : 'Fetch Data'}
            </Button>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/signals');
                  const result = await response.json();
                  if (result.success) {
                    toast.success(`Signal generated: ${result.data.signal.action}`);
                    await fetchDashboardData();
                  } else {
                    toast.error('Failed to generate signal');
                  }
                } catch (error) {
                  toast.error('Signal generation failed');
                }
              }}
              variant="outline"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
              {livePrice && livePrice !== data.currentPrice && (
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
            <PriceChart data={data.chartData} symbol={data.symbol} currentPrice={displayPrice} />
          </div>
          <div className="space-y-6">
            <SignalCard signal={data.latestSignal} currentPrice={displayPrice} />
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
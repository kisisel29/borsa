'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TradesTable } from '@/components/dashboard/TradesTable';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BacktestResults {
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
  equityCurve: Array<{ timestamp: string; equity: number; drawdown: number }>;
  periods: number;
  startDate: string;
  endDate: string;
}

export default function BacktestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [params, setParams] = useState({
    symbol: 'ETH/USDT',
    timeframe: '1h',
    fromDate: '2024-01-01',
    toDate: '2024-12-31',
    initialCapital: '10000',
  });

  const runBacktest = async () => {
    setLoading(true);
    
    try {
      const queryParams = new URLSearchParams({
        symbol: params.symbol,
        timeframe: params.timeframe,
        from: params.fromDate,
        to: params.toDate,
        initialCapital: params.initialCapital,
      });

      const response = await fetch(`/api/backtest?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Backtest failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setResults(result.data);
        toast.success('Backtest completed successfully');
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Backtest error:', error);
      toast.error('Backtest failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Strategy Backtest</h1>
          <p className="text-muted-foreground">
            Test your trading strategy against historical data
          </p>
        </div>

        {/* Backtest Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Backtest Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={params.symbol}
                  onChange={(e) => setParams(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="ETH/USDT"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Input
                  id="timeframe"
                  value={params.timeframe}
                  onChange={(e) => setParams(prev => ({ ...prev, timeframe: e.target.value }))}
                  placeholder="1h"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initialCapital">Initial Capital</Label>
                <Input
                  id="initialCapital"
                  type="number"
                  value={params.initialCapital}
                  onChange={(e) => setParams(prev => ({ ...prev, initialCapital: e.target.value }))}
                  placeholder="10000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={params.fromDate}
                  onChange={(e) => setParams(prev => ({ ...prev, fromDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={params.toDate}
                  onChange={(e) => setParams(prev => ({ ...prev, toDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/fetch-historical', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        symbol: params.symbol,
                        timeframe: params.timeframe,
                        limit: 1000
                      })
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success(`Fetched ${result.data.candlesCount} candles`);
                    } else {
                      toast.error('Failed to fetch historical data');
                    }
                  } catch (error) {
                    toast.error('Historical data fetch failed');
                  }
                }}
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Fetch Data
              </Button>
              <Button 
                onClick={runBacktest} 
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Running Backtest...' : 'Run Backtest'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backtest Results */}
        {results && (
          <>
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Return"
                value={results.totalPnLPct}
                type="percentage"
                trend={results.totalPnLPct >= 0 ? 'up' : 'down'}
              />
              <MetricCard
                title="Win Rate"
                value={results.winRate}
                type="percentage"
                trend={results.winRate >= 50 ? 'up' : 'down'}
              />
              <MetricCard
                title="Profit Factor"
                value={results.profitFactor.toFixed(2)}
                trend={results.profitFactor > 1 ? 'up' : 'down'}
              />
              <MetricCard
                title="Max Drawdown"
                value={results.maxDrawdownPct}
                type="percentage"
                trend="down"
              />
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Trades"
                value={results.totalTrades}
                type="number"
              />
              <MetricCard
                title="Winning Trades"
                value={results.winningTrades}
                type="number"
                trend="up"
              />
              <MetricCard
                title="Average Win"
                value={results.averageWin}
                type="currency"
                trend="up"
              />
              <MetricCard
                title="Average Loss"
                value={Math.abs(results.averageLoss)}
                type="currency"
                trend="down"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Largest Win"
                value={results.largestWin}
                type="currency"
                trend="up"
              />
              <MetricCard
                title="Largest Loss"
                value={Math.abs(results.largestLoss)}
                type="currency"
                trend="down"
              />
              <MetricCard
                title="Sharpe Ratio"
                value={results.sharpeRatio.toFixed(2)}
                trend={results.sharpeRatio > 1 ? 'up' : 'neutral'}
              />
              <MetricCard
                title="Total P&L"
                value={results.totalPnL}
                type="currency"
                trend={results.totalPnL >= 0 ? 'up' : 'down'}
              />
            </div>

            {/* Trade History */}
            <TradesTable 
              trades={results.trades.slice(0, 20)} 
              title={`Trade History (${results.totalTrades} total trades)`}
            />

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Backtest Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <div><span className="font-medium">Test Period:</span> {new Date(results.startDate).toLocaleDateString()} - {new Date(results.endDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Total Periods:</span> {results.periods}</div>
                    <div><span className="font-medium">Symbol:</span> {params.symbol}</div>
                    <div><span className="font-medium">Timeframe:</span> {params.timeframe}</div>
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-medium">Initial Capital:</span> ${parseFloat(params.initialCapital).toLocaleString()}</div>
                    <div><span className="font-medium">Final Capital:</span> ${(parseFloat(params.initialCapital) + results.totalPnL).toLocaleString()}</div>
                    <div><span className="font-medium">Net Profit:</span> <span className={results.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}>${results.totalPnL.toFixed(2)}</span></div>
                    <div><span className="font-medium">Return:</span> <span className={results.totalPnLPct >= 0 ? 'text-green-500' : 'text-red-500'}>{results.totalPnLPct.toFixed(2)}%</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
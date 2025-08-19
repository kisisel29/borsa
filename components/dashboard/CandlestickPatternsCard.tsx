'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Circle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Timeframe } from './TimeframeSelector';

interface Pattern {
  pattern: string;
  confidence: number;
  description: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

interface CandlestickPatternsCardProps {
  currentPrice?: number;
  timeframe?: Timeframe;
}

export function CandlestickPatternsCard({ currentPrice, timeframe = '5m' }: CandlestickPatternsCardProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchPatterns = async () => {
    try {
      const response = await fetch(`/api/patterns?timeframe=${timeframe}`);
      const result = await response.json();
      
      if (result.success) {
        setPatterns(result.data.patterns);
        setLastUpdated(result.data.lastUpdated);
      } else {
        console.error('Failed to fetch patterns:', result.error);
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
    
    // 3 saniyede bir pattern'leri güncelle
    const interval = setInterval(fetchPatterns, 3000);
    
    return () => clearInterval(interval);
  }, [timeframe]); // timeframe değiştiğinde yeniden fetch et

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'SELL':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'NEUTRAL':
      default:
        return <Circle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'SELL':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'NEUTRAL':
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'STRONG':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'MODERATE':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'WEAK':
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Candlestick Patterns ({timeframe})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Analyzing patterns...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Candlestick Patterns ({timeframe})</span>
          <div className="text-xs text-muted-foreground">
            {lastUpdated && timeAgo(lastUpdated)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No patterns detected
          </div>
        ) : (
          patterns.map((pattern, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSignalIcon(pattern.signal)}
                  <span className="font-medium">{pattern.pattern}</span>
                </div>
                <div className="flex space-x-1">
                  <Badge className={getSignalColor(pattern.signal)}>
                    {pattern.signal}
                  </Badge>
                  <Badge className={getStrengthColor(pattern.strength)}>
                    {pattern.strength}
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {pattern.description}
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Confidence: {(pattern.confidence * 100).toFixed(0)}%
                </span>
                <div className="flex items-center space-x-1">
                  {pattern.signal === 'BUY' && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {pattern.signal === 'SELL' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {pattern.signal === 'NEUTRAL' && <Minus className="h-3 w-3 text-yellow-500" />}
                  <span className={pattern.signal === 'BUY' ? 'text-green-500' : 
                                 pattern.signal === 'SELL' ? 'text-red-500' : 'text-yellow-500'}>
                    {pattern.signal}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {patterns.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Based on IG's 16 candlestick patterns analysis for {timeframe}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

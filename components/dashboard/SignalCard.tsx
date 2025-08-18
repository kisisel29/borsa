'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Circle } from 'lucide-react';

interface SignalCardProps {
  signal: {
    action: 'BUY' | 'SELL' | 'HOLD';
    price: number;
    timestamp: string;
    confidence?: number;
    reasoning?: string[];
  } | null;
  currentPrice: number;
}

export function SignalCard({ signal, currentPrice }: SignalCardProps) {
  if (!signal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Signal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No signals generated yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSignalIcon = () => {
    switch (signal.action) {
      case 'BUY':
        return <ArrowUp className="h-5 w-5 text-green-500" />;
      case 'SELL':
        return <ArrowDown className="h-5 w-5 text-red-500" />;
      case 'HOLD':
      default:
        return <Circle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSignalColor = () => {
    switch (signal.action) {
      case 'BUY':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'SELL':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HOLD':
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const priceDiff = currentPrice - signal.price;
  const priceDiffPct = (priceDiff / signal.price) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Latest Signal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getSignalIcon()}
            <div>
              <Badge className={getSignalColor()}>
                {signal.action}
              </Badge>
              {signal.confidence && (
                <div className="text-sm text-muted-foreground mt-1">
                  Confidence: {(signal.confidence * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {timeAgo(signal.timestamp)}
            </div>
            <div className="text-xs text-muted-foreground">
              Signal: ${signal.price.toLocaleString()}
            </div>
            <div className={`text-xs ${priceDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)} ({priceDiffPct >= 0 ? '+' : ''}{priceDiffPct.toFixed(2)}%)
            </div>
          </div>
        </div>

        {signal.reasoning && signal.reasoning.length > 0 && (
          <div className="pt-3 border-t">
            <div className="text-sm font-medium mb-2">Analysis</div>
            <div className="space-y-1">
              {signal.reasoning.slice(0, 3).map((reason, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  • {reason}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
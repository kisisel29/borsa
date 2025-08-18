'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Trade {
  id: string;
  side: string;
  entryTime: string;
  exitTime?: string;
  entryPrice: number;
  exitPrice?: number;
  size: number;
  pnl?: number;
  pnlPct?: number;
  notes?: string;
}

interface TradesTableProps {
  trades: Trade[];
  title?: string;
}

export function TradesTable({ trades, title = 'Recent Trades' }: TradesTableProps) {
  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No trades yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title} ({trades.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trades.map((trade) => (
            <div key={trade.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {trade.side === 'LONG' ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={trade.side === 'LONG' ? 'default' : 'secondary'}>
                    {trade.side}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {trade.size.toFixed(6)} ETH
                  </span>
                </div>
                {trade.pnl !== undefined && (
                  <div className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${trade.pnl.toFixed(2)} ({trade.pnlPct !== undefined ? (trade.pnlPct >= 0 ? '+' : '') + trade.pnlPct.toFixed(2) : '0.00'}%)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Entry:</span> ${trade.entryPrice.toLocaleString()}
                </div>
                {trade.exitPrice && (
                  <div>
                    <span className="font-medium">Exit:</span> ${trade.exitPrice.toLocaleString()}
                  </div>
                )}
                <div>
                  <span className="font-medium">Entry:</span> {new Date(trade.entryTime).toLocaleDateString()}
                </div>
                {trade.exitTime && (
                  <div>
                    <span className="font-medium">Exit:</span> {new Date(trade.exitTime).toLocaleDateString()}
                  </div>
                )}
              </div>

              {trade.notes && (
                <div className="mt-2 text-xs text-muted-foreground italic">
                  {trade.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
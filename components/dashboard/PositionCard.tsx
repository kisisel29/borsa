'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, X } from 'lucide-react';

interface Position {
  id: string;
  side: string;
  openTime: string;
  openPrice: number;
  size: number;
  stopLoss?: number;
  takeProfit?: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  currentPrice: number;
}

interface PositionCardProps {
  positions: Position[];
  onClosePosition?: (positionId: string) => void;
}

export function PositionCard({ positions, onClosePosition }: PositionCardProps) {
  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No open positions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Open Positions ({positions.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {positions.map((position) => (
          <div key={position.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {position.side === 'LONG' ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={position.side === 'LONG' ? 'default' : 'secondary'}>
                  {position.side}
                </Badge>
                <span className="text-sm font-medium">
                  {position.size.toFixed(6)} ETH
                </span>
              </div>
              {onClosePosition && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClosePosition(position.id)}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Close
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Entry Price</div>
                <div className="font-medium">${position.openPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Current Price</div>
                <div className="font-medium">${position.currentPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Unrealized P&L</div>
                <div className={`font-medium ${position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${position.unrealizedPnL.toFixed(2)} ({position.unrealizedPnLPct >= 0 ? '+' : ''}{position.unrealizedPnLPct.toFixed(2)}%)
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Open Time</div>
                <div className="font-medium text-xs">
                  {new Date(position.openTime).toLocaleDateString()} {new Date(position.openTime).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {(position.stopLoss || position.takeProfit) && (
              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {position.stopLoss && (
                    <div>
                      <span className="text-muted-foreground">Stop Loss: </span>
                      <span className="text-red-500">${position.stopLoss.toLocaleString()}</span>
                    </div>
                  )}
                  {position.takeProfit && (
                    <div>
                      <span className="text-muted-foreground">Take Profit: </span>
                      <span className="text-green-500">${position.takeProfit.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, BarChart3 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  type?: 'currency' | 'percentage' | 'number' | 'price';
  trend?: 'up' | 'down' | 'neutral';
  icon?: 'dollar' | 'target' | 'activity' | 'chart' | 'trending';
}

const iconMap = {
  dollar: DollarSign,
  target: Target,
  activity: Activity,
  chart: BarChart3,
  trending: TrendingUp,
};

export function MetricCard({ 
  title, 
  value, 
  description,
  change, 
  type = 'number', 
  trend = 'neutral',
  icon = 'chart'
}: MetricCardProps) {
  const Icon = iconMap[icon];
  
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val.toFixed(2)}%`;
      case 'price':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">
            {formatValue(value)}
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(change).toFixed(2)}%</span>
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
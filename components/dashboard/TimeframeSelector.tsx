'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp } from 'lucide-react';

export type Timeframe = '1m' | '5m' | '1h' | '4h' | '12h' | '1d';

interface TimeframeSelectorProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const timeframes: { value: Timeframe; label: string; description: string }[] = [
  { value: '1m', label: '1 Dakika', description: 'Çok kısa vadeli analiz' },
  { value: '5m', label: '5 Dakika', description: 'Kısa vadeli analiz' },
  { value: '1h', label: '1 Saat', description: 'Orta vadeli analiz' },
  { value: '4h', label: '4 Saat', description: 'Uzun vadeli analiz' },
  { value: '12h', label: '12 Saat', description: 'Günlük analiz' },
  { value: '1d', label: '1 Gün', description: 'Haftalık analiz' },
];

export function TimeframeSelector({ selectedTimeframe, onTimeframeChange }: TimeframeSelectorProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Zaman Dilimi Seçimi</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.value}
              variant={selectedTimeframe === timeframe.value ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(timeframe.value)}
              className={`h-auto p-3 flex flex-col items-center space-y-1 ${
                selectedTimeframe === timeframe.value 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="font-medium text-sm">{timeframe.label}</span>
              <span className="text-xs opacity-75">{timeframe.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

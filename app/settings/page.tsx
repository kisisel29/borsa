'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface StrategySettings {
  emaFast: number;
  emaSlow: number;
  rsiPeriod: number;
  rsiLow: number;
  rsiHigh: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  tpPct: number;
  slPct: number;
  maxPositionSizePct: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StrategySettings>({
    emaFast: 12,
    emaSlow: 26,
    rsiPeriod: 14,
    rsiLow: 30,
    rsiHigh: 70,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    tpPct: 0.02,
    slPct: 0.01,
    maxPositionSizePct: 0.05,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch these from your API/database
      // For now, we'll use the default values
      toast.success('Settings loaded');
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, you'd save these to your database
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      emaFast: 12,
      emaSlow: 26,
      rsiPeriod: 14,
      rsiLow: 30,
      rsiHigh: 70,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      tpPct: 0.02,
      slPct: 0.01,
      maxPositionSizePct: 0.05,
    });
    toast.info('Settings reset to defaults');
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = (key: keyof StrategySettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setSettings(prev => ({ ...prev, [key]: numValue }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Strategy Settings</h1>
            <p className="text-muted-foreground">
              Configure your trading strategy parameters
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={resetToDefaults}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Defaults
            </Button>
            <Button 
              onClick={saveSettings}
              disabled={saving}
            >
              <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technical Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Exponential Moving Averages</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emaFast">Fast EMA Period</Label>
                      <Input
                        id="emaFast"
                        type="number"
                        value={settings.emaFast}
                        onChange={(e) => updateSetting('emaFast', e.target.value)}
                        min="1"
                        max="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emaSlow">Slow EMA Period</Label>
                      <Input
                        id="emaSlow"
                        type="number"
                        value={settings.emaSlow}
                        onChange={(e) => updateSetting('emaSlow', e.target.value)}
                        min="1"
                        max="200"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">RSI Settings</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rsiPeriod">RSI Period</Label>
                      <Input
                        id="rsiPeriod"
                        type="number"
                        value={settings.rsiPeriod}
                        onChange={(e) => updateSetting('rsiPeriod', e.target.value)}
                        min="2"
                        max="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rsiLow">Oversold Level</Label>
                      <Input
                        id="rsiLow"
                        type="number"
                        value={settings.rsiLow}
                        onChange={(e) => updateSetting('rsiLow', e.target.value)}
                        min="0"
                        max="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rsiHigh">Overbought Level</Label>
                      <Input
                        id="rsiHigh"
                        type="number"
                        value={settings.rsiHigh}
                        onChange={(e) => updateSetting('rsiHigh', e.target.value)}
                        min="50"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">MACD Settings</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="macdFast">Fast Period</Label>
                      <Input
                        id="macdFast"
                        type="number"
                        value={settings.macdFast}
                        onChange={(e) => updateSetting('macdFast', e.target.value)}
                        min="1"
                        max="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="macdSlow">Slow Period</Label>
                      <Input
                        id="macdSlow"
                        type="number"
                        value={settings.macdSlow}
                        onChange={(e) => updateSetting('macdSlow', e.target.value)}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="macdSignal">Signal Period</Label>
                      <Input
                        id="macdSignal"
                        type="number"
                        value={settings.macdSignal}
                        onChange={(e) => updateSetting('macdSignal', e.target.value)}
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Management */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Position Management</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxPositionSizePct">Max Position Size (%)</Label>
                      <Input
                        id="maxPositionSizePct"
                        type="number"
                        step="0.01"
                        value={settings.maxPositionSizePct * 100}
                        onChange={(e) => updateSetting('maxPositionSizePct', (parseFloat(e.target.value) / 100).toString())}
                        min="0.01"
                        max="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum percentage of capital to use per position
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Exit Rules</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tpPct">Take Profit (%)</Label>
                      <Input
                        id="tpPct"
                        type="number"
                        step="0.001"
                        value={settings.tpPct * 100}
                        onChange={(e) => updateSetting('tpPct', (parseFloat(e.target.value) / 100).toString())}
                        min="0.1"
                        max="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slPct">Stop Loss (%)</Label>
                      <Input
                        id="slPct"
                        type="number"
                        step="0.001"
                        value={settings.slPct * 100}
                        onChange={(e) => updateSetting('slPct', (parseFloat(e.target.value) / 100).toString())}
                        min="0.1"
                        max="50"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Risk/Reward Ratio</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Current ratio: 1:{(settings.tpPct / settings.slPct).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    A ratio above 1:2 is generally considered favorable
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Current Strategy Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Entry Signals</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• EMA {settings.emaFast} crosses above EMA {settings.emaSlow}</li>
                  <li>• RSI above 50 (oversold at {settings.rsiLow})</li>
                  <li>• MACD histogram turns positive</li>
                  <li>• High confidence signals only (&gt;60%)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Exit Rules</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Take profit at +{(settings.tpPct * 100).toFixed(1)}%</li>
                  <li>• Stop loss at -{(settings.slPct * 100).toFixed(1)}%</li>
                  <li>• Signal reversal (SELL signal)</li>
                  <li>• EMA death cross</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Risk Management</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Max {(settings.maxPositionSizePct * 100).toFixed(1)}% per position</li>
                  <li>• Risk/Reward: 1:{(settings.tpPct / settings.slPct).toFixed(1)}</li>
                  <li>• Paper trading only</li>
                  <li>• No leveraged positions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
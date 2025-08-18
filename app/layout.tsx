import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { TrendingUp, BarChart3, Settings, Home } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crypto Trading Bot - ETH/USDT Strategy',
  description: 'Professional cryptocurrency trading bot with backtesting and paper trading capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-8">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <h1 className="text-xl font-bold">Trading Bot</h1>
              </div>
              
              <nav className="space-y-2">
                <Link 
                  href="/"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  href="/backtest"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Backtest</span>
                </Link>
                
                <Link 
                  href="/settings"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
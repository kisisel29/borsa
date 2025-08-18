# 🚀 Crypto Trading Bot - ETH/USDT Strategy

A professional-grade cryptocurrency trading bot built with Next.js 14, TypeScript, and modern web technologies. Features advanced technical analysis, backtesting capabilities, and paper trading with real-time market data.

## 🌟 Features

### Core Trading System
- **Advanced Strategy Engine**: EMA crossovers, RSI, MACD with customizable parameters
- **Paper Trading**: Safe simulation environment with no real money at risk
- **Real-time Data**: Live market data from Binance via CCXT
- **Risk Management**: Stop-loss, take-profit, position sizing controls
- **Signal Generation**: Automated buy/sell signals with confidence scoring

### Analytics & Backtesting
- **Historical Backtesting**: Test strategies against years of market data
- **Performance Metrics**: Sharpe ratio, max drawdown, win rate, profit factor
- **Trade History**: Detailed logs of all positions and trades
- **Equity Curve**: Visual representation of strategy performance
- **Real-time Dashboard**: Live portfolio tracking and metrics

### Modern Architecture
- **Next.js 14**: App Router, Server Actions, optimized performance
- **TypeScript**: Full type safety across the application
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Professional trading interface design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js runtime
- **Database**: PostgreSQL with Prisma ORM
- **Trading**: CCXT for exchange connectivity
- **Technical Analysis**: technicalindicators library
- **Charts**: Lightweight Charts for price visualization
- **Deployment**: Vercel with Postgres and Cron Jobs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database (local or Vercel Postgres)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crypto-trading-bot
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_bot?schema=public"
EXCHANGE=binance
SYMBOL=ETH/USDT
TIMEFRAME=1h
EMA_FAST=12
EMA_SLOW=26
RSI_PERIOD=14
RSI_LO=30
RSI_HI=70
MACD_FAST=12
MACD_SLOW=26
MACD_SIGNAL=9
TP_PCT=0.02
SL_PCT=0.01
MAX_POSITION_SIZE_PCT=0.05
INITIAL_CAPITAL=10000
CRON_SECRET=your-super-secret-cron-key-here-at-least-20-chars
```

4. **Set up local database (optional)**
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Or use your existing PostgreSQL instance
```

5. **Initialize database**
```bash
npx prisma generate
npx prisma db push
```

6. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 📊 Usage

### Dashboard
- **Live Metrics**: Current price, portfolio value, open positions
- **Recent Signals**: Latest buy/sell signals with reasoning
- **Price Chart**: 24-hour price movement visualization
- **Trade History**: Recent trades with P&L information

### Backtesting
1. Navigate to `/backtest`
2. Set your test parameters:
   - Date range (from/to)
   - Initial capital
   - Symbol and timeframe
3. Click "Run Backtest" to analyze historical performance
4. Review metrics: returns, win rate, drawdown, Sharpe ratio

### Settings
- **Technical Indicators**: Adjust EMA periods, RSI levels, MACD settings
- **Risk Management**: Configure stop-loss, take-profit percentages
- **Position Sizing**: Set maximum position size as % of capital

## 🔄 Cron Jobs & Live Trading

### Manual Trigger (Development)
```bash
curl -X POST http://localhost:3000/api/cron/fetch \
  -H "x-cron-secret: your-super-secret-cron-key-here-at-least-20-chars"
```

### Vercel Cron (Production)
The system automatically sets up Vercel Cron jobs to:
- Fetch latest market data every 5 minutes
- Generate trading signals
- Execute paper trades
- Update stop-loss/take-profit orders

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub** (or your preferred Git provider)

2. **Connect to Vercel**
   - Import your repository to Vercel
   - Configure environment variables in Vercel dashboard

3. **Set up Vercel Postgres**
   - Add Vercel Postgres addon
   - Copy DATABASE_URL to environment variables

4. **Configure Cron Jobs**
   Add to `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/fetch",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```

5. **Deploy**
   ```bash
   npm run build
   vercel deploy
   ```

### Environment Variables for Production
Ensure all environment variables are set in Vercel:
- `DATABASE_URL` (from Vercel Postgres)
- `CRON_SECRET` (generate a secure random string)
- All strategy parameters (EMA_FAST, RSI_LO, etc.)

## 📈 Strategy Details

### Entry Signals (BUY)
- **EMA Golden Cross**: Fast EMA crosses above Slow EMA
- **RSI Bullish**: RSI above 50, especially when recovering from oversold
- **MACD Momentum**: MACD histogram turns positive
- **Confidence Threshold**: Only execute trades with >60% confidence

### Exit Signals
- **Take Profit**: +2% gain (configurable)
- **Stop Loss**: -1% loss (configurable)  
- **Signal Reversal**: Strategy generates SELL signal
- **EMA Death Cross**: Fast EMA crosses below Slow EMA

### Risk Management
- **Position Sizing**: Maximum 5% of capital per trade
- **Stop Loss**: Automatic 1% stop-loss on all positions
- **Take Profit**: Automatic 2% take-profit (1:2 risk/reward)
- **Paper Trading**: No real money, safe simulation environment

## 🔧 API Endpoints

- `GET /api/dashboard` - Dashboard data (prices, positions, trades)
- `GET /api/backtest` - Run historical backtests
- `POST /api/cron/fetch` - Fetch latest data and generate signals
- `GET /api/trades` - Trade history
- `GET /api/positions` - Current positions

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Test specific services
npm run test -- services/strategyEngine.test.ts
```

## 📚 Key Concepts

### Technical Indicators
- **EMA (Exponential Moving Average)**: Trend direction and crossover signals
- **RSI (Relative Strength Index)**: Overbought/oversold conditions
- **MACD (Moving Average Convergence Divergence)**: Momentum and trend changes

### Performance Metrics
- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Gross profit divided by gross loss
- **Sharpe Ratio**: Risk-adjusted returns
- **Maximum Drawdown**: Largest peak-to-trough decline

### Paper Trading
All trades are simulated using historical and real-time data without risking actual capital. This allows you to:
- Test strategies safely
- Learn from mistakes without financial loss
- Build confidence before live trading
- Optimize parameters based on performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## ⚠️ Disclaimer

This software is for educational and research purposes only. Cryptocurrency trading involves substantial risk of loss. Past performance does not guarantee future results. Always do your own research and never invest more than you can afford to lose.

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues for bugs and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Documentation**: Check this README and inline code comments

---

Built with ❤️ for the crypto trading community. Happy trading! 🚀📈
# Crypto Trading Bot

Modern bir kripto para trading bot'u, Next.js, Prisma ve TypeScript ile geliştirilmiştir.

## Özellikler

- 📊 **Gerçek Zamanlı Fiyat Takibi**: Binance API ile ETH/USDT fiyat verilerini takip eder
- 📈 **Dashboard**: Portföy performansı, açık pozisyonlar ve son işlemleri gösterir
- 🔄 **Backtest**: Trading stratejilerini geçmiş verilerle test edebilirsiniz
- ⚙️ **Ayarlanabilir Parametreler**: EMA, RSI, MACD gibi teknik indikatörler için ayarlanabilir parametreler
- 🎯 **Risk Yönetimi**: Stop-loss ve take-profit seviyeleri
- 📱 **Modern UI**: Tailwind CSS ve shadcn/ui ile modern arayüz

## Teknolojiler

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Prisma ORM, SQLite (geliştirme)
- **API**: Binance API
- **Charts**: Recharts, Lightweight Charts
- **Logging**: Pino

## Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın**
   ```bash
   git clone https://github.com/yourusername/crypto-trading-bot.git
   cd crypto-trading-bot
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment dosyasını oluşturun**
   ```bash
   cp env.example .env
   ```

4. **Veritabanını kurun**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Development server'ı başlatın**
   ```bash
   npm run dev
   ```

6. **Proxy server'ı başlatın (SSL sertifika sorunları için)**
   ```bash
   node proxy-server.js
   ```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Kullanım

### Dashboard
Ana sayfa portföyünüzün genel durumunu gösterir:
- Mevcut fiyat ve 24 saatlik değişim
- Toplam P&L ve kazanç oranı
- Açık pozisyonlar
- Son işlemler

### Backtest
Geçmiş verilerle trading stratejilerinizi test edebilirsiniz:
- Tarih aralığı seçimi
- Strateji parametrelerini ayarlama
- Sonuçları görüntüleme

### Ayarlar
Trading parametrelerini özelleştirebilirsiniz:
- Teknik indikatör parametreleri (EMA, RSI, MACD)
- Risk yönetimi ayarları
- Trading sembolü ve zaman dilimi

## Environment Variables

`.env` dosyasında aşağıdaki değişkenleri ayarlayın:

```env
# Database
DATABASE_URL="file:./dev.db"

# Trading Configuration
EXCHANGE=binance
SYMBOL=ETH/USDT
TIMEFRAME=1h

# Strategy Parameters
EMA_FAST=12
EMA_SLOW=26
RSI_PERIOD=14
RSI_LO=30
RSI_HI=70
MACD_FAST=12
MACD_SLOW=26
MACD_SIGNAL=9

# Risk Management
TP_PCT=0.02
SL_PCT=0.01
MAX_POSITION_SIZE_PCT=0.05
INITIAL_CAPITAL=10000

# Security
CRON_SECRET=your-super-secret-cron-key-here-min-20-chars

# Environment
NODE_ENV=development

# SSL Configuration
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## API Endpoints

- `GET /api/dashboard` - Dashboard verilerini getirir
- `GET /api/fetch-data` - Güncel fiyat verilerini getirir
- `GET /api/backtest` - Backtest sonuçlarını getirir
- `GET /api/signals` - Trading sinyallerini getirir

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Uyarı

Bu bot sadece eğitim amaçlıdır. Gerçek para ile trading yapmadan önce kapsamlı test yapın. Kripto para trading'i yüksek risk içerir.

## Destek

Sorularınız için GitHub Issues kullanabilirsiniz.
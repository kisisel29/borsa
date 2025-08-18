import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  EXCHANGE: z.string().default('binance'),
  SYMBOL: z.string().default('ETH/USDT'),
  TIMEFRAME: z.string().default('1h'),
  EMA_FAST: z.coerce.number().default(12),
  EMA_SLOW: z.coerce.number().default(26),
  RSI_PERIOD: z.coerce.number().default(14),
  RSI_LO: z.coerce.number().default(30),
  RSI_HI: z.coerce.number().default(70),
  MACD_FAST: z.coerce.number().default(12),
  MACD_SLOW: z.coerce.number().default(26),
  MACD_SIGNAL: z.coerce.number().default(9),
  TP_PCT: z.coerce.number().default(0.02), // 2% take profit
  SL_PCT: z.coerce.number().default(0.01), // 1% stop loss
  MAX_POSITION_SIZE_PCT: z.coerce.number().default(0.05), // 5% of capital
  INITIAL_CAPITAL: z.coerce.number().default(10000),
  CRON_SECRET: z.string().min(20, 'CRON_SECRET must be at least 20 chars'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  
  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}
interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PatternResult {
  pattern: string;
  confidence: number;
  description: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export class CandlestickPatternService {
  
  // Mum pattern'lerini tespit et
  detectPatterns(candles: Candle[]): PatternResult[] {
    if (candles.length < 3) return [];
    
    const patterns: PatternResult[] = [];
    
    // Son 3 mum için pattern tespiti
    const last3 = candles.slice(-3);
    const last2 = candles.slice(-2);
    const last1 = candles.slice(-1)[0];
    
    // 1. Doji Pattern
    if (this.isDoji(last1)) {
      patterns.push({
        pattern: 'Doji',
        confidence: 0.7,
        description: 'Açılış ve kapanış neredeyse aynı - piyasa kararsızlığı',
        signal: 'NEUTRAL',
        strength: 'MODERATE'
      });
    }
    
    // 2. Hammer Pattern
    if (this.isHammer(last1)) {
      patterns.push({
        pattern: 'Hammer',
        confidence: 0.8,
        description: 'Alt gölge uzun, gövde küçük - yükseliş sinyali',
        signal: 'BUY',
        strength: 'STRONG'
      });
    }
    
    // 3. Inverted Hammer
    if (this.isInvertedHammer(last1)) {
      patterns.push({
        pattern: 'Inverted Hammer',
        confidence: 0.75,
        description: 'Üst gölge uzun, gövde küçük - potansiyel dönüş',
        signal: 'BUY',
        strength: 'MODERATE'
      });
    }
    
    // 4. Shooting Star
    if (this.isShootingStar(last1)) {
      patterns.push({
        pattern: 'Shooting Star',
        confidence: 0.8,
        description: 'Üst gölge uzun, gövde küçük - düşüş sinyali',
        signal: 'SELL',
        strength: 'STRONG'
      });
    }
    
    // 5. Hanging Man
    if (this.isHangingMan(last1)) {
      patterns.push({
        pattern: 'Hanging Man',
        confidence: 0.75,
        description: 'Alt gölge uzun, gövde küçük - düşüş sinyali',
        signal: 'SELL',
        strength: 'MODERATE'
      });
    }
    
    // 6. Bullish Engulfing (2 mum)
    if (last2.length >= 2 && this.isBullishEngulfing(last2[0], last2[1])) {
      patterns.push({
        pattern: 'Bullish Engulfing',
        confidence: 0.85,
        description: 'Yeşil mum kırmızı mumu sarıyor - güçlü yükseliş',
        signal: 'BUY',
        strength: 'STRONG'
      });
    }
    
    // 7. Bearish Engulfing (2 mum)
    if (last2.length >= 2 && this.isBearishEngulfing(last2[0], last2[1])) {
      patterns.push({
        pattern: 'Bearish Engulfing',
        confidence: 0.85,
        description: 'Kırmızı mum yeşil mumu sarıyor - güçlü düşüş',
        signal: 'SELL',
        strength: 'STRONG'
      });
    }
    
    // 8. Morning Star (3 mum)
    if (last3.length >= 3 && this.isMorningStar(last3[0], last3[1], last3[2])) {
      patterns.push({
        pattern: 'Morning Star',
        confidence: 0.9,
        description: 'Üç mumlu yükseliş dönüşü - çok güçlü sinyal',
        signal: 'BUY',
        strength: 'STRONG'
      });
    }
    
    // 9. Evening Star (3 mum)
    if (last3.length >= 3 && this.isEveningStar(last3[0], last3[1], last3[2])) {
      patterns.push({
        pattern: 'Evening Star',
        confidence: 0.9,
        description: 'Üç mumlu düşüş dönüşü - çok güçlü sinyal',
        signal: 'SELL',
        strength: 'STRONG'
      });
    }
    
    // 10. Three White Soldiers
    if (this.hasThreeWhiteSoldiers(candles.slice(-3))) {
      patterns.push({
        pattern: 'Three White Soldiers',
        confidence: 0.8,
        description: 'Üç ardışık yeşil mum - güçlü yükseliş trendi',
        signal: 'BUY',
        strength: 'STRONG'
      });
    }
    
    // 11. Three Black Crows
    if (this.hasThreeBlackCrows(candles.slice(-3))) {
      patterns.push({
        pattern: 'Three Black Crows',
        confidence: 0.8,
        description: 'Üç ardışık kırmızı mum - güçlü düşüş trendi',
        signal: 'SELL',
        strength: 'STRONG'
      });
    }
    
    // 12. Dark Cloud Cover
    if (last2.length >= 2 && this.isDarkCloudCover(last2[0], last2[1])) {
      patterns.push({
        pattern: 'Dark Cloud Cover',
        confidence: 0.75,
        description: 'Kırmızı mum yeşil mumun ortasını kapatıyor',
        signal: 'SELL',
        strength: 'MODERATE'
      });
    }
    
    // 13. Piercing Line
    if (last2.length >= 2 && this.isPiercingLine(last2[0], last2[1])) {
      patterns.push({
        pattern: 'Piercing Line',
        confidence: 0.75,
        description: 'Yeşil mum kırmızı mumun ortasını kapatıyor',
        signal: 'BUY',
        strength: 'MODERATE'
      });
    }
    
    // 14. Spinning Top
    if (this.isSpinningTop(last1)) {
      patterns.push({
        pattern: 'Spinning Top',
        confidence: 0.6,
        description: 'Küçük gövde, eşit gölgeler - kararsızlık',
        signal: 'NEUTRAL',
        strength: 'WEAK'
      });
    }
    
    // 15. Marubozu (Güçlü mum)
    if (this.isMarubozu(last1)) {
      patterns.push({
        pattern: 'Marubozu',
        confidence: 0.8,
        description: 'Gölgesiz güçlü mum - trend devamı',
        signal: last1.close > last1.open ? 'BUY' : 'SELL',
        strength: 'STRONG'
      });
    }
    
    // 16. Harami (2 mum)
    if (last2.length >= 2 && this.isHarami(last2[0], last2[1])) {
      patterns.push({
        pattern: 'Harami',
        confidence: 0.7,
        description: 'Küçük mum büyük mumun içinde - trend zayıflığı',
        signal: 'NEUTRAL',
        strength: 'MODERATE'
      });
    }
    
    return patterns;
  }
  
  // Yardımcı fonksiyonlar
  private isDoji(candle: Candle): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    return bodySize <= totalRange * 0.1; // Gövde toplam aralığın %10'undan küçük
  }
  
  private isHammer(candle: Candle): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    return lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5;
  }
  
  private isInvertedHammer(candle: Candle): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    return upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5;
  }
  
  private isShootingStar(candle: Candle): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    return upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5;
  }
  
  private isHangingMan(candle: Candle): boolean {
    return this.isHammer(candle); // Aynı şekil, farklı bağlam
  }
  
  private isBullishEngulfing(first: Candle, second: Candle): boolean {
    return first.close < first.open && // İlk mum kırmızı
           second.close > second.open && // İkinci mum yeşil
           second.open < first.close && // İkinci mumun açılışı ilkinin kapanışından düşük
           second.close > first.open; // İkinci mumun kapanışı ilkinin açılışından yüksek
  }
  
  private isBearishEngulfing(first: Candle, second: Candle): boolean {
    return first.close > first.open && // İlk mum yeşil
           second.close < second.open && // İkinci mum kırmızı
           second.open > first.close && // İkinci mumun açılışı ilkinin kapanışından yüksek
           second.close < first.open; // İkinci mumun kapanışı ilkinin açılışından düşük
  }
  
  private isMorningStar(first: Candle, second: Candle, third: Candle): boolean {
    return first.close < first.open && // İlk mum kırmızı
           Math.abs(second.close - second.open) < Math.abs(first.close - first.open) * 0.3 && // İkinci mum küçük
           third.close > third.open && // Üçüncü mum yeşil
           third.close > (first.open + first.close) / 2; // Üçüncü mum ilk mumun ortasını geçiyor
  }
  
  private isEveningStar(first: Candle, second: Candle, third: Candle): boolean {
    return first.close > first.open && // İlk mum yeşil
           Math.abs(second.close - second.open) < Math.abs(first.close - first.open) * 0.3 && // İkinci mum küçük
           third.close < third.open && // Üçüncü mum kırmızı
           third.close < (first.open + first.close) / 2; // Üçüncü mum ilk mumun ortasının altında
  }
  
  private hasThreeWhiteSoldiers(candles: Candle[]): boolean {
    if (candles.length < 3) return false;
    
    return candles.every(candle => 
      candle.close > candle.open && // Her mum yeşil
      candle.close > candle.open + (candle.high - candle.low) * 0.6 // Güçlü yeşil mum
    );
  }
  
  private hasThreeBlackCrows(candles: Candle[]): boolean {
    if (candles.length < 3) return false;
    
    return candles.every(candle => 
      candle.close < candle.open && // Her mum kırmızı
      candle.close < candle.open - (candle.high - candle.low) * 0.6 // Güçlü kırmızı mum
    );
  }
  
  private isDarkCloudCover(first: Candle, second: Candle): boolean {
    return first.close > first.open && // İlk mum yeşil
           second.close < second.open && // İkinci mum kırmızı
           second.open > first.close && // İkinci mumun açılışı ilkinin kapanışından yüksek
           second.close < (first.open + first.close) / 2; // İkinci mumun kapanışı ilkinin ortasının altında
  }
  
  private isPiercingLine(first: Candle, second: Candle): boolean {
    return first.close < first.open && // İlk mum kırmızı
           second.close > second.open && // İkinci mum yeşil
           second.open < first.close && // İkinci mumun açılışı ilkinin kapanışından düşük
           second.close > (first.open + first.close) / 2; // İkinci mumun kapanışı ilkinin ortasının üstünde
  }
  
  private isSpinningTop(candle: Candle): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    return bodySize < (candle.high - candle.low) * 0.3 && // Küçük gövde
           Math.abs(lowerShadow - upperShadow) < bodySize; // Eşit gölgeler
  }
  
  private isMarubozu(candle: Candle): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    
    return bodySize > totalRange * 0.9; // Gövde toplam aralığın %90'ından büyük
  }
  
  private isHarami(first: Candle, second: Candle): boolean {
    const firstBodySize = Math.abs(first.close - first.open);
    const secondBodySize = Math.abs(second.close - second.open);
    
    return firstBodySize > secondBodySize * 2 && // İlk mum ikinciden çok daha büyük
           second.open > Math.min(first.open, first.close) && // İkinci mum ilkinin içinde
           second.close < Math.max(first.open, first.close);
  }
}

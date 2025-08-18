# Otomatik veri güncelleme script'i
# Bu script her 5 dakikada bir veri çeker ve dashboard'u günceller

Write-Host "Starting automatic data update script..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

while ($true) {
    try {
        Write-Host "Fetching data..." -ForegroundColor Cyan
        
        # Veri çek
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/fetch-data" -Method POST
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success) {
            Write-Host "✅ Data updated successfully!" -ForegroundColor Green
            Write-Host "   Candles stored: $($data.data.candlesStored)" -ForegroundColor White
            Write-Host "   Current price: $($data.data.currentPrice)" -ForegroundColor White
            Write-Host "   Timestamp: $($data.data.timestamp)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Failed to update data" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "Waiting 5 minutes before next update..." -ForegroundColor Yellow
    Start-Sleep -Seconds 300  # 5 dakika bekle
}

# Test achievements API endpoints

Write-Host "Testing Achievements API..."

# Start server in background
Write-Host "Starting server..."
Start-Process npm -ArgumentList "run dev" -WindowStyle Hidden -PassThru | Out-Null
Start-Sleep -Seconds 5

# Test list achievements
Write-Host "`nTest 1: GET /api/achievements/list"
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/achievements/list" -Method Get
  $data = $response.Content | ConvertFrom-Json
  Write-Host "✅ Status: $($response.StatusCode)"
  Write-Host "   Achievements found: $($data.achievements.Count)"
  if ($data.achievements.Count -gt 0) {
    Write-Host "   First achievement: $($data.achievements[0].id) - $($data.achievements[0].title)"
  }
} catch {
  Write-Host "❌ Error: $_"
}

Write-Host "`nTest Complete!"
Write-Host "Kill server: Get-Process node | Stop-Process -Force"

# Test Rate Limiting (PowerShell)
# Tests the auth endpoint rate limiter (5 attempts per 15 min)

Write-Host "Testing Rate Limiting: /api/auth/login" -ForegroundColor Cyan
Write-Host "Limit: 5 attempts per 15 minutes" -ForegroundColor Yellow
Write-Host "----------------------------------------`n"

$url = "http://localhost:3000/api/auth/login"
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

for ($i = 1; $i -le 7; $i++) {
    Write-Host ""
    Write-Host "Request #$i" -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Headers $headers -Body $body -UseBasicParsing
        $status = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "Status: $status" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        $content | ConvertTo-Json -Depth 3 | Write-Host
        
    } catch {
        $status = $_.Exception.Response.StatusCode.Value__
        
        # Try to parse error response
        $content = $null
        if ($_.ErrorDetails.Message) {
            try {
                $content = $_.ErrorDetails.Message | ConvertFrom-Json
            } catch {
                $content = $_.ErrorDetails.Message
            }
        }
        
        if ($status -eq 429) {
            Write-Host "Status: $status (Too Many Requests)" -ForegroundColor Red
            Write-Host "Response:" -ForegroundColor Gray
            if ($content) {
                if ($content -is [string]) {
                    Write-Host $content
                } else {
                    $content | ConvertTo-Json -Depth 3 | Write-Host
                }
            } else {
                Write-Host "Rate limit exceeded" -ForegroundColor Gray
            }
            Write-Host ""
            Write-Host "✅ Rate limit working! Request #$i was blocked" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "Status: $status" -ForegroundColor Yellow
            Write-Host "Response:" -ForegroundColor Gray
            if ($content) {
                if ($content -is [string]) {
                    Write-Host $content
                } else {
                    $content | ConvertTo-Json -Depth 3 | Write-Host
                }
            }
        }
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "⚠️ All 7 requests succeeded - rate limiting might not be configured" -ForegroundColor Yellow

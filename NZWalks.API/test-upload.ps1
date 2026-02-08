Write-Host "=== NZWalks Image Upload Test ===" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n[Step 1] Authenticating..." -ForegroundColor Yellow
$loginJson = '{"username":"writer@nzwalks.com","password":"Writer@123"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5268/api/Auth/Login" -Method POST -ContentType "application/json" -Body $loginJson

if ($loginResponse.jwtToken) {
    Write-Host "SUCCESS: Got token!" -ForegroundColor Green
    $token = $loginResponse.jwtToken
} else {
    Write-Host "FAILED: Could not get token" -ForegroundColor Red
    exit 1
}

# Step 2: Prepare test image
Write-Host "`n[Step 2] Preparing test image..." -ForegroundColor Yellow
$testImage = "C:\Users\91944\.gemini\antigravity\brain\eee304d6-4e41-43d2-80a0-5220a1cfccc1\test_image_sample_1770137173726.png"
if (-not (Test-Path $testImage)) {
    $testImage = "$env:TEMP\test.txt"
    "test" | Out-File $testImage
}
Write-Host "Using: $testImage" -ForegroundColor Gray

# Step 3: Upload
Write-Host "`n[Step 3] Uploading image..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}
$form = @{
    File = Get-Item $testImage
    FileName = "test-upload"
    FileDescription = "Automated test"
}

$uploadResponse = Invoke-RestMethod -Uri "http://localhost:5268/api/Images/upload" -Method POST -Headers $headers -Form $form

if ($uploadResponse.id) {
    Write-Host "SUCCESS: Image uploaded!" -ForegroundColor Green
    Write-Host "ID: $($uploadResponse.id)" -ForegroundColor White
    Write-Host "FileName: $($uploadResponse.fileName)" -ForegroundColor White
    Write-Host "FilePath: $($uploadResponse.filePath)" -ForegroundColor White
    Write-Host "Size: $($uploadResponse.fileSizeInBytes) bytes" -ForegroundColor White
} else {
    Write-Host "FAILED: Could not upload" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan

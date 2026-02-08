Write-Host "=== Complete Image Upload Test ===" -ForegroundColor Cyan

# Step 1: Register a new Writer user
Write-Host "`n[1/4] Registering new Writer user..." -ForegroundColor Yellow
$registerJson = @"
{
  "username": "testwriter@nzwalks.com",
  "email": "testwriter@nzwalks.com",
  "password": "Test@Writer123",
  "roles": ["Writer"]
}
"@

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5268/api/Auth/Register" -Method POST -ContentType "application/json" -Body $registerJson
    Write-Host "SUCCESS: User registered!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "NOTE: User may already exist, continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "WARNING: Registration issue: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Step 2: Login with the new user
Write-Host "`n[2/4] Logging in..." -ForegroundColor Yellow
$loginJson = @"
{
  "username": "testwriter@nzwalks.com",
  "password": "Test@Writer123"
}
"@

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5268/api/Auth/Login" -Method POST -ContentType "application/json" -Body $loginJson
    $token = $loginResponse.jwtToken
    Write-Host "SUCCESS: Logged in!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Could not login - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Prepare test image
Write-Host "`n[3/4] Preparing test image..." -ForegroundColor Yellow
$testImage = "C:\Users\91944\.gemini\antigravity\brain\eee304d6-4e41-43d2-80a0-5220a1cfccc1\test_image_sample_1770137173726.png"
if (-not (Test-Path $testImage)) {
    Write-Host "Test image not found, creating dummy file..." -ForegroundColor Yellow
    $testImage = "$env:TEMP\test-nz-landscape.jpg"
    "Dummy image content for testing" | Out-File $testImage -Encoding ASCII
}
Write-Host "Using: $testImage" -ForegroundColor Gray

# Step 4: Upload the image
Write-Host "`n[4/4] Uploading image..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}
$form = @{
    File = Get-Item $testImage
    FileName = "nz-landscape-test"
    FileDescription = "Automated test of image upload functionality"
}

try {
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:5268/api/Images/upload" -Method POST -Headers $headers -Form $form
    
    Write-Host "`nSUCCESS: Image uploaded!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Upload Details:" -ForegroundColor Cyan
    Write-Host "  ID:          $($uploadResponse.id)" -ForegroundColor White
    Write-Host "  FileName:    $($uploadResponse.fileName)" -ForegroundColor White
    Write-Host "  Extension:   $($uploadResponse.fileExtension)" -ForegroundColor White
    Write-Host "  Size:        $($uploadResponse.fileSizeInBytes) bytes" -ForegroundColor White
    Write-Host "  Description: $($uploadResponse.fileDescription)" -ForegroundColor White
    Write-Host "  File Path:   $($uploadResponse.filePath)" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    
    # Verify file on disk
    $uploadedFile = "C:\Users\91944\source\repos\NZwalks\NZWalks.API\Images\$($uploadResponse.fileName)$($uploadResponse.fileExtension)"
    if (Test-Path $uploadedFile) {
        Write-Host "`nVERIFIED: File exists on disk at:" -ForegroundColor Green
        Write-Host "  $uploadedFile" -ForegroundColor White
    } else {
        Write-Host "`nWARNING: File not found on disk at:" -ForegroundColor Yellow
        Write-Host "  $uploadedFile" -ForegroundColor White
    }
    
} catch {
    Write-Host "`nFAILED: Upload error" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Green

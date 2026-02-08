# Test Image Upload Functionality
Write-Host "Testing NZWalks Image Upload Functionality" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5268"

# Step 1: Login to get JWT token
Write-Host "`n[1/4] Authenticating as Writer user..." -ForegroundColor Yellow

$loginBody = @{
    username = "writer@nzwalks.com"
    password = "Writer@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/Login" -Method POST -ContentType "application/json" -Body $loginBody
    
    $token = $loginResponse.jwtToken
    Write-Host "✓ Authentication successful!" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create test image if it doesn't exist
Write-Host "`n[2/4] Preparing test image..." -ForegroundColor Yellow

$testImagePath = "C:\Users\91944\.gemini\antigravity\brain\eee304d6-4e41-43d2-80a0-5220a1cfccc1\test_image_sample_1770137173726.png"

if (Test-Path $testImagePath) {
    Write-Host "✓ Test image found: $testImagePath" -ForegroundColor Green
}
else {
    Write-Host "✗ Test image not found at: $testImagePath" -ForegroundColor Red
    Write-Host "  Creating a simple test file..." -ForegroundColor Yellow
    
    # Create a simple text file as fallback
    $testImagePath = "$env:TEMP\test-upload.txt"
    "Test image upload content" | Out-File -FilePath $testImagePath -Encoding UTF8
    Write-Host "✓ Created fallback test file" -ForegroundColor Green
}

# Step 3: Upload the image
Write-Host "`n[3/4] Uploading image..." -ForegroundColor Yellow

$form = @{
    File = Get-Item -Path $testImagePath
    FileName = "automated-test-upload"
    FileDescription = "Automated test upload from PowerShell script"
}

try {
    $uploadResponse = Invoke-RestMethod -Uri "$baseUrl/api/Images/upload" -Method POST -Headers @{Authorization = "Bearer $token"} -Form $form
    
    Write-Host "✓ Image uploaded successfully!" -ForegroundColor Green
    Write-Host "`nUpload Response:" -ForegroundColor Cyan
    Write-Host "  ID: $($uploadResponse.id)" -ForegroundColor White
    Write-Host "  FileName: $($uploadResponse.fileName)" -ForegroundColor White
    Write-Host "  FileExtension: $($uploadResponse.fileExtension)" -ForegroundColor White
    Write-Host "  FileSize: $($uploadResponse.fileSizeInBytes) bytes" -ForegroundColor White
    Write-Host "  FilePath: $($uploadResponse.filePath)" -ForegroundColor White
    Write-Host "  Description: $($uploadResponse.fileDescription)" -ForegroundColor White
} catch {
    Write-Host "✗ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 4: Verify file exists on disk
Write-Host "`n[4/4] Verifying file storage..." -ForegroundColor Yellow

$imagesFolder = "C:\Users\91944\source\repos\NZwalks\NZWalks.API\Images"
$uploadedFileName = "$($uploadResponse.fileName)$($uploadResponse.fileExtension)"
$uploadedFilePath = Join-Path $imagesFolder $uploadedFileName

if (Test-Path $uploadedFilePath) {
    $fileInfo = Get-Item $uploadedFilePath
    Write-Host "✓ File verified on disk!" -ForegroundColor Green
    Write-Host "  Location: $uploadedFilePath" -ForegroundColor White
    Write-Host "  Size: $($fileInfo.Length) bytes" -ForegroundColor White
}
else {
    Write-Host "✗ File not found on disk at: $uploadedFilePath" -ForegroundColor Red
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "✓ Image Upload Test Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

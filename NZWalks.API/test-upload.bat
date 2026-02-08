@echo off
echo === Complete Image Upload Test ===
echo.

REM Step 1: Register user
echo [1/4] Registering Writer user...
curl.exe -X POST "http://localhost:5268/api/Auth/Register" -H "Content-Type: application/json" -d "{\"username\":\"testwriter@nzwalks.com\",\"email\":\"testwriter@nzwalks.com\",\"password\":\"Test@Writer123\",\"roles\":[\"Writer\"]}" -s -o nul
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: User registered or already exists
) else (
    echo NOTE: User may already exist, continuing...
)

echo.
echo [2/4] Logging in...
REM Login and capture token
curl.exe -X POST "http://localhost:5268/api/Auth/Login" -H "Content-Type: application/json" -d "{\"username\":\"testwriter@nzwalks.com\",\"password\":\"Test@Writer123\"}" -s > login_response.json

REM Extract token (using PowerShell for JSON parsing)
for /f "delims=" %%i in ('powershell -Command "(Get-Content login_response.json | ConvertFrom-Json).jwtToken"') do set TOKEN=%%i

if "%TOKEN%"=="" (
    echo FAILED: Could not get token
    type login_response.json
    del login_response.json
    exit /b 1
)

echo SUCCESS: Logged in!
echo Token: %TOKEN:~0,30%...

echo.
echo [3/4] Preparing test image...
set TESTIMAGE=C:\Users\91944\.gemini\antigravity\brain\eee304d6-4e41-43d2-80a0-5220a1cfccc1\test_image_sample_1770137173726.png
if not exist "%TESTIMAGE%" (
    set TESTIMAGE=%TEMP%\test-nz-landscape.txt
    echo Dummy image content > "%TESTIMAGE%"
    echo Created dummy test file
) else (
    echo Using test image: %TESTIMAGE%
)

echo.
echo [4/4] Uploading image...
curl.exe -X POST "http://localhost:5268/api/Images/upload" -H "Authorization: Bearer %TOKEN%" -F "File=@%TESTIMAGE%" -F "FileName=nz-landscape-test" -F "FileDescription=Automated test upload" -s > upload_response.json

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: Image uploaded!
    echo ========================================
    echo Upload Response:
    type upload_response.json
    echo.
    echo ========================================
    
    REM Check if file exists on disk
    for /f "delims=" %%i in ('powershell -Command "try { (Get-Content upload_response.json | ConvertFrom-Json).fileName } catch { '' }"') do set FILENAME=%%i
    for /f "delims=" %%i in ('powershell -Command "try { (Get-Content upload_response.json | ConvertFrom-Json).fileExtension } catch { '' }"') do set FILEEXT=%%i
    
    if exist "C:\Users\91944\source\repos\NZwalks\NZWalks.API\Images\%FILENAME%%FILEEXT%" (
        echo.
        echo VERIFIED: File exists on disk!
    )
) else (
    echo FAILED: Upload error
    type upload_response.json
)

REM Cleanup
del login_response.json 2>nul
del upload_response.json 2>nul

echo.
echo === TEST COMPLETE ===

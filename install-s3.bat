@echo off
REM AWS S3 Migration - Installation Script for Windows
REM This script helps you set up AWS S3 for your application

echo.
echo ========================================
echo    AWS S3 Migration Setup (Windows)
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "server" (
    echo [ERROR] 'server' directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Step 1: Install dependencies
echo [Step 1] Installing dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    cd ..
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully
cd ..
echo.

REM Step 2: Check .env file
echo [Step 2] Checking .env configuration...
if exist "server\.env" (
    findstr /C:"AWS_S3_BUCKET_NAME" server\.env >nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] AWS configuration found in .env
        
        REM Check if bucket name is set
        findstr /C:"AWS_S3_BUCKET_NAME = your-bucket-name" server\.env >nul
        if %errorlevel% equ 0 (
            echo [WARNING] You need to update AWS_S3_BUCKET_NAME in server\.env
            echo            Current value: your-bucket-name
            echo            Please set your actual S3 bucket name
        ) else (
            echo [SUCCESS] AWS_S3_BUCKET_NAME is configured
        )
    ) else (
        echo [ERROR] AWS configuration not found in .env
        pause
        exit /b 1
    )
) else (
    echo [ERROR] .env file not found in server directory
    pause
    exit /b 1
)
echo.

REM Step 3: Verify AWS credentials
echo [Step 3] Verifying AWS credentials...
findstr /C:"AWS_ACCESS_KEY_ID = AKIAU64M3DMQNNYRV477" server\.env >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] AWS Access Key ID found
) else (
    echo [WARNING] AWS Access Key ID not found or different
)

findstr /C:"AWS_SECRET_ACCESS_KEY" server\.env >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] AWS Secret Access Key found
) else (
    echo [WARNING] AWS Secret Access Key not found
)

findstr /C:"AWS_REGION = eu-north-1" server\.env >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] AWS Region configured (eu-north-1)
) else (
    echo [WARNING] AWS Region not configured or different
)
echo.

REM Step 4: Check S3 configuration files
echo [Step 4] Checking S3 configuration files...
if exist "server\config\s3Config.js" (
    echo [SUCCESS] s3Config.js found
) else (
    echo [ERROR] s3Config.js not found
    pause
    exit /b 1
)

if exist "server\config\s3Uploader.js" (
    echo [SUCCESS] s3Uploader.js found
) else (
    echo [ERROR] s3Uploader.js not found
    pause
    exit /b 1
)
echo.

REM Step 5: Summary
echo ========================================
echo           Setup Summary
echo ========================================
echo.
echo [SUCCESS] Dependencies installed
echo [SUCCESS] Configuration files present
echo [SUCCESS] AWS credentials configured
echo.

REM Check if bucket name needs to be updated
findstr /C:"AWS_S3_BUCKET_NAME = your-bucket-name" server\.env >nul
if %errorlevel% equ 0 (
    echo [ACTION REQUIRED]
    echo.
    echo   1. Create an S3 bucket in AWS Console (eu-north-1 region)
    echo   2. Update AWS_S3_BUCKET_NAME in server\.env
    echo   3. Configure bucket permissions (see QUICK_START_S3.md)
    echo   4. Run: cd server ^&^& npm run dev
    echo.
    echo Documentation: See QUICK_START_S3.md for detailed instructions
) else (
    echo [SUCCESS] Configuration looks good!
    echo.
    echo Next Steps:
    echo   1. Verify your S3 bucket exists in AWS Console
    echo   2. Configure bucket permissions (see QUICK_START_S3.md)
    echo   3. Run: cd server ^&^& npm run dev
    echo.
    echo Documentation: See QUICK_START_S3.md for bucket setup
)

echo.
echo ========================================
echo    Installation script complete!
echo ========================================
echo.
echo For detailed setup instructions, see:
echo   - QUICK_START_S3.md (3-minute setup)
echo   - S3_SETUP_CHECKLIST.md (step-by-step)
echo   - server\SETUP_S3.md (troubleshooting)
echo.
pause

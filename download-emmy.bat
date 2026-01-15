@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

title Download Emmy Demo Character
color 0B

echo.
echo ============================================================================
echo                    EMMY - DEMO CHARACTER DOWNLOADER
echo ============================================================================
echo.
echo This will download Emmy character LoRA and description files.
echo Emmy is included as a free demo character for testing.
echo.
echo Download size: ~100-200 MB
echo Location: ComfyUI/models/loras/Emmy/
echo.
pause

:: Setup paths
set "PYTHON=python_embeded\python.exe"
set "LORA_DIR=ComfyUI\models\loras\Emmy"
set "DRIVE_FOLDER=https://drive.google.com/drive/folders/1x-gdYcmsVpT1ZFTFwPsJaHhm09eRrVll"

:: Check Python exists
if not exist "%PYTHON%" (
    echo [ERROR] Python not found! Please run install.bat first.
    pause
    exit /b 1
)

:: Install gdown if needed
echo [1/3] Checking download tool...
"%PYTHON%" -m pip show gdown >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing gdown...
    "%PYTHON%" -m pip install gdown --quiet
)

:: Create Emmy directory
echo [2/3] Preparing directory...
if not exist "%LORA_DIR%" (
    mkdir "%LORA_DIR%"
)

:: Download Emma folder from Google Drive
echo [3/3] Downloading Emmy files from Google Drive...
echo This may take several minutes depending on your connection...
echo.

"%PYTHON%" -m gdown --folder "%DRIVE_FOLDER%" -O "%LORA_DIR%" --remaining-ok

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Download failed!
    echo.
    echo Please check:
    echo  - Internet connection
    echo  - Google Drive link is accessible
    echo.
    echo You can manually download from: %DRIVE_FOLDER%
    echo And place files in: %LORA_DIR%
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo                        DOWNLOAD COMPLETE!
echo ============================================================================
echo.
echo Emmy character files installed to: %LORA_DIR%
echo.
echo You can now:
echo 1. Run the application with run.bat
echo 2. Go to Characters page
echo 3. Create a new character named "Emmy"
echo 4. Set LoRA path to: Emmy/Emmy.safetensors
echo 5. Generate test images!
echo.
echo Press any key to exit...
pause >nul

@echo off
cd /d %~dp0
if "%~1"=="" (
    echo Drag and drop an MP4 file onto this script.
    pause
    exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -File "lastframe.ps1" -FilePath "%~1"

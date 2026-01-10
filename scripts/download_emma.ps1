$ErrorActionPreference = "Stop"
$ScriptPath = $PSScriptRoot
$RootPath = Split-Path -Parent $ScriptPath
$RootPath = (Resolve-Path $RootPath).Path

# Define paths
$PyDir = Join-Path $RootPath "python_embeded"
$PyExe = Join-Path $PyDir "python.exe"
$LorasDir = Join-Path $RootPath "ComfyUI\models\loras"
$TargetDir = Join-Path $LorasDir "EMMA"

# Verify Python
if (-not (Test-Path $PyExe)) {
    Write-Host "Error: Portable Python not found at $PyExe" -ForegroundColor Red
    Write-Host "Please run install.bat first to set up the environment."
    exit 1
}

# Verify/Create Target Directory
if (-not (Test-Path $TargetDir)) {
    Write-Host "Creating target directory: $TargetDir"
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

$FolderUrl = "https://drive.google.com/drive/folders/1NTagU4Z8qJnANqKXu-9hObjr5Zse398N?usp=drive_link"

# Ensure gdown is installed
Write-Host "Checking for gdown..."
try {
    & $PyExe -m pip install gdown --quiet --no-warn-script-location
} catch {
    Write-Host "Warning: Could not verify gdown installation. Attempting to proceed anyway..."
}

Write-Host "`n================================================"
Write-Host " Downloading EMMA Folder from Google Drive"
Write-Host "================================================"
Write-Host "Source URL: $FolderUrl"
Write-Host "Destination: $TargetDir"
Write-Host "This may take a while depending on the size..."
Write-Host ""

# Execute gdown
# -O specifies the output directory. For --folder, it puts the contents INSIDE this directory.
$Process = Start-Process -FilePath $PyExe -ArgumentList "-m gdown `"$FolderUrl`" -O `"$TargetDir`" --folder" -NoNewWindow -Wait -PassThru

if ($Process.ExitCode -eq 0) {
    Write-Host "`n[SUCCESS] Download complete!" -ForegroundColor Green
    Write-Host "Files are located in: $TargetDir"
} else {
    Write-Host "`n[ERROR] Download failed with exit code $($Process.ExitCode)" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

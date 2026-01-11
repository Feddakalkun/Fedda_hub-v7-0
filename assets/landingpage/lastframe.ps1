param(
    [string]$FilePath
)

if (-not $FilePath) {
    Write-Host "No file provided." -ForegroundColor Red
    exit 1
}

$FullPath = Resolve-Path $FilePath
$Dir = Split-Path $FullPath
$Name = [System.IO.Path]::GetFileNameWithoutExtension($FullPath)
$OutputPath = Join-Path $Dir "$Name-lastframe.png"

Write-Host "Extracting last frame from: $Name"
Write-Host "Output: $OutputPath"

# -sseof -1 seeks to the last second. 
# -update 1 overwrites the output file so we end up with the very last frame decoded.
$process = Start-Process -FilePath "ffmpeg" -ArgumentList "-y", "-sseof", "-1", "-i", "`"$FullPath`"", "-update", "1", "-q:v", "2", "`"$OutputPath`"" -PassThru -NoNewWindow -Wait

if ($process.ExitCode -eq 0) {
    Write-Host "Success!" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "Error occurred." -ForegroundColor Red
    Read-Host "Press Enter to exit..."
}

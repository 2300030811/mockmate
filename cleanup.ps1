# Mockmate Project Cleanup Script
# Run this to reduce project size significantly

Write-Host "Cleaning Mockmate Project..." -ForegroundColor Cyan

# Remove build cache (.next folder) - ~700MB
if (Test-Path ".next") {
    Write-Host "Removing .next build cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
    Write-Host "Removed .next (~700MB saved)" -ForegroundColor Green
}

# Remove unnecessary files
$filesToRemove = @(
    "app/api.zip",
    "test_convert.js"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item -Force $file
        Write-Host "Removed $file" -ForegroundColor Green
    }
}

# Check for large files in public folder
Write-Host "`nChecking public folder..." -ForegroundColor Cyan
if (Test-Path "public") {
    Get-ChildItem -Path "public" -Recurse -File | 
        Where-Object { $_.Length -gt 1MB } | 
        ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  Large file: $($_.Name) ($sizeMB MB)" -ForegroundColor Yellow
        }
}

# Final size check
Write-Host "`nCalculating final size..." -ForegroundColor Cyan
try {
    $totalSize = (Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Total project size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Green
} catch {
    Write-Host "Could not calculate total size (permission errors usually)." -ForegroundColor Gray
}

Write-Host "`nCleanup complete!" -ForegroundColor Green
Write-Host "Tip: Run 'npm run build' to regenerate .next when needed" -ForegroundColor Cyan

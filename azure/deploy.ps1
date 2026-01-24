# Azure Deployment Script
# Note: This script requires the Azure CLI.

$cliInstalled = Get-Command az -ErrorAction SilentlyContinue

if (-not $cliInstalled) {
    Write-Host "Error: Azure CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows" -ForegroundColor Yellow
    Write-Host "Or use the Azure Portal instructions in azure/README.md" -ForegroundColor Cyan
    Exit 1
}

Write-Host "Azure CLI detected. Starting interactive deployment..." -ForegroundColor Green
# Simple 'up' command which handles zip, build, and resources
# We default to F1 Free tier, Linux, Node 18
az webapp up --sku F1 --os-type Linux --runtime "NODE:18-lts" --resource-group MockmateResources 

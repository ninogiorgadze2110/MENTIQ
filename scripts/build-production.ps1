<#
.SYNOPSIS
    Produces a single deployable ASP.NET Core application that serves the
    Angular production build from wwwroot.

.DESCRIPTION
    1. Installs Angular dependencies.
    2. Builds the Angular app in production mode.
    3. Clears the API wwwroot folder.
    4. Copies the Angular output into src/Mentiq.Api/wwwroot.
    5. Publishes the ASP.NET Core API (unless -SkipPublish is given).

.PARAMETER Configuration
    Build configuration for dotnet publish. Defaults to Release.

.PARAMETER Output
    Output directory for the published application. Defaults to ./publish.

.PARAMETER SkipPublish
    Build Angular and copy it into wwwroot without running dotnet publish.

.EXAMPLE
    ./scripts/build-production.ps1
#>
[CmdletBinding()]
param(
    [string]$Configuration = 'Release',
    [string]$Output = 'publish',
    [switch]$SkipPublish
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$clientDir  = Join-Path $repoRoot 'src/Mentiq.Client'
$apiDir     = Join-Path $repoRoot 'src/Mentiq.Api'
$wwwroot    = Join-Path $apiDir 'wwwroot'
$angularOut = Join-Path $clientDir 'dist/mentiq-client/browser'

Write-Host '==> [1/5] Installing Angular dependencies...' -ForegroundColor Cyan
Push-Location $clientDir
try {
    if (Test-Path (Join-Path $clientDir 'package-lock.json')) {
        npm ci
    } else {
        npm install
    }

    Write-Host '==> [2/5] Building Angular (production)...' -ForegroundColor Cyan
    npx ng build --configuration production
} finally {
    Pop-Location
}

Write-Host '==> [3/5] Clearing API wwwroot...' -ForegroundColor Cyan
if (Test-Path $wwwroot) {
    Remove-Item -Recurse -Force (Join-Path $wwwroot '*')
} else {
    New-Item -ItemType Directory -Path $wwwroot | Out-Null
}

Write-Host '==> [4/5] Copying Angular build into wwwroot...' -ForegroundColor Cyan
if (-not (Test-Path $angularOut)) {
    throw "Angular build output not found at $angularOut"
}
Copy-Item -Recurse -Force (Join-Path $angularOut '*') $wwwroot

if ($SkipPublish) {
    Write-Host '==> Skipping dotnet publish (-SkipPublish).' -ForegroundColor Yellow
    Write-Host 'Done. Angular build is in the API wwwroot.' -ForegroundColor Green
    return
}

Write-Host "==> [5/5] Publishing ASP.NET Core API ($Configuration)..." -ForegroundColor Cyan
$publishPath = Join-Path $repoRoot $Output
dotnet publish (Join-Path $apiDir 'Mentiq.Api.csproj') -c $Configuration -o $publishPath

Write-Host "Done. Published application is in $publishPath" -ForegroundColor Green

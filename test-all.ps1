param(
  [switch]$SkipInstall,
  [switch]$SkipBackend,
  [switch]$SkipFrontend
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$results = @()
$mavenCmd = "mvn"
$npmCmd = "npm"
$nodeBinDir = ""

function Add-Result {
  param(
    [string]$Step,
    [bool]$Success,
    [string]$Message
  )

  $status = if ($Success) { "PASS" } else { "FAIL" }
  $color = if ($Success) { "Green" } else { "Red" }
  Write-Host "[$status] $Step - $Message" -ForegroundColor $color
  $script:results += [PSCustomObject]@{
    Step = $Step
    Success = $Success
    Message = $Message
  }
}

function Test-CommandAvailable {
  param([string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Resolve-ToolPaths {
  if (-not (Test-CommandAvailable "mvn")) {
    $fallbackMaven = Join-Path $env:USERPROFILE "tools\apache-maven-3.9.9\bin\mvn.cmd"
    if (Test-Path $fallbackMaven) {
      $script:mavenCmd = $fallbackMaven
    }
  }

  if (-not (Test-CommandAvailable "npm")) {
    $fallbackNpm = "C:\Program Files\nodejs\npm.cmd"
    if (Test-Path $fallbackNpm) {
      $script:npmCmd = $fallbackNpm
      $script:nodeBinDir = Split-Path -Parent $fallbackNpm
    }
  } else {
    $resolvedNpm = (Get-Command npm -ErrorAction SilentlyContinue).Source
    if ($resolvedNpm) {
      $script:nodeBinDir = Split-Path -Parent $resolvedNpm
    }
  }
}

function Ensure-NodePath {
  if ($nodeBinDir -and -not ($env:Path -like "*$nodeBinDir*")) {
    $env:Path = "$nodeBinDir;$env:Path"
  }
}

function Invoke-Step {
  param(
    [string]$StepName,
    [string]$Command,
    [string]$WorkingDirectory
  )

  Write-Host ""
  Write-Host "Running: $StepName" -ForegroundColor Cyan
  Push-Location $WorkingDirectory
  try {
    Invoke-Expression $Command
    if ($LASTEXITCODE -eq 0) {
      Add-Result -Step $StepName -Success $true -Message "Completed successfully."
      return $true
    }
    Add-Result -Step $StepName -Success $false -Message "Exited with code $LASTEXITCODE."
    return $false
  } catch {
    Add-Result -Step $StepName -Success $false -Message $_.Exception.Message
    return $false
  } finally {
    Pop-Location
  }
}

Write-Host "LifeSync full test runner" -ForegroundColor Yellow
Write-Host "Root: $root"
Resolve-ToolPaths
Ensure-NodePath

if (-not $SkipBackend) {
  Write-Host ""
  Write-Host "Backend checks" -ForegroundColor Yellow
  if (-not (Test-Path $backendDir)) {
    Add-Result -Step "Backend folder" -Success $false -Message "Missing: $backendDir"
  } elseif (-not (Test-Path $mavenCmd) -and -not (Test-CommandAvailable "mvn")) {
    Add-Result -Step "Maven availability" -Success $false -Message "mvn not found. Install Maven and ensure it is on PATH."
  } else {
    Invoke-Step -StepName "Backend test (mvn test)" -Command "& `"$mavenCmd`" test" -WorkingDirectory $backendDir | Out-Null
    Invoke-Step -StepName "Backend package (mvn clean package -DskipTests)" -Command "& `"$mavenCmd`" clean package -DskipTests" -WorkingDirectory $backendDir | Out-Null
  }
}

if (-not $SkipFrontend) {
  Write-Host ""
  Write-Host "Frontend checks" -ForegroundColor Yellow
  if (-not (Test-Path $frontendDir)) {
    Add-Result -Step "Frontend folder" -Success $false -Message "Missing: $frontendDir"
  } elseif (-not (Test-Path $npmCmd) -and -not (Test-CommandAvailable "npm")) {
    Add-Result -Step "npm availability" -Success $false -Message "npm not found. Install Node.js and ensure npm is on PATH."
  } else {
    if (-not $SkipInstall) {
      Invoke-Step -StepName "Frontend install (npm install)" -Command "& `"$npmCmd`" install" -WorkingDirectory $frontendDir | Out-Null
    } else {
      Add-Result -Step "Frontend install (npm install)" -Success $true -Message "Skipped by flag."
    }
    Invoke-Step -StepName "Frontend test (npm run test -- --watchAll=false --passWithNoTests)" -Command "& `"$npmCmd`" run test -- --watchAll=false --passWithNoTests" -WorkingDirectory $frontendDir | Out-Null
    Invoke-Step -StepName "Frontend build (npm run build)" -Command "& `"$npmCmd`" run build" -WorkingDirectory $frontendDir | Out-Null
  }
}

Write-Host ""
Write-Host "Summary" -ForegroundColor Yellow
$results | ForEach-Object {
  $status = if ($_.Success) { "PASS" } else { "FAIL" }
  $color = if ($_.Success) { "Green" } else { "Red" }
  Write-Host "[$status] $($_.Step): $($_.Message)" -ForegroundColor $color
}

$failed = @($results | Where-Object { -not $_.Success }).Count
if ($failed -gt 0) {
  Write-Host ""
  Write-Host "Completed with $failed failing step(s)." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "All checks passed." -ForegroundColor Green
exit 0

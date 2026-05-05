param(
  [ValidateSet('start', 'stop', 'status', 'logs')]
  [string]$Action = 'start'
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$RunDir = Join-Path $Root '.postiz-run'
$LogDir = Join-Path $RunDir 'logs'
$PidFile = Join-Path $RunDir 'pids.json'
$DockerComposeFile = Join-Path $Root 'docker-compose.local-dev.yaml'

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Get-CommandPath([string]$Name) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  return $null
}

function Require-Command([string]$Name) {
  $path = Get-CommandPath $Name
  if (-not $path) {
    throw "Missing required command: $Name"
  }
  return $path
}

function Wait-Http([string]$Label, [string]$Url, [int]$Attempts = 90, [int]$SleepSeconds = 2) {
  for ($i = 0; $i -lt $Attempts; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Write-Host "$Label is ready at $Url"
        return
      }
    } catch {
      Start-Sleep -Seconds $SleepSeconds
    }
  }

  throw "$Label did not become ready: $Url"
}

function Read-Pids {
  if (-not (Test-Path -LiteralPath $PidFile)) {
    return @{}
  }

  $raw = Get-Content -LiteralPath $PidFile -Raw
  if (-not $raw.Trim()) {
    return @{}
  }

  $obj = $raw | ConvertFrom-Json
  $map = @{}
  foreach ($prop in $obj.PSObject.Properties) {
    $map[$prop.Name] = [int]$prop.Value
  }
  return $map
}

function Write-Pids([hashtable]$Map) {
  $Map | ConvertTo-Json | Set-Content -LiteralPath $PidFile -Encoding ASCII
}

function Stop-Port([int]$Port) {
  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $connections) {
    return
  }

  $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $processIds) {
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
      Write-Host "Stopped process on port $Port (PID $processId)"
    } catch {
    }
  }
}

function Stop-AppProcesses {
  $pids = Read-Pids
  $stoppedPids = @()
  foreach ($entry in $pids.GetEnumerator()) {
    try {
      Stop-Process -Id $entry.Value -Force -ErrorAction Stop
      Write-Host "Stopped $($entry.Key) (PID $($entry.Value))"
      $stoppedPids += $entry.Value
    } catch {
    }
  }
  # Wait for all stopped processes to fully exit and release file handles
  foreach ($stoppedPid in $stoppedPids) {
    try {
      $proc = Get-Process -Id $stoppedPid -ErrorAction SilentlyContinue
      if ($proc) { $proc.WaitForExit(5000) | Out-Null }
    } catch {}
  }

  if (Test-Path -LiteralPath $PidFile) {
    Remove-Item -LiteralPath $PidFile -Force
  }

  Stop-Port 4200
  Stop-Port 3000
  Stop-Port 3002
}

function Start-LoggedProcess([string]$Name, [string]$FilePath, [string[]]$Arguments, [string]$WorkingDirectory) {
  $stdout = Join-Path $LogDir "$Name.log"
  $stderr = Join-Path $LogDir "$Name.err.log"

  $process = Start-Process -FilePath $FilePath `
    -ArgumentList $Arguments `
    -WorkingDirectory $WorkingDirectory `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -WindowStyle Hidden `
    -PassThru

  Write-Host "Started $Name (PID $($process.Id))"
  return $process.Id
}

function Start-Postiz {
  Ensure-Dir $RunDir
  Ensure-Dir $LogDir

  Require-Command 'docker'
  $pnpm = Require-Command 'pnpm.cmd'

  if (-not (Test-Path -LiteralPath (Join-Path $Root '.env'))) {
    throw "Missing .env file at $Root\.env"
  }

  Write-Host 'Starting local dependencies'
  & docker compose -f $DockerComposeFile up -d --remove-orphans
  if ($LASTEXITCODE -ne 0) {
    throw 'docker compose up failed'
  }

  if (-not (Test-Path -LiteralPath (Join-Path $Root 'node_modules'))) {
    Write-Host 'Installing dependencies'
    & $pnpm install
    if ($LASTEXITCODE -ne 0) {
      throw 'pnpm install failed'
    }
  }

  Stop-AppProcesses

  Write-Host 'Building backend'
  & $pnpm --filter ./apps/backend run build
  if ($LASTEXITCODE -ne 0) {
    throw 'backend build failed'
  }

  Write-Host 'Building orchestrator'
  & $pnpm --filter ./apps/orchestrator run build
  if ($LASTEXITCODE -ne 0) {
    throw 'orchestrator build failed'
  }

  $pids = @{}
  $pids.backend = Start-LoggedProcess 'backend' $pnpm @('--filter', './apps/backend', 'run', 'start') $Root
  Wait-Http 'Backend' 'http://localhost:3000/auth/can-register'

  $pids.orchestrator = Start-LoggedProcess 'orchestrator' $pnpm @('--filter', './apps/orchestrator', 'run', 'start') $Root
  Wait-Http 'Orchestrator' 'http://localhost:3002/health/status'

  $pids.frontend = Start-LoggedProcess 'frontend' $pnpm @('--filter', './apps/frontend', 'run', 'dev') $Root
  Wait-Http 'Frontend' 'http://localhost:4200/auth' 120 2

  Write-Pids $pids

  Write-Host ''
  Write-Host 'Postiz is running:'
  Write-Host '- Frontend: http://localhost:4200'
  Write-Host '- Backend: http://localhost:3000'
  Write-Host '- Orchestrator: http://localhost:3002/health/status'
  Write-Host '- Logs: .postiz-run\logs'
}

function Stop-Postiz {
  Stop-AppProcesses
  if (Test-Path -LiteralPath $DockerComposeFile) {
    & docker compose -f $DockerComposeFile down --remove-orphans
    if ($LASTEXITCODE -ne 0) {
      throw 'docker compose down failed'
    }
  }
  Write-Host 'Postiz stopped.'
}

function Show-Status {
  $pids = Read-Pids
  if ($pids.Count -eq 0) {
    Write-Host 'No tracked app processes.'
  } else {
    foreach ($entry in $pids.GetEnumerator()) {
      $running = Get-Process -Id $entry.Value -ErrorAction SilentlyContinue
      if ($running) {
        Write-Host "$($entry.Key): running (PID $($entry.Value))"
      } else {
        Write-Host "$($entry.Key): stopped"
      }
    }
  }

  & docker compose -f $DockerComposeFile ps
}

function Show-Logs {
  Ensure-Dir $LogDir
  Write-Host "Frontend log: $([IO.Path]::Combine($LogDir, 'frontend.log'))"
  Write-Host "Backend log: $([IO.Path]::Combine($LogDir, 'backend.log'))"
  Write-Host "Orchestrator log: $([IO.Path]::Combine($LogDir, 'orchestrator.log'))"
}

switch ($Action) {
  'start' { Start-Postiz }
  'stop' { Stop-Postiz }
  'status' { Show-Status }
  'logs' { Show-Logs }
}

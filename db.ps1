# Deal Finder Database Management
# PowerShell script to start/stop the local database

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'reset')]
    [string]$Action = 'status'
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Status($message, $color = "White") {
    Write-Host $message -ForegroundColor $color
}

function Test-DockerRunning {
    try {
        docker info 2>&1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Start-Database {
    Write-Status "Starting Deal Finder Database..." "Cyan"
    
    if (-not (Test-DockerRunning)) {
        Write-Status "Docker is not running. Please start Docker Desktop first." "Red"
        exit 1
    }
    
    Set-Location $ProjectRoot
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Database started successfully!" "Green"
        Write-Status "  PostgreSQL: localhost:5432" "Gray"
        Write-Status "  pgAdmin:    http://localhost:5050" "Gray"
        Write-Status "  User:       dealfinder" "Gray"
        Write-Status "  Password:   dealfinder123" "Gray"
    }
}

function Stop-Database {
    Write-Status "Stopping Deal Finder Database..." "Cyan"
    
    Set-Location $ProjectRoot
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Database stopped. Data is preserved in ./db-data/" "Green"
    }
}

function Restart-Database {
    Stop-Database
    Start-Sleep -Seconds 2
    Start-Database
}

function Get-DatabaseStatus {
    Write-Status "Deal Finder Database Status" "Cyan"
    
    if (-not (Test-DockerRunning)) {
        Write-Status "Docker is not running" "Red"
        return
    }
    
    Set-Location $ProjectRoot
    docker-compose ps
}

function Show-Logs {
    Write-Status "Database Logs (Ctrl+C to exit)" "Cyan"
    Set-Location $ProjectRoot
    docker-compose logs -f db
}

function Reset-Database {
    Write-Status "WARNING: This will DELETE all database data!" "Yellow"
    $confirm = Read-Host "Type yes to confirm"
    
    if ($confirm -eq "yes") {
        Stop-Database
        
        $dataDir = Join-Path $ProjectRoot "db-data"
        if (Test-Path $dataDir) {
            Remove-Item -Recurse -Force $dataDir
            Write-Status "Database data deleted" "Green"
        }
        
        Write-Status "Run db.ps1 start to create a fresh database" "Cyan"
    } else {
        Write-Status "Reset cancelled" "Gray"
    }
}

switch ($Action) {
    "start"   { Start-Database }
    "stop"    { Stop-Database }
    "restart" { Restart-Database }
    "status"  { Get-DatabaseStatus }
    "logs"    { Show-Logs }
    "reset"   { Reset-Database }
}

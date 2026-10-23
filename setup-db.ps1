param (
    [string]$Password,
    [string]$HostName = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$DbName = "ecoprawn_db"
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " EcoPrawn PostgreSQL Database Setup Tool  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$pgBin = "C:\Program Files\PostgreSQL\18\bin"
if (-not (Test-Path $pgBin)) {
    $found = Get-ChildItem "C:\Program Files\PostgreSQL" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $pgBin = Join-Path $found.FullName "bin"
    } else {
        Write-Error "PostgreSQL installation not found in 'C:\Program Files\PostgreSQL'."
        exit 1
    }
}

$psqlExe = Join-Path $pgBin "psql.exe"
$createdbExe = Join-Path $pgBin "createdb.exe"

if (-not $Password) {
    $secure = Read-Host "Enter your PostgreSQL '$User' password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

$env:PGPASSWORD = $Password

Write-Host "Testing connection to PostgreSQL ($User@$HostName`:$Port)..." -ForegroundColor Yellow
$connTest = & $psqlExe -U $User -h $HostName -p $Port -w -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Connection failed. Incorrect password or PostgreSQL service is not running." -ForegroundColor Red
    Write-Host "Details: $connTest" -ForegroundColor DarkRed
    exit 1
}

Write-Host "[OK] Successfully connected to PostgreSQL server!" -ForegroundColor Green

# Check if database exists
Write-Host "Checking if database '$DbName' exists..." -ForegroundColor Yellow
$checkDb = & $psqlExe -U $User -h $HostName -p $Port -w -t -A -c "SELECT 1 FROM pg_database WHERE datname='$DbName';" 2>&1

if ($checkDb -notmatch "1") {
    Write-Host "Creating database '$DbName'..." -ForegroundColor Yellow
    & $createdbExe -U $User -h $HostName -p $Port -w $DbName
    Write-Host "[OK] Database '$DbName' created successfully!" -ForegroundColor Green
} else {
    Write-Host "[OK] Database '$DbName' already exists." -ForegroundColor Green
}

# URL encode password for connection string
Add-Type -AssemblyName System.Web
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($Password)
$connectionString = "postgresql://${User}:${encodedPassword}@${HostName}:${Port}/${DbName}?schema=public"

$frontendEnv = Join-Path $PSScriptRoot "frontend\.env"
$envLines = @(
    "# PostgreSQL connection string for EcoPrawn",
    "DATABASE_URL=`"$connectionString`""
)
Set-Content -Path $frontendEnv -Value $envLines -Encoding UTF8
Write-Host "[OK] Updated $frontendEnv with your DATABASE_URL" -ForegroundColor Green

# Push Prisma schema and generate client
Write-Host ""
Write-Host "Pushing schema to PostgreSQL (npx prisma db push)..." -ForegroundColor Yellow
Push-Location (Join-Path $PSScriptRoot "frontend")
try {
    npx prisma db push --skip-generate
    Write-Host "[OK] Database tables created successfully!" -ForegroundColor Green
    
    Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
    npx prisma generate
    Write-Host "[OK] Prisma Client ready!" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Setup Complete! PostgreSQL is ready.     " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host " 1. Visit http://localhost:3000/api/seed to populate initial data"
Write-Host " 2. Open http://localhost:3000/dashboard (shows POSTGRES: CONNECTED)"
Write-Host " 3. Optional: Run 'npx prisma studio' inside frontend/ to view your tables"

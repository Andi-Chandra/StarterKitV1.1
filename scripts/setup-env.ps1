param(
    [string]$Source = '.env.local',
    [string]$Dest = '.env'
)

if (-not (Test-Path $Source)) {
    Write-Error "$Source not found. Please create $Source or set the source parameter."
    exit 1
}

if (Test-Path $Dest) {
    $timestamp = Get-Date -Format 'yyyyMMddHHmmss'
    $backup = "$Dest.bak.$timestamp"
    Copy-Item -Path $Dest -Destination $backup -Force
    Write-Output "Existing $Dest backed up to $backup"
}

Copy-Item -Path $Source -Destination $Dest -Force
Write-Output "Copied $Source -> $Dest"

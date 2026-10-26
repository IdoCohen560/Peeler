$ErrorActionPreference = "Stop"
$downloads = "C:\\Users\\Owner\\Downloads"
$projects = "C:\\Users\\Owner\\ghidra\\projects"
$ghidra = "C:\\Users\\Owner\\ghidra\\Ghidra\\RuntimeScripts\\ghidraRun"

# URLs for binaries (replace with actual URLs when known)
$bins = [ordered]@{
    "win" = "reference URL removed"
    "mac" = "reference URL removed"
    "linux" = "reference URL removed"
}

foreach ($plat in $bins.Keys) {
    Write-Host "Processing platform: $plat"
    $url = $bins[$plat]
    $ext = if ($plat -eq 'win') { 'exe' } elseif ($plat -eq 'mac') { 'app' } else { 'bin' }
    $file = Join-Path $downloads "LegacyConverter_$plat.$ext"
    Invoke-WebRequest -Uri $url -OutFile $file
    Write-Host "Downloaded to $file"

    $projName = "LegacyConverter-$plat"
    $projPath = Join-Path $projects $projName
    if (-not (Test-Path $projPath)) { New-Item -ItemType Directory -Path $projPath }
    Write-Host "Project path: $projPath"

    & $ghidra -import $file -analysisPath $projPath -project $projName -logFile (Join-Path $projPath "log.txt") -noGui
    Write-Host "Imported and analyzed binary for $plat"
}
Write-Host "All platforms processed"

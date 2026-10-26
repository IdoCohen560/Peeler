param([switch]$UseDownloadedPackage)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$downloadRoot = Join-Path $projectRoot 'tools\downloads'
$officeRoot = Join-Path $projectRoot 'tools\libreoffice'
$cabRoot = Join-Path $projectRoot 'tools\office-cab'
$packagePath = Join-Path $downloadRoot 'LibreOffice_26.8.1.1_Machine_X64_msi_en-US.msi'
$expectedHash = 'C6298B10CFA1748BCBEDAD94C62CE771E240E5021BFD6D7A967CD571B04B5312'
if (-not (Test-Path -LiteralPath $packagePath)) {
    if ($UseDownloadedPackage) { throw 'The pinned LibreOffice package has not been downloaded.' }
    & winget download --id TheDocumentFoundation.LibreOffice --version 26.8.1.1 --exact --source winget --download-directory $downloadRoot --skip-dependencies --accept-source-agreements --accept-package-agreements --disable-interactivity
    if ($LASTEXITCODE -ne 0) { throw 'LibreOffice download failed.' }
}
if ((Get-FileHash -LiteralPath $packagePath -Algorithm SHA256).Hash -ne $expectedHash) { throw 'LibreOffice package hash mismatch.' }
$sevenZip = Join-Path $projectRoot 'node_modules\electron-winstaller\vendor\7z.exe'
if (-not (Test-Path -LiteralPath $sevenZip)) { throw 'Run npm ci on Windows before extracting the Office engine.' }
New-Item -ItemType Directory -Path $officeRoot -Force | Out-Null
& $sevenZip x $packagePath "-o$cabRoot" -y -bsp0 -bso0
if ($LASTEXITCODE -ne 0) { throw 'LibreOffice package extraction failed.' }
# Read MSI tables without running its installer, custom actions, or registry changes.
$installer = New-Object -ComObject WindowsInstaller.Installer
$database = $installer.OpenDatabase($packagePath, 0)
function Read-Table($query, $columnCount) {
    $view = $database.OpenView($query)
    [void]$view.Execute()
    while ($record = $view.Fetch()) {
        [pscustomobject]@{ A = $record.StringData(1); B = $record.StringData(2); C = $(if ($columnCount -eq 3) { $record.StringData(3) } else { '' }) }
    }
    [void]$view.Close()
}
$directories = @{}
Read-Table 'SELECT Directory, Directory_Parent, DefaultDir FROM Directory' 3 | ForEach-Object { $directories[$_.A] = @{ Parent = $_.B; Name = (($_.C -split ':')[0] -split '\|')[-1] } }
$components = @{}
Read-Table 'SELECT Component, Directory_ FROM Component' 2 | ForEach-Object { $components[$_.A] = $_.B }
function Resolve-OfficeDirectory($id) {
    if ($id -eq 'INSTALLLOCATION') { return $officeRoot }
    if (-not $directories.ContainsKey($id) -or $id -eq 'TARGETDIR') { return $null }
    $parent = Resolve-OfficeDirectory $directories[$id].Parent
    if (-not $parent) { return $null }
    if ($directories[$id].Name -eq '.') { return $parent }
    return Join-Path $parent $directories[$id].Name
}
$copied = 0
Read-Table 'SELECT File, Component_, FileName FROM File' 3 | ForEach-Object {
    $destinationDirectory = Resolve-OfficeDirectory $components[$_.B]
    if ($destinationDirectory) {
        $name = ($_.C -split '\|')[-1]
        $destination = [IO.Path]::GetFullPath((Join-Path $destinationDirectory $name))
        if (-not $destination.StartsWith($officeRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'MSI destination escaped the project Office directory.' }
        $source = Join-Path $cabRoot $_.A
        if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing cabinet file: $($_.A)" }
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
        Copy-Item -LiteralPath $source -Destination $destination -Force
        $copied++
    }
}
& (Join-Path $officeRoot 'program\soffice.com') --version
if ($LASTEXITCODE -ne 0) { throw 'The extracted Office engine could not start.' }
Write-Output "Office engine ready: $copied files in $officeRoot. No system installation was performed."

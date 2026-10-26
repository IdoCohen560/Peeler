param([switch]$UseDownloadedPackage)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$downloadRoot = Join-Path $projectRoot 'tools\downloads'
$mediaRoot = Join-Path $projectRoot 'tools\ffmpeg'
$packagePath = Join-Path $downloadRoot 'FFmpeg_9.0.2_X64_portable_en-US.zip'
if (-not (Test-Path -LiteralPath $packagePath)) {
    if ($UseDownloadedPackage) { throw 'The pinned FFmpeg package has not been downloaded.' }
    & winget download --id Gyan.FFmpeg --version 9.0.2 --exact --source winget --download-directory $downloadRoot --skip-dependencies --accept-source-agreements --accept-package-agreements --disable-interactivity
    if ($LASTEXITCODE -ne 0) { throw 'FFmpeg download failed.' }
}
if ((Get-FileHash -LiteralPath $packagePath -Algorithm SHA256).Hash -ne '759D0A9831C436A0EB331AD36F236C06CB04AAA0005DA46571F0E9D3D9206F6B') { throw 'FFmpeg package hash mismatch.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($packagePath)
try {
    New-Item -ItemType Directory -Path $mediaRoot -Force | Out-Null
    foreach ($entry in $zip.Entries) {
        if ($entry.FullName -match '^ffmpeg-9\.0\.2-full_build/(bin/(ffmpeg|ffprobe)\.exe|LICENSE|README\.txt)$') {
            $destination = Join-Path $mediaRoot ([IO.Path]::GetFileName($entry.FullName))
            [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destination, $true)
        }
    }
} finally { $zip.Dispose() }
& (Join-Path $mediaRoot 'ffmpeg.exe') -version | Select-Object -First 1
if ($LASTEXITCODE -ne 0) { throw 'The extracted media engine could not start.' }
Write-Output "Media engine ready in $mediaRoot. No system installation was performed."

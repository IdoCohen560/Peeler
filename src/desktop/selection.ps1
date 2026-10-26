$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class PeelerForeground { [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow(); }'
$foreground = [PeelerForeground]::GetForegroundWindow().ToInt64()
$shell = New-Object -ComObject Shell.Application
$paths = @()
foreach ($explorer in $shell.Windows()) {
    if ([long]$explorer.HWND -eq $foreground) {
        foreach ($item in $explorer.Document.SelectedItems()) {
            if (-not $item.IsFolder) { $paths += [string]$item.Path }
        }
    }
}
ConvertTo-Json -InputObject @($paths) -Compress

# Check RTK availability and instruct agents to prefix commands
$rtkPaths = @(
  'C:\\Projects\\_clis\\rtk.exe',
  "$env:USERPROFILE\\.local\\bin\\rtk",
  "C:\\Program Files\\rtk\\rtk.exe"
)
$found = $false
foreach ($p in $rtkPaths) {
  if (Test-Path $p) { Write-Host "RTK found at $p"; $found = $true; break }
}
if (-not $found) { Write-Host "RTK not found in common paths. Run 'rtk --version' to verify." }

# Agent guidance (use rtk-prefixed commands):
# rtk git status
# rtk npm run build
# rtk read src/features/share/components/ShareScreen.tsx

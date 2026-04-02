# check-agent-names.ps1
# Scans a text for forbidden human names used in prior squad configurations.
# Run before posting PR/issue comments or committing squad config changes.
#
# Usage: .\check-agent-names.ps1 -Text "your text here"
#        .\check-agent-names.ps1 -File path\to\file.md

param(
    [string]$Text,
    [string]$File
)

$forbidden = @(
    'danny', 'rusty', 'linus', 'basher', 'livingston', 'saul', 'reuben', 'ralph',
    '@danny', '@rusty', '@linus', '@basher', '@livingston', '@saul', '@reuben', '@ralph'
)

if ($File) {
    $Text = Get-Content $File -Raw
}

if (-not $Text) {
    Write-Error "Provide -Text or -File"
    exit 1
}

$lowerText = $Text.ToLower()
$violations = @()

foreach ($name in $forbidden) {
    if ($lowerText -match "\b$([regex]::Escape($name))\b") {
        $violations += $name
    }
}

if ($violations.Count -gt 0) {
    Write-Host "POLICY VIOLATION: Found forbidden human name(s): $($violations -join ', ')" -ForegroundColor Red
    Write-Host "See .squad/agent-naming-policy.md for valid agent names." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "OK: No forbidden human names found." -ForegroundColor Green
    exit 0
}

# Deploy this blog to GitHub Pages.
# Run it after editing posts:  .\deploy.ps1 "new post: htb example box"

param(
  [string]$Message = "update blog"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# 1. who are we
$user = gh api user | ConvertFrom-Json
$login = $user.login
$repo = "$login.github.io"

Write-Host "account: $login" -ForegroundColor Cyan
Write-Host "repo:    $repo" -ForegroundColor Cyan

# 2. git identity, commits show up as yours
if (-not (Test-Path .git)) {
  git init -b main | Out-Null
}

git config user.name $user.name
git config user.email "$($user.id)+$login@users.noreply.github.com"

# 3. create the repo on github if it is not there yet
$exists = $true
try { gh repo view $repo | Out-Null } catch { $exists = $false }

if (-not $exists) {
  Write-Host "creating repo..." -ForegroundColor Yellow
  gh repo create $repo --public --description "cybersecurity writeups, ctf notes and lab logs"
}

# 4. push
$remotes = git remote
if (-not ($remotes -match "origin")) {
  git remote add origin "https://github.com/$repo.git"
}

git add -A
if (git status --porcelain) {
  git commit -m $Message | Out-Null
} else {
  Write-Host "nothing new to commit" -ForegroundColor Yellow
}

git push -u origin main

# 5. turn on pages (ignore the error if it is already on)
$body = '{"source":{"branch":"main","path":"/"}}'
$body | gh api -X POST "repos/$repo/pages" --input - 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  $body | gh api -X PUT "repos/$repo/pages" --input - 2>$null | Out-Null
}

Write-Host ""
Write-Host "pushed. build usually takes 1 to 3 minutes." -ForegroundColor Green
Write-Host "site: https://$($login.ToLower()).github.io" -ForegroundColor Green
Write-Host "build status: gh api repos/$repo/pages/builds/latest"

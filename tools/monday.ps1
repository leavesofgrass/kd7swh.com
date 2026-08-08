# tools/monday.ps1 — the Monday pipeline for kd7swh.com/lun
#
# Runs publish -> build -> guard -> links in order, stops at the first
# failure, then shows what changed and asks before committing anything.
# The commit prompt is the human gate — nothing publishes without a yes.
#
# Usage, from anywhere:   D:\kd7swh\tools\monday.ps1
# Prereqs: Docker Desktop running; Phases 2-4 built (publish.mjs exists).

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host @'

      |
     /|\      LINUX USER NET — Monday pipeline
    ~~|~~     publish -> build -> guard -> links
      |       live by 7:00 PM  ·  net at 8:10

'@

foreach ($step in @("publish", "build", "guard", "links")) {
    Write-Host "=== $step ===" -ForegroundColor Cyan
    if ($step -eq "publish") {
        # --force so a late story (tools\add-story.ps1) can be injected and
        # the pipeline re-run; same drafts file in, same page out.
        docker compose run --rm publish node tools/publish.mjs --force
    } else {
        docker compose run --rm $step
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "'$step' failed (exit $LASTEXITCODE). Nothing was committed." -ForegroundColor Red
        Write-Host "Fix the problem and run this script again."
        exit $LASTEXITCODE
    }
    Write-Host ""
}

Write-Host "=== what changed ===" -ForegroundColor Cyan
git status --short content/lun
Write-Host ""

$answer = Read-Host "Commit and push content/lun? [y/N]"
if ($answer -match '^[Yy]') {
    git add content/lun
    git commit -m "lun: week of $(Get-Date -Format 'yyyy-MM-dd')"
    git push
    Write-Host ""
    Write-Host "Pushed. Confirm https://kd7swh.com/lun/ before 7:00 PM." -ForegroundColor Green
} else {
    Write-Host "Not committed. Nothing published." -ForegroundColor Yellow
}

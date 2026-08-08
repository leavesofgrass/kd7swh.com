# tools/add-story.ps1 — PowerShell twin of tools/add-story.sh.
#
#   .\tools\add-story.ps1 https://example.com/story [--checked] [--source="LWN"]
#
# Runs the Node tool inside the container — the toolchain never runs on
# the host.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
docker compose run --rm dev node tools/add-story.mjs @args
exit $LASTEXITCODE

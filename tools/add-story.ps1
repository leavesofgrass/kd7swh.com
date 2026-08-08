# tools/add-story.ps1 — one-command late-story injection, from Windows.
#
#   D:\kd7swh\tools\add-story.ps1 https://example.com/story
#   D:\kd7swh\tools\add-story.ps1 https://example.com/story --checked
#   D:\kd7swh\tools\add-story.ps1 https://example.com/story --source="LWN"
#
# Runs the Node tool inside the container (no Node on Windows, ever).

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
docker compose run --rm dev node tools/add-story.mjs @args
exit $LASTEXITCODE

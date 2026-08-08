#!/usr/bin/env bash
# tools/add-story.sh — one-command late-story injection.
#
#   ./tools/add-story.sh https://example.com/story
#   ./tools/add-story.sh https://example.com/story --checked
#   ./tools/add-story.sh https://example.com/story --source="LWN"
#
# Runs the Node tool inside the container — the toolchain never runs on
# the host.

set -euo pipefail
cd "$(dirname "$0")/.."
exec docker compose run --rm dev node tools/add-story.mjs "$@"

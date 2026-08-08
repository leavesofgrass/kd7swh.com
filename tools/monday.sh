#!/usr/bin/env bash
# tools/monday.sh — the net-night pipeline.
#
# Runs publish -> build -> guard -> links, stops at the first failure,
# shows what changed, and asks before committing. The prompt is the human
# gate — nothing publishes without a yes.

set -euo pipefail
cd "$(dirname "$0")/.."

for step in publish build guard links; do
  echo "=== $step ==="
  if [ "$step" = publish ]; then
    # --force so a late story (tools/add-story.sh) can be injected and the
    # pipeline re-run; same drafts file in, same page out.
    docker compose run --rm publish node tools/publish.mjs --force
  else
    docker compose run --rm "$step"
  fi
done

echo
echo "=== what changed ==="
git status --short content/lun
echo

read -r -p "Commit and push content/lun? [y/N] " answer
case "$answer" in
  [Yy]*)
    git add content/lun
    git commit -m "lun: week of $(date +%F)"
    git push
    echo "Pushed. Confirm https://kd7swh.com/lun/ before 7:00 PM."
    ;;
  *)
    echo "Not committed. Nothing published."
    ;;
esac

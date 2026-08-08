# kd7swh.com

Personal site — amateur radio, Linux, microcontrollers. Hosts the weekly
**Linux User Net** links at `/lun`.

Nothing here requires Node on Windows. The whole toolchain lives in the
container.

## The one rule

**No container service mounts anything outside this folder.** The weekly
candidate list lives in `./drafts`, which is part of this project. Nothing
on the host outside this directory is ever mounted or read.

If a change appears to require reaching outside this directory, stop.

## Setup, once

```
docker compose build
mkdir drafts
```

Optionally, open `D:\kd7swh\drafts` as its own small Obsidian vault so
checkboxes render while you curate.

## Daily use

| What | Command |
|---|---|
| Dev server, live reload | `docker compose up dev` → http://localhost:8080 |
| Production build to `./_site` | `docker compose run --rm build` |
| Turn this week's checked items into a page | `docker compose run --rm publish` |
| Inject a late-breaking story into this week's drafts | `tools\add-story.ps1 <url>` |
| Leakage and shape checks | `docker compose run --rm guard` |
| Check every link resolves | `docker compose run --rm links` |
| Text-browser check | `docker compose exec dev w3m http://localhost:8080/lun/` |
| Shell in the container | `docker compose run --rm dev bash` |
| Add a dependency | `docker compose run --rm dev npm install <pkg>` |

Extract just the built site, no compose involved:

```
docker build --target artifact --output type=local,dest=./_site .
```

## Monday

```
docker compose run --rm publish      # drafts -> content/lun/
docker compose run --rm build
docker compose run --rm guard
docker compose run --rm links        # every link, resolved
git add content/lun && git commit && git push
```

Live and verified by 7:00 PM. Net at 8:10.

Story breaks after you've already published? `tools\add-story.ps1 <url>`,
check its box in the drafts file (or pass `--checked`), then run
`tools\monday.ps1` again — its publish step uses `--force` so re-running
regenerates the week from the same drafts file.

## Gotchas

**Changed `package.json` and the container doesn't see it.** `node_modules` is a
named volume seeded from the image, so it doesn't update on rebuild alone:

```
docker compose down -v
docker compose build
```

**Live reload isn't firing.** inotify doesn't cross the Windows bind mount. The
dev image sets `CHOKIDAR_USEPOLLING=1` to work around it. If it still misses
changes, raise `CHOKIDAR_INTERVAL`.

**`publish` says nothing is checked.** That's the intended failure. Nothing
publishes unless items are explicitly marked `[x]` in the drafts file.

**Builds feel slow.** Source lives on `D:` and crosses into the Linux VM on
every read. `node_modules` is already on a named volume, which removes most of
it. The rest is the cost of keeping the repo on a Windows drive.

# Development notes

Everything runs in containers; nothing installs on the host.

| What | Command |
|---|---|
| Dev server with live reload | `docker compose up dev` → http://localhost:8080 |
| Production build to `./_site` | `docker compose run --rm build` |
| Checked drafts → this week's page | `docker compose run --rm publish` |
| Leakage and shape checks | `docker compose run --rm guard` |
| Every link resolves | `docker compose run --rm links` |
| Inject a late-breaking story | `./tools/add-story.sh <url>` |
| Text-browser check | `docker compose exec dev w3m http://localhost:8080/lun/` |
| Shell in the container | `docker compose run --rm dev bash` |
| Add a dependency | `docker compose run --rm dev npm install <pkg>` |

## The weekly cycle

Candidates land in `drafts/<Monday>.md` as unchecked boxes. Checking a
box is the only way anything publishes — `publish.mjs` emits checked
lines verbatim and ignores every other line.

Net night, from the repo root:

```
./tools/monday.sh
```

That runs publish → build → guard → links, shows what changed, and asks
before committing anything. Story breaks late? `./tools/add-story.sh <url>`,
check its box in the drafts file (or pass `--checked`), run the pipeline
again.

Live and verified by 7:00 PM Pacific. Net at 8:10.

## Gotchas

- **Changed `package.json` and the container doesn't see it** —
  `node_modules` is a named volume seeded from the image:
  `docker compose down -v && docker compose build`
- **Live reload not firing** — on hosts where file-change events don't
  cross the bind mount, the watcher polls (`CHOKIDAR_USEPOLLING` is
  already set); raise `CHOKIDAR_INTERVAL` if it still misses changes.
- **`publish` says nothing is checked** — intended. Nothing publishes
  unless it is explicitly marked `[x]`.
- **A date looks off by one** — dates are formatted in UTC on purpose;
  format them any other way and every heading shifts a day.

## Rehosting

The archive is plain Markdown, one file per week, in `content/lun/`. The
canonical origin lives in exactly one place: `siteUrl` in
`eleventy.config.js`. Fork, change that line, point your own domain.
Details in [CONTRIBUTING.md](../CONTRIBUTING.md).

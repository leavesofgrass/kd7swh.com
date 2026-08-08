# Contributing

## Suggesting a story for the net

**The best route is the
[groups.io forum](https://groups.io/g/the-linux-user-net/topics)** — that's
where the net already talks between sessions, and it gets read during
research every week. No GitHub account needed.

GitHub works too: open a
[story suggestion](https://github.com/leavesofgrass/kd7swh.com/issues/new/choose)
issue. Either way, the bar a story has to clear is simple to state: it
should change what a Linux user or a radio operator can **do**, and give
the net something to **discuss**, not just announce.

**Inclusion is editorial.** Suggestions are genuinely welcome, and most of
what makes the list started as one — but the list is curated by hand, and
an unmerged suggestion is not a rejection of the person who sent it.

## Corrections

Spotted something wrong in a published week — a broken attribution, a
mislabeled source? Open a
[correction issue](https://github.com/leavesofgrass/kd7swh.com/issues/new/choose)
or a PR. **PRs against past weeks are corrections only.** The archive is a
record of what was covered, not a page to keep retrofitting; dead links
stay, because they were what was read.

## Working on the site itself

The whole toolchain runs in containers — nothing installs on the host.
The command reference lives in [docs/development.md](docs/development.md).
PRs run build, guard, tests, and a link check in CI; all four need to
pass.

## Rehosting this archive

The Linux User Net list is a community asset, and it is built to outlive
any one host:

- Every week is one plain Markdown file in `content/lun/`, named
  `YYYY-MM-DD.md` — no database, no proprietary format, no absolute URLs
  baked into content.
- The canonical origin lives in exactly one place: `siteUrl` in
  `eleventy.config.js`.

To rehost: **fork this repository**, change `siteUrl`, remove the custom
domain in the repository's Pages settings and set your own, and the whole
archive comes with you. The content license (CC BY-NC-SA 4.0 — see
[LICENSE-content](LICENSE-content)) permits exactly this, with
attribution.

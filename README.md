# kd7swh.com

Source for [kd7swh.com](https://kd7swh.com) — a personal site about
amateur radio, Linux, microcontrollers, retrocomputing, and the places
they overlap. It also carries the weekly link list of the
**Linux User Net**, at [kd7swh.com/lun](https://kd7swh.com/lun/).

Static pages built with [Eleventy](https://www.11ty.dev/). No JavaScript,
system fonts, readable in a text browser over a thin link. The whole
toolchain runs in containers — the only things you need installed are git
and Docker.

## Quick start

```
docker compose up dev
```

Live-reloading dev server at http://localhost:8080. Everything else — the
weekly publishing flow, the guard checks, the link checker — is in
[docs/development.md](docs/development.md).

## The one rule

No container mounts anything outside this repository. The weekly
candidate list lives in `./drafts` (working material, never committed);
nothing else on the host is ever read.

## Contributing and licenses

Story suggestions and corrections are welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md). Code is MIT ([LICENSE-code](LICENSE-code));
site text and the net archive are CC BY-NC-SA 4.0
([LICENSE-content](LICENSE-content)) and built to be rehostable by
whoever runs the net after us.

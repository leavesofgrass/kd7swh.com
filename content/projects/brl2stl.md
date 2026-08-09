---
title: brl2stl
license: MIT
repo: https://github.com/leavesofgrass/brl2stl
summary: turn braille into plastic — 3D-printable models from braille or plain text
order: 4
---

**brl2stl** turns braille into plastic. Give it a braille file (BRF, the
exchange format of braille embossers) or plain text, and it produces a
3D-printable model in STL or 3MF — the formats slicers take — as signs,
labels, flashcards, book pages, even jigs for embossing paper by hand.
Type, watch the live preview, export the model, slice, print.

The defaults are the ones that matter. Text is translated to contracted
braille (Unified English Braille, Grade 2) through
[Liblouis](https://liblouis.io/) — the same open braille library that
sits on the [links shelf](/links/) — with a built-in uncontracted
fallback, and a warning, when Liblouis isn't there. Dot dimensions
default to the Americans with Disabilities Act signage standard
(section 703.3), with presets for Marburg Medium — the embosser
standard most of the world uses — and others, plus per-dimension
overrides for matching a particular embosser.

It runs however suits you: a desktop app, a command line, a web
interface, or a Docker container — cross-platform, zero required
dependencies. Releases carry standalone desktop apps that need no
Python at all, and a build script produces the same for Linux.

Python, on PyPI as `brl2stl`. Code and step-by-step documentation —
from getting started through the printing and emboss-jig guides — at
[github.com/leavesofgrass/brl2stl](https://github.com/leavesofgrass/brl2stl).

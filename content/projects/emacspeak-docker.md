---
title: emacspeak-docker
license: GPL-2.0-or-later
repo: https://github.com/leavesofgrass/emacspeak-docker
summary: Emacspeak with the classic voices — one script or one container
group: Assistive technology
order: 3
---

**emacspeak-docker** gives [Emacspeak](https://github.com/tvraman/emacspeak)
— the complete audio desktop for Emacs — a voice worth listening to: the
two classic synthesizers many blind users grew up on, instead of eSpeak.
**IBM ViaVoice / Eloquence** is licensed today through
[Voxin](https://voxin.oralux.net), about fifteen euros — bring your own
archive. **Software DECtalk** needs no license and, in the project's own
words, sounds like 1985 in the best way.

On a Debian-family system it's one script. On any other Linux, the same
script after a short package list. Anywhere else, the Docker container —
the ViaVoice engine only exists as Linux binary code, so it runs happily
inside the container and can never run bare-metal outside one. The
installer narrates each step, self-tests the speech engines before it
finishes, and fails loudly at the exact step that broke. And the
licensed Voxin archive never enters the repository or any image: ignore
patterns plus a pre-commit hook keep it out of git, and in Docker the
engine installs into a persistent volume rather than the image.

The difficulty is the point. Three eras of software have to cooperate:
Emacspeak's speech servers (1995 to present), ViaVoice's text-to-speech
engine — released for Linux only as 32-bit binaries and long since
withdrawn from distribution — and DECtalk (1984 to the 2000s), surviving
as community-preserved source in 1990s C that modern compilers dislike.

The heart of the repository is the
[guide](https://github.com/leavesofgrass/emacspeak-docker/blob/main/GUIDE.md):
every trap, every undocumented assumption, every piece of the stack from
Emacs down to the sound card, written out step by step with reasons — so
this setup never has to be reverse-engineered again.

Shell scripts and a Dockerfile, under the same license as Emacspeak
itself. Code and the complete guide at
[github.com/leavesofgrass/emacspeak-docker](https://github.com/leavesofgrass/emacspeak-docker).

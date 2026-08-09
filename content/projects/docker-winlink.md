---
title: docker-winlink
license: GPL-2.0
repo: https://github.com/leavesofgrass/docker-winlink
summary: an amateur radio desktop in a container, open in any web browser
order: 5
---

**docker-winlink** puts a complete amateur radio desktop inside a
container. One command builds a Linux desktop that opens in your web
browser with the tools already installed: **Winlink Express** — the
standard client for Winlink, the amateur radio email system — and the
**VARA** software modems for FM and high-frequency work, both
Windows-only programs set free to run under
[Wine](https://www.winehq.org/) on Linux. Alongside them: **Dire
Wolf**, the open-source software packet modem, **CHIRP** for
programming radios, and the hamlib radio-control library.

Everything you configure — callsign, Winlink account, modem settings —
persists across restarts and even rebuilds, so the one-time station
setup really is one-time. No Linux or Docker experience is expected:
with Docker installed, copy the example configuration, set two
passwords, run one command, and open the desktop at a local address in
any browser. It runs on Linux, macOS, and Windows hosts alike.

Honest notes, straight from its own documentation: the first build
takes twenty to thirty minutes (you wait once); transmitting requires
an amateur radio license — though Winlink's telnet mode sends real
Winlink email over the internet with no radio and no license, a
complete practice environment before anything ever keys a transmitter;
and VARA itself is shareware, running speed-limited until you buy a
key.

One licensing point worth being precise about: the GPL license covers
the container recipes, scripts, and documentation. Winlink Express and
VARA are not redistributed — the build downloads them from their
official sources.

Dockerfiles and scripts. Code and documentation — including the radio
hookup guide — at
[github.com/leavesofgrass/docker-winlink](https://github.com/leavesofgrass/docker-winlink).

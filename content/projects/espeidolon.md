---
title: ESPeidolon
license: MIT
repo: https://github.com/leavesofgrass/espeidolon
summary: two ESP32 boards bridging a Bluetooth radio to everything else
group: Amateur radio
order: 5
---

**ESPeidolon** is amateur radio firmware that turns two inexpensive
development boards into a bridge between a Bluetooth handheld radio — a
Kenwood TH-D74 or TH-D75, or a UV-Pro — and everything else in the
shack. One board, an ESP32 classic, speaks Bluetooth to the radio and
re-exports the packet stream so phone and tablet APRS apps can use it;
the second, an ESP32-S3, handles WiFi: a live web dashboard, a
receive-only internet gateway for the Automatic Packet Reporting System
(APRS), a network packet server, and a wired USB connection for anything
expecting a traditional terminal node controller. Three jumper wires
join the boards — the work is split in two to escape a single board's
memory limits.

Everything travels as KISS, the simple serial protocol packet radio has
used for decades, so existing apps connect without adapters or
translation layers. If you know
[bb-link](https://github.com/islandmagic/bb-link), this is the same idea
with more features and a second board. Its own documentation is candid
about the boundary: there is no modem inside — ESPeidolon is transport
plumbing, and the radio does all the radio work.

As of version 0.9.1 the feature list runs deep: smart position beaconing
with GPS, an APRS message inbox, firmware updates delivered over the air
from one board to the other, LoRa hardware variants, a mesh-network
client, a digipeater (a relay that repeats packets onward), a packet
decoder, and a serial command line for setup and diagnostics. A single
board running alone covers the Bluetooth-only case.

C++, built with [PlatformIO](https://platformio.org/). Code and
documentation:
[github.com/leavesofgrass/espeidolon](https://github.com/leavesofgrass/espeidolon).

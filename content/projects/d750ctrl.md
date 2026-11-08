---
title: d750ctrl
license: MIT
repo: https://github.com/leavesofgrass/d750ctrl
summary: keyboard control of the Kenwood TM-D750 from Linux, with VARA chat, radiograms, SSTV and RTTY one key away
group: Amateur radio
order: 11
language: Python
---

**d750ctrl** runs a Kenwood TM-D750 from the keyboard of a Linux box,
over the radio's own USB serial port. One small daemon owns the port.
Everything else talks to the daemon, so the screen, the command line
and a modem share the radio without fighting over the cable.

The command is `d750`, and its verbs are plain. `d750 status` prints
both bands, the transmit band, the TNC, squelch and power, one short
line per fact with the answer first. `d750 freq B 144.390`,
`d750 mode A nfm`, `d750 squelch B 3`, `d750 power B high`,
`d750 tnc aprs B`, `d750 mem`, `d750 clock`, and `d750 doctor` for
every check in one list, Pass or Fail per line. Add `-n` to see what
a verb would send without sending it. The exit codes say Pass, Fail
or usage, so the verbs script well.

The screen, `d750ctrl`, is for operators who want the dials: both
bands, the active one in big digits, tuning by step or by typing a
frequency, squelch, power, mode, VFO or memory, a memory browser read
from the radio, TNC, GPS output, a PTT lock, a CQ frame through the
modem, the radio clock, raw CAT, and a scrolling log of every command
and answer. It runs inside tmux on a server of its own, and the other
modes get windows: x opens [xarachat](/projects/xarachat/) for
keyboard-to-keyboard chat over VARA, r a radiogram, S the SSTV tool
and R the RTTY tool. Each keeps running while you tune. F9 brings the
rig screen back from anywhere, F12 steps through the windows, and a
chat link stays up while you check the other band.

SSTV and RTTY are built in. `d750-sstv` sends a picture or listens for
one through the radio's sound card; `d750-rtty` sends a line of text
or decodes what it hears, with a Baudot modem written for it. Both key
the radio through the daemon and pause the VARA modem meanwhile. The
daemon also speaks the rigctld protocol on a port of its own, so
[xara](https://github.com/x0rro/xara) or any hamlib-aware program keys
the radio through it. It unkeys when a client drops and after thirty
seconds regardless, and on the command port it refuses anything that
would key or reset the radio.

Kenwood does not publish the command set for this model, so a probe
asks the radio, read only, which commands it answers, and writes the
table the verbs rely on. What it learned is in the README: the TH-D74
dialect over USB, four mode codes, and the rules found the hard way,
among them that GPS sentences on the CAT port slow every command to
seconds, and that the built-in TNC will not transmit while the data
band's squelch is open.

Written for a station run by keyboard and screen reader as much as by
eye. A pretend radio on a pseudo terminal and some seventy checks mean
none of it needs a radio to be proven. Python 3 and bash, nothing else
for the core; the SSTV tool adds a small Python environment. Code and
documentation:
[github.com/leavesofgrass/d750ctrl](https://github.com/leavesofgrass/d750ctrl).

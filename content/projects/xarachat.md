---
title: xarachat
license: MIT
repo: https://github.com/leavesofgrass/xarachat
summary: keyboard-to-keyboard chat over VARA from a terminal, with a line mode for screen readers and a radiogram writer for traffic
group: Amateur radio
order: 10
language: Python
---

**xarachat** is keyboard-to-keyboard chat over VARA, from a terminal.
The modem does the radio side: sound card, PTT, bandwidth. xarachat
does the text, in one of two ways that share the same core. Run it
with no options and you get a screen: your call sign and the state of
the link along the top, the conversation in the middle with a time on
every line, and a line to type in at the bottom. F2 calls a station,
F3 listens for one, F4 hangs up, F5 opens the settings, F1 prints the
help into the conversation, and F10 quits, asking first if a link is
up. Enter sends. Slash commands do the same jobs for those who prefer
them.

Run it with `--listen` or `--call N0CALL` and you get line mode: one
event per line, no redraws, the cursor never moved, so a screen reader
or a Braille display follows it like any other terminal program.
Incoming lines read `N0CALL: text`; you type a line and press Enter.
Line mode is the accessible one, and the project's one rule for
contributors is to keep it plain.

It comes with **radiogram**, a writer for ARRL National Traffic System
radiograms. `radiogram new` asks the questions of the form one at a
time, and most are answered with Enter: your station, place and
signature come from a one-time setup, precedence and handling default
to what you used last, the time is now, the date is today, the number
counts up. An address book fills in a whole addressee from a short
name, and Tab completes the places, stations and signatures you have
used before. A period becomes X, a question mark QUERY, `ARL 46`
becomes ARL FORTY SIX with its meaning shown, and the check is counted
for you. The result is the standard transmission form, saved and
logged; `--send N0CALL` hands it to xarachat, which calls the station
and sends it, and `radiogram parse` turns a received one into a
delivery form with the ARL texts spelled out. NTS traffic is plain
text by design, so the same radiogram goes over a VARA link, into a
Winlink message or over voice.

It talks to the modem over VARA's two TCP ports, so it is written for
[xara](https://github.com/x0rro/xara), a VARA modem for Linux, macOS
and FreeBSD, and the protocol is the one VARA HF and VARA FM speak on
Windows, the same modems that
[docker-winlink](/projects/docker-winlink/) runs under Wine. One
script installs the chat alone; another builds xara as well, on Arch,
Debian, Ubuntu or Fedora; and a pretend modem in the repository lets
you try the whole thing before a radio is connected.

Python 3 and nothing else, no packages to install. Code and
documentation, from the first-run setup to the man pages:
[github.com/leavesofgrass/xarachat](https://github.com/leavesofgrass/xarachat).

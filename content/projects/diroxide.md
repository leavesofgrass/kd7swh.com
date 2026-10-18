---
title: diroxide
license: Apache-2.0 OR MIT
repo: https://github.com/leavesofgrass/diroxide
summary: a two-panel file manager in the orthodox style, written for the keyboard and the screen reader
group: Tools
order: 9
language: Rust
---

**diroxide** (Directory Oxide) is a two-panel file manager in the
orthodox style of Worker and Directory Opus, written in Rust. Its
command is `diro`. It is designed first for people who use a screen
reader or a Braille display, and for anyone who works from the keyboard:
every row says what it is in its first 40 characters — one Braille line
— status is always a word, never a color or a symbol alone, and every
delete lists what it will remove and starts on No.

Tab switches panels, the arrow keys move, Space marks a row, F5 copies
to the other panel and asks first, F2 renames, Ctrl+P opens a palette
listing every command, and Ctrl+Z undoes the last job — the same keys
on Windows, Linux, and macOS. If you would rather have Total Commander's
keys, or Midnight Commander's, or a vim-style set, a preset swaps the
whole map. Underneath, a job engine creates, verifies, and only then
destroys: a replaced file goes to the trash first, and the undo journal
is on disk before the first step, so Undo still works after a restart.

It runs in the terminal and covers local folders and archives: copy,
move, rename, trash, and undo; zip, 7z, tar, and xz archives opened like
folders; a viewer and a live quick view; split and join; links and
permissions; search with a filter language; labels, bookmarks, and file
compare; watching a folder for new arrivals; and `diro` subcommands that
print plain lines, name first.

diroxide has no voice of its own. It writes short lines that put their
meaning first and keeps the cursor on the focused row, so NVDA, JAWS,
and a 40-cell Braille display can follow along; Orca and VoiceOver are
best effort. Its accessibility rules and message style come from
[textweaver](/projects/textweaver/), and the quick view can hand a
document straight to it.

It is in alpha, and the documentation keeps a page of
[known limits](https://github.com/leavesofgrass/diroxide/blob/main/docs/known-limits.md)
that says what does not work yet.

Rust throughout, with ratatui drawing the terminal screen and no X11
code; until the downloads for each platform arrive, it builds from
source with cargo. Code and documentation, from the quick start to a
keyboard sheet for every preset:
[github.com/leavesofgrass/diroxide](https://github.com/leavesofgrass/diroxide).

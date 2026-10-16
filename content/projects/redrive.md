---
title: redrive
license: MIT
repo: https://github.com/leavesofgrass/redrive
summary: a reMarkable tablet and OneNote kept in step over the USB cable, no cloud required
group: Tools
order: 8
language: PowerShell
---

**redrive** keeps a reMarkable tablet and Microsoft OneNote in step over
the tablet's USB cable — no subscription, no cloud account. The tablet's
documents appear as a drive letter on your PC, handwriting included.
Drop a PDF or EPUB into that drive and it is on the tablet a few seconds
later. Your OneNote pages travel to the tablet during the day; what you
write on them at night is back on the same OneNote pages in the morning,
added at the bottom as pictures, with the annotated PDF attached.
Notebooks you start on the tablet itself show up in a "From reMarkable"
section of their own.

It is a set of Windows PowerShell scripts, and nothing else needs to be
installed. Setup is five minutes: unzip it anywhere, plug the tablet in
and tap it awake, double-click `Install.cmd`, and paste the tablet's
password once. From then on redrive starts with Windows and reports
through a colored dot near the clock — grey for unplugged, yellow for
asleep, blue for syncing, green for up to date, orange when something
needs attention. Right-click it for *Sync now*, the log, *Pause*, and
*Doctor*, which checks everything from the cable to OneNote, prints the
fix next to each problem, and copies a report to the clipboard for
whoever is helping you.

How it works, in one paragraph: the tablet keeps its documents as files
named by random IDs plus a small index. redrive reads that index over
SSH and rebuilds the real folder names on the PC, and asks the tablet's
own web interface for a PDF of each document — which is why the
handwriting looks exactly as it does on the tablet. Uploads go the same
way. The few things the web interface cannot do — filing into folders,
renaming, trashing — are applied in one short quiet moment per sync, in
which the tablet's app restarts: only when the tablet has been idle for
two minutes, and at most twice in ten minutes. Deleting a file from the
drive never deletes it on the tablet; the tablet is the original.

It needs a reMarkable in developer mode (Paper Pro family) or any
reMarkable 1 or 2, its USB cable, and Windows 10 or 11 with the desktop
OneNote app. A command line covers the rest — `status`, `sync`,
`doctor`, `backup`, `ssh`, `logs` — and a fake tablet in the repository
lets anyone work on it without the hardware. Not affiliated with
reMarkable AS or Microsoft.

Windows PowerShell, nothing to install beyond the scripts themselves.
Code and documentation, from the quick start to the troubleshooting
guide:
[github.com/leavesofgrass/redrive](https://github.com/leavesofgrass/redrive).

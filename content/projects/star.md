---
title: star
license: GPL-3.0-or-later
repo: https://github.com/leavesofgrass/star
summary: a document reader and writing tool that speaks, built for print disabilities
order: 1
---

**star** — the Speaking Terminal Access Reader — is a document reader and
Markdown writing tool with text-to-speech built in. It opens the formats
students actually get handed — PDF, Word, EPUB, PowerPoint, web pages,
spreadsheets — reads them aloud, and highlights each word as it is
spoken. No cloud account, no internet connection required: everything
runs on your own machine.

It is built for students with print disabilities — people who work with
dense, heavily formatted documents and need a reading tool that gets out
of the way. It comes out of years in assistive technology and research
interests in vision loss and text-to-speech systems, and it stands in a
deliberate lineage: [Emacspeak](https://emacspeak.sourceforge.net/),
Kurzweil 1000, Natural Reader, and Central Access Reader.

The graphical interface is the primary one, with a keyboard shortcut for
every command; a full keyboard-driven terminal interface stays one flag
away for text-only environments. And star is a place to *write*, not
just read — create documents, format Markdown, dictate straight into the
text.

The accessibility work goes deep rather than decorative: it works with
the screen readers people actually use (Orca, VoiceOver, NVDA, JAWS),
ships a high-contrast theme and dyslexia-friendly reading fonts, and
speaks more than English — the interface is translated, right-to-left
scripts included. What it reads it can also produce: braille files ready
for embossing, audio in common formats, chaptered audiobooks, even
subtitles.

The core runs on nothing but Python's standard library and grows on
demand: reach for optical character recognition, the offline dictionary,
translation, or dictation, and star offers to fetch that piece in the
background — working in the same session, and nothing installed without
a yes.

Python 3.11+, on PyPI as `star-reader`, with self-contained downloads on
every release for people who can't or won't install Python. Code and
documentation:
[github.com/leavesofgrass/star](https://github.com/leavesofgrass/star).

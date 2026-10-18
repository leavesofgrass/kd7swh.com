---
title: textweaver
license: GPL-3.0-or-later
repo: https://github.com/leavesofgrass/textweaver
summary: a document reader and writer that speaks, built for screen readers and Braille displays
group: Assistive technology
order: 2
language: Rust
---

**textweaver** is a document reader and writer that speaks. Open a Word
document, PDF, EPUB, Markdown file, or plain text and it reads aloud
while a highlight follows each spoken word; switch to writing and it
echoes the letters and words you type. It remembers where you were in
every file and picks up there next time.

It is designed first for people who use a screen reader or a Braille
display, and for students with print disabilities. It comes in two forms
that share documents, settings, and keys: a graphical app, and a
terminal reader, `tw`, that needs no mouse and draws no graphics — the
form many screen reader users prefer, and a dependable fallback anywhere
the app is awkward. The keys are the same on every platform: Space to
read and pause, Alt+Up and Alt+Down by sentence, H to the next heading,
F2 for a palette listing every command.

textweaver can speak with its own voice or leave the speaking to your
screen reader. On Windows it works with NVDA and JAWS, and that is the
combination tested by ear, with a 40-cell Braille display; VoiceOver on
macOS and Orca on Linux have had basic testing so far, with more
planned. The interface and the speech come in English, Spanish, German,
French, Portuguese, and Arabic — the first two reviewed by native
speakers, the others not yet, and the project says so.

It is in beta. The documentation keeps a page of
[known limits](https://github.com/leavesofgrass/textweaver/blob/main/docs/known-limits.md)
stating what does not work yet, so you can decide what to rely on before
you use it for something that matters. Settings, keys, and file formats
may still change between releases.

textweaver grew out of [star](/projects/star/), the Python reader on
this same page, and now stands on its own: a fresh codebase, built for
the same people. The two are developed side by side. Its rules for
messages and accessibility carried over into
[diroxide](/projects/diroxide/), a two-panel file manager whose quick
view can hand a document straight to textweaver.

Rust, all of it — the interface is drawn with Masonry and Vello and
speaks to assistive technology through AccessKit — with one
self-contained download per platform: Linux (x86-64 and ARM), macOS, and
Windows, each holding the app, the terminal reader, the speech helpers,
and the full documentation. Code and documentation:
[github.com/leavesofgrass/textweaver](https://github.com/leavesofgrass/textweaver).

---
layout: base.njk
title: Accessibility
permalink: /accessibility/index.html
---

# Accessibility

This site is built to be readable by everyone, on anything — a screen
reader, a ten-year-old phone, a text browser over packet radio.

What that means in practice:

- **No JavaScript.** Every page is plain HTML and CSS. Nothing requires
  scripting to read or navigate.
- **Semantic structure.** One `h1` per page, headings in order, a skip
  link to the main content as the first focusable element.
- **Contrast.** Body text meets or exceeds a 4.5:1 contrast ratio in both
  the light and dark color schemes, which follow your system preference.
- **Fonts and motion.** System fonts only — nothing downloads. There is
  almost no motion, and `prefers-reduced-motion` is respected regardless.
- **Keyboard.** Everything interactive has a visible focus indicator.
- **Plain text.** Every week of the [Linux User Net list](/lun/) is also
  published as a `.txt` file, and both the site and the net list have
  Atom feeds.
- **Print.** Pages print cleanly — net control sometimes needs the week
  on paper.

Found something that doesn't hold up? Please say so — on
[groups.io](https://groups.io/g/the-linux-user-net/topics) or via a
[GitHub issue](https://github.com/leavesofgrass/kd7swh.com/issues). It
will get fixed.

---
title: abax
license: GPL-3.0
repo: https://github.com/leavesofgrass/abax
summary: a keyboard-first statistics and data-science workstation
group: Data
order: 4
---

**abax** is a statistics and data-science workstation built on a fast,
scriptable spreadsheet. Load a dataset and explore it with 642 formula
functions — statistics and probability distributions, financial,
engineering, database, and a set built for radio work. Run the built-in
analyses: regression, t-tests, analysis of variance, correlation.
Reshape with pivot and group-by, profile columns, chart the result, hand
a selection to pandas, and script the whole thing with Python macros.

It grows out of real practice — data science in Python and R as they are
used in epidemiology, public health, and biomedical engineering
research. That kind of work outgrows a spreadsheet quickly but doesn't
want to become a notebook server; abax aims at the middle. Formulas
behave the way spreadsheet hands expect — array results spill across
cells, errors are values rather than crashes, `LET` and `LAMBDA` work —
and where behavior is ambiguous, abax follows gnumeric.

It reads and writes by extension: CSV, Excel, Parquet, SQLite, JSON,
Markdown, R, OpenDocument, and Jupyter notebooks with a lossless
round-trip — and abax itself runs as a Jupyter kernel when a notebook is
where the work lives. It runs as a desktop application, a vim-style
terminal interface friendly to an SSH session, or a headless command
line. The core is pure standard-library Python; the heavier machinery —
hypothesis tests, machine-learning models, linear algebra, Fourier
analysis, differential-equation solvers — arrives as optional pieces
with graceful fallbacks, so nothing breaks when a library is missing.

The assistive-technology background shows here too: interface elements
carry screen-reader labels, cells can be read aloud as you move through
a sheet, and a dyslexia-friendly font is one setting away.

And because of who built it: more than sixty radio-frequency functions,
link budgets, a Smith chart, and thin-wire antenna modelling live in the
same spreadsheet as the statistics.

Python — `pip install abax`, or ready-to-run downloads on every release
for machines without Python. Code at
[github.com/leavesofgrass/abax](https://github.com/leavesofgrass/abax);
full documentation at
[leavesofgrass.github.io/abax](https://leavesofgrass.github.io/abax/).

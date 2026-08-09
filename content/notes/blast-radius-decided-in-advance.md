---
title: "Blast Radius, Decided in Advance"
date: 2026-08-09
---

# Blast Radius, Decided in Advance

On August 4th, 2026, a worm started spreading through npm, the package
repository that most JavaScript projects — including the static site
generator that builds this page — pull their dependencies from.
Researchers nicknamed it "Shai-Hulud: Here We Go Again." It began with a
poisoned release of a small package called `keyv` and, within hours, had
copied itself into roughly 444 package names across a dozen organizations.

The mechanism was ugly and clever. npm packages can declare scripts that
run automatically during install, and this worm used a `preinstall`
script — `node setup.mjs` — to execute before any of a project's own code
ever ran. That script downloaded a runtime and used it to harvest
whatever was lying around: cloud credentials (AWS, Google Cloud, Azure),
GitHub and npm tokens, SSH (secure remote login) private keys, Kubernetes
tokens, database connection strings. Then it planted hooks so that simply
reopening the project later would fire the payload again — a
`.claude/settings.json` file with a SessionStart hook aimed at AI coding
agents like Claude Code, and a `.vscode/tasks.json` file with a
folderOpen task aimed at the editor. It topped this off with host
persistence via a background process and used public GitHub repos as a
dead drop for command and control. It is a genuinely well-engineered
piece of malware, in the way that's uncomfortable to admire.

I'd run `npm install` on this site's toolchain on August 8th, squarely
inside the exposure window. So I went and audited it.

What I found was nothing. My dependency tree is small: Eleventy, the
static site generator, and its RSS plugin, as the only direct
dependencies. Neither poisoned package appeared anywhere in the tree. The
only install script in the whole thing belongs to an optional macOS-only
package that never even runs on my Linux machine. Clean bill of health —
and I want to be honest about what that means. This was a fire drill, not
a fire. Docker (a tool for running software inside an isolated, disposable
container) didn't catch the worm, because the worm was never here to catch.

But the audit wasn't pointless, because of what it confirmed. My whole
toolchain lives inside Docker. There's no Node.js installed on my actual
machine at all; the container is the toolchain. And the one rule I've held
since I set this up is that the container mounts only the project
directory — nothing else on my computer is ever visible to it. My GitHub
token, meanwhile, lives in my operating system's keyring, not in the
project, so it was never inside the container even while npm was running.

Which means that in the world where I *had* picked up a poisoned
dependency, the story stays small. The payload runs inside a container
that gets thrown away and rebuilt identically next time, holding no
credentials worth stealing, unable to see the keyring where my real token
lives, with no path out to the host where Claude and my editor actually
run to plant a persistent hook. The blast radius wasn't something Docker
fought for me in the moment of infection. It was something I'd already
decided, weeks earlier, before there was any attack to have a radius at
all.

This is the part of Unix-like culture I've come to love: the long lineage
of isolation primitives, each one narrowing what a piece of untrusted
code is allowed to touch. `chroot` gave a process a fake root directory
back in the 1970s. BSD jails hardened that into a real boundary. Linux
namespaces and cgroups (control groups, which limit and account for a
process's resources) split it further. Containers packaged the whole
lineage into something a solo person can spin up before breakfast, and
rebuild identically on their desk or in continuous integration. Running an
install script you didn't write, from a registry you don't fully control,
is exactly the situation this lineage exists for.

So the thing worth celebrating isn't that I dodged something scary. I
didn't — there was nothing to dodge. It's that the boring setup work, done
once and with no worm in mind, is the reason the audit was a non-event
instead of a scramble. A solo builder doesn't get a security team. But you
can still decide, in advance, what an attacker is allowed to touch. Do
that early enough, and your best security incidents are the ones you
barely notice.

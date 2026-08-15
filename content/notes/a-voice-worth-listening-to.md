---
title: "A Voice Worth Listening To"
date: 2026-08-15
---

# A Voice Worth Listening To

Computers have been reading to me since grade school. Not with
recordings of a person — with synthesizers: DECtalk from childhood on,
Eloquence since college. People hear voices like these and reach for the
word "robotic." They're right. They just think it's a criticism.

Both are formant synthesizers. Instead of playing back stitched-together
recordings, they model the human vocal tract as mathematics and compute
speech from rules, in real time, in a few megabytes of memory. Rules
have consequences that recordings can't match. The same text always
sounds exactly the same. The voice starts speaking the instant it has
something to say. And it stays intelligible when you speed it up — not a
little faster, but several times faster than conversation.
[Research on trained blind listeners](https://www.icphs2007.de/conference/Papers/1186/1186.pdf)
has measured comprehension at up to nearly three times the rate sighted
listeners can follow, and the test material at those
speeds was formant synthesis, precisely because it stays crisp where
recorded speech smears. The phenomenon is not unique to sound: RSVP
reading — rapid serial visual presentation, words flashed one at a time
at a fixed point so the eye never has to travel — has been shown to let
some readers with vision disabilities read roughly twice as fast as a
page allows. Strip away the mechanics of presentation and trained readers
accelerate, whatever the channel. Veteran screen-reader users describe
running their speech at 800 words a minute. At those rates a voice stops being a
person you listen to and becomes an instrument you play.

Modern neural text-to-speech is astonishing, and I don't begrudge it a
thing. For an audiobook or a podcast — long-form listening, where
naturalness is the point — the new local models like
[Piper](https://github.com/OHF-Voice/piper1-gpl) are a genuine gift. But a
screen reader is a thinking tool, and there the classics still win on
the merits. When Samuel Proulx, a blind accessibility advocate,
[evaluated the newest lightweight AI voices](https://stuff.interfree.ca/2026/01/05/ai-tts-for-screenreaders.html)
for screen-reader use in January 2026, the disqualifiers were immediate:
they can't begin speaking until they've been handed a whole chunk of
text, they skip words, they misread numbers. Neural synthesis answers
the question "how human can a computer sound?" Formant synthesis answers
a different one: "how fast can you think?"

The voices themselves have histories worth knowing. DECtalk descends
from the work of Dennis Klatt at MIT, whose synthesizer —
[published openly in 1980](https://doi.org/10.1121/1.383940) — Digital
Equipment Corporation turned into a commercial product in the early
1980s. Its flagship voice, Perfect Paul, was
modeled on Klatt's own. The most famous synthetic voice of the twentieth
century, Stephen Hawking's, came from
[a sibling of the same lineage](https://computerhistory.org/blog/how-dectalk-gave-voice-to-a-genius-engineering-stephen-hawkings-wheelchair/)
— a Speech Plus CallText 5010, not DECtalk itself, whatever the family
resemblance suggests. He kept it for thirty years — "I have not heard
a voice I like better," he said in 2006. Klatt himself lost his voice to thyroid
cancer in the last years of his life, while the voice he had modeled on
it went on speaking for thousands of us. Every DECtalk phrase still
carries him.

Eloquence, the engine IBM shipped as ViaVoice text-to-speech, is the
other voice of my life. It is the default voice of JAWS (Job Access With
Speech, the screen reader that has dominated blind employment for
decades) and of the Kurzweil 1000 reading software, and these days
Apple offers it under license across its products. The voice I hear today is,
to my ear, the voice I heard in college — and that constancy is not
stagnation. It's a feature. At 500 words a minute, you want a voice that
never surprises you.

Which brings me to the software this note is really about. T.V. Raman
came to it through mathematics. His Cornell dissertation system,
[AsTeR](https://www.cs.cornell.edu/info/people/raman/aster/abstract.html)
— the Audio System For Technical Readings — turned documents written in
TeX, the typesetting language of mathematics, into structured audio. It
didn't read lines off a page; it parsed the document's logic and voiced
it, rendering nested equations with pitch and pausing, so that a blind
scholar could work through the technical literature independently. The dissertation won the
[ACM Doctoral Dissertation Award](https://awards.acm.org/award_winners/raman_4110221.cfm)
in 1994; its
interface lived inside Emacs even then, and its Common Lisp source is
[public today](https://github.com/tvraman/aster-math). That same year,
at Digital Equipment Corporation's research lab, Raman started
[Emacspeak](https://tvraman.github.io/emacspeak/), releasing it as open
source in April 1995 — the dissertation's insight carried from
documents to the whole of computing. He has always insisted it is not a
screen reader, and the distinction is the whole idea. A screen reader speaks the
screen: point one at a calendar and it reads a grid of numbers, because
a grid of numbers is what's displayed. Emacspeak lives inside the
application — it is built on Emacs, an editor with fifty years of
lineage that is really a programmable environment in the Lisp
programming language — so it speaks the information instead: the date. Code comments arrive in a different voice than the
code around them: audio formatting, Raman named it — syntax
highlighting for the ear.

Raman made that argument at book length in
*[Auditory User Interfaces: Toward the Speaking Computer](https://emacspeak.sourceforge.net/raman/aui/aui.html)*
(1997): an auditory interface, in his words, works "directly with the
computational core of the application" — a peer of the interface built
for the eye, not a translation of it. I bought the hardcover as a young
student and found it intriguing; it is a rare volume now, and it still
sits on my bookshelf, a reminder of how long this effort has been
running and of the community that still gathers around it. The idea
carried far beyond one program: at Google, Raman went on to
[lead Android accessibility from its inception](https://tvraman.github.io/vita/resume.html).
But Emacspeak is the argument running on your machine. The project's
[own catalog](https://tvraman.github.io/emacspeak/applications.html)
counts 210 speech-enabled applications, from mail and web and shells to
EPUB and DAISY talking books. In 1999 it entered the
[Smithsonian's permanent research collection](https://web.archive.org/web/20151208204541/http://www.cs.vassar.edu/~priestdo/emacspeak/list.archive.1999/msg00247.html).
It is my primary speech tool at home. I write software with it, and I read with it.

And I listen to radio with it. Emacspeak's media layer will play any
stream you point it at, so a software-defined radio receiver elsewhere
on my network arrives in the same audio desktop as my code and my mail.
I use it for the BBC too — broadcasts that were on shortwave when I was
a kid now arrive over the network. Fitting, then, that one of Raman's
last commits to the project trimmed its BBC radio playlists.

About those commits. For thirty years Emacspeak shipped like a metronome
— a release every May and November, each one named after a dog. Release
60.0, "DreamDog," landed in May 2024. That July, Raman published a
thirty-year retrospective,
["Emacspeak — A Speech Odyssey"](https://emacspeak.blogspot.com/2024/07/emacspeak-speech-odyssey.html),
dedicated to his guide dogs Aster, Hubbell, and Tilden. The dedication
was a bookend: *Auditory User Interfaces*, twenty-seven years earlier,
is inscribed "To My Guiding Eyes, Aster." His last commit is dated
August 26, 2024. The clock has been quiet since. That is the
whole public record, and all I will repeat here — except one line from
the retrospective that reads like a thesis for everything above: "Open
Source is essential for discovering new interaction paradigms."

Here is what happened next, and it is the part that proves him right:
nothing collapsed. The [mailing list](https://mail.emacspeak.net/) is
active this summer — users adapting Emacspeak to new macOS releases, to
Windows Subsystem for Linux, to Telegram, to AI language tools — and
its archives run back more than a quarter of a century. Greg
Priest-Dorman keeps the mail server running; Debian's accessibility
team [keeps the package alive](https://tracker.debian.org/pkg/emacspeak). A [speech server for the
Mac](https://github.com/intelligrit/swiftmac), written in Swift (Apple's
programming language), is maintained by a community member outside the
main repository. It plugs into the same
speech-server protocol Raman designed in 1995 — a protocol now old
enough to be driving neural voices that did not exist when it was
written. Open-source software doesn't need its author's permission to
stay alive. Neither do its users.

The catch — there is always a catch — is that the classic voices make
you work for them. Every Linux system can already talk:
[eSpeak NG](https://github.com/espeak-ng/espeak-ng), the free formant
voice, is everywhere, small, and reliable. But it is the voice that is
*there*, not the voice you would *choose* — and choosing means asking a
modern system to host engines it has forgotten. DECtalk's source
survives in [community hands](https://github.com/dectalk/dectalk),
never formally open-sourced, written in a dialect of 1990s C that
today's compilers greet with suspicion. On Linux, Eloquence has only
ever been 32-bit binary code, and the licensed route to it today is
[Voxin](https://voxin.oralux.net/). That is what my
[emacspeak-docker](https://github.com/leavesofgrass/emacspeak-docker)
project is for — and despite the name, it is two doors, not one. On
Debian-, Arch-, or Fedora-family systems, a single script sets up
Emacspeak and its speech servers natively, handling each distribution's
own package manager and 32-bit plumbing as it goes. Everywhere else,
the container. Either way, the installer narrates its own progress and
fails loudly at the exact step that broke — an installer you can debug
by ear — and every trap along the way is written down in
[the guide](https://github.com/leavesofgrass/emacspeak-docker/blob/main/GUIDE.md),
whose stated goal is that this setup "never has to be reverse-engineered
again." When the smoke
test passes, ViaVoice announces it in its own voice: "Outloud is alive.
Eloquence speaks again."

There are no perfect accessibility tools. Not on any platform, not at
any price — anyone who depends on this stuff learns that early. And
price is its own gatekeeper: commercial assistive technology routinely
runs to thousands of dollars, which keeps it, for some of the people
who need it most, entirely out of reach. Open tools are there for
everyone, ready to be shaped to the person using them. What they offer
is not perfection; it is standing. DEC is gone. IBM
withdrew its engine from sale a generation ago. The author of my audio
desktop has gone quiet. And none of it can take the voices away,
because the source is in the hands of the people who need it. A blind user on a proprietary platform is a customer, and
customers get what ships. A blind user on an open one is a participant —
able to keep a forty-year-old voice speaking on this year's kernel, to
tune it, to fix it, and to hand it to the next person. That is what I
grew up listening to, and it read this sentence back to me just now. A
synthesizer from the 1980s on a 2026 Linux box is still, by every
measure that matters to the person listening, a voice worth listening
to.

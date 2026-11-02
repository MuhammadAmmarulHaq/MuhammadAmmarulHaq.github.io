---
layout: page
title: about
permalink: /about/
---
<p class="cmd"><span class="ps1"><span class="u">{{ site.prompt.user }}</span><span class="punct">@</span><span class="h">{{ site.prompt.host }}</span><span class="path">:~$</span></span> cat aboutme</p>

{{ site.author_bio }}

## focus

| area | detail |
|---|---|
| primary | binary exploitation (pwn) |
| also | web exploitation, penetration testing, offensive security |
| playing | competitive CTF, multiple victories, blackhat '26 finalist |
| researching | vulnerability research and custom challenge authoring |
| recognition | NASA Vulnerability Disclosure Program hall of fame |

<p class="cmd"><span class="ps1"><span class="u">{{ site.prompt.user }}</span><span class="punct">@</span><span class="h">{{ site.prompt.host }}</span><span class="path">:~$</span></span> cat what-i-write.txt</p>

Most of what lands here:

- CTF writeups, heavily pwn, plus web, rev and forensics
- machine walkthroughs from hack the box and tryhackme
- notes on tooling: pwntools, gdb with pwndbg, ghidra, nmap, burp
- things i got wrong the first time, and the fix

<p class="cmd"><span class="ps1"><span class="u">{{ site.prompt.user }}</span><span class="punct">@</span><span class="h">{{ site.prompt.host }}</span><span class="path">:~$</span></span> ls ~/links</p>

- GitHub: [github.com/{{ site.github_username }}](https://github.com/{{ site.github_username }})
- Hack The Box: [add your profile url](https://app.hackthebox.com/)
- TryHackMe: [add your profile url](https://tryhackme.com/)
- Email: [add your address](mailto:you@example.com)

<p class="cmd"><span class="ps1"><span class="u">{{ site.prompt.user }}</span><span class="punct">@</span><span class="h">{{ site.prompt.host }}</span><span class="path">:~$</span></span> cat ./rules</p>

{{ site.content_rules }}

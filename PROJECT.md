# PROJECT: sec blog

Handoff document. Everything needed to continue this project with any model or tool.
Last updated: 2026-10-30.

---

## 1. what this is

A cybersecurity writeup and notes blog with a terminal (CLI) interface. Personal site of
Muhammad Ammarul Haq. Static site, built by GitHub Pages, no server, no database.

**Live site:** https://muhammadammarulhaq.github.io
**Repo:** https://github.com/MuhammadAmmarulHaq/MuhammadAmmarulHaq.github.io
**Local folder:** `C:\Users\ammar\blog`

### design rules (do not break these)

The owner asked for these explicitly.

1. CLI / terminal aesthetic. Monospace everywhere, `ls` style post listings, shell prompts.
2. The home page must be **typable**. It is a working shell, not a picture of one.
3. **No animations. No blinking cursor. No animated loading dots.** Static cursor block only.
4. **No em dashes or en dashes** in content or UI text. Use plain hyphens.
5. Keep it simple. No React, no Next.js, no build tooling. Content is markdown files.

---

## 2. stack

| piece | choice | why |
|---|---|---|
| generator | Jekyll | GitHub Pages builds it natively, nothing to install locally |
| hosting | GitHub Pages | free, custom domain capable, HTTPS included |
| theme | custom CSS, ~10KB, one file | no dependency, full control of the CLI look |
| terminal | vanilla JS, ~14KB | DOM and keyboard logic, a framework adds nothing here |
| repo name | `<username>.github.io` | required for a user site at the root URL |
| markdown | kramdown + rouge | default on GitHub Pages, syntax highlighting built in |

Dependency count is effectively zero. `Gemfile` exists only for optional local preview.

---

## 3. current state (as of 2026-10-30)

| thing | status |
|---|---|
| repo created | yes, public |
| initial commit | `b324d15` "initial commit: cli style blog for cybersecurity writeups" |
| branch | `main` |
| files tracked | 24 |
| Pages source | `main`, `/` (root) |
| Pages status | `built` |
| live check | `/`, `/posts/`, `/writeups/`, `/about/`, `style.css`, `terminal.js`, `feed.xml`, `sitemap.xml` all return 200 |
| posts | 3 (1 hello world, 1 writeup template, 1 toolbox) |
| custom domain | none yet |

### things that are still placeholder text

- `about.md`: Hack The Box / TryHackMe profile links point to the platform home pages,
  and the email is `you@example.com`. Replace both.
- `_posts/2026-10-18-writeup-template.md` is a sample. Delete it when a real writeup exists.
- `assets/img/` does not exist yet. Create it when the first screenshot is uploaded.

---

## 4. file map

```
C:\Users\ammar\blog\
  _config.yml                    site settings, permalinks, plugins, prompt strings
  Gemfile                        optional local preview only, GitHub ignores it
  .gitignore                     ignores _site/, .ghconfig/, vendor/
  deploy.ps1                     one command publish script
  README.md                      setup and usage guide
  PROJECT.md                     this file
  index.md                       HOME PAGE, the interactive terminal
  posts.md                       /posts/   all posts
  writeups.md                    /writeups/ category filter, category "writeups"
  about.md                       /about/   bio and links
  404.html                       /404.html not found page

  _posts/
    2026-10-29-hello-world.md            categories: blog
    2026-10-18-writeup-template.md       categories: writeups (sample, delete later)
    2026-10-11-toolbox.md                categories: blog

  _layouts/
    default.html                 html shell, includes head, header, footer
    page.html                    used by about.md, posts.md, writeups.md
    post.html                    used by _posts/*, has prev/next nav

  _includes/
    head.html                    meta, seo, og tags, css link, favicon
    header.html                  prompt line + nav
    footer.html                  small footer, loads copy.js
    post-list.html               renders an `ls` style list, takes posts + limit
    post-index.json              ALL posts as JSON, powers terminal search/ls

  assets/
    css/style.css                the entire theme
    js/terminal.js               the interactive shell on the home page
    js/copy.js                   copy button injected into every code block
```

---

## 5. how the site works

### build

GitHub Pages runs Jekyll on push to `main`. Liquid runs, markdown converts, `_site/` is
published. No CI workflow file needed. Build takes 1 to 3 minutes.

Plugins active: `jekyll-feed` (makes `/feed.xml`) and `jekyll-sitemap` (makes `/sitemap.xml`).

### the terminal

`index.md` renders the first screen **server side** using `_includes/post-list.html`, so the
newest posts are visible before any JavaScript runs. That matters: no JS still means a
readable site.

Then `_includes/post-index.json` dumps every post into a `<script type="application/json">`
block as an array: title, slug, url, date, category, tags, description, plain-text body.

`assets/js/terminal.js` reads that, adds a hidden `<input>` over the prompt line, and runs
commands. Both the server-rendered list and the JS list are newest-first.

Terminal features:

- commands: see the table in section 7
- history with arrow up / arrow down
- tab completion for command names and post slugs
- Ctrl+L clears, Ctrl+C prints `^C` and aborts the line
- real error output, for example `bash: nmap: command not found. type help`
- flags are tolerated: `ls -la` and `ls -la --all` both work
- clicking anywhere in the terminal focuses the input
- cursor is a static block, colored brighter when focused. Nothing blinks.

### how dates are compared

The JSON uses `YYYY-MM-DD` strings, which sort correctly lexicographically. The JS sorts
descending on that string. `fmtDate()` converts to `Oct 29 2026` so JS-rendered and
Jekyll-rendered lines look identical.

---

## 6. how to publish

### from the local folder

```powershell
cd C:\Users\ammar\blog
.\deploy.ps1 "new writeup: htb example box"
```

`deploy.ps1` reads your identity from the GitHub API, sets git user name and email to your
ID-based noreply address, creates the repo if missing, commits, pushes, and enables Pages.
If git says `dubious ownership`, run:

```powershell
git config --global --add safe.directory C:/Users/ammar/blog
```

### by hand, via the GitHub web UI

Upload the changed files at the repo, commit to `main`, wait for the build. Works from a
phone. Good for fixing a typo.

### environment note for automated tools

`git` and `gh` are installed but **not on PATH by default in a non-login shell**. Prepend:

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
```

The GitHub CLI auth lives in a custom config dir, not the default one:

```powershell
$env:GH_CONFIG_DIR = 'C:\Users\ammar\blog\.ghconfig'
```

That folder is gitignored. It contains a plain-text token at
`C:\Users\ammar\blog\.ghconfig\hosts.yml`. To remove it: `gh auth logout`.

---

## 7. terminal command reference

| command | behavior |
|---|---|
| `help` | print the command list |
| `man <cmd>` | one line about a command |
| `ls` | all posts, newest first |
| `ls writeups` | only category `writeups` |
| `ls blog` | everything that is not a writeup |
| `ls tags` | tag list with counts, sorted by count |
| `latest [n]` | newest n posts, default 5, max 50 |
| `cat <slug>` | title, date, category, tags, description, link |
| `open <slug>` | navigate to that post |
| `search <words>` | substring search over title, description, tags and body text |
| `cd posts` `cd writeups` `cd about` `cd ~` | navigate |
| `whoami` | the one-line bio |
| `about` | bio plus the about page link |
| `contact` | GitHub link, about link, content policy line |
| `neofetch` | post count, writeup count, latest date, stack |
| `date` `pwd` `uptime` | the usual |
| `history` | commands typed this session |
| `clear` | wipe the screen |
| `sudo` | joke, prints the not-in-sudoers line |
| `exit` | joke, prints "there is no exit. only more boxes." |

Slug matching in `cat` and `open` is: exact slug, then slug prefix, then title substring.

### adding a command

1. Open `assets/js/terminal.js`.
2. Add a function to the `commands` object. It receives `args` (array of strings).
   Use `print(text, cls)` for a line, `printPre(text)` for a block, `printList(posts)` for
   an `ls` style list, `printLink(prefix, href, label)` for a line with a link.
   Classes available: `dim`, `err`, `strong`.
3. Add a row to the `HELP` array at the top so `help` and `man` pick it up.
4. Commit and push.

---

## 8. how to write a post

Create `_posts/YYYY-MM-DD-slug.md`. The date in the filename is the publish date, the
slug becomes the URL: `/posts/slug/`.

```yaml
---
title: "htb: example box"
date: 2026-11-02 14:00:00 +0000
categories: writeups
tags: [htb, linux, privesc]
description: "One sentence for search results and the rss feed."
---

Body in markdown.
```

- `categories: writeups` puts it in `/writeups/` and `/posts/`. Anything else shows in
  `/posts/` only.
- Images: put the file in `assets/img/`, reference as `![alt](/assets/img/file.png)`.
- Code fences get a `copy` button automatically via `assets/js/copy.js`.
- Supported markdown: headings, lists, tables, blockquotes, bold, links, inline code,
  fenced code with a language name, images, horizontal rules.

### recommended writeup structure

The site ships a template with this shape, and it is worth keeping:

1. box info table: name, platform, os, difficulty, ip
2. recon: nmap output, then full port scan
3. enumeration: what the service exposes, including dead ends
4. foothold: the command that got the first shell
5. privilege escalation: the enumeration that found it, then the escalation
6. lessons: what was obvious in hindsight, what to check first next time

---

## 9. customization points

| want to change | edit |
|---|---|
| site title, tagline, author | `_config.yml` |
| the prompt shown in the header and terminal | `_config.yml` -> `prompt.user`, `prompt.host` |
| colors | `assets/css/style.css` -> the `:root` block |
| fonts | `--mono` in `:root` |
| nav links | `_includes/header.html` |
| footer text | `_includes/footer.html` |
| what the home page prints on load | `index.md` |
| terminal commands | `assets/js/terminal.js` |

Colors currently in use:

| variable | value | used for |
|---|---|---|
| `--bg` | `#0a0c10` | page background |
| `--panel` | `#11151c` | code blocks |
| `--line` | `#1e242e` | borders |
| `--fg` | `#c9d4e0` | body text |
| `--fg-strong` | `#e8eef6` | headings, typed text |
| `--dim` | `#6c7787` | secondary text |
| `--accent` | `#3ddc84` | prompt, links, cursor |
| `--amber` | `#e3b341` | category tags, inline code |
| `--red` | `#f85149` | errors |
| `--blue` | `#58a6ff` | focus rings, paths |

---

## 10. optional local preview (not required)

Only if you want to see changes before pushing. Needs Ruby.

```bash
gem install bundler
bundle install
bundle exec jekyll serve
```

Then http://localhost:4000.

A useful trick when Ruby is not available: copy the CSS and markup into a standalone
`preview.html` and open it in a browser. That is how the theme was designed and verified.

---

## 11. ideas not yet built

- press `/` anywhere to open a command palette version of the terminal
- tag pages at `/tags/<tag>/`, terminal `tags` already lists them
- a `/now` page and a reading list page
- light theme toggle with a `theme` command (keep it non-animated)
- reading progress as a plain percentage in the post meta
- a `random` terminal command that jumps to a random writeup
- Open Graph image per post
- moving to Astro or Next.js if app-like features are ever needed (comments, live
  scoreboard, auth). Not needed for 3 posts. Would require installing Node.

---

## 12. rules for content

Everything published must come from legal labs: Hack The Box, TryHackMe, CTFs, and
personal VMs. No live third-party targets, no client data, no weaponized exploits against
systems not owned by the author. This is also stated on the about page, and it protects
the GitHub Pages hosting from abuse takedowns.

---

## 13. gotchas hit so far, so they are not hit again

1. **Repo name must match the username exactly**, `<username>.github.io`, or the site does
   not serve at the root URL. Here: `MuhammadAmmarulHaq.github.io`.
2. **The Pages site must be Public** on a free plan.
3. **Jekyll needs a `.md` or `.yaml` front matter block** or it copies the file verbatim.
4. **Binary files break kramdown's utf-8 encoding pass** and fail the build. Keep all
   published files text. Do not commit images into `_posts/`.
5. **`gh` writes its token into a config dir.** If that dir sits inside the repo it will be
   committed, which happened once. It was removed from history and gitignored. Never commit
   `.ghconfig/`.
6. **In PowerShell 5.1, `??` is not valid.** Use `if ($x) {...} else {...}`.
7. **Native command stderr in PowerShell renders as an error record.** A git or gh command
   printing to stderr and "exiting with code 1" is often still a success. Check the actual
   output, not `$LASTEXITCODE` alone.
8. **`tools.browser` here has no timer APIs.** Use the shell for waits, not `setTimeout`
   inside `browser.evaluate`.
9. **Screenshot needs a focused, visible tab.** Call focus first.
10. **Do not use em dashes.** The owner does not want them. Verified with a repo-wide grep.

---

## 14. quick task recipes

**publish a new post**

```
write _posts/2026-11-02-name.md
cd C:\Users\ammar\blog
.\deploy.ps1 "post: name"
tehn wait 2 minutes, check https://muhammadammarulhaq.github.io
```

**check the live site from the shell**

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
(Invoke-WebRequest -Uri "https://muhammadammarulhaq.github.io" -UseBasicParsing).StatusCode
```

**check the build status**

```powershell
$env:GH_CONFIG_DIR = 'C:\Users\ammar\blog\.ghconfig'
gh api repos/MuhammadAmmarulHaq/MuhammadAmmarulHaq.github.io/pages --jq '.status'
```

**add a custom domain later**

1. Buy or claim the domain.
2. Add a file named `CNAME` at the repo root containing just the bare domain, no protocol.
3. At the DNS provider, point the apex or subdomain to the GitHub Pages IPs or CNAME.
4. Update `url` in `_config.yml`, then commit and push. Pages reissues HTTPS automatically.

---

## 15. glossary for a fresh session

- **Pages**: GitHub's static hosting. Builds Jekyll from `main`, serves `_site/`.
- **Liquid**: Jekyll's template language. `{% ... %}` for tags, `{{ ... }}` for output.
- **front matter**: the `---` block of YAML at the top of a post or page.
- **collection `posts`**: files in `_posts/`, the only built-in collection in use.
- **slug**: the URL-safe version of the filename or title.
- **`post-index.json`**: the bridge between Jekyll content and the terminal JS.
- **`deploy.ps1`**: the publish script. One command, does everything.

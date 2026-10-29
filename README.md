# sec blog

A terminal-look blog for cybersecurity writeups, built with Jekyll and hosted free on
GitHub Pages at **https://muhammadammarulhaq.github.io**.

Nothing needs to be installed on your machine. GitHub builds the site for you.

---

## 1. publish it (about 5 minutes, all in the browser)

1. Go to https://github.com/new
2. Repository name: **`MuhammadAmmarulHaq.github.io`** (must match your username exactly)
3. Visibility: **Public** (Pages on private repos needs a paid plan)
4. Do not add a README, then click **Create repository**
5. On the empty repo page click **uploading an existing file**
6. Drag in everything from this folder: `_config.yml`, `_posts`, `_layouts`, `_includes`,
   `assets`, `index.md`, `posts.md`, `writeups.md`, `about.md`, `404.html`
   (skip `Gemfile`, `.gitignore`, `README.md`, they are optional)
7. Click **Commit changes**
8. Go to **Settings > Pages**
9. Under *Build and deployment*, set **Source: Deploy from a branch**,
   **Branch: main**, **Folder: / (root)**, then **Save**
10. Wait 1 to 3 minutes, then open https://muhammadammarulhaq.github.io

If the site does not appear, check **Settings > Pages** for a build error message.

---

## 2. write a post

Add a file to `_posts/` named `YYYY-MM-DD-some-title.md`. The date in the filename is
the publish date, the rest becomes the url.

```yaml
---
title: "htb: example box"
date: 2026-11-02 14:00:00 +0000
categories: writeups
tags: [htb, linux, privesc]
description: "One sentence that shows up in search results and the rss feed."
---

Your markdown here.
```

`categories` decides where it appears:

| category | shows in |
|---|---|
| `writeups` | ~/writeups and ~/posts |
| `blog` | ~/posts |

Markdown you can use: headings, lists, tables, `**bold**`, `[links](https://example.com)`,
images `![alt](/assets/img/shot.png)`, and fenced code blocks with a language name:

````markdown
```bash
$ nmap -sC -sV 10.10.10.10
```
````

Code blocks get a `copy` button automatically.

To upload a screenshot, put the file in `assets/img/` and reference it as
`/assets/img/your-file.png`.

---

## 3. change your details

Everything personal lives in `_config.yml`:

- `title`, `tagline`, `description`
- `author`
- `github_username` and `url` (already set to your account)
- `prompt.user` and `prompt.host`, the shell prompt in the header

The about page text is in `about.md`.

---

## 4. the terminal

The home page is a working shell, not a picture of one. Click it and type.

| command | does |
|---|---|
| `ls` | all posts, newest first |
| `ls writeups` / `ls blog` / `ls tags` | filter |
| `latest 3` | newest n posts |
| `cat <slug>` | summary of one post, with a link |
| `open <slug>` | jump to that post |
| `search nmap` | search titles, tags and body text |
| `cd posts` / `cd writeups` / `cd about` / `cd ~` | navigate |
| `whoami`, `about`, `contact` | about you |
| `neofetch`, `date`, `pwd`, `history` | the usual |
| `clear` | wipe the screen |

Arrow up and down walk the command history. Tab completes command names and post slugs.
Ctrl+L clears. The cursor is a static block on purpose, nothing blinks.

The post list on the home page is also rendered by Jekyll, so it is there before any
script runs, and search works from the same `_includes/post-index.json` data.

To add a command, open `assets/js/terminal.js` and add a function to the `commands`
object, then add a line to the `HELP` array at the top so it shows in `help`.

---

## 5. preview locally (optional, needs Ruby)

Only if you want to see changes before pushing.

```bash
gem install bundler
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.

---

## files

```
_config.yml            site settings
_posts/                one markdown file per post
_layouts/              page templates (default, page, post)
_includes/             header, footer, head, post list, post index json
assets/css/style.css   the entire theme
assets/js/terminal.js  the interactive shell on the home page
assets/js/copy.js      copy button for code blocks
index.md               home page (the terminal)
posts.md               all posts
writeups.md            writeups only
about.md               about page
404.html               not found page
```

## rules i hold myself to

Lab content only. No live targets, no client data, no weaponised exploits against
systems i do not own.

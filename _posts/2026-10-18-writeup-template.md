---
title: "writeup template: machine walkthroughs"
date: 2026-10-18 09:30:00 +0000
categories: writeups
tags: [template, htb, methodology]
description: "The structure i use for every machine writeup. Copy this file when starting a new box. All content below is placeholder."
---

> Template post. The hostname, ip addresses and output below are fake. Copy this file,
> rename it, and replace the content. Delete this quote block when you publish.

## box info

| field | value |
|---|---|
| name | ExampleBox |
| platform | Hack The Box |
| os | Linux |
| difficulty | Medium |
| ip | 10.10.10.10 |

## recon

Start with a full tcp scan. The fast scan first, then the full port range while you work
through the first results.

```bash
$ nmap -sC -sV -oA nmap/initial 10.10.10.10
Starting Nmap 7.94
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu
80/tcp open  http    nginx 1.18.0
```

Full range, in the background:

```bash
$ nmap -p- --min-rate 5000 -oA nmap/allports 10.10.10.10
```

## enumeration

What the service actually exposes, and what i tried. Note the dead ends, they save time later.

```bash
$ gobuster dir -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/common.txt
/uploads              (Status: 301)
/login                (Status: 200)
```

## foothold

How i got the first shell, with the command that did it and why it worked.

```bash
$ nc -lvnp 4444
listening on [any] 4444 ...
```

## privilege escalation

The enumeration that found it, then the escalation itself.

```bash
$ sudo -l
User www-data may run the following commands:
    (root) NOPASSWD: /usr/bin/backup.sh
```

## lessons

- the thing that was obvious in hindsight
- the tool or flag i should have tried first
- what i would check immediately on the next box

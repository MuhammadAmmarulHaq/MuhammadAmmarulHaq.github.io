---
layout: page
title: writeups
permalink: /writeups/
---
<p class="cmd"><span class="ps1">{{ site.prompt.user }}@{{ site.prompt.host }}:~/posts$</span> ls -la writeups/</p>

{% assign entries = site.categories.writeups %}
{% if entries.size > 0 %}
{% include post-list.html posts=entries limit=200 %}
<p class="res dim">total {{ entries.size }} entries</p>
{% else %}
<p class="res dim">nothing here yet. add <code>categories: writeups</code> to a post and it lands in this folder.</p>
{% endif %}

<p class="cmd"><span class="ps1">{{ site.prompt.user }}@{{ site.prompt.host }}:~/posts$</span> cat ../howto</p>
<p class="res">
  writeups are machine walkthroughs: recon, enumeration, foothold, privesc, lessons.
  blog posts are notes, tooling and ctf writeups.
</p>

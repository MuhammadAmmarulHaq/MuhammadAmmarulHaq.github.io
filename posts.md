---
layout: page
title: posts
permalink: /posts/
---
<p class="cmd"><span class="ps1">{{ site.prompt.user }}@{{ site.prompt.host }}:~/posts$</span> ls -la --all</p>

{% if site.posts.size > 0 %}
{% include post-list.html posts=site.posts limit=200 %}
<p class="res dim">total {{ site.posts.size }} entries</p>
{% else %}
<p class="res dim">empty. add a file to <code>_posts/</code> and it shows up here.</p>
{% endif %}

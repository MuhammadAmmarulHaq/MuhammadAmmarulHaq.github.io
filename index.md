---
layout: default
title: home
---
<section class="term" id="terminal"
         data-prompt="{{ site.prompt.user }}@{{ site.prompt.host }}"
         data-tagline="{{ site.tagline }}"
         data-blog="{{ site.title }}"
         data-posts-url="{{ '/posts/' | relative_url }}"
         data-writeups-url="{{ '/writeups/' | relative_url }}"
         data-about-url="{{ '/about/' | relative_url }}"
         data-tags-url="{{ '/tags/' | relative_url }}"
         data-github-url="https://github.com/{{ site.github_username }}">

  <div class="term-boot" id="term-boot">
    <pre class="boot-pre" id="boot-pre"></pre>
  </div>

  <div class="term-body" id="term-body">
    <div class="term-output" id="term-output" role="log" aria-live="polite">
      <p class="cmd"><span class="ps1"><span class="u">{{ site.prompt.user }}</span><span class="punct">@</span><span class="h">{{ site.prompt.host }}</span><span class="path">:~$</span></span> whoami</p>
      <p class="res">{{ site.tagline }}</p>

      <p class="cmd"><span class="ps1"><span class="u">{{ site.prompt.user }}</span><span class="punct">@</span><span class="h">{{ site.prompt.host }}</span><span class="path">:~$</span></span> latest</p>
      {% include post-list.html posts=site.posts limit=5 %}
    </div>

    <form class="term-line" id="term-form" autocomplete="off">
      <span class="ps1"><span class="u">{{ site.prompt.user }}</span><span class="punct">@</span><span class="h">{{ site.prompt.host }}</span><span class="path">:~$</span></span>
      <span class="typed" id="term-typed"></span><span class="caret" aria-hidden="true"></span>
      <input id="term-input" type="text" name="cmd" aria-label="terminal command"
             autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
      <button class="sr-only" type="submit">run</button>
    </form>
  </div>
</section>

<script type="application/json" id="term-data">
{% include post-index.json %}
</script>
<script type="application/json" id="term-fs">
{% include term-fs.json %}
</script>
<script src="{{ '/assets/js/terminal.js' | relative_url }}" defer></script>

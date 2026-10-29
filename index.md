---
layout: default
title: home
---
<section class="term" id="terminal"
         data-prompt="{{ site.prompt.user }}@{{ site.prompt.host }}:~$"
         data-whoami="security researcher. ctfer. i break lab machines and write down what i learn."
         data-posts-url="{{ '/posts/' | relative_url }}"
         data-writeups-url="{{ '/writeups/' | relative_url }}"
         data-about-url="{{ '/about/' | relative_url }}"
         data-github-url="https://github.com/{{ site.github_username }}">

  <div class="term-output" id="term-output" role="log" aria-live="polite">
    <p class="cmd"><span class="ps1">{{ site.prompt.user }}@{{ site.prompt.host }}:~$</span> whoami</p>
    <p class="res">security researcher. ctfer. i break lab machines and write down what i learn.</p>

    <p class="cmd"><span class="ps1">{{ site.prompt.user }}@{{ site.prompt.host }}:~$</span> latest</p>
    {% include post-list.html posts=site.posts limit=5 %}

    <p class="res dim">type <code>help</code> for the command list. try <code>ls</code>, <code>latest</code>, <code>cat &lt;slug&gt;</code>, <code>search &lt;word&gt;</code>.</p>
  </div>

  <form class="term-line" id="term-form" autocomplete="off">
    <span class="ps1">{{ site.prompt.user }}@{{ site.prompt.host }}:~$</span>
    <span class="typed" id="term-typed"></span><span class="caret" aria-hidden="true"></span>
    <input id="term-input" type="text" name="cmd" aria-label="terminal command"
           autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
    <button class="sr-only" type="submit">run</button>
  </form>
</section>

<script type="application/json" id="term-data">
{% include post-index.json %}
</script>
<script src="{{ '/assets/js/terminal.js' | relative_url }}" defer></script>

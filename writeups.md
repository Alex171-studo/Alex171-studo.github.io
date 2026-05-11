---
layout: page
title: "Machine Writeups"
---

<p class="text-secondary" style="margin-bottom: 3rem; font-size: 1.1rem;">
  Explore my detailed walkthroughs for HackTheBox and TryHackMe machines. 
  Each writeup covers enumeration, exploitation, and privilege escalation steps.
</p>

<div style="margin-bottom: 3rem;">
  <input type="text" id="search-writeups" placeholder="Search machines, tags, or platforms..." 
         style="width: 100%; padding: 1rem; background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius); font-family: var(--font-mono); outline: none;">
</div>

<div class="writeup-grid">
  {% for post in site.posts %}
    {% include card-writeup.html %}
  {% endfor %}
</div>

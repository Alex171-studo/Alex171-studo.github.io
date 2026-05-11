---
layout: page
title: "Machine Writeups"
---

<p class="text-secondary" style="margin-bottom: 3rem; font-size: 1.1rem;">
  Explore my detailed walkthroughs for HackTheBox and TryHackMe machines. 
  Each writeup covers enumeration, exploitation, and privilege escalation steps.
</p>

<div class="writeup-grid">
  {% for post in site.posts %}
    {% include card-writeup.html %}
  {% endfor %}
</div>

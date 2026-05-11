---
layout: default
title: "Home"
---

<section class="hero fade-in">
  <div class="container">
    <div class="terminal-block" style="max-width: 600px; margin: 0 auto 2rem; text-align: left;">
      <div class="terminal-header">
        <div class="terminal-dot" style="background: #ff5f56;"></div>
        <div class="terminal-dot" style="background: #ffbd2e;"></div>
        <div class="terminal-dot" style="background: #27c93f;"></div>
      </div>
      <div class="terminal-body font-mono">
        <span style="color: #888;"># Initializing personal profile...</span><br>
        <span style="color: var(--accent-primary);">$</span> cat profile.json<br>
        {<br>
          &nbsp;&nbsp;"name": "Alex171",<br>
          &nbsp;&nbsp;"role": "Security Researcher",<br>
          &nbsp;&nbsp;"focus": ["Web Pentest", "AI Security"],<br>
          &nbsp;&nbsp;"status": "Learning & Hacking"<br>
        }
      </div>
    </div>
    
    <h1>Étudiant en <span id="typing-text" data-texts='["> Cybersécurité", "> Pentesting", "> IA Security"]'>Cybersécurité</span></h1>
    <p>CTF Player & Security Researcher. Passionné par l'offensif et la sécurité des systèmes IA.</p>
    
    <div class="hero-cta">
      <a href="{{ '/writeups' | relative_url }}" class="btn btn-primary">View Writeups</a>
      <a href="{{ '/about' | relative_url }}" class="btn btn-outline">About Me</a>
    </div>
  </div>
</section>

<section id="skills" style="background: var(--bg-surface);">
  <div class="container">
    <h2 class="font-mono" style="text-align: center; margin-bottom: 3rem;">Technical _<span>Skills</span></h2>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
      {% for skill in site.skills %}
      <div class="skill-bar-container">
        <div class="skill-info">
          <span>{{ skill.name }}</span>
          <span>{{ skill.level }}%</span>
        </div>
        <div class="skill-bar">
          <div class="skill-progress" style="width: {{ skill.level }}%"></div>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
</section>

<section id="latest-writeups">
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
      <h2 class="font-mono">Latest _<span>Writeups</span></h2>
      <a href="{{ '/writeups' | relative_url }}" class="text-green font-mono">View All -></a>
    </div>
    
    <div class="writeup-grid">
      {% for post in site.posts limit:3 %}
        {% include card-writeup.html %}
      {% endfor %}
    </div>
  </div>
</section>

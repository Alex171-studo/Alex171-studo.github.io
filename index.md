---
layout: default
title: "Home"
---

<section class="hero fade-in">
  <div class="container">
    <div class="terminal-box">
      <div class="terminal-header" style="justify-content: flex-start; margin-bottom: 1.5rem;">
        <div class="terminal-dot" style="background: #ff5f56;"></div>
        <div class="terminal-dot" style="background: #ffbd2e;"></div>
        <div class="terminal-dot" style="background: #27c93f;"></div>
        <span class="terminal-title" style="margin-left: 1rem; color: #555;">~/godwill-alexis</span>
      </div>
      
      <h1 class="hero-name">Godwill Alexis AGUEMON</h1>
      <div class="hero-subtitle">
        <span id="typing-text" data-texts='["> Security Researcher", "> Web Pentester", "> CTF Player", "> OSCP Aspirant"]'>> Security Researcher</span>
      </div>
      
      <p style="max-width: 600px; margin: 0 auto 2.5rem; color: var(--text-primary); font-size: 1.1rem; line-height: 1.8;">
        Passionné par la cybersécurité offensive et l'analyse de vulnérabilités. 
        Bienvenue dans mon environnement de travail numérique.
      </p>
      
      <div class="hero-cta" style="display: flex; gap: 1rem; justify-content: center;">
        <a href="{{ '/writeups' | relative_url }}" class="btn btn-primary" style="padding: 1rem 2rem; background: var(--accent-primary); color: #000; font-weight: bold; border-radius: 4px;">Explore Writeups</a>
        <a href="{{ '/about' | relative_url }}" class="btn btn-outline" style="padding: 1rem 2rem; border: 1px solid var(--accent-primary); color: var(--accent-primary); border-radius: 4px;">More About Me</a>
      </div>
    </div>
  </div>
</section>

<section id="latest-writeups" style="padding: 6rem 0;">
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4rem;">
      <h2 class="font-mono" style="font-size: 2rem; color: var(--accent-primary);">0x01_Latest_Writeups</h2>
      <a href="{{ '/writeups' | relative_url }}" class="text-green font-mono" style="border-bottom: 1px solid var(--accent-primary);">View_All_Archives()</a>
    </div>
    
    <div class="writeup-grid">
      {% for post in site.posts limit:3 %}
        {% include card-writeup.html %}
      {% endfor %}
    </div>
  </div>
</section>

<section id="status-terminal" style="padding: 4rem 0; background: rgba(0,255,65,0.02);">
  <div class="container">
    <div class="terminal-block" style="border: 1px solid rgba(0,255,65,0.2);">
      <div class="terminal-body font-mono" style="color: #aaa;">
        <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
          <div>
            <span style="color: var(--accent-primary);">[ STATUS ]</span> Active<br>
            <span style="color: var(--accent-primary);">[ TARGET ]</span> Web Security / AD Pentest<br>
          </div>
          <div>
            <span style="color: var(--accent-primary);">[ TOOLS  ]</span> BurpSuite, Metasploit, Nmap, Python<br>
            <span style="color: var(--accent-primary);">[ LOC    ]</span> West Africa / Remote<br>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

---
layout: page
title: "Personal Projects"
---

<div class="writeup-grid">
  <!-- Portfolio -->
  <div class="card fade-in">
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
      <span style="font-size: 2rem;">🌐</span>
      <div style="display: flex; gap: 0.5rem;">
        <span class="badge badge-platform">HTML/CSS/JS</span>
      </div>
    </div>
    <h3 class="font-mono" style="margin-bottom: 0.5rem;">Portfolio _<span>Cybersec</span></h3>
    <p class="text-secondary" style="font-size: 0.9rem; line-height: 1.7; margin-bottom: 1.5rem;">
      Ce portfolio — vitrine de mes writeups, certifications et projets. Design dark cybersec avec terminal interactif, animations CSS et architecture Jekyll propre.
    </p>
    <a href="https://github.com/Alex171-studo/Alex171-studo.github.io" target="_blank" class="btn btn-outline">Github Repo</a>
  </div>

  <!-- XOR Solver -->
  <div class="card fade-in">
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
      <span style="font-size: 2rem;">🔓</span>
      <div style="display: flex; gap: 0.5rem;">
        <span class="badge badge-platform">Python</span>
      </div>
    </div>
    <h3 class="font-mono" style="margin-bottom: 0.5rem;">XOR _<span>Solver</span></h3>
    <p class="text-secondary" style="font-size: 0.9rem; line-height: 1.7; margin-bottom: 1.5rem;">
      Script Python qui parse du code C décompilé par Ghidra, extrait automatiquement les constantes XOR et calcule le nombre magique pour l'escalade de privilèges. Développé lors du lab Bookstore (THM).
    </p>
    <div class="terminal-block">
      <div class="terminal-header">
        <span class="font-mono" style="font-size: 0.75rem;">solveur.py</span>
      </div>
      <div class="terminal-body font-mono" style="font-size: 0.8rem;">
        <span style="color: var(--accent-primary);">$</span> python3 solveur.py challenge.c<br>
        <span style="color: #888;">[*] Valeur cible : 0x5dcd21f4</span><br>
        <span style="color: var(--accent-primary);">[-] Magic Number : 1573743953</span>
      </div>
    </div>
  </div>
</div>

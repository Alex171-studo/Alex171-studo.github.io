# Alex171-studo — Cybersec Portfolio 🔐

Portfolio cybersécurité de **Alex171-studo** — étudiant en 2ème année de CPGE, futur ingénieur IA Security.

**Site live** : [alex171-studo.github.io](https://alex171-studo.github.io)

---

## Structure du projet

```
Alex171-studo.github.io/
├── index.html              # Accueil
├── about.html              # À propos
├── writeups.html           # Liste des writeups
├── certifications.html     # Certifications THM + PortSwigger
├── projects.html           # Projets
├── resources.html          # Ressources & Cheatsheets
├── css/
│   ├── style.css           # Design system cybersec dark theme
│   └── animations.css      # Matrix, glitch, pulse animations
├── js/
│   ├── main.js             # Navigation, counters, filters, matrix canvas
│   └── terminal.js         # Terminal interactif
├── writeups/
│   ├── gamezone.html
│   ├── easy-ctf.html
│   ├── chill-hack.html
│   ├── blog.html
│   ├── daily-bugle.html
│   ├── bookstore.html
│   └── skynet.html
├── _posts/                 # Sources Markdown originales
└── .nojekyll               # Désactive Jekyll sur GitHub Pages
```

## Writeups publiés

| Lab | Difficulté | Techniques principales |
|-----|-----------|----------------------|
| Game Zone | Medium | SQLi, SQLmap, John, SSH Tunnel, Metasploit |
| Easy CTF | Easy | FTP, SQLi CVE-2019-9053, sudo vim |
| Chill Hack | Easy | Command Injection, Stéganographie, Docker |
| Blog | Medium | WordPress RCE CVE-2019-8942, SUID |
| Daily Bugle | Hard | Joomla SQLi CVE-2017-8917, bcrypt, yum |
| Bookstore | Medium | LFI, API REST, Werkzeug, Python RCE |
| Skynet | Medium | SMB, RFI, Tar Wildcard Injection |

## Fonctionnalités

- 🌙 **Dark cybersec theme** — Matrix rain CSS, glassmorphism, scanlines
- ⌨️ **Terminal interactif** — widget flottant avec commandes
- 🔍 **Filtres dynamiques** — par plateforme, difficulté, technique
- 📱 **Responsive** — mobile-first, hamburger menu
- ⚡ **Animations** — fade-in, typing effect, counters, glitch
- 📑 **Table des matières** — sticky sidebar sur chaque writeup

## Déploiement

```bash
git add .
git commit -m "Portfolio cybersec v1"
git push origin main
```

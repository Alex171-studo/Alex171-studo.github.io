# Alex171 | Security Researcher Portfolio 🔐

Portfolio cybersécurité de **Alex171** — étudiant en 2ème année de CPGE, futur ingénieur IA Security.
Refonte complète sous **Jekyll** pour une gestion propre et professionnelle du contenu.

**Site live** : [Alex171-studo.github.io](https://Alex171-studo.github.io)

---

## 🏗️ Structure du Projet (Jekyll)

```
Alex171-studo.github.io/
├── _posts/                 # ✍️ TOUS les writeups (Markdown)
├── _layouts/               # 📐 Templates (default, post, page)
├── _includes/              # 🧩 Composants réutilisables (navbar, footer, card)
├── _config.yml             # ⚙️ Configuration du site
├── assets/                 # 🖼️ Images par machine (avatar.png, screenshots)
├── css/
│   └── style.css           # 🎨 Design System centralisé (Dark Hacker)
├── js/
│   └── main.js             # ⌨️ Logique interactive (Matrix, Typing, Search)
├── index.md                # 🏠 Accueil
├── about.md                # 👤 À propos
├── writeups.md             # 🔍 Hub des writeups avec recherche
├── certifications.md       # 🏆 Certifications THM + PortSwigger
├── projects.md             # 💻 Projets personnels
└── resources.md            # 📚 Ressources & Cheatsheets
```

## 📝 Ajouter un nouveau Writeup

Pour ajouter un walkthrough, crée un fichier `.md` dans `_posts/` avec le format suivant :

```yaml
---
layout: post
title: "Nom Machine - HTB/THM"
date: YYYY-MM-DD
platform: HackTheBox     # ou TryHackMe
difficulty: Easy         # Easy / Medium / Hard / Insane
category: [Linux, Web, PrivEsc]
image: /assets/nom-machine/avatar.png
description: "Courte description de l'exploitation"
---
```

## 🚀 Fonctionnalités

- 🟢 **Design Hacker** — Arrière-plan Matrix rain, thème sombre profond, typo JetBrains Mono.
- 📱 **Responsive** — Navigation fluide sur mobile via menu hamburger.
- 🔍 **Recherche temps-réel** — Filtrage instantané des machines par nom ou technologie.
- ⚡ **Automatisation** — Déploiement via GitHub Actions à chaque push sur `main`.
- ⌨️ **Typing Effect** — Animation terminal sur la page d'accueil.

## 🛠️ Développement Local

```bash
bundle exec jekyll serve
```

## 📦 Déploiement

Le site est automatiquement construit et déployé par **GitHub Actions**. Il suffit de pusher sur la branche `main`.

```bash
git add .
git commit -m "feat: add new writeup"
git push origin main
```

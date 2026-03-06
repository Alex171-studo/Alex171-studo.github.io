/**
 * terminal.js — Interactive Terminal Widget
 * alex@portfolio:~$ style with command routing
 */

const TERMINAL_COMMANDS = {
    help: {
        fn: () => `
<span class="t-success">Commandes disponibles :</span>
<span class="t-key">whoami</span>       → À propos d'Alex
<span class="t-key">projects</span>     → Voir les projets
<span class="t-key">writeups</span>     → Writeups CTF & Labs
<span class="t-key">certs</span>        → Certifications
<span class="t-key">resources</span>    → Ressources & outils
<span class="t-key">skills</span>       → Stack technique
<span class="t-key">contact</span>      → Me contacter
<span class="t-key">clear</span>        → Effacer le terminal
<span class="t-key">ls</span>           → Lister les pages
<span class="t-key">cat about</span>    → Infos rapides
<span class="t-key">exit</span>         → Fermer le terminal`,
    },

    whoami: {
        fn: () => `
<span class="t-success">Alex171-studo</span>
<span class="t-output">Étudiant en Prépa 2A (Math/Info)</span>
<span class="t-output">Objectif : École d'Ingénieur IA & Big Data</span>
<span class="t-output">Spécialisation → Sécurité des systèmes IA</span>
<span class="t-output">Passionné de pentest web & offensive security</span>
<br>
<a href="about.html" class="t-key" style="text-decoration:underline">→ Voir la page À propos</a>`,
    },

    projects: {
        fn: () => `
<span class="t-success">Projets :</span>
<span class="t-key">[1]</span> <span class="t-output">Portfolio Cybersec (ce site)</span>
<span class="t-key">[2]</span> <span class="t-output">Script Python reverse XOR solver</span>
<span class="t-key">[3]</span> <span class="t-output">En cours...</span>
<br>
<a href="projects.html" class="t-key" style="text-decoration:underline">→ Voir tous les projets</a>`,
    },

    writeups: {
        fn: () => `
<span class="t-success">Writeups publiés :</span>
<span class="t-key">THM</span> <span class="t-output">Game Zone    — SQLi, SQLmap, Metasploit</span>
<span class="t-key">THM</span> <span class="t-output">Easy CTF     — FTP, SQLi, Privilege Escalation</span>
<span class="t-key">THM</span> <span class="t-output">Chill Hack   — Command Injection, Docker</span>
<span class="t-key">THM</span> <span class="t-output">Blog         — WordPress RCE, SUID</span>
<span class="t-key">THM</span> <span class="t-output">Daily Bugle  — Joomla SQLi, John</span>
<span class="t-key">THM</span> <span class="t-output">Bookstore    — LFI, Python Console RCE</span>
<span class="t-key">THM</span> <span class="t-output">Skynet       — SMB, RFI, Tar Wildcard</span>
<br>
<a href="writeups.html" class="t-key" style="text-decoration:underline">→ Voir tous les writeups</a>`,
    },

    certs: {
        fn: () => `
<span class="t-success">Certifications & Parcours :</span>
<span class="t-success">✔</span> <span class="t-output">TryHackMe — Pre-Security</span>
<span class="t-success">✔</span> <span class="t-output">TryHackMe — Jr Penetration Tester</span>
<span class="t-success">✔</span> <span class="t-output">TryHackMe — Web Fundamentals</span>
<span class="t-key">⟳</span> <span class="t-output">TryHackMe — Pentester Web (en cours)</span>
<span class="t-success">✔</span> <span class="t-output">PortSwigger — XSS</span>
<span class="t-success">✔</span> <span class="t-output">PortSwigger — SQL Injection</span>
<span class="t-success">✔</span> <span class="t-output">PortSwigger — Server-Side Vulnerabilities</span>
<br>
<a href="certifications.html" class="t-key" style="text-decoration:underline">→ Voir les certifications</a>`,
    },

    resources: {
        fn: () => `
<span class="t-success">Ressources :</span>
<span class="t-key">Plateformes</span> <span class="t-output">TryHackMe, HackTheBox, PortSwigger</span>
<span class="t-key">Outils</span>      <span class="t-output">Burp Suite, Nmap, SQLmap, Metasploit</span>
<span class="t-key">Refs</span>        <span class="t-output">PayloadsAllTheThings, GTFOBins, HackTricks</span>
<br>
<a href="resources.html" class="t-key" style="text-decoration:underline">→ Voir les ressources</a>`,
    },

    skills: {
        fn: () => `
<span class="t-success">Stack technique :</span>
<span class="t-key">Pentest</span>     <span class="t-output">Burp Suite · Nmap · SQLmap · Metasploit · ffuf</span>
<span class="t-key">Web</span>         <span class="t-output">XSS · SQLi · LFI/RFI · RCE · IDOR</span>
<span class="t-key">Systèmes</span>    <span class="t-output">Linux · SSH · SMB · Docker</span>
<span class="t-key">Code</span>        <span class="t-output">Python · Bash · HTML/CSS/JS</span>`,
    },

    contact: {
        fn: () => `
<span class="t-success">Contact :</span>
<span class="t-key">GitHub</span>    <a href="https://github.com/Alex171-studo" target="_blank" class="t-val" style="text-decoration:underline">github.com/Alex171-studo</a>
<span class="t-key">THM</span>       <a href="https://tryhackme.com" target="_blank" class="t-val" style="text-decoration:underline">tryhackme.com/p/Alex171</a>`,
    },

    ls: {
        fn: () => `
<span class="t-success">Pages disponibles :</span>
<span class="t-key">index.html</span>          <span class="t-output">Accueil</span>
<span class="t-key">about.html</span>          <span class="t-output">À propos</span>
<span class="t-key">writeups.html</span>       <span class="t-output">Writeups</span>
<span class="t-key">certifications.html</span> <span class="t-output">Certifications</span>
<span class="t-key">projects.html</span>       <span class="t-output">Projets</span>
<span class="t-key">resources.html</span>      <span class="t-output">Ressources</span>`,
    },

    'cat about': {
        fn: () => `
<span class="t-output">Nom     : Alex (Alex171-studo)</span>
<span class="t-output">Niveau  : 2ème année CPGE (Math-Info)</span>
<span class="t-output">Objectif: Ingénieur en sécurité des IA</span>
<span class="t-output">Focus   : Pentest Web, Offensive Security</span>
<span class="t-output">Labs    : TryHackMe · PortSwigger Web Academy</span>`,
    },

    clear: { fn: () => null },
    exit: { fn: () => '__CLOSE__' },
};

// ── TERMINAL WIDGET ──────────────────────────────
class InteractiveTerminal {
    constructor() {
        this.history = [];
        this.historyIdx = -1;
        this.output = document.getElementById('term-output');
        this.input = document.getElementById('term-input');
        this.toggle = document.getElementById('term-toggle');
        this.window = document.getElementById('interactive-terminal');
        if (!this.toggle) return;
        this.init();
    }

    init() {
        this.toggle.addEventListener('click', () => this.toggleTerminal());
        document.getElementById('term-close')?.addEventListener('click', () => this.close());
        this.input?.addEventListener('keydown', e => this.onKey(e));
        this.printWelcome();
    }

    toggleTerminal() {
        if (this.window.classList.contains('open')) {
            this.close();
        } else {
            this.window.classList.add('open');
            this.toggle.textContent = '✕';
            this.toggle.style.bottom = (parseInt(this.window.offsetHeight) + 24) + 'px';
            this.input?.focus();
        }
    }

    close() {
        this.window.classList.remove('open');
        this.toggle.textContent = '>_';
        this.toggle.style.bottom = '1.5rem';
    }

    printWelcome() {
        this.appendOutput(`<span class="t-success">█████╗ ██╗     ███████╗██╗  ██╗<br>██╔══██╗██║     ██╔════╝╚██╗██╔╝<br>███████║██║     █████╗   ╚███╔╝ <br>██╔══██║██║     ██╔══╝   ██╔██╗ <br>██║  ██║███████╗███████╗██╔╝ ██╗<br>╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝</span>`, false);
        this.appendOutput(`<span class="t-output">Alex171-studo — Portfolio Cybersec</span>`, false);
        this.appendOutput(`<span class="t-output">Tape <span class="t-key">help</span> pour voir les commandes disponibles.</span>`, false);
    }

    onKey(e) {
        if (e.key === 'Enter') {
            const cmd = this.input.value.trim();
            this.input.value = '';
            this.historyIdx = -1;
            if (!cmd) return;
            this.history.unshift(cmd);
            this.execute(cmd);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIdx < this.history.length - 1) {
                this.historyIdx++;
                this.input.value = this.history[this.historyIdx];
            }
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIdx > 0) {
                this.historyIdx--;
                this.input.value = this.history[this.historyIdx];
            } else {
                this.historyIdx = -1;
                this.input.value = '';
            }
        }
    }

    execute(cmd) {
        this.appendPrompt(cmd);
        const lower = cmd.toLowerCase();
        const command = TERMINAL_COMMANDS[lower] || TERMINAL_COMMANDS[cmd];
        if (!command) {
            this.appendOutput(`<span class="t-error">Commande introuvable : <b>${cmd}</b>. Tape <span class="t-key">help</span> pour l'aide.</span>`);
            return;
        }
        const result = command.fn();
        if (result === '__CLOSE__') { this.close(); return; }
        if (result === null) { this.output.innerHTML = ''; this.printWelcome(); return; }
        this.appendOutput(result);
        this.scrollBottom();
    }

    appendPrompt(cmd) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="t-prompt">alex@portfolio:~$</span><span class="t-cmd">&nbsp;${this.escape(cmd)}</span>`;
        this.output.appendChild(line);
    }

    appendOutput(html, wrap = true) {
        const el = document.createElement('div');
        el.style.marginBottom = '0.25rem';
        el.innerHTML = html;
        this.output.appendChild(el);
    }

    scrollBottom() {
        const body = this.output.parentElement;
        body.scrollTop = body.scrollHeight;
    }

    escape(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

document.addEventListener('DOMContentLoaded', () => new InteractiveTerminal());

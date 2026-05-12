/**
 * main.js — Alex171 Portfolio
 * Navigation, animations, counters, matrix canvas
 */

// ── NAVIGATION ──────────────────────────────────────
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

// Active link detection
function setActiveLink() {
    const path = location.pathname;
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === '/' && path === '/') {
            a.classList.add('active');
        } else if (href !== '/' && path.startsWith(href)) {
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
    });
}
setActiveLink();

// Hamburger toggle
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        const spans = hamburger.querySelectorAll('span');
        if (mobileMenu.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        }
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (navbar) navbar.style.background =
        window.scrollY > 30
            ? 'rgba(6,10,18,0.97)'
            : 'rgba(6,10,18,0.9)';
});

// ── FADE IN ON SCROLL ──────────────────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── ANIMATED COUNTERS ─────────────────────────────
function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    el.textContent = '0';
    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const el = e.target;
            animateCounter(el, parseInt(el.dataset.target), 2000);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── MATRIX CANVAS ─────────────────────────────────
function initMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    let drops = Array(cols).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$&+,:;=?@#|<>^*()%!01アイウエオカキクケコ';

    setInterval(() => {
        ctx.fillStyle = 'rgba(6,10,18,0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px JetBrains Mono, monospace';

        cols = Math.floor(canvas.width / fontSize);
        if (drops.length !== cols) drops = Array(cols).fill(1);

        drops.forEach((y, i) => {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, y * fontSize);
            if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }, 50);
}
document.addEventListener('DOMContentLoaded', initMatrix);

// ── TYPING EFFECT ────────────────────────────────
function typeWriter(el, texts, speed = 80, pause = 2000) {
    let textIdx = 0, charIdx = 0, deleting = false;
    function tick() {
        const current = texts[textIdx];
        if (deleting) {
            el.textContent = current.substring(0, charIdx--);
            if (charIdx < 0) {
                deleting = false;
                textIdx = (textIdx + 1) % texts.length;
                setTimeout(tick, 400);
                return;
            }
        } else {
            el.textContent = current.substring(0, charIdx++);
            if (charIdx > current.length) {
                deleting = true;
                setTimeout(tick, pause);
                return;
            }
        }
        setTimeout(tick, deleting ? speed / 2 : speed);
    }
    tick();
}

const typerEl = document.getElementById('typing-text');
if (typerEl) {
    const texts = typerEl.dataset.texts ? JSON.parse(typerEl.dataset.texts) : ['> whoami'];
    typeWriter(typerEl, texts);
}

// ── CERT PROGRESS BARS ───────────────────────────
function animateBars() {
    document.querySelectorAll('.cert-progress-fill').forEach(bar => {
        const width = bar.dataset.width || '0';
        setTimeout(() => { bar.style.width = width + '%'; }, 300);
    });
}
const barObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateBars(); barObs.disconnect(); } });
}, { threshold: 0.1 });
const barsSection = document.querySelector('.cert-grid');
if (barsSection) barObs.observe(barsSection);

// ── COPY CODE BUTTONS ────────────────────────────
document.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('copy-btn')) return;
    const block = e.target.closest('.code-block');
    const code = block ? block.querySelector('pre')?.textContent : '';
    if (!code) return;
    await navigator.clipboard.writeText(code).catch(() => { });
    e.target.textContent = 'Copié ✓';
    e.target.classList.add('copied');
    setTimeout(() => {
        e.target.textContent = 'Copier';
        e.target.classList.remove('copied');
    }, 2000);
});

// ── WRITEUP FILTERS ──────────────────────────────
function initFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.writeup-card');
    if (!btns.length) return;
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                const match = filter === 'all' ||
                    card.dataset.platform === filter ||
                    (card.dataset.tags || '').toLowerCase().includes(filter.toLowerCase());
                card.style.display = match ? '' : 'none';
            });
        });
    });
}
document.addEventListener('DOMContentLoaded', initFilters);

// ── TABLE OF CONTENTS (writeup pages) ────────────
function initTOC() {
    const toc = document.querySelector('.toc-list');
    if (!toc) return;
    const headings = document.querySelectorAll('.writeup-content h2, .writeup-content h3');
    const tocItems = document.querySelectorAll('.toc-item');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                tocItems.forEach(i => i.classList.remove('active'));
                const active = toc.querySelector(`[data-target="${e.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(h => { if (h.id) obs.observe(h); });
}
document.addEventListener('DOMContentLoaded', initTOC);

// ── SMOOTH SCROLL FOR TOC ────────────────────────
document.addEventListener('click', (e) => {
    const item = e.target.closest('.toc-item');
    if (!item) return;
    const target = document.getElementById(item.dataset.target);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── SEARCH (writeups page) ───────────────────────
const searchInput = document.getElementById('search-writeups');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll('.writeup-card');
        cards.forEach(card => {
            const title = card.querySelector('.title').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            const platform = card.dataset.platform ? card.dataset.platform.toLowerCase() : '';
            const tags = card.dataset.tags ? card.dataset.tags.toLowerCase() : '';
            
            const match = title.includes(query) || desc.includes(query) || platform.includes(query) || tags.includes(query);
            card.style.display = match ? '' : 'none';
        });
    });
}

// ── ADAPTIVE THEME ───────────────────────────────
function initAdaptiveTheme() {
    const cards = document.querySelectorAll('.writeup-card');
    // On listing page, we don't change global theme, but on post page we do
    const isPostPage = document.querySelector('.writeup-content');
    if (isPostPage) {
        const platformBadge = document.querySelector('.badge-platform');
        if (platformBadge) {
            const platform = platformBadge.textContent.trim().toLowerCase();
            if (platform.includes('htb') || platform.includes('hackthebox')) {
                document.body.classList.add('theme-htb');
            } else if (platform.includes('thm') || platform.includes('tryhackme')) {
                document.body.classList.add('theme-thm');
            }
        }
    }
}
document.addEventListener('DOMContentLoaded', initAdaptiveTheme);

// ── INTERACTIVE TERMINAL ─────────────────────────
const TERMINAL_COMMANDS = {
    help: () => `
        <div class="term-help">
            <span style="color:var(--accent-secondary)">Système de Navigation AlexOS v1.0.2</span><br>
            -------------------------------------------<br>
            - <span style="color:var(--accent-primary)">whoami</span>      : Affiche l'identité de l'opérateur<br>
            - <span style="color:var(--accent-primary)">ls</span>          : Liste les sections du site<br>
            - <span style="color:var(--accent-primary)">cat [file]</span>   : Lit le contenu d'un fichier/section<br>
            - <span style="color:var(--accent-primary)">writeups</span>    : Accès direct à la base de données machines<br>
            - <span style="color:var(--accent-primary)">clear</span>       : Nettoie la console<br>
            - <span style="color:var(--accent-primary)">exit</span>        : Termine la session<br>
            -------------------------------------------
        </div>
    `,
    whoami: () => `Alex171 - Security Researcher. Expert in Web Pentesting & OSCP Aspirant.`,
    ls: () => `
        <span style="color:var(--accent-secondary)">Index des répertoires :</span><br>
        -rw-r--r--  <a href="/about.html" style="color:inherit">about.md</a><br>
        -rw-r--r--  <a href="/projects.html" style="color:inherit">projects.md</a><br>
        drwxr-xr-x  <a href="/writeups.html" style="color:inherit">writeups/</a><br>
        -rw-r--r--  <a href="/certifications.html" style="color:inherit">certifications.md</a>
    `,
    cat: (args) => {
        if (!args) return "Usage: cat [filename]";
        const file = args.toLowerCase();
        if (file.includes('about')) { setTimeout(() => window.location.href = '/about.html', 800); return "Lecture de about.md..."; }
        if (file.includes('project')) { setTimeout(() => window.location.href = '/projects.html', 800); return "Lecture de projects.md..."; }
        if (file.includes('cert')) { setTimeout(() => window.location.href = '/certifications.html', 800); return "Lecture de certifications.md..."; }
        return `Fichier '${args}' introuvable ou accès refusé.`;
    },
    writeups: () => {
        setTimeout(() => window.location.href = '/writeups.html', 1000);
        return "Accès à la base de données... Redirection en cours...";
    },
    clear: () => { termOutput.innerHTML = ''; return ''; },
    exit: () => { termWindow.classList.remove('open'); return ''; }
};

const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
const termWindow = document.getElementById('interactive-terminal');
const termToggle = document.getElementById('term-toggle');
const termClose = document.getElementById('term-close');

if (termToggle) {
    termToggle.addEventListener('click', () => {
        termWindow.classList.toggle('open');
        if (termWindow.classList.contains('open')) {
            termInput.focus();
            if (termOutput.innerHTML === '') {
                termOutput.innerHTML = '<div>Bienvenue sur AlexOS. Tapez <span style="color:var(--accent-primary)">\'help\'</span> pour commencer.</div>';
            }
        }
    });
}

if (termClose) {
    termClose.addEventListener('click', () => termWindow.classList.remove('open'));
}

if (termInput) {
    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const fullCmd = termInput.value.trim();
            const parts = fullCmd.split(' ');
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');
            
            termOutput.innerHTML += `<div><span style="color:var(--accent-primary)">alex@portfolio:~$</span> ${fullCmd}</div>`;
            
            const response = TERMINAL_COMMANDS[cmd] ? TERMINAL_COMMANDS[cmd](args) : `Commande inconnue : ${cmd}. Tape 'help' pour voir la liste.`;
            
            if (response !== '') {
                termOutput.innerHTML += `<div style="margin-bottom:0.5rem">${response}</div>`;
            }
            
            termInput.value = '';
            termOutput.scrollTop = termOutput.scrollHeight;
        }
    });
}

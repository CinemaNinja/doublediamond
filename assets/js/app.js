/**
 * DOUBLE DIAMOND MOVING - APP LOGIC
 * Vanilla JS only. Minimal footprint.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Sticky Navbar Effect ---
    const nav = document.querySelector('.site-nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // If the link is just "#" (like the site logo), scroll smoothly to the very top.
            if (targetId === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Mobile Hamburger Menu ---
    const hamburger = document.getElementById('nav-hamburger');
    const navContent = document.getElementById('nav-content');

    if (hamburger && navContent) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('active');
            navContent.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close drawer when a nav link is clicked (smooth scroll still fires)
        navContent.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navContent.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close drawer on outside click
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && navContent.classList.contains('open')) {
                hamburger.classList.remove('active');
                navContent.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }
});

// =======================================================================
// INTERACTIVE SNOWSCAPE ENGINE
// =======================================================================
class Snowscape {
    constructor() {
        this.canvas = document.getElementById('snow-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        const densitySlider = document.getElementById('snow-density');
        
        // Initial Startup Count
        this.particleCount = densitySlider ? parseInt(densitySlider.value, 10) : (window.innerWidth > 900 ? 100 : 32);
        
        this.mouseX = null;
        this.mouseY = null;

        // ---- Repulsion Sources ----
        // Collect all interactive elements that should repel snow.
        // Each source gets { el, pad, strength } for tuned behavior.
        this.repulsionSources = [];
        this._collectRepulsionSources();

        // Cached rects for the current frame (one getBoundingClientRect per element per frame)
        this.cachedRects = [];

        this.init();
        this.animate();

        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        // Dynamic Density Binding
        if (densitySlider) {
            densitySlider.addEventListener('input', (e) => {
                this.particleCount = parseInt(e.target.value, 10);
                this.init();
            });
        }

        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            if (e.clientY <= rect.bottom && e.clientY >= rect.top) {
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            } else {
                this.mouseX = null;
                this.mouseY = null;
            }
        });

        document.addEventListener('mouseleave', () => {
            this.mouseX = null;
            this.mouseY = null;
        });
    }

    _collectRepulsionSources() {
        // Hero CTA buttons — strong, wide field
        document.querySelectorAll('.hero .btn').forEach(el => {
            this.repulsionSources.push({ el, pad: 40, strength: 12 });
        });

        // Section headings — wide horizontal field, moderate push
        // (Excludes hero h1 — only the hero buttons should repel there)
        document.querySelectorAll('.masked-heading-container, .heading-massive, .about-text h2').forEach(el => {
            if (!this.repulsionSources.some(s => s.el === el)) {
                this.repulsionSources.push({ el, pad: 30, strength: 10 });
            }
        });

        // Service cards — tight field, moderate push
        document.querySelectorAll('.service-card').forEach(el => {
            this.repulsionSources.push({ el, pad: 15, strength: 8 });
        });

        // Expert cards (owners + team) — tight field
        document.querySelectorAll('.expert-card').forEach(el => {
            this.repulsionSources.push({ el, pad: 12, strength: 8 });
        });

        // Media gallery cards
        document.querySelectorAll('.media-card').forEach(el => {
            this.repulsionSources.push({ el, pad: 15, strength: 8 });
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.resize();
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2.5 + 0.5,
                density: Math.random() * this.particleCount,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.7 + 0.1
            });
        }
    }

    _cacheRects() {
        // Cache all bounding rects once per frame, skip off-screen elements
        const vw = this.canvas.width;
        const vh = this.canvas.height;
        this.cachedRects = [];

        for (let i = 0; i < this.repulsionSources.length; i++) {
            const src = this.repulsionSources[i];
            const rect = src.el.getBoundingClientRect();

            // Cull elements entirely off-screen (with generous padding)
            const margin = 100;
            if (rect.bottom < -margin || rect.top > vh + margin ||
                rect.right < -margin || rect.left > vw + margin) {
                continue;
            }

            const halfW = rect.width / 2 + src.pad;
            const halfH = rect.height / 2 + src.pad;

            this.cachedRects.push({
                cx: rect.left + rect.width / 2,
                cy: rect.top + rect.height / 2,
                halfW,
                halfH,
                strength: src.strength
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Cache element rects once per frame (not per particle)
        this._cacheRects();

        for (let i = 0; i < this.particleCount; i++) {
            let p = this.particles[i];

            // Swaying motion (wind)
            p.y += p.speed;
            p.x += Math.sin(p.density) * 0.8;

            // Magnetic interaction (Repel from custom cursor)
            if (this.mouseX !== null && this.mouseY !== null) {
                let dx = this.mouseX - p.x;
                let dy = this.mouseY - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Blast radius of 200px
                if (distance < 200) {
                    let force = (200 - distance) / 200;
                    force = force * force;

                    let pushX = (dx / distance) * force * 15;
                    let pushY = (dy / distance) * force * 15;
                    p.x -= pushX;
                    p.y -= pushY;
                }
            }

            // Repulsion fields from all registered elements
            for (let r = 0; r < this.cachedRects.length; r++) {
                const field = this.cachedRects[r];
                const dx = p.x - field.cx;
                const dy = p.y - field.cy;

                // Quick bounding-box pre-check (skip expensive sqrt if clearly outside)
                if (Math.abs(dx) > field.halfW || Math.abs(dy) > field.halfH) continue;

                const normDist = Math.sqrt((dx / field.halfW) ** 2 + (dy / field.halfH) ** 2);

                if (normDist < 1) {
                    const force = (1 - normDist) ** 2;
                    const angle = Math.atan2(dy, dx);
                    p.x += Math.cos(angle) * force * field.strength;
                    p.y += Math.sin(angle) * force * field.strength;
                }
            }

            // Boundary reset
            if (p.y > this.canvas.height || p.x > this.canvas.width + 10 || p.x < -10) {
                p.x = Math.random() * this.canvas.width;
                p.y = -10;
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// =======================================================================
// CINEMATIC TILT ENGINE
// =======================================================================
class TiltEngine {
    constructor() {
        this.cards = document.querySelectorAll('.service-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMove(e, card));
            card.addEventListener('mouseleave', () => this.handleLeave(card));
        });
    }

    handleMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    }

    handleLeave(card) {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }
}

// =======================================================================
// TYPOGRAPHY REVEAL ENGINE
// =======================================================================
class RevealTypography {
    constructor() {
        this.headings = document.querySelectorAll('.section-header h2, .hero-content h1');
        this.init();
    }

    init() {
        this.headings.forEach(h => {
            // Wrap the text in a mask container if not already wrapped
            if (!h.querySelector('.reveal-text')) {
                const originalText = h.innerHTML;
                h.innerHTML = `<span class="reveal-text-container"><span class="reveal-text">${originalText}</span></span>`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Snowscape();
    new TiltEngine();
    new RevealTypography();
});

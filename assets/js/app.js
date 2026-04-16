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
        this.particleCount = densitySlider ? parseInt(densitySlider.value, 10) : (window.innerWidth > 900 ? 200 : 64);
        
        this.mouseX = null;
        this.mouseY = null;

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

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
                    force = force * force; // Ease the force curve

                    let pushX = (dx / distance) * force * 15;
                    let pushY = (dy / distance) * force * 15;
                    p.x -= pushX;
                    p.y -= pushY;
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
document.addEventListener('DOMContentLoaded', () => new Snowscape());

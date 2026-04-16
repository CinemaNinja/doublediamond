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

    // --- GSAP & LENIS SCROLL PHYSICS ENGINE ---
    // Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        smooth: true,
        smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000) });
    gsap.ticker.lagSmoothing(0);

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // 1. HERO PARALLAX
    // Parralax the background video wrapper upward gently
    gsap.to('.hero-video-wrapper', {
        yPercent: 20,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    // Parallax the hero content up much faster for deep separation depth
    gsap.to('.hero-content', {
        yPercent: 80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "+=600", scrub: true }
    });

    // 2. STAGGERED REVEALS (Replacing old IntersectionObserver)
    // Stagger services specifically
    gsap.from('.service-card', {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#services', start: 'top 75%' }
    });
    // Generic GSAP reveals for all historic .reveal items
    gsap.utils.toArray('.reveal').forEach(el => {
        // don't double animate cards that we stagger directly above
        if (!el.classList.contains('service-card') && !el.classList.contains('expert-card') && !el.classList.contains('media-card')) {
            gsap.from(el, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        }
    });

    // Ensure bento grid and team grid items are heavily staggered
    gsap.from('.expert-card, .bento-box', {
        y: 80,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el => el.parentElement, start: 'top 80%' }
    });

    // 3. PHYSICAL FORCE GLASS TILT (Velocity Tracking)
    // Target the glass cards in the expert and media sections
    const proxy = { tilt: 0 };
    const tiltSetter = gsap.quickSetter(".expert-card, .bento-box", "rotationX", "deg");
    const clamp = gsap.utils.clamp(-10, 10); // Soft luxury physics limit

    // Tie physical tilt entirely to lenis scroll velocity momentum
    lenis.on('scroll', (e) => {
        let velocityY = e.velocity;
        let tilt = clamp(velocityY * 0.4); 
        
        if (Math.abs(tilt) > 0.1) {
            proxy.tilt = tilt;
            gsap.to(proxy, {
                tilt: 0,
                duration: 0.8,
                ease: "power3",
                overwrite: true,
                onUpdate: () => tiltSetter(proxy.tilt)
            });
        }
    });
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
        this.particleCount = window.innerWidth > 900 ? 250 : 80;
        this.mouseX = null;
        this.mouseY = null;
        
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });
        
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
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
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

/**
 * DOUBLE DIAMOND MOVING - APP LOGIC
 * Vanilla JS only. Minimal footprint.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Sticky Navbar Effect ---
    const nav = document.querySelector('.site-nav');
    const sectionLinks = Array.from(document.querySelectorAll('[data-section-link]'));
    const trackedSections = sectionLinks
        .map(link => document.getElementById(link.dataset.sectionLink))
        .filter(Boolean);

    const setActiveSection = (sectionId) => {
        sectionLinks.forEach(link => {
            const isActive = link.dataset.sectionLink === sectionId;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    const sectionObserver = new IntersectionObserver((entries) => {
        const visibleSections = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
            setActiveSection(visibleSections[0].target.id);
        }
    }, {
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75]
    });

    trackedSections.forEach(section => sectionObserver.observe(section));

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
                history.pushState(null, '', window.location.pathname);
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                history.pushState(null, '', targetId);
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                setActiveSection(targetId.replace('#', ''));
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

    // --- Static Quote Request Forms ---
    document.querySelectorAll('[data-quote-form]').forEach(form => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const formData = new FormData(form);
            const quote = {
                name: (formData.get('name') || '').toString().trim(),
                contact: (formData.get('contact') || '').toString().trim(),
                service: (formData.get('service') || '').toString().trim(),
                date: (formData.get('date') || '').toString().trim(),
                notes: (formData.get('notes') || '').toString().trim()
            };

            const subject = `Quote Request - ${quote.service || 'Double Diamond'}`;
            const body = [
                'New quote request from doublediamondmoving.com',
                '',
                `Name: ${quote.name}`,
                `Phone or Email: ${quote.contact}`,
                `Service Type: ${quote.service}`,
                `Move / Storage Date: ${quote.date || 'Flexible / TBD'}`,
                '',
                'Notes:',
                quote.notes || 'No notes provided.'
            ].join('\n');

            const mailto = `mailto:info@doublediamondmoving.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailto;
        });
    });
});

// =======================================================================
// CINEMATIC TILT ENGINE
// =======================================================================
class TiltEngine {
    constructor() {
        this.cards = document.querySelectorAll('.service-card');
        this.canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        if (!this.canTilt) return;

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
// SERVICE DETAIL SWITCHER
// =======================================================================
class ServiceDetails {
    constructor() {
        this.cards = Array.from(document.querySelectorAll('[data-service]'));
        this.details = Array.from(document.querySelectorAll('[data-service-detail]'));
        this.panel = document.getElementById('service-detail-panel');
        this.init();
    }

    init() {
        if (!this.cards.length || !this.details.length || !this.panel) return;

        this.cards.forEach(card => {
            card.addEventListener('click', () => this.select(card.dataset.service));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.select(card.dataset.service);
                }
            });
        });
    }

    select(serviceId) {
        this.cards.forEach(card => {
            const isSelected = card.dataset.service === serviceId;
            card.classList.toggle('is-selected', isSelected);
            card.setAttribute('aria-expanded', isSelected ? 'true' : 'false');
        });

        this.panel.classList.add('is-changing');

        this.details.forEach(detail => {
            const isActive = detail.dataset.serviceDetail === serviceId;
            detail.hidden = !isActive;
            detail.classList.toggle('is-active', isActive);
        });

        window.setTimeout(() => {
            this.panel.classList.remove('is-changing');
        }, 500);
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
    new ServiceDetails();
    new TiltEngine();
    new RevealTypography();
});

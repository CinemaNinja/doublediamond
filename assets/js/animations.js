/**
 * DOUBLE DIAMOND MOVING - ADVANCED ANIMATIONS ENGINE
 * Handles preloader, magnetic elements, custom cursor, and dynamic glass shine.
 * Built entirely in Vanilla JS for performance and easy designer handoff.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PRELOADER SEQUENCE ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Simple delay to simulate loading or ensure video buffers
        setTimeout(() => {
            preloader.classList.add('loaded');
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.remove('loading-lock');
            }, 1000); // Wait for transition to finish
        }, 1500); // 1.5s initial cinematic hold
    } else {
        document.body.classList.remove('loading-lock');
    }

    // --- 2. CUSTOM BLEND-MODE CURSOR & MASKING ---
    const cursor = document.getElementById('custom-cursor');
    const interactiveElements = document.querySelectorAll('a, button, .magnetic, .service-card');
    const maskHeading = document.querySelector('.masked-heading-container');

    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

            // Power the digital magnifying glass text mapping
            if (maskHeading) {
                const rect = maskHeading.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                maskHeading.style.setProperty('--x', `${x}px`);
                maskHeading.style.setProperty('--y', `${y}px`);
            }
        });

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // --- 3. MAGNETIC ELEMENTS ---
    const magneticEls = document.querySelectorAll('.magnetic');
    magneticEls.forEach(btn => {
        let rect;

        btn.addEventListener('mouseenter', function () {
            // Remove transform to get absolute base position
            btn.style.transform = "translate(0px, 0px)";
            rect = btn.getBoundingClientRect();
        });

        btn.addEventListener('mousemove', function (e) {
            if (!rect) return;
            // Use clientX / clientY to match viewport-based getBoundingClientRect
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Move item lightly towards the cursor
            // Lower multiplier prevents it from escaping the mouse boundary
            btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
        });

        btn.addEventListener('mouseleave', function () {
            btn.style.transform = "translate(0px, 0px)";
            rect = null;
        });
    });

    // --- 4. DYNAMIC GLASS SHINE ON HOVER ---
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set CSS variables for the mask/shine position
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- 5. HERO VIDEO PARALLAX ---
    const heroContent = document.querySelector('.hero-content');
    const heroVideo = document.querySelector('.hero-video-wrapper');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        // Move video half as fast as scroll
        if (heroVideo) {
            heroVideo.style.transform = `translate3d(0, ${scrolled * 0.5}px, 0)`;
        }
        // Fade out hero content on scroll
        if (heroContent) {
            heroContent.style.opacity = 1 - (scrolled / 500);
            heroContent.style.transform = `translate3d(0, ${scrolled * 0.2}px, 0)`;
        }
    });

});

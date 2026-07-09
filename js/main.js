// ============================================================
// main.js — Main JavaScript Entry Point
// ============================================================


// Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');

    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100,
    });

    // ── Hover Hint Tooltips ──────────────────────────────────
    const setupHoverHint = (hintId, sectionSelector, cardSelector) => {
        const hint = document.getElementById(hintId);
        const section = document.querySelector(sectionSelector);
        if (!hint || !section) return;

        let dismissTimer = null;

        const dismissHint = () => {
            if (!hint.classList.contains('is-visible')) return;
            clearTimeout(dismissTimer);
            hint.classList.remove('is-visible');
            hint.classList.add('is-hiding');
            setTimeout(() => hint.style.display = 'none', 400);
        };

        const showHint = () => {
            hint.classList.add('is-visible');
            // Auto-dismiss after 3.5s
            dismissTimer = setTimeout(dismissHint, 3500);
        };

        // Trigger on section entering viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(showHint, 600); // slight delay feels more natural
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(section);

        // Dismiss on first card hover
        section.querySelectorAll(cardSelector).forEach(card => {
            card.addEventListener('mouseenter', dismissHint, { once: true });
        });
    };

    setupHoverHint('serviceHoverHint', '.service-section', '.service-card');
    setupHoverHint('whyHoverHint', '.why-balaji-section', '.why-card');

    // Initialize Hero Swiper
    const heroSwiper = new Swiper('.heroSwiper', {
        direction: 'vertical',
        loop: true,
        autoplay: {
            delay: 4500,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        speed: 1000,
    });

    // Initialize Testimonial Swiper
    const testimonialSwiper = new Swiper('.testimonial-swiper', {
        loop: true,
        speed: 700,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        slidesPerView: 1.1,
        spaceBetween: 20,
        breakpoints: {
            576: { slidesPerView: 1.3, spaceBetween: 20 },
            768: { slidesPerView: 2.1, spaceBetween: 24 },
            1200: { slidesPerView: 2.3, spaceBetween: 28 },
        },
    });

    // ── Stat Number Counter Animation ──
    const counters = document.querySelectorAll('.counter');

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;

                // Adjust increment dynamically so smaller numbers don't instantly complete
                const increment = Math.max(1, Math.ceil(target / 80));

                // Make the delay slower (50ms) for small 2-digit targets to ensure the counter feels smooth and readable
                const delay = target < 100 ? 55 : 15;

                if (count < target) {
                    counter.innerText = Math.min(target, count + increment);
                    setTimeout(updateCount, delay);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    // Trigger animation when the about section wrapper comes into view
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(aboutSection);
    } else {
        // Fallback for older browsers or missing nodes
        animateCounters();
    }
});

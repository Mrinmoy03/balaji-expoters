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

    // ── Sticky Navbar: blur + hide/show on scroll ────────────
    const header = document.querySelector('.site-header');
    if (header) {
        const SCROLL_THRESHOLD = 80;   // px before blur kicks in
        const HIDE_DELTA = 6;    // min px moved before hiding/showing
        let lastScrollY = window.scrollY;

        const onScroll = () => {
            const currentY = window.scrollY;
            const delta = currentY - lastScrollY;

            // Toggle blur/glass background
            header.classList.toggle('is-scrolled', currentY > SCROLL_THRESHOLD);

            // Only react if movement is meaningful (avoids micro-jitter)
            if (Math.abs(delta) > HIDE_DELTA) {
                if (delta > 0 && currentY > SCROLL_THRESHOLD) {
                    // Scrolling DOWN — hide navbar
                    header.classList.add('is-hidden');
                    document.body.classList.add('nav-is-hidden');
                } else {
                    // Scrolling UP — reveal navbar
                    header.classList.remove('is-hidden');
                    document.body.classList.remove('nav-is-hidden');
                }
                lastScrollY = currentY;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }

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

    // Initialize Hero Swiper (index page only)
    if (document.querySelector('.heroSwiper')) {
        new Swiper('.heroSwiper', {
            direction: 'vertical',
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            speed: 1200, // Smooth transition speed
        });
    }

    // Initialize Testimonial Swiper (index page only)
    if (document.querySelector('.testimonial-swiper')) {
        new Swiper('.testimonial-swiper', {
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
    }

    // Initialize Core Services Swiper (services page only)
    if (document.querySelector('.services-swiper')) {
        const servicesSwiper = new Swiper('.services-swiper', {
            loop: true,
            speed: 800,
            spaceBetween: 30,
            slidesPerView: 1.1,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                576: { slidesPerView: 1.5, spaceBetween: 24 },
                768: { slidesPerView: 2.2, spaceBetween: 28 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
            },
        });

        // Robust manual hover pause/resume for swiper
        const serviceSlides = document.querySelectorAll('.services-swiper .swiper-slide');
        serviceSlides.forEach(slide => {
            slide.addEventListener('mouseenter', () => {
                servicesSwiper.autoplay.stop();
            });
            slide.addEventListener('mouseleave', () => {
                servicesSwiper.autoplay.start();
            });
        });
    }

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

    // Trigger animation when any stats-row comes into view (works on all pages)
    const statsRow = document.querySelector('.stats-row');
    if (statsRow && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        observer.observe(statsRow);
    } else if (counters.length) {
        // Fallback: run immediately if IntersectionObserver unavailable
        animateCounters();
    }

    // Dynamic timeline axis fill on scroll (horizontal on desktop, vertical on mobile)
    const timelineWrapper = document.querySelector('.production-timeline-wrapper');
    const axisFill = document.querySelector('.timeline-axis-fill');
    if (timelineWrapper && axisFill) {
        const updateAxisFill = () => {
            const isMobile = window.innerWidth < 992;

            if (isMobile) {
                // Mobile: vertical scroll progress based on section viewport position
                const rect = timelineWrapper.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Calculate percentage based on how much of the section has entered/passed the viewport
                const totalHeight = rect.height;
                const scrolled = windowHeight - rect.top - 120; // 120px offset for better visual alignment

                let fillPercent = 0;
                if (scrolled >= 0) {
                    fillPercent = Math.min(100, (scrolled / (totalHeight + 50)) * 100);
                }
                axisFill.style.height = `${fillPercent}%`;
                axisFill.style.width = '100%';
            } else {
                // Desktop: horizontal scroll progress
                const scrollLeft = timelineWrapper.scrollLeft;
                const scrollWidth = timelineWrapper.scrollWidth;
                const clientWidth = timelineWrapper.clientWidth;
                const maxScroll = scrollWidth - clientWidth;

                const fillPercent = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
                axisFill.style.width = `${fillPercent}%`;
                axisFill.style.height = '100%';
            }
        };

        window.addEventListener('scroll', updateAxisFill, { passive: true });
        timelineWrapper.addEventListener('scroll', updateAxisFill, { passive: true });
        window.addEventListener('resize', updateAxisFill, { passive: true });
        // Run once initially to capture initial offset
        updateAxisFill();
    }

    // Toggle product specifications card-specs-table inside collection-card
    const specToggles = document.querySelectorAll('.btn-specs-toggle');
    specToggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Stops navigation on card anchor click

            const card = btn.closest('.collection-card');
            if (card) {
                const table = card.querySelector('.card-specs-table');
                if (table) {
                    const isOpen = table.classList.toggle('is-open');
                    btn.classList.toggle('is-active', isOpen);

                    // Update text label dynamically
                    const labelSpan = btn.querySelector('span');
                    if (labelSpan) {
                        labelSpan.textContent = isOpen ? 'Hide Specifications' : 'Show Specifications';
                    }
                }
            }
        });
    });

    // Floating Brochure Popup logic (shows on each page load)
    setTimeout(() => {
        const popup = document.getElementById('brochurePopup');
        if (popup) {
            popup.classList.add('is-visible');
        }
    }, 1500);

    document.getElementById('closeBrochurePopup')?.addEventListener('click', () => {
        const popup = document.getElementById('brochurePopup');
        if (popup) {
            popup.classList.remove('is-visible');
        }
    });
});

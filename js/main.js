// ============================================================
// main.js — Main JavaScript Entry Point
// ============================================================


// Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');

    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 700,
        easing: 'ease-in-out',
        once: true,
        offset: 40,          // trigger earlier (was 100)
        mirror: false,
        anchorPlacement: 'top-bottom',
    });

    // Refresh AOS after all images load so element positions are correct
    window.addEventListener('load', () => {
        AOS.refresh();
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

    // Initialize Reels Swiper (index page only)
    if (document.querySelector('.reels-swiper')) {
        new Swiper('.reels-swiper', {
            loop: true,
            speed: 700,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            slidesPerView: 1,
            spaceBetween: 30,
            pagination: {
                el: '.reels-swiper .swiper-pagination',
                clickable: true,
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

    // Dynamic timeline axis fill / GSAP horizontal scroll handling
    const timelineWrapper = document.querySelector('.production-timeline-wrapper');
    const axisFill = document.querySelector('.timeline-axis-fill');
    if (timelineWrapper && axisFill) {
        const isGSAPEnabled = timelineWrapper.classList.contains('gs-scroll-enabled') && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
        let gsapTimeline = null;
        let wasMobile = window.innerWidth < 992;

        const initGSAPTimeline = () => {
            const scrollContent = timelineWrapper.querySelector('.timeline-scroll-content');
            if (!scrollContent) return;

            // Clear previous timeline if active
            if (gsapTimeline) {
                gsapTimeline.scrollTrigger.kill(true);
                gsapTimeline.kill();
                gsapTimeline = null;
            }

            // Reset positioning styles
            gsap.set(scrollContent, { clearProps: "transform" });
            gsap.set(axisFill, { clearProps: "width,height" });
            gsap.set(axisFill, { height: '100%' });

            const totalWidth = scrollContent.offsetWidth; // 2240px
            const visibleWidth = timelineWrapper.clientWidth;
            const amountToScroll = totalWidth - visibleWidth;

            if (amountToScroll > 0) {
                gsapTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: ".process-section",
                        pin: true,
                        start: "top top",
                        end: () => `+=${amountToScroll * 1.2}`,
                        scrub: 1,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    }
                });

                gsapTimeline.to(scrollContent, {
                    x: () => -(scrollContent.offsetWidth - timelineWrapper.clientWidth),
                    ease: "none"
                }, 0);

                gsapTimeline.to(axisFill, {
                    width: "100%",
                    ease: "none"
                }, 0);
            }
        };

        const killGSAPTimeline = () => {
            if (gsapTimeline) {
                gsapTimeline.scrollTrigger.kill(true);
                gsapTimeline.kill();
                gsapTimeline = null;
            }
            const scrollContent = timelineWrapper.querySelector('.timeline-scroll-content');
            if (scrollContent) {
                gsap.set(scrollContent, { clearProps: "all" });
            }
            gsap.set(axisFill, { clearProps: "all" });
        };

        const updateAxisFill = () => {
            const isMobile = window.innerWidth < 992;

            if (isGSAPEnabled) {
                if (isMobile) {
                    killGSAPTimeline();
                    // Mobile fallback: vertical fill logic on scroll
                    const rect = timelineWrapper.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const totalHeight = rect.height;
                    const scrolled = windowHeight - rect.top - 120;

                    let fillPercent = 0;
                    if (scrolled >= 0) {
                        fillPercent = Math.min(100, (scrolled / (totalHeight + 50)) * 100);
                    }
                    axisFill.style.height = `${fillPercent}%`;
                    axisFill.style.width = '100%';
                } else {
                    // Desktop with GSAP: initialize timeline
                    if (!gsapTimeline) {
                        initGSAPTimeline();
                    }
                }
            } else {
                // Standard behavior (non-GSAP or services page timeline)
                if (isMobile) {
                    const rect = timelineWrapper.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const totalHeight = rect.height;
                    const scrolled = windowHeight - rect.top - 120;

                    let fillPercent = 0;
                    if (scrolled >= 0) {
                        fillPercent = Math.min(100, (scrolled / (totalHeight + 50)) * 100);
                    }
                    axisFill.style.height = `${fillPercent}%`;
                    axisFill.style.width = '100%';
                } else {
                    const scrollLeft = timelineWrapper.scrollLeft;
                    const scrollWidth = timelineWrapper.scrollWidth;
                    const clientWidth = timelineWrapper.clientWidth;
                    const maxScroll = scrollWidth - clientWidth;

                    const fillPercent = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
                    axisFill.style.width = `${fillPercent}%`;
                    axisFill.style.height = '100%';
                }
            }
        };

        // Attach scroll/interaction listeners
        window.addEventListener('scroll', updateAxisFill, { passive: true });
        timelineWrapper.addEventListener('scroll', updateAxisFill, { passive: true });

        // Handle resize events to toggle timeline structure
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth < 992;
            if (isMobile !== wasMobile) {
                wasMobile = isMobile;
                if (isGSAPEnabled) {
                    if (isMobile) {
                        killGSAPTimeline();
                    } else {
                        initGSAPTimeline();
                    }
                }
            }
            updateAxisFill();
        }, { passive: true });

        // Initial run
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

    // Initialize Collection Swiper (index page only)
    if (document.querySelector('.collection-swiper')) {
        new Swiper('.collection-swiper', {
            loop: true,
            speed: 800,
            spaceBetween: 30,
            slidesPerView: 1.1,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            pagination: {
                el: '.collection-swiper .swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                576: { slidesPerView: 1.5, spaceBetween: 24 },
                768: { slidesPerView: 2.2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
            },
        });
    }

    // Refresh AOS after all Swipers settle to fix stale element positions
    setTimeout(() => AOS.refresh(), 500);

    // Auto-scroll to category on products.html load based on URL query parameter or hash
    if (window.location.pathname.includes('products.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryQuery = urlParams.get('category');
        const hashQuery = window.location.hash ? window.location.hash.substring(1) : null;
        const targetId = categoryQuery || hashQuery;

        if (targetId) {
            setTimeout(() => {
                const target = document.getElementById(targetId);
                if (target) {
                    const offset = 140;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });

                    // Also set active class on category filter button
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.toggle('is-active', btn.dataset.target === targetId);
                    });
                }
            }, 300);
        }
    }

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

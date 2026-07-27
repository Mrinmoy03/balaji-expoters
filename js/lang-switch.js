/**
 * Balaji Garments — Multi-Language Selector & Search Engine
 * Integrates Google Translate with custom flag UI, search filter, auto-detection & persistence.
 */

(function () {
    // ── Supported Languages Database ──────────────────────────
    const languages = [
        { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', keywords: 'english uk us' },
        { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', keywords: 'french francais france' },
        { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', keywords: 'german deutsch germany' },
        { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', keywords: 'spanish espanol spain' },
        { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', keywords: 'arabic saudi uae' },
        { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', keywords: 'italian italiano italy' },
        { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', keywords: 'portuguese portugues brazil' },
        { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', keywords: 'russian russia' },
        { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', keywords: 'japanese japan' },
        { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳', keywords: 'chinese china' },
        { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', keywords: 'dutch netherlands holland' },
        { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱', keywords: 'polish poland' },
        { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', keywords: 'turkish turkey' },
        { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', keywords: 'korean korea' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', keywords: 'hindi india' },
        { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', keywords: 'tamil india' },
        { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', keywords: 'vietnamese vietnam' },
        { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', keywords: 'indonesian indonesia' },
        { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', keywords: 'swahili kenya africa' },
        { code: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱', keywords: 'hebrew israel' }
    ];

    const STORAGE_KEY = 'balaji_lang';

    // ── Helper: Set Cookie for Google Translate ───────────────
    function setGoogleTranslateCookie(langCode) {
        const domain = window.location.hostname;
        const cookieVal = langCode === 'en' ? '' : `/en/${langCode}`;

        document.cookie = `googtrans=${cookieVal}; path=/;`;
        document.cookie = `googtrans=${cookieVal}; path=/; domain=${domain};`;
        if (domain.includes('.')) {
            const rootDomain = domain.substring(domain.indexOf('.'));
            document.cookie = `googtrans=${cookieVal}; path=/; domain=${rootDomain};`;
        }
    }

    // ── Helper: Get Browser Language ──────────────────────────
    function getBrowserLanguage() {
        const navLang = navigator.language || navigator.userLanguage || 'en';
        const shortCode = navLang.split('-')[0].toLowerCase();
        const found = languages.find(l => l.code === shortCode || l.code.toLowerCase() === navLang.toLowerCase());
        return found ? found.code : 'en';
    }

    // ── Languages that produce notably longer text than English ──
    // These get body class 'lang-verbose' for CSS font-size overrides.
    const verboseLangs = ['fr', 'de', 'es', 'pt', 'it', 'pl', 'ru', 'nl', 'tr'];
    // These produce shorter/compact text — no change needed.
    // 'en', 'ja', 'zh-CN', 'ko', 'ar', 'hi', 'ta', 'vi', 'id', 'he', 'sw'

    // ── Apply body attribute for CSS targeting ────────────────
    function applyLangBodyClass(langCode) {
        document.body.removeAttribute('data-lang-size');
        if (verboseLangs.includes(langCode)) {
            document.body.setAttribute('data-lang-size', 'verbose');
        }
        // Also set the lang code itself for ultra-specific overrides
        document.body.setAttribute('data-lang', langCode);
    }

    // ── Apply Language Switch ─────────────────────────────────
    function switchLanguage(langCode, reloadIfNeeded = true) {
        const currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
        localStorage.setItem(STORAGE_KEY, langCode);
        setGoogleTranslateCookie(langCode);

        // Update UI components
        updateSelectorUI(langCode);
        applyLangBodyClass(langCode);

        if (reloadIfNeeded && currentLang !== langCode) {
            window.location.reload();
        }
    }

    // ── Update Selector Buttons & Dropdown UI ─────────────────
    function updateSelectorUI(activeCode) {
        const langObj = languages.find(l => l.code === activeCode) || languages[0];

        // Update all desktop and mobile buttons
        document.querySelectorAll('.lang-btn-current-flag').forEach(el => el.textContent = langObj.flag);
        document.querySelectorAll('.lang-btn-current-name').forEach(el => el.textContent = langObj.name);

        // Update active checkmarks in list
        document.querySelectorAll('.lang-option').forEach(el => {
            const code = el.getAttribute('data-lang-code');
            if (code === activeCode) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    // ── Render Language Selector Component HTML ───────────────
    function createSelectorHTML(instanceId) {
        const searchInputId = `langSearch_${instanceId}`;
        const listId = `langList_${instanceId}`;

        let optionsHTML = languages.map(l => `
            <a href="javascript:void(0)" class="lang-option" data-lang-code="${l.code}" data-keywords="${l.name.toLowerCase()} ${l.native.toLowerCase()} ${l.keywords}">
                <div class="lang-option-left">
                    <span class="flag-icon">${l.flag}</span>
                    <span>${l.name} <small class="text-muted fs-7">(${l.native})</small></span>
                </div>
                <i class="ri-check-line check-icon"></i>
            </a>
        `).join('');

        return `
            <div class="lang-selector-wrapper dropdown">
                <button class="lang-btn" type="button" id="langDropdown_${instanceId}" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                    <span class="lang-flag lang-btn-current-flag">🇬🇧</span>
                    <span class="lang-btn-current-name">English</span>
                    <i class="ri-arrow-down-s-line lang-arrow"></i>
                </button>
                <div class="lang-dropdown-menu dropdown-menu dropdown-menu-end" aria-labelledby="langDropdown_${instanceId}">
                    <div class="lang-search-box">
                        <i class="ri-search-line"></i>
                        <input type="text" id="${searchInputId}" class="lang-search-input" placeholder="Search language..." autocomplete="off">
                    </div>
                    <div class="lang-list" id="${listId}">
                        ${optionsHTML}
                        <div class="lang-no-results">No language found</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ── Initialize Selector Events & Search Filters ───────────
    function initLanguageSelector() {
        const savedLang = localStorage.getItem(STORAGE_KEY) || getBrowserLanguage();
        setGoogleTranslateCookie(savedLang);

        // Inject desktop selector if container exists or place in nav
        const desktopNav = document.querySelector('#mainNavbar .navbar-nav');
        if (desktopNav && !document.querySelector('.lang-selector-wrapper-desktop')) {
            const li = document.createElement('li');
            li.className = 'nav-item ms-lg-2 lang-selector-wrapper-desktop';
            li.innerHTML = createSelectorHTML('desktop');
            desktopNav.insertBefore(li, desktopNav.querySelector('.ms-lg-3') || null);
        }

        // Inject mobile selector in offcanvas if container exists
        const mobileOffcanvasBody = document.querySelector('.mobile-nav .offcanvas-body');
        if (mobileOffcanvasBody && !document.querySelector('.lang-selector-wrapper-mobile')) {
            const div = document.createElement('div');
            div.className = 'mt-3 pt-3 border-top lang-selector-wrapper-mobile';
            div.innerHTML = createSelectorHTML('mobile');
            mobileOffcanvasBody.appendChild(div);
        }

        // Initial UI state update + apply body lang class on page load
        updateSelectorUI(savedLang);
        applyLangBodyClass(savedLang);

        // Event listener for language option clicks
        document.addEventListener('click', function (e) {
            const option = e.target.closest('.lang-option');
            if (option) {
                e.preventDefault();
                const code = option.getAttribute('data-lang-code');
                switchLanguage(code, true);
            }
        });

        // Event listener for live search filtering inside dropdowns
        document.addEventListener('input', function (e) {
            if (e.target && e.target.classList.contains('lang-search-input')) {
                const query = e.target.value.toLowerCase().trim();
                const menu = e.target.closest('.lang-dropdown-menu');
                if (!menu) return;

                const options = menu.querySelectorAll('.lang-option');
                const noResults = menu.querySelector('.lang-no-results');
                let matches = 0;

                options.forEach(opt => {
                    const keywords = opt.getAttribute('data-keywords') || '';
                    if (keywords.includes(query)) {
                        opt.classList.remove('hidden');
                        matches++;
                    } else {
                        opt.classList.add('hidden');
                    }
                });

                if (noResults) {
                    noResults.style.display = matches === 0 ? 'block' : 'none';
                }
            }
        });
    }

    // ── Load Google Translate Hidden Engine Script ────────────
    window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            autoDisplay: false
        }, 'google_translate_element');
    };

    function loadGoogleTranslateScript() {
        // Create hidden element container if missing
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.display = 'none';
            document.body.appendChild(div);
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);
    }

    // DOM Ready Initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLanguageSelector();
            loadGoogleTranslateScript();
        });
    } else {
        initLanguageSelector();
        loadGoogleTranslateScript();
    }
})();

/**
 * Pearl Dental Clinic — i18n Language Switcher
 * Handles EN/AR switching with RTL layout support
 */

(function() {
  'use strict';

  const LANG_KEY = 'pearl_lang';
  let currentLang = localStorage.getItem(LANG_KEY) || 'en';

  // ── Apply language to page ─────────────────────────────────────
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    const t = TRANSLATIONS[lang];
    if (!t) return;

    // Set html attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Update meta
    if (t.metaDesc) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', t.metaDesc);
    }

    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else if (el.hasAttribute('data-i18n-html')) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    // Update page title
    if (t.siteName) {
      const titleEl = document.querySelector('title');
      if (titleEl) {
        const currentTitle = titleEl.textContent;
        const parts = currentTitle.split(' | ');
        if (parts.length > 1) {
          titleEl.textContent = parts[0] + ' | ' + t.siteName;
        }
      }
    }

    // Update lang switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Load RTL stylesheet
    manageRtlStylesheet(lang === 'ar');

    // Update font family for Arabic
    if (lang === 'ar') {
      document.body.style.fontFamily = "'Cairo', 'Inter', system-ui, sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
    }

    // Dispatch event for other scripts to react
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  // ── Manage RTL stylesheet ──────────────────────────────────────
  function manageRtlStylesheet(enable) {
    let rtlLink = document.getElementById('rtl-stylesheet');
    if (enable && !rtlLink) {
      rtlLink = document.createElement('link');
      rtlLink.id = 'rtl-stylesheet';
      rtlLink.rel = 'stylesheet';
      rtlLink.href = 'css/rtl.css';
      document.head.appendChild(rtlLink);
    } else if (!enable && rtlLink) {
      rtlLink.remove();
    }
  }

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    // Set up lang switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (lang && lang !== currentLang) {
          applyLanguage(lang);
        }
      });
    });

    // Apply saved or detected language
    applyLanguage(currentLang);
  }

  // ── Public API ─────────────────────────────────────────────────
  window.i18n = {
    init,
    setLanguage: applyLanguage,
    getCurrentLanguage: () => currentLang,
    t: (key) => (TRANSLATIONS[currentLang] || TRANSLATIONS.en)[key] || key,
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

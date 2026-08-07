/**
 * Pearl Dental Clinic — Main JavaScript
 * Handles: Navbar, FAQ, Before/After slider, Testimonials,
 *          Counters, Floating buttons, Scroll-to-top, AOS init
 */

(function () {
  'use strict';

  // ── DOM ready ────────────────────────────────────────────────────
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ── Navbar ───────────────────────────────────────────────────────
  function initNavbar() {
    const navbar = document.querySelector('.navbar-pearl');
    if (!navbar) return;

    const heroEl = document.querySelector('.hero');

    function updateNavbar() {
      const scrolled = window.scrollY > 20;
      navbar.classList.toggle('scrolled', scrolled);

      if (heroEl) {
        const heroBottom = heroEl.offsetTop + heroEl.offsetHeight;
        navbar.classList.toggle('on-hero', window.scrollY < heroBottom - 80);
      }
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // Active nav link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav-links .nav-link[href^="#"]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(s => observer.observe(s));
  }

  // ── Mobile Drawer ────────────────────────────────────────────────
  function initMobileDrawer() {
    const toggles = document.querySelectorAll('.navbar-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    const overlay = document.querySelector('.mobile-drawer-overlay');
    const closeBtn = document.querySelector('.mobile-drawer-close');
    if (!toggles.length || !drawer) return;

    function openDrawer() {
      drawer.classList.add('open');
      overlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      overlay?.classList.remove('open');
      document.body.style.overflow = '';
    }

    toggles.forEach(t => t.addEventListener('click', openDrawer));
    closeBtn?.addEventListener('click', closeDrawer);
    overlay?.addEventListener('click', closeDrawer);

    // Close on nav link click
    drawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Keyboard close
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
  }

  // ── Smooth scroll for anchor links ─────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 76;
          const y = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  }

  // ── FAQ Accordion ────────────────────────────────────────────────
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        items.forEach(i => {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = '0';
        });

        // Open clicked
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  // ── Before & After Slider ────────────────────────────────────────
  function initBeforeAfter() {
    const containers = document.querySelectorAll('.ba-slider-container');

    containers.forEach(container => {
      const afterImg   = container.querySelector('.ba-img-after');
      const divider    = container.querySelector('.ba-divider');
      const handle     = container.querySelector('.ba-handle');
      if (!afterImg || !divider) return;

      let isDragging = false;
      let isRtl = document.documentElement.dir === 'rtl';

      function setPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const pct = (x / rect.width) * 100;

        if (isRtl) {
          afterImg.style.clipPath = `inset(0 0 0 ${pct}%)`;
        } else {
          afterImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        }

        divider.style.left = pct + '%';
        if (handle) {
          handle.style.left = pct + '%';
          handle.style.right = 'auto';
        }
      }

      // Mouse events
      container.addEventListener('mousedown', e => {
        isDragging = true;
        setPosition(e.clientX);
      });
      document.addEventListener('mousemove', e => {
        if (isDragging) setPosition(e.clientX);
      });
      document.addEventListener('mouseup', () => { isDragging = false; });

      // Touch events
      container.addEventListener('touchstart', e => {
        isDragging = true;
        setPosition(e.touches[0].clientX);
      }, { passive: true });
      document.addEventListener('touchmove', e => {
        if (isDragging) setPosition(e.touches[0].clientX);
      }, { passive: true });
      document.addEventListener('touchend', () => { isDragging = false; });

      // Listen for RTL change
      document.addEventListener('languageChanged', ({ detail }) => {
        isRtl = detail.lang === 'ar';
      });
    });

    // Before/After tabs
    const tabs = document.querySelectorAll('.ba-tab');
    const galleries = document.querySelectorAll('.ba-gallery');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        galleries.forEach(g => {
          g.style.display = g.dataset.cat === cat ? 'block' : 'none';
        });
      });
    });
  }

  // ── Animated Counters ────────────────────────────────────────────
  function initCounters() {
    const counters = document.querySelectorAll('.stat-value[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target;
        const target = parseInt(el.dataset.target) || 0;
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1800;
        const start = performance.now();

        function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = prefix + Math.floor(ease * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = prefix + target + suffix;
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  // ── Testimonial Slider ───────────────────────────────────────────
  function initTestimonialSlider() {
    const track = document.querySelector('.testimonial-track');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    const dots = document.querySelectorAll('.testimonial-dot');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-slide');
    let current = 0;
    let autoplayInterval;
    let perView = getPerView();

    function getPerView() {
      return window.innerWidth >= 992 ? 3 : window.innerWidth >= 576 ? 2 : 1;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - perView);
    }

    function goTo(index) {
      const max = getMaxIndex();
      current = Math.max(0, Math.min(index, max));
      const cardWidth = cards[0]?.offsetWidth + 24 || 0; // gap
      track.style.transform = `translateX(${document.dir === 'rtl' ? '' : '-'}${current * cardWidth}px)`;

      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));

      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= max;
    }

    prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); resetAutoplay(); });
    });

    function startAutoplay() {
      autoplayInterval = setInterval(() => {
        const max = getMaxIndex();
        goTo(current >= max ? 0 : current + 1);
      }, 5000);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(current + 1); else goTo(current - 1);
        resetAutoplay();
      }
    });

    window.addEventListener('resize', () => {
      perView = getPerView();
      goTo(0);
    });

    goTo(0);
    startAutoplay();
  }

  // ── Scroll-to-top & Floating buttons ───────────────────────────
  function initFab() {
    const scrollTopBtn = document.querySelector('.fab-scroll-top');
    if (scrollTopBtn) {
      window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
      }, { passive: true });
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ── AOS Init ─────────────────────────────────────────────────────
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 700,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
        delay: 50,
      });

      // Refresh AOS on language change (layout shift)
      document.addEventListener('languageChanged', () => {
        setTimeout(() => AOS.refresh(), 100);
      });
    }
  }

  // ── Contact form ─────────────────────────────────────────────────
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
      const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);

      // Simple validation
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('is-invalid');
          valid = false;
        } else {
          field.classList.remove('is-invalid');
        }
      });

      const emailField = form.querySelector('[type="email"]');
      if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('is-invalid');
        valid = false;
      }

      if (!valid) return;

      const btn = form.querySelector('[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner"></div>`;
      }

      // Simulate send (no backend for contact form in MVP)
      await new Promise(r => setTimeout(r, 1000));

      const successEl = document.getElementById('contact-form-success');
      if (successEl) {
        successEl.style.display = 'block';
        successEl.textContent = t.formSuccess;
      }

      form.reset();
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-send"></i> ${t.formSend}`;
      }
    });
  }

  // ── Current day highlighting in hours table ──────────────────────
  function initHoursTable() {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[new Date().getDay()];
    const todayRow = document.querySelector(`[data-day="${today}"]`);
    if (todayRow) todayRow.classList.add('hours-today');
  }

  // ── Run all inits ────────────────────────────────────────────────
  ready(() => {
    initNavbar();
    initMobileDrawer();
    initSmoothScroll();
    initFAQ();
    initBeforeAfter();
    initCounters();
    initTestimonialSlider();
    initFab();
    initAOS();
    initContactForm();
    initHoursTable();
  });

})();

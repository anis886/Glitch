/**
 * Pearl Dental Clinic — Appointment Booking System
 * Multi-step form with Supabase backend and localStorage fallback
 */

(function() {
  'use strict';

  // ── State ────────────────────────────────────────────────────────
  const state = {
    currentStep: 1,
    totalSteps: 4,
    data: {
      fullName: '',
      phone: '',
      email: '',
      contactPref: 'whatsapp',
      patientType: 'new',
      service: null,
      serviceName: '',
      doctorId: 'any',
      doctorName: '',
      date: '',
      time: '',
      notes: '',
      consent: false,
    },
    bookedSlots: [],
    referenceNumber: '',
  };

  // ── Doctors data ─────────────────────────────────────────────────
  const DOCTORS = [
    {
      id: 'dr-fatima',
      aliases: ['dr-fatima', 'dr-malak'],
      nameEn: 'Dr. Fatima',
      nameAr: 'د. فاطمة',
      specEn: 'Cosmetic & General Dentistry',
      specAr: 'طب الأسنان التجميلي والعام',
      initials: 'FA',
      color: '#1A9CB0',
    },
    {
      id: 'dr-hana',
      aliases: ['dr-hana', 'dr-mahy'],
      nameEn: 'Dr. Hana Al-Sabah',
      nameAr: 'د. هناء الصباح',
      specEn: 'Orthodontics & Implants',
      specAr: 'تقويم الأسنان والزراعة',
      initials: 'HS',
      color: '#0F2744',
    },
    {
      id: 'dr-sara',
      nameEn: 'Dr. Sara Al-Enezi',
      nameAr: 'د. سارة العنزي',
      specEn: 'Pediatric Dentistry',
      specAr: 'طب أسنان الأطفال',
      initials: 'SE',
      color: '#10B981',
    },
    {
      id: 'dr-khalid',
      nameEn: 'Dr. Khalid Al-Sabah',
      nameAr: 'د. خالد الصباح',
      specEn: 'Endodontics & Oral Surgery',
      specAr: 'علاج قناة الجذر وجراحة الفم',
      initials: 'KS',
      color: '#6366F1',
    },
  ];

  // ── Services data ────────────────────────────────────────────────
  const SERVICES = [
    { id: 'exam',      iconClass: 'bi bi-search-heart', keyEn: 'svcExam',      keyAr: 'svcExam'      },
    { id: 'cleaning',  iconClass: 'bi bi-stars',        keyEn: 'svcCleaning',  keyAr: 'svcCleaning'  },
    { id: 'whitening', iconClass: 'bi bi-brightness-high', keyEn: 'svcWhitening', keyAr: 'svcWhitening' },
    { id: 'implant',   iconClass: 'bi bi-gem',          keyEn: 'svcImplant',   keyAr: 'svcImplant'   },
    { id: 'ortho',     iconClass: 'bi bi-align-center', keyEn: 'svcOrtho',     keyAr: 'svcOrtho'     },
    { id: 'rootcanal', iconClass: 'bi bi-activity',     keyEn: 'svcRootCanal', keyAr: 'svcRootCanal' },
    { id: 'cosmetic',  iconClass: 'bi bi-star',         keyEn: 'svcCosmetic',  keyAr: 'svcCosmetic'  },
    { id: 'pediatric', iconClass: 'bi bi-balloon-heart',keyEn: 'svcPediatric', keyAr: 'svcPediatric' },
    { id: 'emergency', iconClass: 'bi bi-lightning-charge', keyEn: 'svcEmergency', keyAr: 'svcEmergency' },
    { id: 'other',     iconClass: 'bi bi-three-dots',   keyEn: 'svcOther',     keyAr: 'svcOther'     },
  ];

  // ── Available time slots ─────────────────────────────────────────
  const ALL_TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30',
  ];

  // Format time for display
  function formatTime(t) {
    const [h, m] = t.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  }

  // ── DOM helpers ──────────────────────────────────────────────────
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  // ── Toast ────────────────────────────────────────────────────────
  function showToast(msg, type = 'info', duration = 3000) {
    let container = $('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span>${icon}</span> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }

  // ── Step navigation ──────────────────────────────────────────────
  function goToStep(step) {
    if (step < 1 || step > state.totalSteps) return;

    // Update state
    state.currentStep = step;

    // Update step circles
    $$('.step-item').forEach((item, i) => {
      const stepNum = i + 1;
      item.classList.remove('active', 'completed');
      if (stepNum === step) item.classList.add('active');
      else if (stepNum < step) item.classList.add('completed');

      const circle = item.querySelector('.step-circle');
      if (circle) {
        if (stepNum < step) {
          circle.innerHTML = '<i class="bi bi-check-lg"></i>';
        } else {
          circle.textContent = stepNum;
        }
      }
    });

    // Show correct step panel
    $$('.appt-step').forEach((panel, i) => {
      panel.classList.toggle('active', i + 1 === step);
    });

    // Scroll to top of form
    const formEl = $('.appt-card');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Special init for steps
    if (step === 3) initStep3();
    if (step === 4) renderConfirmation();
  }

  // ── Step 1: Validation ───────────────────────────────────────────
  function validateStep1() {
    let valid = true;
    const t = window.i18n ? window.i18n.t : (k) => k;

    // Full name
    const name = $('#appt-name');
    if (!name || !name.value.trim() || name.value.trim().length < 2) {
      showFieldError(name, t('errRequired'));
      valid = false;
    } else clearFieldError(name);

    // Phone
    const phone = $('#appt-phone');
    if (!phone || !phone.value.trim() || phone.value.trim().length < 7) {
      showFieldError(phone, t('errPhone'));
      valid = false;
    } else clearFieldError(phone);

    // Email
    const email = $('#appt-email');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email.value.trim())) {
      showFieldError(email, t('errEmail'));
      valid = false;
    } else clearFieldError(email);

    return valid;
  }

  function showFieldError(el, msg) {
    if (!el) return;
    el.classList.add('is-invalid');
    let errEl = el.parentElement.querySelector('.form-error-msg');
    if (!errEl) {
      errEl = el.closest('.mb-3') ? el.closest('.mb-3').querySelector('.form-error-msg') : null;
    }
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
  }

  function clearFieldError(el) {
    if (!el) return;
    el.classList.remove('is-invalid');
    const parent = el.closest('.mb-3') || el.parentElement;
    const errEl = parent ? parent.querySelector('.form-error-msg') : null;
    if (errEl) errEl.classList.remove('visible');
  }

  // ── Step 2: Service selection ────────────────────────────────────
  function initStep2() {
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const grid = $('#service-select-grid');
    if (!grid) return;

    grid.innerHTML = '';
    SERVICES.forEach(svc => {
      const name = (TRANSLATIONS[lang] || TRANSLATIONS.en)[svc.keyEn] || svc.keyEn;
      const card = document.createElement('div');
      card.className = 'service-select-card' + (state.data.service === svc.id ? ' selected' : '');
      card.dataset.svcId = svc.id;
      card.dataset.svcName = name;
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', state.data.service === svc.id);
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="svc-icon"><i class="${svc.iconClass}"></i></div>
        <div class="svc-name">${name}</div>
      `;
      card.addEventListener('click', () => selectService(svc.id, name, card));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectService(svc.id, name, card); }
      });
      grid.appendChild(card);
    });
  }

  function selectService(id, name, cardEl) {
    state.data.service = id;
    state.data.serviceName = name;
    $$('.service-select-card').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });
    cardEl.classList.add('selected');
    cardEl.setAttribute('aria-checked', 'true');

    // Clear error if any
    const errEl = $('#service-error');
    if (errEl) errEl.classList.remove('visible');
  }

  // ── Step 3: Doctor & Time ────────────────────────────────────────
  function initStep3() {
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);

    // Render doctor cards
    const grid = $('#doctor-select-grid');
    if (grid) {
      grid.innerHTML = '';

      // "Any doctor" option
      const anyCard = document.createElement('div');
      anyCard.className = 'doctor-select-card' + (state.data.doctorId === 'any' ? ' selected' : '');
      anyCard.dataset.doctorId = 'any';
      anyCard.setAttribute('role', 'radio');
      anyCard.setAttribute('aria-checked', state.data.doctorId === 'any');
      anyCard.setAttribute('tabindex', '0');
      anyCard.innerHTML = `
        <div class="doctor-select-initials" style="background:#64748B;">
          <i class="bi bi-people-fill" style="font-size:1.25rem;"></i>
        </div>
        <div class="doctor-select-name" data-i18n="anyDoctor">${t.anyDoctor}</div>
        <div class="doctor-select-spec">&nbsp;</div>
      `;
      anyCard.addEventListener('click', () => selectDoctor('any', t.anyDoctor, anyCard));
      anyCard.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDoctor('any', t.anyDoctor, anyCard); }
      });
      grid.appendChild(anyCard);

      DOCTORS.forEach(dr => {
        const name = lang === 'ar' ? dr.nameAr : dr.nameEn;
        const spec = lang === 'ar' ? dr.specAr : dr.specEn;
        const card = document.createElement('div');
        card.className = 'doctor-select-card' + (state.data.doctorId === dr.id ? ' selected' : '');
        card.dataset.doctorId = dr.id;
        card.dataset.doctorName = name;
        card.setAttribute('role', 'radio');
        card.setAttribute('aria-checked', state.data.doctorId === dr.id);
        card.setAttribute('tabindex', '0');
        card.innerHTML = `
          <div class="doctor-select-initials" style="background:${dr.color}">${dr.initials}</div>
          <div class="doctor-select-name">${name}</div>
          <div class="doctor-select-spec">${spec}</div>
        `;
        card.addEventListener('click', () => selectDoctor(dr.id, name, card));
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDoctor(dr.id, name, card); }
        });
        grid.appendChild(card);
      });
    }

    // Set min date to today
    const dateInput = $('#appt-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      dateInput.addEventListener('change', () => {
        state.data.date = dateInput.value;
        loadTimeSlots();
      });
    }

    // Load slots if date already chosen
    if (state.data.date) loadTimeSlots();
  }

  function selectDoctor(id, name, cardEl) {
    state.data.doctorId = id;
    state.data.doctorName = name;
    $$('.doctor-select-card').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });
    cardEl.classList.add('selected');
    cardEl.setAttribute('aria-checked', 'true');

    // Reload slots for new doctor
    if (state.data.date) loadTimeSlots();
  }

  async function loadTimeSlots() {
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);
    const slotsWrap = $('#time-slots-wrap');
    if (!slotsWrap || !state.data.date) return;

    slotsWrap.innerHTML = `<div class="text-muted" style="padding:0.5rem 0;"><div class="spinner" style="border-color:rgba(0,0,0,0.2);border-top-color:var(--color-primary);display:inline-block;margin-right:0.5rem;"></div> ${t.loadingSlots}</div>`;

    const booked = await window.PearlDB.getBookedSlots(state.data.doctorId, state.data.date);
    state.bookedSlots = booked;

    // Check if Thursday (limit hours)
    const dayOfWeek = new Date(state.data.date + 'T00:00:00').getDay();
    // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    const isFriday = dayOfWeek === 5;
    if (isFriday) {
      slotsWrap.innerHTML = `<p class="text-muted" style="padding:0.5rem 0;">${t.hoursFriday} — ${t.noSlots}</p>`;
      return;
    }

    const isThursday = dayOfWeek === 4;
    const availableSlots = ALL_TIME_SLOTS.filter(slot => {
      if (isThursday) {
        const hour = parseInt(slot.split(':')[0]);
        if (hour >= 18) return false;
      }
      return true;
    });

    if (availableSlots.length === 0) {
      slotsWrap.innerHTML = `<p class="text-muted">${t.noSlots}</p>`;
      return;
    }

    slotsWrap.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'time-slots-grid';

    availableSlots.forEach(slot => {
      const isBooked = booked.includes(slot);
      const isSelected = state.data.time === slot;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot' + (isBooked ? ' booked' : '') + (isSelected && !isBooked ? ' selected' : '');
      btn.textContent = formatTime(slot);
      btn.disabled = isBooked;
      btn.setAttribute('aria-pressed', isSelected && !isBooked);
      if (!isBooked) {
        btn.addEventListener('click', () => selectTimeSlot(slot, btn));
      }
      grid.appendChild(btn);
    });

    slotsWrap.appendChild(grid);
  }

  function selectTimeSlot(slot, btnEl) {
    state.data.time = slot;
    $$('.time-slot:not(.booked)').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-pressed', 'false');
    });
    btnEl.classList.add('selected');
    btnEl.setAttribute('aria-pressed', 'true');

    // Clear error
    const errEl = $('#time-error');
    if (errEl) errEl.classList.remove('visible');
  }

  // ── Step 3 Validation ────────────────────────────────────────────
  function validateStep3() {
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);
    let valid = true;

    if (!state.data.date) {
      const errEl = $('#date-error');
      if (errEl) { errEl.textContent = t.errSelectDate; errEl.classList.add('visible'); }
      valid = false;
    }
    if (!state.data.time) {
      const errEl = $('#time-error');
      if (errEl) { errEl.textContent = t.errSelectTime; errEl.classList.add('visible'); }
      valid = false;
    }

    return valid;
  }

  // ── Step 4: Confirmation ─────────────────────────────────────────
  function renderConfirmation() {
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);

    const formatDate = (d) => {
      if (!d) return '—';
      return new Date(d + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-KW', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const rows = [
      { label: t.summaryPatient, value: state.data.fullName },
      { label: t.summaryService, value: state.data.serviceName },
      { label: t.summaryDoctor,  value: state.data.doctorName || t.anyDoctor },
      { label: t.summaryDate,    value: formatDate(state.data.date) },
      { label: t.summaryTime,    value: formatTime(state.data.time) },
      { label: t.summaryContact, value: `${state.data.phone} • ${state.data.email}` },
    ];

    const tbody = $('#confirmation-rows');
    if (tbody) {
      tbody.innerHTML = rows.map(r => `
        <div class="summary-row">
          <span class="summary-label">${r.label}</span>
          <span class="summary-value">${r.value || '—'}</span>
        </div>
      `).join('');
    }
  }

  // ── Submit appointment ───────────────────────────────────────────
  async function submitAppointment() {
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);

    // Validate consent
    const consentEl = $('#appt-consent');
    if (!consentEl || !consentEl.checked) {
      showToast(t.errConsent, 'error');
      return;
    }

    // Gather data
    state.data.fullName   = ($('#appt-name')  || {}).value?.trim() || state.data.fullName;
    state.data.phone      = ($('#appt-phone') || {}).value?.trim() || state.data.phone;
    state.data.email      = ($('#appt-email') || {}).value?.trim() || state.data.email;
    state.data.notes      = ($('#appt-notes') || {}).value?.trim() || '';

    const payload = {
      full_name:         state.data.fullName,
      phone:             '+965 ' + state.data.phone.replace(/^\+?965\s*/, ''),
      email:             state.data.email,
      contact_preference: state.data.contactPref,
      patient_type:      state.data.patientType,
      service:           state.data.service,
      service_name:      state.data.serviceName,
      doctor_id:         state.data.doctorId,
      doctor_name:       state.data.doctorName || t.anyDoctor,
      appointment_date:  state.data.date,
      appointment_time:  state.data.time,
      notes:             state.data.notes,
      language:          lang,
    };

    // UI: loading
    const confirmBtn = $('#btn-confirm');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<div class="spinner"></div> ${t.btnConfirming}`;
    }

    const result = await window.PearlDB.createAppointment(payload);

    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = t.btnConfirm;
    }

    if (result.success) {
      state.referenceNumber = result.data.reference_number;
      showSuccessState(result.isLocal);
    } else {
      if (result.error === 'SLOT_TAKEN') {
        showToast(t.errBooking, 'error', 5000);
        // Reload slots
        loadTimeSlots();
        state.data.time = '';
      } else {
        showToast(t.errGeneric, 'error');
      }
    }
  }

  // ── Success state ────────────────────────────────────────────────
  function showSuccessState(isLocal) {
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);

    const step4 = $('#appt-step-4');
    if (!step4) return;

    const whatsappText = encodeURIComponent(
      lang === 'ar'
        ? `مرحباً، أريد تأكيد موعدي في عيادة بيرل للأسنان.\nالمريض: ${state.data.fullName}\nالخدمة: ${state.data.serviceName}\nالتاريخ: ${state.data.date}\nالوقت: ${formatTime(state.data.time)}\nرقم المرجع: ${state.referenceNumber}`
        : `Hello, I'd like to confirm my appointment at Pearl Dental Clinic.\nPatient: ${state.data.fullName}\nService: ${state.data.serviceName}\nDate: ${state.data.date}\nTime: ${formatTime(state.data.time)}\nReference: ${state.referenceNumber}`
    );

    const calUrl = buildCalendarUrl();

    step4.innerHTML = `
      <div class="appt-success" role="alert" aria-live="polite">
        <div class="appt-success-icon">
          <i class="bi bi-check-lg"></i>
        </div>
        <h3>${t.successTitle}</h3>
        <p>${t.successText}${isLocal ? '<br><small style="color:var(--color-warning);">(Saved locally — Supabase not configured)</small>' : ''}</p>
        <div class="ref-number" aria-label="${t.refLabel}">${state.referenceNumber}</div>
        <p class="text-muted" style="margin-bottom:1.5rem;">${t.refLabel}</p>
        <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
          <a href="${calUrl}" target="_blank" class="btn-outline-custom" style="font-size:0.875rem;">
            <i class="bi bi-calendar-plus"></i> ${t.btnAddCalendar}
          </a>
          <a href="https://wa.me/96598765432?text=${whatsappText}" target="_blank" rel="noopener" class="btn-primary-custom" style="font-size:0.875rem;background:#25D366;border-color:#25D366;">
            <i class="bi bi-whatsapp"></i> ${t.btnWhatsApp}
          </a>
        </div>
        <div style="margin-top:1.5rem;">
          <button type="button" class="btn-outline-custom" id="btn-book-another" style="font-size:0.875rem;">
            <i class="bi bi-plus-circle"></i> ${t.btnBookAnother}
          </button>
        </div>
      </div>
    `;

    // Hide navigation buttons
    const navBtns = $('.appt-nav-btns');
    if (navBtns) navBtns.style.display = 'none';

    // Reset on "book another"
    const anotherBtn = $('#btn-book-another');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', resetForm);
    }

    // Update step indicators to all completed
    $$('.step-item').forEach(item => {
      item.classList.remove('active');
      item.classList.add('completed');
      const circle = item.querySelector('.step-circle');
      if (circle) circle.innerHTML = '<i class="bi bi-check-lg"></i>';
    });
  }

  function buildCalendarUrl() {
    const startDate = state.data.date.replace(/-/g, '');
    const [h, m] = state.data.time.split(':');
    const startTime = `${h}${m}00`;
    // +1 hour
    const endH = String(parseInt(h) + 1).padStart(2, '0');
    const endTime = `${endH}${m}00`;
    const title = encodeURIComponent(`Pearl Dental Clinic Appointment — ${state.data.serviceName}`);
    const details = encodeURIComponent(`Appointment Reference: ${state.referenceNumber}\nDoctor: ${state.data.doctorName}\nService: ${state.data.serviceName}`);
    const location = encodeURIComponent('Salem Al-Mubarak Street, Salmiya, Kuwait');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}T${startTime}/${startDate}T${endTime}&details=${details}&location=${location}`;
  }

  // ── Reset form ───────────────────────────────────────────────────
  function resetForm() {
    state.currentStep = 1;
    state.data = {
      fullName: '', phone: '', email: '', contactPref: 'whatsapp',
      patientType: 'new', service: null, serviceName: '', doctorId: 'any',
      doctorName: '', date: '', time: '', notes: '', consent: false,
    };
    state.referenceNumber = '';

    // Restore nav buttons
    const navBtns = $('.appt-nav-btns');
    if (navBtns) navBtns.style.display = '';

    // Restore step 4 content
    const step4 = $('#appt-step-4');
    if (step4) {
      // Will be re-rendered when we get to step 4 again
      step4.innerHTML = $('#step4-template') ? $('#step4-template').innerHTML : '';
    }

    // Re-init services grid
    initStep2();

    goToStep(1);
  }

  // ── Pre-select doctor from URL param ────────────────────────────
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const doctorParam = params.get('doctor');
    if (doctorParam) {
      const dr = DOCTORS.find(d => d.id === doctorParam || (d.aliases && d.aliases.includes(doctorParam)));
      if (dr) {
        state.data.doctorId = dr.id;
        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        state.data.doctorName = lang === 'ar' ? dr.nameAr : dr.nameEn;
      }
    }
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    // Initialize Supabase
    window.PearlDB.init();

    // Check URL params (pre-selected doctor)
    checkUrlParams();

    // Init services grid
    initStep2();

    // Show Supabase notice if not configured
    if (!window.PearlDB.isConfigured()) {
      const noticeEl = $('#supabase-notice');
      if (noticeEl) noticeEl.style.display = 'flex';
    }

    // ── Step 1 inputs ──
    $$('#appt-name, #appt-phone, #appt-email').forEach(input => {
      input.addEventListener('blur', () => {
        if (input.value.trim()) clearFieldError(input);
      });
    });

    // Contact preference
    $$('[name="contact-pref"]').forEach(radio => {
      radio.addEventListener('change', () => {
        state.data.contactPref = radio.value;
      });
    });

    // Patient type
    $$('[name="patient-type"]').forEach(radio => {
      radio.addEventListener('change', () => {
        state.data.patientType = radio.value;
      });
    });

    // ── Next button ──
    const btnNext = $('#btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);

        if (state.currentStep === 1) {
          // Save step 1 data
          state.data.fullName = ($('#appt-name') || {}).value?.trim() || '';
          state.data.phone    = ($('#appt-phone') || {}).value?.trim() || '';
          state.data.email    = ($('#appt-email') || {}).value?.trim() || '';
          if (!validateStep1()) return;
          goToStep(2);
        } else if (state.currentStep === 2) {
          if (!state.data.service) {
            const errEl = $('#service-error');
            if (errEl) { errEl.textContent = t.errSelectService; errEl.classList.add('visible'); }
            return;
          }
          goToStep(3);
        } else if (state.currentStep === 3) {
          state.data.notes = ($('#appt-notes') || {}).value?.trim() || '';
          if (!validateStep3()) return;
          goToStep(4);
        }
      });
    }

    // ── Back button ──
    const btnBack = $('#btn-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (state.currentStep > 1) goToStep(state.currentStep - 1);
      });
    }

    // ── Confirm button ──
    const btnConfirm = $('#btn-confirm');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', submitAppointment);
    }

    // Re-init service grid on language change
    document.addEventListener('languageChanged', () => {
      initStep2();
      if (state.currentStep === 3) initStep3();
    });
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API for external use (e.g., "book with doctor" button) ──
  window.PearlAppt = {
    openWithDoctor: (doctorId) => {
      const dr = DOCTORS.find(d => d.id === doctorId || (d.aliases && d.aliases.includes(doctorId)));
      if (dr) {
        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        state.data.doctorId = dr.id;
        state.data.doctorName = lang === 'ar' ? dr.nameAr : dr.nameEn;
      }
      window.location.href = 'appointment.html?doctor=' + doctorId;
    }
  };

})();

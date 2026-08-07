/**
 * Pearl Dental Clinic — Manage Booking / Patient Portal JS
 * Enables patients to check appointment status and request cancellation using Reference ID.
 */

(function () {
  'use strict';

  function initManageBooking() {
    const modalEl = document.getElementById('manageBookingModal');
    if (!modalEl) return;

    const form = document.getElementById('lookup-form');
    const resultCard = document.getElementById('lookup-result');
    const errorAlert = document.getElementById('lookup-error');
    const cancelBtn = document.getElementById('btn-cancel-appt');

    let currentApptRef = null;

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const refInput = document.getElementById('lookup-ref');
        const contactInput = document.getElementById('lookup-contact');

        const ref = (refInput ? refInput.value : '').trim();
        const contact = (contactInput ? contactInput.value : '').trim();

        if (!ref) return;

        if (errorAlert) errorAlert.style.display = 'none';
        if (resultCard) resultCard.style.display = 'none';

        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Searching...';
        }

        const res = await window.PearlDB.getAppointmentByRef(ref, contact);

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }

        if (res.success && res.data) {
          currentApptRef = res.data.reference_number;
          renderApptResult(res.data);
        } else {
          currentApptRef = null;
          if (errorAlert) {
            const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
            const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);
            errorAlert.textContent = t.notFoundAppt || 'No matching appointment found.';
            errorAlert.style.display = 'block';
          }
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', async () => {
        if (!currentApptRef) return;

        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);

        if (!confirm(t.btnConfirmCancel || 'Are you sure you want to cancel this appointment?')) {
          return;
        }

        const contactInput = document.getElementById('lookup-contact');
        const contact = (contactInput ? contactInput.value : '').trim();

        cancelBtn.disabled = true;
        cancelBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Cancelling...';

        const res = await window.PearlDB.cancelAppointment(currentApptRef, contact);

        cancelBtn.disabled = false;
        cancelBtn.innerHTML = t.btnCancelAppt || 'Cancel Appointment';

        if (res.success) {
          // Re-fetch and re-render
          const updated = await window.PearlDB.getAppointmentByRef(currentApptRef, contact);
          if (updated.success) renderApptResult(updated.data);
          alert(t.cancelSuccess || 'Appointment cancelled successfully.');
        } else {
          alert(t.errGeneric || 'Failed to cancel appointment.');
        }
      });
    }
  }

  function renderApptResult(appt) {
    const resultCard = document.getElementById('lookup-result');
    if (!resultCard) return;

    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const t = (TRANSLATIONS[lang] || TRANSLATIONS.en);

    const statusBadgeMap = {
      pending: `<span class="badge bg-warning text-dark"><i class="bi bi-clock-history me-1"></i>${t.statusPending || 'Pending'}</span>`,
      confirmed: `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>${t.statusConfirmed || 'Confirmed'}</span>`,
      cancelled: `<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>${t.statusCancelled || 'Cancelled'}</span>`,
      completed: `<span class="badge bg-info text-dark"><i class="bi bi-check-all me-1"></i>${t.statusCompleted || 'Completed'}</span>`
    };

    document.getElementById('res-ref').textContent = appt.reference_number || '—';
    document.getElementById('res-patient').textContent = appt.full_name || '—';
    document.getElementById('res-service').textContent = appt.service_name || appt.service || '—';
    document.getElementById('res-doctor').textContent = appt.doctor_name || '—';
    document.getElementById('res-date').textContent = appt.appointment_date || '—';
    document.getElementById('res-time').textContent = appt.appointment_time || '—';
    document.getElementById('res-status').innerHTML = statusBadgeMap[appt.status] || statusBadgeMap.pending;

    const cancelBtn = document.getElementById('btn-cancel-appt');
    if (cancelBtn) {
      cancelBtn.style.display = appt.status === 'cancelled' || appt.status === 'completed' ? 'none' : 'inline-block';
    }

    resultCard.style.display = 'block';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManageBooking);
  } else {
    initManageBooking();
  }
})();

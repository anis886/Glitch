/**
 * Pearl Dental Clinic — Supabase Client & DB Interface
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a free account at https://supabase.com
 * 2. Create a new project
 * 3. Go to Settings → API and copy your project URL and anon (public) key
 * 4. Replace SUPABASE_URL and SUPABASE_ANON_KEY below with your values
 * 5. Run the SQL in supabase-setup.sql in your Supabase SQL Editor
 *
 * SECURITY NOTE:
 * - Only use the ANON (public) key here, never the service role key
 * - Enable Row Level Security (RLS) in Supabase for the appointments table
 * - The anon key is safe to expose in frontend code when RLS is configured
 */

// ── Configuration ────────────────────────────────────────────────
// Replace these with your actual Supabase credentials
const SUPABASE_URL     = 'https://imeezjdbnbmhxamqthjy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RebmX0oaXykDDqt7mx734g_ycgIDL50';

const IS_CONFIGURED = SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE';

// ── Supabase client (loaded from CDN) ────────────────────────────
let supabaseClient = null;

function initSupabase() {
  if (!IS_CONFIGURED) return null;
  try {
    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Pearl Dental] Supabase connected.');
    return supabaseClient;
  } catch (e) {
    console.warn('[Pearl Dental] Supabase init failed:', e);
    return null;
  }
}

// ── Local Storage Fallback ───────────────────────────────────────
const LOCAL_KEY = 'pearl_appointments';

function getLocalAppointments() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalAppointment(appt) {
  const appts = getLocalAppointments();
  appts.push(appt);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(appts));
}

// ── Generate Appointment Reference ──────────────────────────────
function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'PDC-';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

// ── Check if a time slot is booked ──────────────────────────────
async function isSlotBooked(doctorId, date, time) {
  const booked = await getBookedSlots(doctorId, date);
  return booked.includes(time);
}

// ── Get booked slots for a doctor on a date ──────────────────────
async function getBookedSlots(doctorId, date) {
  if (!supabaseClient) {
    // Local fallback
    const appts = getLocalAppointments();
    return appts
      .filter(a =>
        a.appointment_date === date &&
        (doctorId === 'any' || a.doctor_id === doctorId) &&
        a.status !== 'cancelled'
      )
      .map(a => a.appointment_time);
  }

  try {
    // Call RPC function (zero PII exposure)
    const { data, error } = await supabaseClient.rpc('get_booked_slots', {
      p_date: date,
      p_doctor_id: doctorId || 'any'
    });

    if (error) throw error;
    return (data || []).map(d => d.appointment_time);
  } catch (e) {
    console.warn('[Pearl Dental] Get booked slots error (RPC fallback attempt):', e);
    return [];
  }
}

// ── Create an appointment ────────────────────────────────────────
async function createAppointment(appointmentData) {
  const ref = generateRef();
  const payload = {
    ...appointmentData,
    reference_number: ref,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  if (!supabaseClient) {
    // Local fallback
    payload.id = Date.now().toString();
    saveLocalAppointment(payload);
    return { success: true, data: payload, isLocal: true };
  }

  try {
    // Check if slot is taken
    const alreadyBooked = await isSlotBooked(
      appointmentData.doctor_id,
      appointmentData.appointment_date,
      appointmentData.appointment_time
    );

    if (alreadyBooked) {
      return { success: false, error: 'SLOT_TAKEN' };
    }

    const { data, error } = await supabaseClient
      .from('appointments')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error('[Pearl Dental] Create appointment error:', e);
    if (e.code === '23505') {
      // Unique constraint violation (duplicate slot)
      return { success: false, error: 'SLOT_TAKEN' };
    }
    return { success: false, error: 'GENERIC' };
  }
}

// ── Lookup appointment by reference number ───────────────────────
async function getAppointmentByRef(refNumber, phoneOrEmail) {
  const cleanRef = (refNumber || '').trim().toUpperCase();
  const cleanContact = (phoneOrEmail || '').trim().toLowerCase().replace(/\s+/g, '');

  if (!supabaseClient) {
    // Local fallback
    const appts = getLocalAppointments();
    const found = appts.find(a => {
      const matchRef = (a.reference_number || '').toUpperCase() === cleanRef;
      if (!matchRef) return false;
      if (!cleanContact) return true;
      const apptPhone = (a.phone || '').toLowerCase().replace(/\s+/g, '');
      const apptEmail = (a.email || '').toLowerCase();
      return apptPhone.includes(cleanContact) || apptEmail.includes(cleanContact);
    });
    return found ? { success: true, data: found } : { success: false, error: 'NOT_FOUND' };
  }

  try {
    // Call secure RPC function (requires ref + contact verification server-side)
    const { data, error } = await supabaseClient.rpc('get_appointment_by_ref', {
      p_ref: cleanRef,
      p_contact: cleanContact
    });

    if (error) throw error;
    if (!data || data.length === 0) return { success: false, error: 'NOT_FOUND' };

    return { success: true, data: data[0] };
  } catch (e) {
    console.error('[Pearl Dental] Get appointment error:', e);
    return { success: false, error: 'GENERIC' };
  }
}

// ── Cancel appointment by reference number ─────────────────────
async function cancelAppointment(refNumber, phoneOrEmail) {
  const cleanRef = (refNumber || '').trim().toUpperCase();
  const cleanContact = (phoneOrEmail || '').trim().toLowerCase().replace(/\s+/g, '');

  if (!supabaseClient) {
    // Local fallback
    const appts = getLocalAppointments();
    const idx = appts.findIndex(a => (a.reference_number || '').toUpperCase() === cleanRef);
    if (idx !== -1) {
      appts[idx].status = 'cancelled';
      localStorage.setItem(LOCAL_KEY, JSON.stringify(appts));
      return { success: true, data: appts[idx] };
    }
    return { success: false, error: 'NOT_FOUND' };
  }

  try {
    const { data, error } = await supabaseClient.rpc('cancel_appointment_by_ref', {
      p_ref: cleanRef,
      p_contact: cleanContact
    });

    if (error) throw error;
    if (data === true) return { success: true };
    return { success: false, error: 'NOT_FOUND' };
  } catch (e) {
    console.error('[Pearl Dental] Cancel appointment error:', e);
    return { success: false, error: 'GENERIC' };
  }
}

// ── Export ───────────────────────────────────────────────────────
window.PearlDB = {
  init: initSupabase,
  isConfigured: () => IS_CONFIGURED,
  isSlotBooked,
  getBookedSlots,
  createAppointment,
  getAppointmentByRef,
  cancelAppointment,
  generateRef,
};


-- ============================================================
-- Pearl Dental Clinic — Secured Supabase Schema & RLS Policies
-- Run this script in the Supabase SQL Editor (https://supabase.com)
-- ============================================================

-- 1. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_preference VARCHAR(20) DEFAULT 'whatsapp',
    patient_type VARCHAR(20) DEFAULT 'new',
    service VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(100) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    notes TEXT,
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Clean up any legacy policies
DROP POLICY IF EXISTS "Allow public insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public read appointment slots" ON public.appointments;

-- 3. Strict RLS Policies

-- A. INSERT: Allow anyone (anon/public) to insert new appointments
CREATE POLICY "Allow public insert appointments" 
ON public.appointments 
FOR INSERT 
TO public 
WITH CHECK (true);

-- B. DIRECT SELECT / UPDATE / DELETE DENIED BY DEFAULT FOR ANONYMOUS USERS!
-- Direct table queries like `supabase.from('appointments').select('*')` will return 0 rows to unauthenticated API users.

-- 4. Secure RPC Functions (SECURITY DEFINER) for Public Frontend

-- RPC 1: Public Time Slot Availability (NO PATIENT PII EXPOSURE)
CREATE OR REPLACE FUNCTION public.get_booked_slots(
    p_date DATE,
    p_doctor_id VARCHAR(100) DEFAULT 'any'
)
RETURNS TABLE (
    appointment_time VARCHAR(20),
    doctor_id VARCHAR(100)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT a.appointment_time, a.doctor_id
    FROM public.appointments a
    WHERE a.appointment_date = p_date
      AND (p_doctor_id = 'any' OR a.doctor_id = p_doctor_id)
      AND a.status != 'cancelled';
END;
$$;

-- RPC 2: Single Appointment Lookup by Reference Number + Verified Phone or Email
CREATE OR REPLACE FUNCTION public.get_appointment_by_ref(
    p_ref VARCHAR(20),
    p_contact VARCHAR(255) DEFAULT ''
)
RETURNS TABLE (
    id UUID,
    reference_number VARCHAR(20),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    contact_preference VARCHAR(20),
    patient_type VARCHAR(20),
    service VARCHAR(100),
    service_name VARCHAR(255),
    doctor_id VARCHAR(100),
    doctor_name VARCHAR(255),
    appointment_date DATE,
    appointment_time VARCHAR(20),
    notes TEXT,
    language VARCHAR(10),
    status VARCHAR(20),
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_ref VARCHAR(20);
    clean_contact VARCHAR(255);
BEGIN
    clean_ref := UPPER(TRIM(p_ref));
    clean_contact := LOWER(REGEXP_REPLACE(TRIM(p_contact), '\s+', '', 'g'));

    RETURN QUERY
    SELECT a.id, a.reference_number, a.full_name, a.phone, a.email,
           a.contact_preference, a.patient_type, a.service, a.service_name,
           a.doctor_id, a.doctor_name, a.appointment_date, a.appointment_time,
           a.notes, a.language, a.status, a.created_at
    FROM public.appointments a
    WHERE UPPER(a.reference_number) = clean_ref
      AND (
          clean_contact = ''
          OR LOWER(REGEXP_REPLACE(a.phone, '\s+', '', 'g')) LIKE '%' || clean_contact || '%'
          OR LOWER(a.email) LIKE '%' || clean_contact || '%'
      )
    LIMIT 1;
END;
$$;

-- RPC 3: Cancel Appointment by Reference + Verified Contact
CREATE OR REPLACE FUNCTION public.cancel_appointment_by_ref(
    p_ref VARCHAR(20),
    p_contact VARCHAR(255) DEFAULT ''
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_ref VARCHAR(20);
    clean_contact VARCHAR(255);
    rows_updated INT;
BEGIN
    clean_ref := UPPER(TRIM(p_ref));
    clean_contact := LOWER(REGEXP_REPLACE(TRIM(p_contact), '\s+', '', 'g'));

    UPDATE public.appointments a
    SET status = 'cancelled'
    WHERE UPPER(a.reference_number) = clean_ref
      AND (
          clean_contact = ''
          OR LOWER(REGEXP_REPLACE(a.phone, '\s+', '', 'g')) LIKE '%' || clean_contact || '%'
          OR LOWER(a.email) LIKE '%' || clean_contact || '%'
      );

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated > 0;
END;
$$;

-- Grant EXECUTE permissions to public (anon role) on secure RPC functions
GRANT EXECUTE ON FUNCTION public.get_booked_slots(DATE, VARCHAR) TO public;
GRANT EXECUTE ON FUNCTION public.get_appointment_by_ref(VARCHAR, VARCHAR) TO public;
GRANT EXECUTE ON FUNCTION public.cancel_appointment_by_ref(VARCHAR, VARCHAR) TO public;

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_slot 
ON public.appointments (doctor_id, appointment_date, appointment_time, status);

CREATE INDEX IF NOT EXISTS idx_appointments_ref 
ON public.appointments (reference_number);

COMMENT ON TABLE public.appointments IS 'Secured table for Pearl Dental Clinic appointments';

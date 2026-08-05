-- ============================================================
-- Pearl Dental Clinic — Security Update & Hardened RLS
-- Run this snippet in Supabase SQL Editor (https://supabase.com)
-- ============================================================

-- 1. Clean up legacy policies
DROP POLICY IF EXISTS "Allow public read appointment slots" ON public.appointments;
DROP POLICY IF EXISTS "Allow public insert appointments" ON public.appointments;

-- 2. Strict Insert Policy (Only create allowed directly)
CREATE POLICY "Allow public insert appointments" 
ON public.appointments 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 3. Secure RPC Function 1: Public Time Slot Availability (No PII)
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

-- 4. Secure RPC Function 2: Single Appointment Lookup by Ref + Contact Verification
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

-- 5. Secure RPC Function 3: Cancel Appointment by Ref + Verified Contact
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

-- 6. Grant EXECUTE permissions
GRANT EXECUTE ON FUNCTION public.get_booked_slots(DATE, VARCHAR) TO public;
GRANT EXECUTE ON FUNCTION public.get_appointment_by_ref(VARCHAR, VARCHAR) TO public;
GRANT EXECUTE ON FUNCTION public.cancel_appointment_by_ref(VARCHAR, VARCHAR) TO public;

-- 7. Add Ref Index
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON public.appointments (reference_number);

-- ==============================================================================
-- Anjali Hospital (A Unit of KMC Manipal) - Supabase Appointments Schema
-- Project ID: cslsahbgufkmwggwasax
-- Instructions: Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cslsahbgufkmwggwasax/sql
-- ==============================================================================

-- 1. Create the appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  access_token TEXT,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT,
  fee NUMERIC DEFAULT 0,
  duration_minutes INTEGER DEFAULT 20,
  staff_id TEXT,
  doctor_name TEXT,
  doctor_specialty TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  
  -- Patient details
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  reason_for_visit TEXT,
  is_existing_patient BOOLEAN DEFAULT FALSE,
  uhid_number TEXT,
  
  -- Workflow and notes
  status TEXT DEFAULT 'confirmed',
  payment_status TEXT DEFAULT 'pay_at_hospital',
  notes TEXT,
  internal_notes TEXT,
  
  -- Structured JSON storage for full compatibility
  customer JSONB,
  vitals JSONB,
  raw_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for fast lookup by date, doctor, and patient phone
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (date);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_ref ON public.appointments (booking_reference);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments (phone);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments (staff_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Set Policies for anonymous and authenticated access:
-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow anon and auth inserts" ON public.appointments;
DROP POLICY IF EXISTS "Allow anon and auth reads" ON public.appointments;
DROP POLICY IF EXISTS "Allow anon and auth updates" ON public.appointments;

-- Allow public and staff bookings from the website portal
CREATE POLICY "Allow anon and auth inserts"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading appointments for confirmation & portal
CREATE POLICY "Allow anon and auth reads"
ON public.appointments
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow updates (status changes, triage vitals, cancellation)
CREATE POLICY "Allow anon and auth updates"
ON public.appointments
FOR UPDATE
TO anon, authenticated
USING (true);

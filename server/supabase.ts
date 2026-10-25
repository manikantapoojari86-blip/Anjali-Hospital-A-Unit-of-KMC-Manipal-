import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Appointment } from '../src/types/index.ts';

export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'cslsahbgufkmwggwasax';
export const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_R8x21_QBRgBNkrqic0M10Q_w_AFCRQt';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export const SUPABASE_SQL_SETUP = `-- Supabase SQL Schema for Anjali Hospital (A Unit of KMC Manipal)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new

create table if not exists public.appointments (
  id text primary key,
  booking_reference text not null unique,
  access_token text,
  service_id text,
  service_name text,
  service_category text,
  fee numeric default 0,
  duration_minutes integer default 20,
  staff_id text,
  doctor_name text,
  doctor_specialty text,
  appointment_date text,
  start_time text,
  end_time text,
  patient_name text,
  patient_phone text,
  patient_email text,
  patient_age integer,
  patient_gender text,
  blood_group text,
  uhid_number text,
  reason_for_visit text,
  is_existing_patient boolean default false,
  status text default 'confirmed',
  payment_status text default 'pay_at_hospital',
  notes text,
  internal_notes text,
  customer jsonb,
  vitals jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security and configure access policies
alter table public.appointments enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Enable public insert for appointment booking" on public.appointments;
drop policy if exists "Enable read access for appointments" on public.appointments;
drop policy if exists "Enable update access for appointments" on public.appointments;

-- Allow public bookings to insert appointments
create policy "Enable public insert for appointment booking"
  on public.appointments
  for insert
  with check (true);

-- Allow reading appointments
create policy "Enable read access for appointments"
  on public.appointments
  for select
  using (true);

-- Allow updating appointment status
create policy "Enable update access for appointments"
  on public.appointments
  for update
  using (true);
`;

export interface SupabaseSyncResult {
  success: boolean;
  tableExists: boolean;
  error?: string;
  code?: string;
}

/**
 * Format an Appointment object into the database row schema
 */
export function formatAppointmentForSupabase(apt: Appointment) {
  return {
    id: apt.id,
    booking_reference: apt.bookingReference,
    access_token: apt.accessToken,
    service_id: apt.serviceId,
    service_name: apt.serviceName,
    service_category: apt.serviceCategory,
    fee: apt.fee,
    duration_minutes: apt.durationMinutes,
    staff_id: apt.staffId,
    doctor_name: apt.doctorName,
    doctor_specialty: apt.doctorSpecialty,
    appointment_date: apt.date,
    start_time: apt.startTime,
    end_time: apt.endTime,
    patient_name: apt.customer?.fullName || '',
    patient_phone: apt.customer?.phone || '',
    patient_email: apt.customer?.email || '',
    patient_age: apt.customer?.age || null,
    patient_gender: apt.customer?.gender || 'male',
    blood_group: apt.customer?.bloodGroup || '',
    uhid_number: apt.customer?.uhidNumber || '',
    reason_for_visit: apt.customer?.reasonForVisit || '',
    is_existing_patient: Boolean(apt.customer?.isExistingPatient),
    status: apt.status,
    payment_status: apt.paymentStatus,
    notes: apt.notes || '',
    internal_notes: apt.internalNotes || '',
    customer: apt.customer || {},
    vitals: apt.vitals || {},
    created_at: apt.createdAt || new Date().toISOString(),
    updated_at: apt.updatedAt || new Date().toISOString()
  };
}

/**
 * Sync an appointment to Supabase
 */
export async function syncAppointmentToSupabase(apt: Appointment): Promise<SupabaseSyncResult> {
  try {
    const row = formatAppointmentForSupabase(apt);
    const { error } = await supabase
      .from('appointments')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn(`[Supabase] Sync warning for ${apt.bookingReference}:`, error.message, `(${error.code})`);
      const isMissingTable = error.code === 'PGRST205' || error.message?.includes('schema cache');
      return {
        success: false,
        tableExists: !isMissingTable,
        error: error.message,
        code: error.code
      };
    }

    console.log(`[Supabase] Successfully stored appointment ${apt.bookingReference} in Supabase backend!`);
    return {
      success: true,
      tableExists: true
    };
  } catch (err: any) {
    console.error(`[Supabase] Unexpected sync exception for ${apt.bookingReference}:`, err);
    return {
      success: false,
      tableExists: false,
      error: err?.message || 'Network exception during Supabase sync'
    };
  }
}

/**
 * Update an appointment's status in Supabase
 */
export async function updateSupabaseAppointmentStatus(
  id: string,
  status: Appointment['status'],
  internalNotes?: string
): Promise<SupabaseSyncResult> {
  try {
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    };
    if (internalNotes !== undefined) {
      updatePayload.internal_notes = internalNotes;
    }

    const { error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.warn(`[Supabase] Status update warning for ${id}:`, error.message);
      return {
        success: false,
        tableExists: error.code !== 'PGRST205',
        error: error.message,
        code: error.code
      };
    }

    return { success: true, tableExists: true };
  } catch (err: any) {
    return { success: false, tableExists: false, error: err?.message };
  }
}

/**
 * Check connection status and whether the appointments table exists
 */
export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  tableExists: boolean;
  projectId: string;
  url: string;
  error?: string;
  sqlSetupScript: string;
  sqlEditorUrl: string;
}> {
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`;

  try {
    const { error } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return {
          connected: true,
          tableExists: false,
          projectId: SUPABASE_PROJECT_ID,
          url: SUPABASE_URL,
          error: "Table 'public.appointments' does not exist in your Supabase database yet.",
          sqlSetupScript: SUPABASE_SQL_SETUP,
          sqlEditorUrl
        };
      }

      return {
        connected: false,
        tableExists: false,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        error: error.message,
        sqlSetupScript: SUPABASE_SQL_SETUP,
        sqlEditorUrl
      };
    }

    return {
      connected: true,
      tableExists: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      sqlSetupScript: SUPABASE_SQL_SETUP,
      sqlEditorUrl
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      error: err?.message || 'Connection failed',
      sqlSetupScript: SUPABASE_SQL_SETUP,
      sqlEditorUrl
    };
  }
}

/**
 * Sync all appointments to Supabase
 */
export async function syncAllAppointmentsToSupabase(appointments: Appointment[]): Promise<{
  success: boolean;
  totalSynced: number;
  totalFailed: number;
  errors: string[];
}> {
  let totalSynced = 0;
  let totalFailed = 0;
  const errors: string[] = [];

  for (const apt of appointments) {
    const res = await syncAppointmentToSupabase(apt);
    if (res.success) {
      totalSynced++;
    } else {
      totalFailed++;
      if (res.error && !errors.includes(res.error)) {
        errors.push(res.error);
      }
    }
  }

  return {
    success: totalFailed === 0,
    totalSynced,
    totalFailed,
    errors
  };
}

/**
 * Fetch latest appointments directly from Supabase backend
 */
export async function fetchAppointmentsFromSupabase(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch appointments from Supabase' };
  }
}


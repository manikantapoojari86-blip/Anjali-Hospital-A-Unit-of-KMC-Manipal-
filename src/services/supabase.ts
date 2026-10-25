import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'cslsahbgufkmwggwasax';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_R8x21_QBRgBNkrqic0M10Q_w_AFCRQt';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false
  }
});

export async function fetchSupabaseBackendStatus(): Promise<{
  connected: boolean;
  tableExists: boolean;
  projectId: string;
  url: string;
  error?: string;
  sqlSetupScript: string;
  sqlEditorUrl: string;
}> {
  const res = await fetch('/api/supabase/status');
  if (!res.ok) {
    throw new Error('Failed to fetch Supabase status');
  }
  return res.json();
}

export async function triggerSupabaseSyncAll(): Promise<{
  success: boolean;
  totalSynced: number;
  message: string;
}> {
  const res = await fetch('/api/supabase/sync-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sync with Supabase');
  }
  return data;
}

export async function fetchSupabaseLiveAppointments(): Promise<{
  success: boolean;
  appointments: any[];
  error?: string;
}> {
  const res = await fetch('/api/supabase/appointments');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch Supabase appointments');
  }
  return res.json();
}

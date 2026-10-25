import type {
  BusinessSettings,
  HospitalService,
  DoctorStaff,
  Appointment,
  PatientReview,
  TimeSlot,
  AdminStats,
  CustomerInfo,
  AuditLog,
  StaffAccount,
  StaffSessionUser,
  ClinicalVitals
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchHospitalConfig(): Promise<{
  settings: BusinessSettings;
  services: HospitalService[];
  staff: DoctorStaff[];
  reviews: PatientReview[];
}> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Failed to load hospital configuration.');
  return res.json();
}

export async function fetchAvailableSlots(
  date: string,
  serviceId: string,
  staffId?: string
): Promise<{ date: string; serviceId: string; slots: TimeSlot[] }> {
  const params = new URLSearchParams({ date, serviceId });
  if (staffId && staffId !== 'any') {
    params.set('staffId', staffId);
  }
  const res = await fetch(`${API_BASE}/availability?${params.toString()}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch available slots.');
  }
  return res.json();
}

export async function createAppointment(data: {
  serviceId: string;
  staffId?: string;
  date: string;
  startTime: string;
  customer: CustomerInfo;
  notes?: string;
}): Promise<{ success: boolean; appointment: Appointment; supabaseSynced?: boolean }> {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to create appointment.');
  }
  return body;
}

export async function fetchAppointmentByRef(
  reference: string,
  phone?: string,
  token?: string
): Promise<Appointment> {
  const params = new URLSearchParams();
  if (phone) params.set('phone', phone);
  if (token) params.set('token', token);

  const url = `${API_BASE}/appointments/${encodeURIComponent(reference)}?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Appointment not found.');
  }
  return data;
}

export async function cancelAppointment(
  reference: string,
  reason: string,
  phone?: string
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/appointments/${encodeURIComponent(reference)}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, phone })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to cancel appointment.');
  }
  return data;
}

export async function rescheduleAppointment(
  reference: string,
  newDate: string,
  newStartTime: string,
  phone?: string
): Promise<{ success: boolean; appointment: Appointment }> {
  const res = await fetch(`${API_BASE}/appointments/${encodeURIComponent(reference)}/reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newDate, newStartTime, phone })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reschedule appointment.');
  }
  return data;
}

// --- Secure Staff Portal API ---

export async function staffLogin(
  loginIdentifier: string,
  password: string
): Promise<{ success: boolean; token: string; user: StaffSessionUser }> {
  const res = await fetch(`${API_BASE}/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginIdentifier, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Staff authentication failed.');
  return data;
}

export async function staffLogout(token: string): Promise<void> {
  await fetch(`${API_BASE}/staff/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => {});
}

export async function fetchStaffProfile(token: string): Promise<StaffSessionUser> {
  const res = await fetch(`${API_BASE}/staff/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Session invalid or expired.');
  const data = await res.json();
  return data.user;
}

export async function staffChangePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/staff/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Password update failed.');
  return data;
}

export async function fetchStaffOverview(token: string): Promise<{
  user: StaffSessionUser;
  stats: AdminStats;
  todayAppointments: Appointment[];
  recentBookings: Appointment[];
}> {
  const res = await fetch(`${API_BASE}/staff/overview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load staff overview.');
  }
  return res.json();
}

export async function fetchStaffAppointments(
  token: string,
  filters?: { date?: string; status?: string; staffId?: string; search?: string }
): Promise<Appointment[]> {
  const params = new URLSearchParams();
  if (filters?.date) params.set('date', filters.date);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.staffId) params.set('staffId', filters.staffId);
  if (filters?.search) params.set('search', filters.search);

  const res = await fetch(`${API_BASE}/staff/appointments?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch appointments.');
  }
  return res.json();
}

export async function staffCreateAppointment(
  token: string,
  data: any
): Promise<{ success: boolean; appointment: Appointment }> {
  const res = await fetch(`${API_BASE}/staff/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to save appointment.');
  return body;
}

export async function staffUpdateAppointmentStatus(
  token: string,
  id: string,
  status: Appointment['status'],
  internalNotes?: string
): Promise<{ success: boolean; appointment: Appointment }> {
  const res = await fetch(`${API_BASE}/staff/appointments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status, internalNotes })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update status.');
  return body;
}

export async function staffRecordVitals(
  token: string,
  id: string,
  vitals: ClinicalVitals
): Promise<{ success: boolean; appointment: Appointment }> {
  const res = await fetch(`${API_BASE}/staff/appointments/${encodeURIComponent(id)}/vitals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(vitals)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to record vitals.');
  return body;
}

// --- Administrator-Only Staff Management API ---

export async function fetchAdminStaffAccounts(token: string): Promise<StaffAccount[]> {
  const res = await fetch(`${API_BASE}/admin/staff-accounts`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch staff accounts.');
  }
  return res.json();
}

export async function adminCreateStaffAccount(
  token: string,
  data: {
    employeeId: string;
    fullName: string;
    email: string;
    role: string;
    department: string;
    staffProfileId?: string;
    initialPassword?: string;
  }
): Promise<{ success: boolean; account: StaffAccount }> {
  const res = await fetch(`${API_BASE}/admin/staff-accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to create staff account.');
  return body;
}

export async function adminUpdateStaffAccount(
  token: string,
  id: string,
  data: Partial<StaffAccount>
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/admin/staff-accounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update staff account.');
  return body;
}

export async function adminResetStaffPassword(
  token: string,
  id: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/staff-accounts/${encodeURIComponent(id)}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ newPassword })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to reset staff password.');
  return body;
}

export async function adminUpdateServices(token: string, services: HospitalService[]): Promise<HospitalService[]> {
  const res = await fetch(`${API_BASE}/admin/services`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(services)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update services.');
  return body.services;
}

export async function adminUpdateStaff(token: string, staff: DoctorStaff[]): Promise<DoctorStaff[]> {
  const res = await fetch(`${API_BASE}/admin/staff`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(staff)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update staff.');
  return body.staff;
}

export async function adminUpdateSettings(token: string, settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update settings.');
  return body.settings;
}

export async function fetchAdminAuditLogs(token: string): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load audit logs.');
  }
  return res.json();
}

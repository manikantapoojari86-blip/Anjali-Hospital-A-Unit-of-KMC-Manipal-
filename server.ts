import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import {
  checkSupabaseStatus,
  syncAllAppointmentsToSupabase,
  fetchAppointmentsFromSupabase
} from './server/supabase.ts';
import type { StaffSessionUser, StaffRole } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Extend express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: StaffSessionUser;
      token?: string;
    }
  }
}

// Authentication Middleware
function authenticateStaff(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in with your hospital staff account.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const user = db.verifySession(token);

  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid credentials. Please re-authenticate.' });
  }

  req.user = user;
  req.token = token;
  next();
}

// Role Authorization Middleware
function requireRoles(...allowedRoles: StaffRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      db.addAuditLog(
        'ACCESS_DENIED',
        req.user.employeeId,
        `Forbidden attempt to access ${req.method} ${req.path} requiring roles [${allowedRoles.join(', ')}].`
      );
      return res.status(403).json({
        error: `Access Denied: Your staff role (${req.user.role}) is not authorized for this operation.`
      });
    }

    next();
  };
}

// --- Supabase Cloud Backend Endpoints ---
app.get('/api/supabase/status', async (_req: Request, res: Response) => {
  const status = await checkSupabaseStatus();
  res.json(status);
});

app.get('/api/supabase/appointments', async (_req: Request, res: Response) => {
  const result = await fetchAppointmentsFromSupabase();
  if (!result.success) {
    return res.status(500).json({ error: result.error || 'Failed to fetch appointments from Supabase' });
  }
  res.json({ success: true, appointments: result.data || [] });
});

app.post('/api/supabase/sync-all', async (_req: Request, res: Response) => {
  const allAppointments = db.getAllAppointments();
  const result = await syncAllAppointmentsToSupabase(allAppointments);
  res.json({
    success: result.success,
    totalSynced: result.totalSynced,
    totalFailed: result.totalFailed,
    errors: result.errors,
    message: `Processed ${allAppointments.length} appointments (${result.totalSynced} synced to Supabase).`
  });
});

// --- Public Endpoints (Patients & Website Visitors) ---

// Hospital Public Config
app.get('/api/config', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  const services = db.getServices(true);
  const staff = db.getStaff(true);
  const reviews = db.getReviews();
  res.json({
    settings,
    services,
    staff,
    reviews
  });
});

// Services Catalog
app.get('/api/services', (_req: Request, res: Response) => {
  res.json(db.getServices(true));
});

// Doctors List
app.get('/api/staff', (_req: Request, res: Response) => {
  res.json(db.getStaff(true));
});

// Reviews
app.get('/api/reviews', (_req: Request, res: Response) => {
  res.json(db.getReviews());
});

// Available Slots
app.get('/api/availability', (req: Request, res: Response) => {
  const { date, serviceId, staffId } = req.query;
  if (!date || !serviceId) {
    return res.status(400).json({ error: 'date and serviceId are required parameters.' });
  }

  try {
    const slots = db.getAvailableSlots(
      String(date),
      String(serviceId),
      staffId ? String(staffId) : undefined
    );
    res.json({ date, serviceId, slots });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to calculate available slots.' });
  }
});

// Public Appointment Booking
app.post('/api/appointments', async (req: Request, res: Response) => {
  const { serviceId, staffId, date, startTime, customer, notes } = req.body;

  if (!serviceId || !date || !startTime || !customer) {
    return res.status(400).json({ error: 'Missing mandatory booking fields.' });
  }

  if (!customer.fullName || !customer.phone) {
    return res.status(400).json({ error: 'Patient name and contact phone number are required.' });
  }

  try {
    const result = await db.createAppointment({
      serviceId,
      staffId,
      date,
      startTime,
      customer,
      notes
    });

    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment reserved successfully at Anjali Hospital (A Unit of KMC Manipal).',
      appointment: result.appointment,
      supabaseSynced: result.supabaseSynced
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Server error while processing appointment.' });
  }
});

// Secure Lookup by Reference / Token
app.get('/api/appointments/:ref', (req: Request, res: Response) => {
  const ref = req.params.ref;
  const token = req.query.token as string | undefined;
  const phone = req.query.phone as string | undefined;

  let apt = db.getAppointmentByRef(ref);
  if (!apt && token) {
    apt = db.getAppointmentByToken(token);
  }

  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found. Please verify the booking reference.' });
  }

  if (phone) {
    const cleanQuery = phone.replace(/\D/g, '');
    const cleanPatient = apt.customer.phone.replace(/\D/g, '');
    if (!cleanPatient.endsWith(cleanQuery) && !cleanQuery.endsWith(cleanPatient)) {
      return res.status(403).json({ error: 'Phone number does not match this booking record.' });
    }
  }

  res.json(apt);
});

// Patient Self-Service Cancel
app.post('/api/appointments/:ref/cancel', async (req: Request, res: Response) => {
  const ref = req.params.ref;
  const { reason, phone } = req.body;

  const apt = db.getAppointmentByRef(ref);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  if (phone) {
    const cleanQuery = phone.replace(/\D/g, '');
    const cleanPatient = apt.customer.phone.replace(/\D/g, '');
    if (!cleanPatient.endsWith(cleanQuery) && !cleanQuery.endsWith(cleanPatient)) {
      return res.status(403).json({ error: 'Phone number verification failed.' });
    }
  }

  const result = await db.cancelAppointment(ref, reason || 'Cancelled by patient', apt.customer.fullName);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: 'Appointment cancelled successfully.' });
});

// Patient Self-Service Reschedule
app.post('/api/appointments/:ref/reschedule', async (req: Request, res: Response) => {
  const ref = req.params.ref;
  const { newDate, newStartTime, phone } = req.body;

  if (!newDate || !newStartTime) {
    return res.status(400).json({ error: 'New date and time slot are required for rescheduling.' });
  }

  const apt = db.getAppointmentByRef(ref);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  if (phone) {
    const cleanQuery = phone.replace(/\D/g, '');
    const cleanPatient = apt.customer.phone.replace(/\D/g, '');
    if (!cleanPatient.endsWith(cleanQuery) && !cleanQuery.endsWith(cleanPatient)) {
      return res.status(403).json({ error: 'Phone number verification failed.' });
    }
  }

  const result = await db.rescheduleAppointment(ref, newDate, newStartTime, apt.customer.fullName);
  if (!result.success) {
    return res.status(409).json({ error: result.error });
  }

  res.json({
    success: true,
    message: 'Appointment rescheduled successfully.',
    appointment: result.appointment
  });
});

// --- Secure Staff Portal Authentication Endpoints ---

// Staff Login
app.post('/api/staff/login', (req: Request, res: Response) => {
  const loginIdentifier = req.body.loginIdentifier || req.body.email;
  const { password } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: 'Please enter your Employee ID / Work Email and Password.' });
  }

  const result = db.loginStaff(loginIdentifier, password, ip);
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({
    success: true,
    token: result.token,
    user: result.user
  });
});

// Staff Logout
app.post('/api/staff/logout', authenticateStaff, (req: Request, res: Response) => {
  if (req.token) {
    db.revokeSession(req.token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Current Staff Profile
app.get('/api/staff/me', authenticateStaff, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// Staff Self Password Change
app.post('/api/staff/change-password', authenticateStaff, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  const result = db.loginStaff(req.user!.email, currentPassword);
  if (!result.success) {
    return res.status(400).json({ error: 'Current password verification failed.' });
  }

  const resetResult = await db.resetStaffPassword(req.user!, req.user!.id, newPassword);
  if (!resetResult.success) {
    return res.status(400).json({ error: resetResult.error });
  }

  res.json({ success: true, message: 'Password updated successfully. Please re-authenticate.' });
});

// --- Role-Enforced Staff Workflows ---

// Staff Dashboard Overview
app.get('/api/staff/overview', authenticateStaff, (req: Request, res: Response) => {
  const stats = db.getAdminStats();
  const today = new Date().toISOString().split('T')[0];
  const userAppointments = db.getAppointmentsForStaff(req.user!, { date: today });
  const recentBookings = db.getAppointmentsForStaff(req.user!).slice(0, 10);

  res.json({
    user: req.user,
    stats,
    todayAppointments: userAppointments,
    recentBookings
  });
});

// Staff Appointments List (Scoped by role)
app.get('/api/staff/appointments', authenticateStaff, (req: Request, res: Response) => {
  const { date, status, staffId, search } = req.query;
  const list = db.getAppointmentsForStaff(req.user!, {
    date: date ? String(date) : undefined,
    status: status ? String(status) : undefined,
    staffId: staffId ? String(staffId) : undefined,
    search: search ? String(search) : undefined
  });
  res.json(list);
});

// Create Walk-in / Phone Booking (Receptionist & Administrator)
app.post(
  '/api/staff/appointments',
  authenticateStaff,
  requireRoles('receptionist', 'administrator'),
  async (req: Request, res: Response) => {
    const { serviceId, staffId, date, startTime, customer, notes, internalNotes } = req.body;
    const result = await db.createAppointment({
      serviceId,
      staffId,
      date,
      startTime,
      customer,
      notes
    });

    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    if (internalNotes && result.appointment) {
      await db.updateAppointmentStatusForStaff(
        req.user!,
        result.appointment.id,
        result.appointment.status,
        internalNotes
      );
    }

    res.status(201).json({
      success: true,
      appointment: result.appointment,
      supabaseSynced: result.supabaseSynced
    });
  }
);

// Update Status (Role-restricted)
app.patch('/api/staff/appointments/:id', authenticateStaff, async (req: Request, res: Response) => {
  const id = req.params.id;
  const { status, internalNotes } = req.body;

  const result = await db.updateAppointmentStatusForStaff(
    req.user!,
    id,
    status,
    internalNotes
  );

  if (!result.success) {
    return res.status(403).json({ error: result.error });
  }

  res.json({ success: true, appointment: result.appointment });
});

// Record Nursing Vitals (Nurse, Doctor, Administrator)
app.post(
  '/api/staff/appointments/:id/vitals',
  authenticateStaff,
  requireRoles('nurse', 'doctor', 'administrator'),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const vitals = req.body;

    const result = await db.recordVitals(req.user!, id, vitals);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, appointment: result.appointment });
  }
);

// --- Administrator-Only Staff & System Management ---

// List Staff Accounts
app.get(
  '/api/admin/staff-accounts',
  authenticateStaff,
  requireRoles('administrator'),
  (_req: Request, res: Response) => {
    res.json(db.getStaffAccounts());
  }
);

// Create Staff Account
app.post(
  '/api/admin/staff-accounts',
  authenticateStaff,
  requireRoles('administrator'),
  async (req: Request, res: Response) => {
    const result = await db.createStaffAccount(req.user!, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result);
  }
);

// Update Staff Account (Role, Status, Department)
app.patch(
  '/api/admin/staff-accounts/:id',
  authenticateStaff,
  requireRoles('administrator'),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await db.updateStaffAccount(req.user!, id, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true });
  }
);

// Admin Reset Staff Password
app.post(
  '/api/admin/staff-accounts/:id/reset-password',
  authenticateStaff,
  requireRoles('administrator'),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const { newPassword } = req.body;
    const result = await db.resetStaffPassword(req.user!, id, newPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, message: 'Password reset successfully.' });
  }
);

// Manage Services
app.get(
  '/api/admin/services',
  authenticateStaff,
  requireRoles('administrator'),
  (_req: Request, res: Response) => {
    res.json(db.getServices(false));
  }
);

app.put(
  '/api/admin/services',
  authenticateStaff,
  requireRoles('administrator'),
  async (req: Request, res: Response) => {
    const services = req.body;
    if (!Array.isArray(services)) {
      return res.status(400).json({ error: 'Expected array of services.' });
    }
    const updated = await db.updateServices(services, req.user!.employeeId);
    res.json({ success: true, services: updated });
  }
);

// Manage Doctor Profiles & Working Hours
app.get(
  '/api/admin/staff',
  authenticateStaff,
  requireRoles('administrator', 'doctor'),
  (_req: Request, res: Response) => {
    res.json(db.getStaff(false));
  }
);

app.put(
  '/api/admin/staff',
  authenticateStaff,
  requireRoles('administrator'),
  async (req: Request, res: Response) => {
    const staff = req.body;
    if (!Array.isArray(staff)) {
      return res.status(400).json({ error: 'Expected array of staff.' });
    }
    const updated = await db.updateStaff(staff, req.user!.employeeId);
    res.json({ success: true, staff: updated });
  }
);

// Manage Settings
app.put(
  '/api/admin/settings',
  authenticateStaff,
  requireRoles('administrator'),
  async (req: Request, res: Response) => {
    const newSettings = req.body;
    const updated = await db.updateSettings(newSettings, req.user!.employeeId);
    res.json({ success: true, settings: updated });
  }
);

// Security & Audit Logs
app.get(
  '/api/admin/audit-logs',
  authenticateStaff,
  requireRoles('administrator'),
  (_req: Request, res: Response) => {
    res.json(db.getAuditLogs());
  }
);

// Export Appointments CSV
app.get(
  '/api/export/appointments.csv',
  authenticateStaff,
  requireRoles('administrator'),
  (req: Request, res: Response) => {
    const appointments = db.getAppointmentsForStaff(req.user!);
    const headers = [
      'Reference',
      'Date',
      'Time',
      'Patient Name',
      'Phone',
      'Age',
      'Gender',
      'UHID',
      'Service',
      'Doctor',
      'Status',
      'Fee',
      'Payment Status',
      'Vitals BP',
      'Vitals Pulse',
      'Notes'
    ];

    const rows = appointments.map(a => [
      `"${a.bookingReference}"`,
      `"${a.date}"`,
      `"${a.startTime} - ${a.endTime}"`,
      `"${a.customer.fullName}"`,
      `"${a.customer.phone}"`,
      a.customer.age,
      `"${a.customer.gender}"`,
      `"${a.customer.uhidNumber || ''}"`,
      `"${a.serviceName}"`,
      `"${a.doctorName}"`,
      `"${a.status}"`,
      a.fee,
      `"${a.paymentStatus}"`,
      `"${a.vitals?.bp || ''}"`,
      `"${a.vitals?.pulse || ''}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="anjali_hospital_appointments.csv"');
    res.send(csv);
  }
);

// --- Server Lifecycle & Dev Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🏥 Anjali Hospital Secure Staff Portal running at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

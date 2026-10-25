export interface BusinessSettings {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  inaugurationNote: string;
  parentAffiliation: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  whatsapp: string;
  email: string;
  mapsUrl: string;
  directionsUrl?: string;
  mapsEmbedQuery: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  operatingHours: {
    [day: string]: {
      open: string;
      close: string;
      emergency: string;
      dialysis: string;
      isClosed?: boolean;
    };
  };
  currency: string;
  timezone: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  allowReschedule: boolean;
  rescheduleNoticeHours: number;
  cancellationPolicy: string;
  paymentMode: 'pay_at_hospital' | 'online_optional' | 'deposit_required';
  onlineDepositAmount?: number;
}

export interface HospitalService {
  id: string;
  name: string;
  shortCode: string;
  category: 'Specialized Care' | 'Emergency' | 'Specialty OPD' | 'Primary Care' | 'Diagnostics';
  description: string;
  clinicalDetails: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  assignedStaffIds: string[];
  preparationNotes?: string;
  image?: string;
}

export interface DoctorStaff {
  id: string;
  name: string;
  title: string;
  degrees: string;
  department: string;
  specialty: string;
  isVisitingKMC: boolean;
  availableDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  workingHours: {
    start: string; // e.g. "09:00"
    end: string;   // e.g. "17:00"
    breakStart?: string; // e.g. "13:00"
    breakEnd?: string;   // e.g. "14:00"
  };
  serviceIds: string[];
  bio: string;
  isActive: boolean;
  avatarColor?: string;
}

export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'pay_at_hospital' | 'paid' | 'exempt_subsidized';

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  reasonForVisit: string;
  isExistingPatient: boolean;
  uhidNumber?: string; // Hospital Unique Health Identification Number if existing
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "09:20"
  available: boolean;
  reason?: string;
}

export type StaffRole = 'administrator' | 'doctor' | 'receptionist' | 'nurse' | 'technician';

export interface StaffAccount {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: StaffRole;
  department: string;
  staffProfileId?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface StaffSessionUser {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: StaffRole;
  department: string;
  staffProfileId?: string;
}

export interface ClinicalVitals {
  bp?: string;
  pulse?: number;
  temp?: number;
  spo2?: number;
  rbs?: number;
  triageCategory?: 'Routine' | 'Priority' | 'Emergency';
  recordedBy?: string;
  recordedAt?: string;
}

export interface Appointment {
  id: string;
  bookingReference: string;
  accessToken: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  fee: number;
  durationMinutes: number;
  staffId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  customer: CustomerInfo;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  internalNotes?: string;
  vitals?: ClinicalVitals;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  text: string;
  serviceMentioned?: string;
  verifiedLocal: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface AdminStats {
  todayAppointmentsCount: number;
  upcomingCount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
  totalAppointmentsCount: number;
  estimatedOpdRevenue: number;
  dialysisBookedCount: number;
}

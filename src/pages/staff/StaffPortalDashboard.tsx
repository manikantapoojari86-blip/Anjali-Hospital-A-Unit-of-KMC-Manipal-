import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import {
  fetchStaffOverview,
  fetchStaffAppointments,
  staffCreateAppointment,
  staffUpdateAppointmentStatus,
  staffRecordVitals,
  staffChangePassword,
  fetchAdminStaffAccounts,
  adminCreateStaffAccount,
  adminUpdateStaffAccount,
  adminResetStaffPassword,
  adminUpdateServices,
  adminUpdateStaff,
  adminUpdateSettings,
  fetchAdminAuditLogs
} from '../../services/api.ts';
import {
  fetchSupabaseBackendStatus,
  triggerSupabaseSyncAll,
  fetchSupabaseLiveAppointments
} from '../../services/supabase.ts';
import type {
  Appointment,
  HospitalService,
  DoctorStaff,
  BusinessSettings,
  AuditLog,
  AdminStats,
  StaffAccount,
  StaffRole,
  ClinicalVitals
} from '../../types/index.ts';
import {
  Activity,
  Calendar,
  Clock,
  User,
  Users,
  Settings,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  KeyRound,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Lock,
  UserPlus,
  ShieldAlert,
  FileText,
  UserCheck,
  Edit,
  Power,
  Database,
  Copy,
  ExternalLink,
  RefreshCw,
  Check
} from 'lucide-react';

export const StaffPortalDashboard: React.FC = () => {
  const { staffToken, currentStaffUser, logoutStaffUser, showToast, refreshConfig, settings: globalSettings, navigateTo } = useHospital();

  if (!staffToken || !currentStaffUser) {
    navigateTo('staff-login');
    return null;
  }

  const role = currentStaffUser.role;

  // Active Tab state tailored by role
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (role === 'doctor') return 'my-appointments';
    if (role === 'receptionist') return 'opd-register';
    if (role === 'nurse') return 'nursing-queue';
    return 'overview';
  });

  // Overview Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  // Appointments list
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Clinical Doctor Notes & Status
  const [doctorNotesText, setDoctorNotesText] = useState('');

  // Nursing Vitals Modal State
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalsBp, setVitalsBp] = useState('120/80');
  const [vitalsPulse, setVitalsPulse] = useState('72');
  const [vitalsTemp, setVitalsTemp] = useState('98.4');
  const [vitalsSpo2, setVitalsSpo2] = useState('99');
  const [vitalsRbs, setVitalsRbs] = useState('110');
  const [vitalsTriage, setVitalsTriage] = useState<'Routine' | 'Priority' | 'Emergency'>('Routine');

  // Walk-in / Phone modal
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInServiceId, setWalkInServiceId] = useState('');
  const [walkInStaffId, setWalkInStaffId] = useState('any');
  const [walkInDate, setWalkInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [walkInTime, setWalkInTime] = useState('11:00');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAge, setWalkInAge] = useState('40');
  const [walkInGender, setWalkInGender] = useState<'male' | 'female' | 'other'>('male');
  const [walkInReason, setWalkInReason] = useState('Walk-in Outpatient Consultation');
  const [walkInNotes, setWalkInNotes] = useState('');

  // Admin: Staff Accounts Management State
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);
  const [showNewStaffModal, setShowNewStaffModal] = useState(false);
  const [newStaffEmpId, setNewStaffEmpId] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('doctor');
  const [newStaffDept, setNewStaffDept] = useState('General Medicine');
  const [newStaffDoctorId, setNewStaffDoctorId] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('KmcAnjali@2026');

  // Admin: Password Reset Modal for another staff
  const [resettingStaffAccount, setResettingStaffAccount] = useState<StaffAccount | null>(null);
  const [newStaffTempPassword, setNewStaffTempPassword] = useState('AnjaliReset@2026');

  // Self Password Change Modal
  const [showSelfPasswordModal, setShowSelfPasswordModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Editable Services, Staff, Settings, Audit
  const [editableServices, setEditableServices] = useState<HospitalService[]>([]);
  const [editableStaff, setEditableStaff] = useState<DoctorStaff[]>([]);
  const [editableSettings, setEditableSettings] = useState<Partial<BusinessSettings>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Supabase Backend Integration State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tableExists: boolean;
    projectId: string;
    url: string;
    error?: string;
    sqlSetupScript: string;
    sqlEditorUrl: string;
  } | null>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseAppointments, setSupabaseAppointments] = useState<any[]>([]);
  const [isLoadingSupabaseApts, setIsLoadingSupabaseApts] = useState(false);

  const loadSupabaseAppointments = async () => {
    setIsLoadingSupabaseApts(true);
    try {
      const res = await fetchSupabaseLiveAppointments();
      if (res.success && res.appointments) {
        setSupabaseAppointments(res.appointments);
      }
    } catch (err: any) {
      console.warn('Could not query Supabase appointments:', err);
    } finally {
      setIsLoadingSupabaseApts(false);
    }
  };

  const loadSupabaseStatus = async () => {
    setIsCheckingSupabase(true);
    try {
      const st = await fetchSupabaseBackendStatus();
      setSupabaseStatus(st);
      loadSupabaseAppointments();
    } catch (err: any) {
      console.warn('Could not query Supabase status:', err);
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  const handleSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const res = await triggerSupabaseSyncAll();
      showToast(res.message, res.success ? 'success' : 'info');
      loadSupabaseStatus();
      loadSupabaseAppointments();
    } catch (err: any) {
      showToast(err?.message || 'Failed to sync with Supabase', 'error');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  // Load Overview & Appointments
  const loadPortalData = async () => {
    setIsLoading(true);
    try {
      const overview = await fetchStaffOverview(staffToken);
      setStats(overview.stats);
      setTodayAppointments(overview.todayAppointments);

      const list = await fetchStaffAppointments(staffToken, {
        date: filterDate || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        staffId: filterStaff !== 'all' ? filterStaff : undefined,
        search: searchQuery || undefined
      });
      setAppointments(list);

      // If Administrator, also load admin specific modules
      if (role === 'administrator') {
        const accounts = await fetchAdminStaffAccounts(staffToken);
        setStaffAccounts(accounts);

        const logs = await fetchAdminAuditLogs(staffToken);
        setAuditLogs(logs);

        loadSupabaseStatus();
      }

      // Load services & doctors
      const resSrv = await fetch('/api/services');
      const srvs = await resSrv.json();
      setEditableServices(srvs);
      if (srvs.length > 0 && !walkInServiceId) {
        setWalkInServiceId(srvs[0].id);
      }

      const resStaff = await fetch('/api/staff');
      const stf = await resStaff.json();
      setEditableStaff(stf);

      if (globalSettings) {
        setEditableSettings({ ...globalSettings });
      }
    } catch (err: any) {
      showToast(err?.message || 'Could not synchronize staff portal data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
    if (activeTab === 'supabase-cloud') {
      loadSupabaseStatus();
    }
  }, [filterDate, filterStatus, filterStaff, searchQuery, activeTab]);

  // Appointment Status Updater
  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      const res = await staffUpdateAppointmentStatus(
        staffToken,
        id,
        newStatus,
        role !== 'receptionist' ? doctorNotesText || undefined : undefined
      );
      if (res.success) {
        showToast(`Appointment status updated to ${newStatus.toUpperCase()}`, 'success');
        loadPortalData();
        if (selectedAppointment && selectedAppointment.id === id) {
          setSelectedAppointment(res.appointment);
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Permission denied or update failed.', 'error');
    }
  };

  // Record Clinical Vitals
  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const vitals: ClinicalVitals = {
        bp: vitalsBp.trim(),
        pulse: Number(vitalsPulse) || undefined,
        temp: Number(vitalsTemp) || undefined,
        spo2: Number(vitalsSpo2) || undefined,
        rbs: Number(vitalsRbs) || undefined,
        triageCategory: vitalsTriage
      };

      const res = await staffRecordVitals(staffToken, selectedAppointment.id, vitals);
      if (res.success) {
        showToast('Clinical vitals recorded in patient file.', 'success');
        setShowVitalsModal(false);
        setSelectedAppointment(res.appointment);
        loadPortalData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to record vitals.', 'error');
    }
  };

  // Walk-in creation (Receptionist & Administrator)
  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInServiceId || !walkInName || !walkInPhone) {
      showToast('Please enter mandatory patient fields.', 'error');
      return;
    }

    try {
      const res = await staffCreateAppointment(staffToken, {
        serviceId: walkInServiceId,
        staffId: walkInStaffId !== 'any' ? walkInStaffId : undefined,
        date: walkInDate,
        startTime: walkInTime,
        customer: {
          fullName: walkInName.trim(),
          phone: walkInPhone.trim(),
          age: Number(walkInAge),
          gender: walkInGender,
          reasonForVisit: walkInReason.trim(),
          isExistingPatient: false
        },
        notes: walkInReason.trim(),
        internalNotes: walkInNotes.trim()
      });

      if (res.success) {
        showToast('Walk-in consultation registered at front desk.', 'success');
        setShowWalkInModal(false);
        loadPortalData();
        setWalkInName('');
        setWalkInPhone('');
        setWalkInNotes('');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to register walk-in.', 'error');
    }
  };

  // Admin Create Staff Account
  const handleCreateStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminCreateStaffAccount(staffToken, {
        employeeId: newStaffEmpId.trim(),
        fullName: newStaffName.trim(),
        email: newStaffEmail.trim(),
        role: newStaffRole,
        department: newStaffDept.trim(),
        staffProfileId: newStaffRole === 'doctor' ? newStaffDoctorId : undefined,
        initialPassword: newStaffPassword.trim()
      });

      if (res.success) {
        showToast(`Staff account for ${newStaffName} created with role ${newStaffRole.toUpperCase()}.`, 'success');
        setShowNewStaffModal(false);
        setNewStaffEmpId('');
        setNewStaffName('');
        setNewStaffEmail('');
        loadPortalData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create staff account.', 'error');
    }
  };

  // Admin Toggle Account Active Status
  const handleToggleStaffStatus = async (account: StaffAccount) => {
    try {
      const newActive = !account.isActive;
      await adminUpdateStaffAccount(staffToken, account.id, { isActive: newActive });
      showToast(`Account for ${account.fullName} marked as ${newActive ? 'ACTIVE' : 'DEACTIVATED'}.`, 'info');
      loadPortalData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to modify account status.', 'error');
    }
  };

  // Admin Reset Staff Password
  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingStaffAccount) return;

    try {
      await adminResetStaffPassword(staffToken, resettingStaffAccount.id, newStaffTempPassword);
      showToast(`Password for ${resettingStaffAccount.fullName} reset successfully.`, 'success');
      setResettingStaffAccount(null);
    } catch (err: any) {
      showToast(err?.message || 'Password reset failed.', 'error');
    }
  };

  // Staff Self Password Change
  const handleSelfPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput !== confirmPasswordInput) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      await staffChangePassword(staffToken, currentPasswordInput, newPasswordInput);
      showToast('Password changed successfully. Please log in with your new password.', 'success');
      setShowSelfPasswordModal(false);
      logoutStaffUser();
    } catch (err: any) {
      showToast(err?.message || 'Password change failed.', 'error');
    }
  };

  // Role Badge Color Helper
  const getRoleBadge = (r: StaffRole) => {
    switch (r) {
      case 'administrator':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'doctor':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'receptionist':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'nurse':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Staff Navigation Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-white">Anjali Hospital Staff Portal</h1>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                A Unit of KMC Manipal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as <strong className="text-white">{currentStaffUser.fullName}</strong> · {currentStaffUser.department}
            </p>
          </div>
        </div>

        {/* Right Session Badges & Actions */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getRoleBadge(role)}`}>
            {role}
          </span>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
            {currentStaffUser.employeeId}
          </span>

          <span className="text-slate-800">|</span>

          <button
            onClick={() => setShowSelfPasswordModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Change Account Password"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Change Password</span>
          </button>

          <button
            onClick={logoutStaffUser}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 rounded-lg border border-rose-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Role-tailored Tab Navigation */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-2 flex flex-wrap gap-2 text-xs font-semibold">
        {/* DOCTOR TABS */}
        {role === 'doctor' && (
          <>
            <button
              onClick={() => setActiveTab('my-appointments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'my-appointments' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>My Assigned Consultations</span>
            </button>
            <button
              onClick={() => setActiveTab('doctor-schedule')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'doctor-schedule' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>My Availability & Hours</span>
            </button>
          </>
        )}

        {/* RECEPTIONIST TABS */}
        {role === 'receptionist' && (
          <>
            <button
              onClick={() => setActiveTab('opd-register')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'opd-register' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>OPD Reception Register</span>
            </button>
            <button
              onClick={() => {
                setWalkInServiceId(editableServices[0]?.id || 'srv_genmed');
                setShowWalkInModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-emerald-400 hover:bg-emerald-950/60 border border-emerald-800 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Walk-in Patient</span>
            </button>
          </>
        )}

        {/* NURSE TABS */}
        {role === 'nurse' && (
          <>
            <button
              onClick={() => setActiveTab('nursing-queue')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'nursing-queue' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{currentStaffUser.department} Patient Queue</span>
            </button>
          </>
        )}

        {/* ADMINISTRATOR TABS */}
        {role === 'administrator' && (
          <>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'overview' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview & KPIs</span>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'appointments' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>All Appointments</span>
            </button>
            <button
              onClick={() => setActiveTab('staff-accounts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'staff-accounts' ? 'bg-purple-600 text-white font-bold' : 'text-purple-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Accounts & RBAC</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'services' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Services & Fees</span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'doctors' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Doctor Rosters</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'settings' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'audit' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Security Audit Logs</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('supabase-cloud');
                loadSupabaseStatus();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer ${
                activeTab === 'supabase-cloud' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Cloud DB</span>
              {supabaseStatus && (
                <span className={`w-2 h-2 rounded-full ${supabaseStatus.tableExists ? 'bg-emerald-300' : 'bg-amber-400 animate-pulse'}`} />
              )}
            </button>
          </>
        )}
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* DOCTOR VIEW: My Assigned Appointments */}
        {(activeTab === 'my-appointments' || (role === 'doctor' && activeTab !== 'doctor-schedule')) && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-400" />
                    <span>My Assigned Patient Roster</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Patients scheduled for consultation with {currentStaffUser.fullName}.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800">
                  {appointments.length} Consultations
                </span>
              </div>
            </div>

            {/* Doctor's Appointments Table */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center">
                  No appointments currently assigned to you for this period.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="py-2.5">Time</th>
                        <th>Reference</th>
                        <th>Patient Name & Age</th>
                        <th>Chief Complaint / Symptoms</th>
                        <th>Vitals</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {appointments.map(a => (
                        <tr key={a.id} className="hover:bg-slate-900/60">
                          <td className="py-3 font-bold text-white">
                            {a.startTime} <span className="text-[10px] text-slate-400 block">{a.date}</span>
                          </td>
                          <td className="font-mono text-blue-400 font-bold">{a.bookingReference}</td>
                          <td className="font-semibold text-white">
                            {a.customer.fullName}
                            <span className="text-[10px] text-slate-400 block">
                              {a.customer.age} Yrs · {a.customer.gender} · {a.customer.phone}
                            </span>
                          </td>
                          <td className="text-slate-300 max-w-xs truncate italic">
                            "{a.customer.reasonForVisit}"
                          </td>
                          <td>
                            {a.vitals ? (
                              <span className="text-[10px] font-mono text-emerald-400 block">
                                BP {a.vitals.bp} | HR {a.vitals.pulse}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Pending</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                a.status === 'confirmed'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : a.status === 'checked_in'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : a.status === 'completed'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => {
                                setSelectedAppointment(a);
                                setDoctorNotesText(a.internalNotes || '');
                              }}
                              className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                            >
                              Clinical File
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECEPTIONIST VIEW: OPD Register */}
        {(activeTab === 'opd-register' || (role === 'receptionist' && activeTab !== 'opd-register')) && (
          <div className="space-y-6">
            {/* Reception Controls */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search patient name, phone, ref..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setWalkInServiceId(editableServices[0]?.id || 'srv_genmed');
                  setShowWalkInModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Walk-in / Phone Patient</span>
              </button>
            </div>

            {/* Receptionist Table */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400">
                  Showing {appointments.length} Appointments (Patient clinical records restricted)
                </span>
              </div>

              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center">No matching appointment records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="py-2.5">Date & Time</th>
                        <th>Reference</th>
                        <th>Patient Name</th>
                        <th>Phone Number</th>
                        <th>Service / Dept</th>
                        <th>Doctor</th>
                        <th>Fee & Payment</th>
                        <th>Status</th>
                        <th className="text-right">Desk Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {appointments.map(a => (
                        <tr key={a.id} className="hover:bg-slate-900/60">
                          <td className="py-3 font-semibold text-white">
                            {a.date} <span className="text-slate-400 text-[10px] block">{a.startTime} - {a.endTime}</span>
                          </td>
                          <td className="font-mono text-blue-400 font-bold">{a.bookingReference}</td>
                          <td className="font-bold text-white">
                            {a.customer.fullName}
                            <span className="text-[10px] text-slate-400 block">{a.customer.age}y, {a.customer.gender}</span>
                          </td>
                          <td className="font-mono text-slate-300">{a.customer.phone}</td>
                          <td className="text-slate-300">{a.serviceName}</td>
                          <td className="text-slate-300">{a.doctorName}</td>
                          <td>
                            <span className="font-bold text-white">₹{a.fee}</span>
                            <span className="text-[10px] text-emerald-400 block">{a.paymentStatus}</span>
                          </td>
                          <td>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                a.status === 'confirmed'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : a.status === 'checked_in'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : a.status === 'completed'
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="text-right space-x-1.5">
                            {a.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(a.id, 'checked_in')}
                                className="px-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded cursor-pointer"
                              >
                                Check-In
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedAppointment(a)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NURSE VIEW: Clinical Ward Queue */}
        {(activeTab === 'nursing-queue' || (role === 'nurse' && activeTab !== 'nursing-queue')) && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                <span>{currentStaffUser.department} — Clinical Nursing Queue</span>
              </h2>
              <p className="text-xs text-slate-400">
                Record vital triage parameters (Blood pressure, Pulse rate, SpO2) prior to dialysis or medical officer consultation.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center">
                  No active patients queued for {currentStaffUser.department}.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="py-2.5">Slot</th>
                        <th>Reference</th>
                        <th>Patient Name</th>
                        <th>Clinical Vitals Status</th>
                        <th>Triage</th>
                        <th>Status</th>
                        <th className="text-right">Nursing Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {appointments.map(a => (
                        <tr key={a.id} className="hover:bg-slate-900/60">
                          <td className="py-3 font-bold text-white">
                            {a.startTime} <span className="text-[10px] text-slate-400 block">{a.date}</span>
                          </td>
                          <td className="font-mono text-blue-400 font-bold">{a.bookingReference}</td>
                          <td className="font-semibold text-white">
                            {a.customer.fullName}
                            <span className="text-[10px] text-slate-400 block">{a.customer.age}y · {a.customer.gender}</span>
                          </td>
                          <td>
                            {a.vitals ? (
                              <div className="text-[11px] text-emerald-400 font-mono space-y-0.5">
                                <div>BP: {a.vitals.bp} | HR: {a.vitals.pulse} bpm</div>
                                <div className="text-[10px] text-slate-400">SpO2: {a.vitals.spo2}% | Temp: {a.vitals.temp}°F</div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-400 font-bold">Vitals Not Recorded</span>
                            )}
                          </td>
                          <td>
                            {a.vitals?.triageCategory ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                {a.vitals.triageCategory}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">-</span>
                            )}
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                              {a.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => {
                                setSelectedAppointment(a);
                                if (a.vitals) {
                                  setVitalsBp(a.vitals.bp || '120/80');
                                  setVitalsPulse(String(a.vitals.pulse || 72));
                                  setVitalsTemp(String(a.vitals.temp || 98.4));
                                  setVitalsSpo2(String(a.vitals.spo2 || 99));
                                  setVitalsTriage(a.vitals.triageCategory || 'Routine');
                                }
                                setShowVitalsModal(true);
                              }}
                              className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                            >
                              Record Vitals
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMINISTRATOR VIEW: Overview */}
        {role === 'administrator' && activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's OPD Consultations</span>
                <div className="text-3xl font-black text-white">{stats.todayAppointmentsCount}</div>
                <div className="text-[11px] text-blue-400">Scheduled for today</div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dialysis Shift Count</span>
                <div className="text-3xl font-black text-sky-400">{stats.dialysisBookedCount}</div>
                <div className="text-[11px] text-slate-400">Hemodialysis sessions</div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active Staff</span>
                <div className="text-3xl font-black text-purple-400">{staffAccounts.length || 8}</div>
                <div className="text-[11px] text-purple-400/80">Authorized accounts</div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recorded Consultation Fees</span>
                <div className="text-3xl font-black text-amber-400">₹{stats.estimatedOpdRevenue.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400">Gross outpatient value</div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white">Today's Hospital Appointments Schedule</h3>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="text-xs font-bold text-blue-400 hover:underline"
                >
                  View All Registry →
                </button>
              </div>

              {todayAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No consultations booked for today yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="py-2.5">Time</th>
                        <th>Reference</th>
                        <th>Patient</th>
                        <th>Department</th>
                        <th>Doctor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {todayAppointments.map(a => (
                        <tr key={a.id} className="hover:bg-slate-900/50">
                          <td className="py-3 font-bold text-white">{a.startTime}</td>
                          <td className="font-mono text-blue-400">{a.bookingReference}</td>
                          <td className="font-semibold text-white">{a.customer.fullName}</td>
                          <td className="text-slate-300">{a.serviceName}</td>
                          <td className="text-slate-300">{a.doctorName}</td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-900/50 text-blue-300">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMINISTRATOR: STAFF ACCOUNTS & RBAC MANAGEMENT */}
        {role === 'administrator' && activeTab === 'staff-accounts' && (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span>Authorized Hospital Staff Accounts & Roles</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Manage individual logins, roles, department authorizations, and access credentials. Public registration is permanently disabled.
                </p>
              </div>

              <button
                onClick={() => setShowNewStaffModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Staff Account</span>
              </button>
            </div>

            {/* Staff Accounts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="py-2.5">Employee ID</th>
                    <th>Full Name</th>
                    <th>Work Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {staffAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-900/60">
                      <td className="py-3 font-mono font-bold text-purple-400">{acc.employeeId}</td>
                      <td className="font-bold text-white">{acc.fullName}</td>
                      <td className="text-slate-300 font-mono text-[11px]">{acc.email}</td>
                      <td className="text-slate-300">{acc.department}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleBadge(acc.role)}`}>
                          {acc.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            acc.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {acc.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="text-[11px] text-slate-500">
                        {acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => setResettingStaffAccount(acc)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer"
                        >
                          Reset Password
                        </button>

                        <button
                          onClick={() => handleToggleStaffStatus(acc)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                            acc.isActive
                              ? 'text-rose-400 bg-rose-950/60 hover:bg-rose-900 border border-rose-800'
                              : 'text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          {acc.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADMINISTRATOR: ALL APPOINTMENTS REGISTRY */}
        {role === 'administrator' && activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search patient, phone, ref..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/api/export/appointments.csv"
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </a>

                <button
                  onClick={() => {
                    setWalkInServiceId(editableServices[0]?.id || 'srv_genmed');
                    setShowWalkInModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Walk-in</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="py-2.5">Date & Time</th>
                      <th>Reference</th>
                      <th>Patient Name</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Doctor</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {appointments.map(a => (
                      <tr key={a.id} className="hover:bg-slate-900/60">
                        <td className="py-3 font-semibold text-white">
                          {a.date} <span className="text-slate-400 text-[10px] block">{a.startTime} - {a.endTime}</span>
                        </td>
                        <td className="font-mono text-blue-400 font-bold">{a.bookingReference}</td>
                        <td className="font-bold text-white">
                          {a.customer.fullName}
                          <span className="text-[10px] text-slate-400 block">{a.customer.age}y, {a.customer.gender}</span>
                        </td>
                        <td className="text-slate-300 font-mono">{a.customer.phone}</td>
                        <td className="text-slate-200">{a.serviceName}</td>
                        <td className="text-slate-300">{a.doctorName}</td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                            {a.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => {
                              setSelectedAppointment(a);
                              setDoctorNotesText(a.internalNotes || '');
                            }}
                            className="px-3 py-1 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ADMINISTRATOR: SECURITY AUDIT LOGS */}
        {role === 'administrator' && activeTab === 'audit' && (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Hospital Security & Administrative Audit Trail</span>
            </h3>
            <div className="space-y-2 text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-blue-400 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-amber-300">
                        {log.action}
                      </span>
                      <span>Actor: {log.actor}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMINISTRATOR: SUPABASE CLOUD BACKEND */}
        {role === 'administrator' && activeTab === 'supabase-cloud' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Supabase Cloud Backend Integration</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        PostgreSQL
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live connection and automatic synchronization for patient bookings and clinical schedules.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={loadSupabaseStatus}
                    disabled={isCheckingSupabase}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                    <span>Check Connection</span>
                  </button>

                  <button
                    onClick={handleSyncSupabase}
                    disabled={isSyncingSupabase}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md transition-colors"
                  >
                    <span>{isSyncingSupabase ? 'Syncing...' : 'Sync All Appointments Now'}</span>
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-medium">Supabase Project ID</span>
                  <div className="font-mono text-white font-bold text-sm">
                    {supabaseStatus?.projectId || 'cslsahbgufkmwggwasax'}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    https://cslsahbgufkmwggwasax.supabase.co
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-medium">API Publishable Key</span>
                  <div className="font-mono text-emerald-400 font-semibold text-xs truncate">
                    sb_publishable_R8x21_...
                  </div>
                  <span className="text-[11px] text-emerald-400/80 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Configured & Authenticated</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-medium">Table 'public.appointments'</span>
                  <div className="flex items-center gap-2">
                    {supabaseStatus?.tableExists ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready & Live Sync Active</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Pending Schema Execution</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {supabaseStatus?.tableExists
                      ? 'Every booking is mirrored to Supabase'
                      : 'Run the setup SQL below in Supabase'}
                  </span>
                </div>
              </div>

              {/* Automatic Sync Notice */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 space-y-2">
                <div className="font-bold flex items-center gap-2 text-white">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Real-time Automatic Backend Sync Enabled</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Whenever a patient submits an appointment on the public website or a receptionist registers a walk-in patient, the backend creates the record locally and immediately synchronizes it to your Supabase <strong>public.appointments</strong> table.
                </p>
              </div>

              {/* Schema SQL runner card */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Supabase Database Setup Script</h4>
                    <p className="text-xs text-slate-400">
                      If you haven't created the table yet, paste this SQL into the Supabase SQL Editor:
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (supabaseStatus?.sqlSetupScript) {
                          navigator.clipboard.writeText(supabaseStatus.sqlSetupScript);
                          setCopiedSql(true);
                          showToast('Supabase SQL script copied to clipboard', 'success');
                          setTimeout(() => setCopiedSql(false), 3000);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                    </button>

                    <a
                      href="https://supabase.com/dashboard/project/cslsahbgufkmwggwasax/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm cursor-pointer"
                    >
                      <span>Open Supabase SQL Editor</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60 overflow-y-auto leading-relaxed">
                  {supabaseStatus?.sqlSetupScript || 'Loading schema...'}
                </pre>
              </div>

              {/* Live Stored Appointments in Supabase */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Live Appointments Stored in Supabase (`public.appointments`)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {supabaseAppointments.length} Record{supabaseAppointments.length === 1 ? '' : 's'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Live records fetched directly from your Supabase PostgreSQL cloud database.
                    </p>
                  </div>

                  <button
                    onClick={loadSupabaseAppointments}
                    disabled={isLoadingSupabaseApts}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupabaseApts ? 'animate-spin' : ''}`} />
                    <span>{isLoadingSupabaseApts ? 'Loading from Cloud...' : 'Refresh Supabase Records'}</span>
                  </button>
                </div>

                {isLoadingSupabaseApts && (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Querying Supabase backend...</span>
                  </div>
                )}

                {!isLoadingSupabaseApts && supabaseAppointments.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-slate-300 font-semibold">No appointments found in Supabase yet.</p>
                    <p className="text-[11px] text-slate-500">
                      Click "Sync All Appointments Now" above or book a consultation on the public site to store appointments in Supabase.
                    </p>
                  </div>
                )}

                {!isLoadingSupabaseApts && supabaseAppointments.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
                        <tr>
                          <th className="py-3 px-4">Booking Ref</th>
                          <th className="py-3 px-4">Patient Particulars</th>
                          <th className="py-3 px-4">Service & Doctor</th>
                          <th className="py-3 px-4">Date & Slot</th>
                          <th className="py-3 px-4">Cloud Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                        {supabaseAppointments.map((apt: any) => (
                          <tr key={apt.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono text-emerald-400 font-bold text-xs">
                                {apt.booking_reference}
                              </span>
                              <span className="block text-[10px] text-slate-500">
                                ID: {apt.id}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">
                                {apt.patient_name || apt.customer?.fullName || 'N/A'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {apt.patient_phone || apt.customer?.phone || ''}
                                {apt.patient_email ? ` · ${apt.patient_email}` : ''}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white font-medium">{apt.service_name}</div>
                              <div className="text-[11px] text-slate-400">{apt.doctor_name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white font-mono">{apt.appointment_date}</div>
                              <div className="text-[11px] text-slate-400">{apt.start_time} - {apt.end_time}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{apt.status || 'confirmed'}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CLINICAL APPOINTMENT DETAILS & STATUS UPDATER */}
      {selectedAppointment && !showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-xl w-full rounded-2xl p-6 sm:p-8 space-y-5 border border-slate-800 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-blue-400 font-bold text-sm">
                  {selectedAppointment.bookingReference}
                </span>
                <h3 className="font-bold text-base text-white">{selectedAppointment.serviceName}</h3>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500">Patient:</span>
                <div className="font-bold text-white text-sm">{selectedAppointment.customer.fullName}</div>
                <div className="text-slate-400">{selectedAppointment.customer.age} Yrs · {selectedAppointment.customer.phone}</div>
              </div>
              <div>
                <span className="text-slate-500">Scheduled:</span>
                <div className="font-bold text-white text-sm">{selectedAppointment.date}</div>
                <div className="text-slate-400">{selectedAppointment.startTime} - {selectedAppointment.endTime}</div>
              </div>
              <div>
                <span className="text-slate-500">Doctor:</span>
                <div className="text-slate-200 font-semibold">{selectedAppointment.doctorName}</div>
              </div>
              <div>
                <span className="text-slate-500">Fee:</span>
                <div className="text-emerald-400 font-bold text-sm">₹{selectedAppointment.fee} ({selectedAppointment.paymentStatus})</div>
              </div>
            </div>

            {/* Patient Symptoms */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block font-bold text-[11px]">Chief Patient Complaint:</span>
              <p className="text-slate-200 italic">"{selectedAppointment.customer.reasonForVisit || selectedAppointment.notes || 'None noted'}"</p>
            </div>

            {/* Vitals summary if present */}
            {selectedAppointment.vitals && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 space-y-1 text-emerald-200">
                <span className="font-bold text-[11px] block">Recorded Clinical Vitals:</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div>BP: {selectedAppointment.vitals.bp}</div>
                  <div>HR: {selectedAppointment.vitals.pulse} bpm</div>
                  <div>SpO2: {selectedAppointment.vitals.spo2}%</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Recorded by {selectedAppointment.vitals.recordedBy} at {new Date(selectedAppointment.vitals.recordedAt || '').toLocaleTimeString()}
                </div>
              </div>
            )}

            {/* Doctor Clinical Notes (Doctors & Admins only) */}
            {role !== 'receptionist' ? (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Confidential Clinical & Consultation Notes:</label>
                <textarea
                  rows={3}
                  value={doctorNotesText}
                  onChange={e => setDoctorNotesText(e.target.value)}
                  placeholder="Record diagnosis, prescription medicines, investigations ordered..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-[11px] italic">
                🔒 Clinical doctor notes are restricted to medical personnel under patient confidentiality rules.
              </div>
            )}

            {/* Status Change Buttons based on role */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-bold block">Status Actions:</span>
              <div className="flex flex-wrap gap-2">
                {role === 'receptionist' && selectedAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'checked_in')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                  >
                    Check In Patient
                  </button>
                )}

                {(role === 'doctor' || role === 'administrator') && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'checked_in')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold cursor-pointer"
                    >
                      Patient Arrived
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                    >
                      Complete & Save Consultation
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'no_show')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold cursor-pointer"
                    >
                      No Show
                    </button>
                  </>
                )}

                {role === 'administrator' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD NURSING VITALS */}
      {showVitalsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-md w-full rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Record Clinical Vitals</h3>
                <p className="text-xs text-slate-400">Patient: {selectedAppointment.customer.fullName}</p>
              </div>
              <button onClick={() => setShowVitalsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Blood Pressure (mmHg) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 120/80"
                    value={vitalsBp}
                    onChange={e => setVitalsBp(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Pulse / Heart Rate (bpm) *</label>
                  <input
                    type="number"
                    required
                    placeholder="72"
                    value={vitalsPulse}
                    onChange={e => setVitalsPulse(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="98.4"
                    value={vitalsTemp}
                    onChange={e => setVitalsTemp(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Oxygen Saturation SpO2 (%)</label>
                  <input
                    type="number"
                    placeholder="99"
                    value={vitalsSpo2}
                    onChange={e => setVitalsSpo2(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Triage Classification</label>
                <select
                  value={vitalsTriage}
                  onChange={e => setVitalsTriage(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Routine">Routine Stable</option>
                  <option value="Priority">Priority / High BP</option>
                  <option value="Emergency">Emergency Critical</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Vitals to Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN CREATE STAFF ACCOUNT */}
      {showNewStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-lg w-full rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Create Hospital Staff Account</h3>
                <p className="text-xs text-slate-400">Issue individual authorized login credentials.</p>
              </div>
              <button onClick={() => setShowNewStaffModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStaffAccount} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-DOC-105"
                    value={newStaffEmpId}
                    onChange={e => setNewStaffEmpId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Staff Role *</label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="nurse">Nurse</option>
                    <option value="administrator">Hospital Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@anjalihospitalbyndoor.in"
                    value={newStaffEmail}
                    onChange={e => setNewStaffEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology OPD, Hemodialysis, Casualty"
                  value={newStaffDept}
                  onChange={e => setNewStaffDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {newStaffRole === 'doctor' && (
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Link to Doctor Profile</label>
                  <select
                    value={newStaffDoctorId}
                    onChange={e => setNewStaffDoctorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="">Unlinked / New Specialist</option>
                    {editableStaff.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-300 block mb-1">Temporary Initial Password *</label>
                <input
                  type="text"
                  required
                  value={newStaffPassword}
                  onChange={e => setNewStaffPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewStaffModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN RESET STAFF PASSWORD */}
      {resettingStaffAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-md w-full rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Reset Staff Credentials</h3>
                <p className="text-xs text-slate-400">Employee: {resettingStaffAccount.fullName} ({resettingStaffAccount.employeeId})</p>
              </div>
              <button onClick={() => setResettingStaffAccount(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdminResetPassword} className="space-y-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">New Temporary Passphrase *</label>
                <input
                  type="text"
                  required
                  value={newStaffTempPassword}
                  onChange={e => setNewStaffTempPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 text-slate-400 text-[11px]">
                Upon resetting, any existing active login sessions for this employee will be instantly revoked across all devices.
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResettingStaffAccount(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SELF PASSWORD CHANGE */}
      {showSelfPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-md w-full rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Change Account Password</h3>
              <button onClick={() => setShowSelfPasswordModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSelfPasswordChange} className="space-y-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPasswordInput}
                  onChange={e => setCurrentPasswordInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">New Password (min 8 chars) *</label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSelfPasswordModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Update & Re-authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WALK-IN BOOKING (Receptionist & Administrator) */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-lg w-full rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Register Walk-in Patient</h3>
              <button onClick={() => setShowWalkInModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Service *</label>
                  <select
                    value={walkInServiceId}
                    onChange={e => setWalkInServiceId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {editableServices.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Doctor *</label>
                  <select
                    value={walkInStaffId}
                    onChange={e => setWalkInStaffId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="any">Any Available</option>
                    {editableStaff.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={walkInDate}
                    onChange={e => setWalkInDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Time Slot *</label>
                  <input
                    type="time"
                    required
                    value={walkInTime}
                    onChange={e => setWalkInTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Hegde"
                    value={walkInName}
                    onChange={e => setWalkInName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98451 00000"
                    value={walkInPhone}
                    onChange={e => setWalkInPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    value={walkInAge}
                    onChange={e => setWalkInAge(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Gender</label>
                  <select
                    value={walkInGender}
                    onChange={e => setWalkInGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

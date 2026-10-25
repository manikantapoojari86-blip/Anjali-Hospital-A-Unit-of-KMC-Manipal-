import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  BusinessSettings,
  HospitalService,
  DoctorStaff,
  PatientReview,
  Appointment,
  StaffSessionUser
} from '../types/index.ts';
import { fetchHospitalConfig, fetchStaffProfile, staffLogout } from '../services/api.ts';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface HospitalContextType {
  settings: BusinessSettings | null;
  services: HospitalService[];
  staff: DoctorStaff[];
  reviews: PatientReview[];
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  // Navigation
  currentPage: string;
  navigateTo: (page: string, params?: Record<string, string>) => void;
  pageParams: Record<string, string>;
  // Booking draft
  preselectedServiceId: string | null;
  setPreselectedServiceId: (id: string | null) => void;
  preselectedStaffId: string | null;
  setPreselectedStaffId: (id: string | null) => void;
  lastConfirmedAppointment: Appointment | null;
  setLastConfirmedAppointment: (apt: Appointment | null) => void;
  // Notifications
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  // Staff Auth (RBAC)
  staffToken: string | null;
  currentStaffUser: StaffSessionUser | null;
  loginStaffUser: (token: string, user: StaffSessionUser) => void;
  logoutStaffUser: () => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [services, setServices] = useState<HospitalService[]>([]);
  const [staff, setStaff] = useState<DoctorStaff[]>([]);
  const [reviews, setReviews] = useState<PatientReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // App routing state (SPA)
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/services') return 'services';
    if (path === '/about') return 'about';
    if (path === '/gallery') return 'gallery';
    if (path === '/reviews') return 'reviews';
    if (path === '/contact') return 'contact';
    if (path === '/book') return 'book';
    if (path === '/booking/confirmation') return 'confirmation';
    if (path === '/booking/manage') return 'manage';
    if (path === '/staff/login' || path === '/admin/login') return 'staff-login';
    if (path === '/staff/portal' || path.startsWith('/admin') || path.startsWith('/staff')) return 'staff-portal';
    return 'home';
  });

  const [pageParams, setPageParams] = useState<Record<string, string>>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return params;
  });

  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [preselectedStaffId, setPreselectedStaffId] = useState<string | null>(null);
  const [lastConfirmedAppointment, setLastConfirmedAppointment] = useState<Appointment | null>(null);

  // Staff Session State (Stored securely per session)
  const [staffToken, setStaffToken] = useState<string | null>(() => {
    return sessionStorage.getItem('anjali_staff_token') || localStorage.getItem('anjali_staff_token');
  });

  const [currentStaffUser, setCurrentStaffUser] = useState<StaffSessionUser | null>(() => {
    const saved = sessionStorage.getItem('anjali_staff_user') || localStorage.getItem('anjali_staff_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateTo = (page: string, params: Record<string, string> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let url = '/';
    if (page === 'services') url = '/services';
    else if (page === 'about') url = '/about';
    else if (page === 'gallery') url = '/gallery';
    else if (page === 'reviews') url = '/reviews';
    else if (page === 'contact') url = '/contact';
    else if (page === 'book') url = '/book';
    else if (page === 'confirmation') url = '/booking/confirmation';
    else if (page === 'manage') url = '/booking/manage';
    else if (page === 'staff-login') url = '/staff/login';
    else if (page === 'staff-portal') url = '/staff/portal';

    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    window.history.pushState({}, '', url);
  };

  const loginStaffUser = (token: string, user: StaffSessionUser) => {
    setStaffToken(token);
    setCurrentStaffUser(user);
    sessionStorage.setItem('anjali_staff_token', token);
    sessionStorage.setItem('anjali_staff_user', JSON.stringify(user));
  };

  const logoutStaffUser = () => {
    if (staffToken) {
      staffLogout(staffToken);
    }
    setStaffToken(null);
    setCurrentStaffUser(null);
    sessionStorage.removeItem('anjali_staff_token');
    sessionStorage.removeItem('anjali_staff_user');
    localStorage.removeItem('anjali_staff_token');
    localStorage.removeItem('anjali_staff_user');
    localStorage.removeItem('anjali_admin_token');
    localStorage.removeItem('anjali_admin_user');
    showToast('Securely signed out of hospital portal.', 'info');
    navigateTo('home');
  };

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHospitalConfig();
      setSettings(data.settings);
      setServices(data.services);
      setStaff(data.staff);
      setReviews(data.reviews);
    } catch (err: any) {
      console.error('Error fetching hospital config:', err);
      setError(err?.message || 'Could not connect to hospital service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify staff session on startup
  useEffect(() => {
    loadConfig();

    if (staffToken) {
      fetchStaffProfile(staffToken)
        .then(user => {
          setCurrentStaffUser(user);
        })
        .catch(() => {
          // Token expired or invalid
          setStaffToken(null);
          setCurrentStaffUser(null);
          sessionStorage.removeItem('anjali_staff_token');
          sessionStorage.removeItem('anjali_staff_user');
        });
    }

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/services') setCurrentPage('services');
      else if (path === '/about') setCurrentPage('about');
      else if (path === '/gallery') setCurrentPage('gallery');
      else if (path === '/reviews') setCurrentPage('reviews');
      else if (path === '/contact') setCurrentPage('contact');
      else if (path === '/book') setCurrentPage('book');
      else if (path === '/booking/confirmation') setCurrentPage('confirmation');
      else if (path === '/booking/manage') setCurrentPage('manage');
      else if (path === '/staff/login' || path === '/admin/login') setCurrentPage('staff-login');
      else if (path === '/staff/portal' || path.startsWith('/admin') || path.startsWith('/staff')) setCurrentPage('staff-portal');
      else setCurrentPage('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <HospitalContext.Provider
      value={{
        settings,
        services,
        staff,
        reviews,
        isLoading,
        error,
        refreshConfig: loadConfig,
        currentPage,
        navigateTo,
        pageParams,
        preselectedServiceId,
        setPreselectedServiceId,
        preselectedStaffId,
        setPreselectedStaffId,
        lastConfirmedAppointment,
        setLastConfirmedAppointment,
        toasts,
        showToast,
        removeToast,
        staffToken,
        currentStaffUser,
        loginStaffUser,
        logoutStaffUser
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};

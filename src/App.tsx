/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext.tsx';
import { EmergencyTopStrip } from './components/common/EmergencyTopStrip.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { NotificationToastContainer } from './components/common/NotificationToast.tsx';

// Public Pages
import { HomePage } from './pages/HomePage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { ReviewsPage } from './pages/ReviewsPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage.tsx';
import { BookingManagePage } from './pages/BookingManagePage.tsx';

// Secure Hospital Staff Portal & RBAC
import { StaffLoginPage } from './pages/staff/StaffLoginPage.tsx';
import { StaffPortalDashboard } from './pages/staff/StaffPortalDashboard.tsx';

const AppContent: React.FC = () => {
  const { currentPage, staffToken, isLoading, error } = useHospital();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/20 animate-pulse">
          +
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-extrabold text-lg tracking-tight">Anjali Hospital</h2>
          <p className="text-xs text-blue-400 font-medium">A Unit of KMC Manipal · Connecting Clinical Services...</p>
        </div>
      </div>
    );
  }

  // Private Staff Portal view (secured with authentication and RBAC)
  if (currentPage === 'staff-portal' || currentPage === 'admin') {
    if (!staffToken) {
      return (
        <div className="min-h-screen bg-slate-900">
          <StaffLoginPage />
          <NotificationToastContainer />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <StaffPortalDashboard />
        <NotificationToastContainer />
      </div>
    );
  }

  if (currentPage === 'staff-login' || currentPage === 'admin-login') {
    return (
      <div className="min-h-screen bg-slate-900">
        <StaffLoginPage />
        <NotificationToastContainer />
      </div>
    );
  }

  // Public Hospital Website View
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      <EmergencyTopStrip />
      <Navbar />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'services' && <ServicesPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'gallery' && <GalleryPage />}
        {currentPage === 'reviews' && <ReviewsPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'book' && <BookingPage />}
        {currentPage === 'confirmation' && <BookingConfirmationPage />}
        {currentPage === 'manage' && <BookingManagePage />}
      </main>

      <Footer />
      <NotificationToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <AppContent />
    </HospitalProvider>
  );
}

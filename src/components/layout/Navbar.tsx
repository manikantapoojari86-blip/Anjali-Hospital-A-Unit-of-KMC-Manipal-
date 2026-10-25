import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { Calendar, Phone, Menu, X, Activity, Clock, Lock, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPage, navigateTo, settings, staffToken, currentStaffUser } = useHospital();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services & OPD' },
    { id: 'about', label: 'About Us' },
    { id: 'gallery', label: 'Hospital Tour' },
    { id: 'reviews', label: 'Patient Reviews' },
    { id: 'contact', label: 'Contact & Directions' }
  ];

  const handleNavClick = (id: string) => {
    navigateTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Hospital Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-sky-600 flex items-center justify-center text-white shadow-md shadow-blue-500/15 group-hover:shadow-blue-500/30 transition-all">
              <Activity className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                  ANJALI HOSPITAL
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Byndoor
                </span>
              </div>
              <span className="text-xs font-semibold text-blue-600 tracking-wide flex items-center gap-1.5">
                <span>A UNIT OF KMC MANIPAL</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-normal">Kasturba Hospital</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-smooth cursor-pointer ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href={`tel:${settings?.phone || '08254251805'}`}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
              title="Direct Telephone Line"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>{settings?.phone || '082542 51805'}</span>
            </a>

            {/* Direct Staff Portal Access */}
            {staffToken && currentStaffUser ? (
              <button
                onClick={() => handleNavClick('staff-portal')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors cursor-pointer"
                title="Open Hospital Staff Portal"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{currentStaffUser.fullName.split(' ')[0]} (Staff)</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('staff-login')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Hospital Staff Portal Login"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Staff Portal</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('book')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-md shadow-blue-700/20 hover:shadow-lg hover:shadow-blue-700/30 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => handleNavClick(staffToken ? 'staff-portal' : 'staff-login')}
              className="p-2 text-slate-700 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Staff Portal"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Staff</span>
            </button>
            <button
              onClick={() => handleNavClick('book')}
              className="p-2 text-white bg-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>OPD: 8:30 AM - 6:00 PM</span>
            </div>
            <span className="font-semibold text-rose-600">Emergency: 24x7</span>
          </div>

          {/* Staff Portal Highlight in Mobile Drawer */}
          <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                Staff Portal & Clinical Console
              </span>
              <p className="text-[10px] text-slate-400">
                {staffToken && currentStaffUser
                  ? `Signed in as ${currentStaffUser.fullName}`
                  : 'Pre-registered login (Manikanta Poojari)'}
              </p>
            </div>
            <button
              onClick={() => handleNavClick(staffToken ? 'staff-portal' : 'staff-login')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {staffToken ? 'Open' : 'Login'}
            </button>
          </div>

          {navLinks.map(link => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleNavClick('manage')}
              className="w-full text-center py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Manage Existing Appointment
            </button>
            <a
              href={`tel:${settings?.phone || '08254251805'}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg border border-blue-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Reception: {settings?.phone || '082542 51805'}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

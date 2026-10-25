import React from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { PhoneCall, MapPin, ShieldCheck, CalendarCheck, Lock } from 'lucide-react';

export const EmergencyTopStrip: React.FC = () => {
  const { settings, navigateTo, staffToken, currentStaffUser } = useHospital();

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Emergency telephone with pulse */}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={`tel:${settings?.emergencyPhone?.replace(/\s+/g, '') || '08254251805'}`}
            className="flex items-center gap-2 font-semibold text-rose-400 hover:text-rose-300 transition-colors py-0.5 group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <PhoneCall className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>24/7 Emergency Casualty: {settings?.phone || '082542 51805'}</span>
          </a>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-600">·</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>A Unit of KMC Manipal / MAHE</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-600">·</span>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>NH 66, Baindur, Kundapur Tq</span>
          </div>
        </div>

        {/* Right: Manage Booking & Admin Login */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('manage')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Manage My Booking</span>
          </button>

          <span className="text-slate-700">|</span>

          {staffToken && currentStaffUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                {currentStaffUser.fullName.split(' ')[0]} ({currentStaffUser.role})
              </span>
              <button
                onClick={() => navigateTo('staff-portal')}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-0.5 rounded font-semibold cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Staff Portal</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigateTo('staff-login')}
              className="flex items-center gap-1.5 text-blue-300 hover:text-white bg-blue-950/60 border border-blue-800/80 px-2.5 py-0.5 rounded font-medium transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-blue-400" />
              <span>Staff Login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

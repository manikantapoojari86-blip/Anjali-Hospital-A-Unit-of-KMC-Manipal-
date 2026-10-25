import React from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { HOSPITAL_IMAGES } from '../../assets/imagesMap.ts';
import { HeartPulse, CheckCircle2, ShieldCheck, Calendar, PhoneCall } from 'lucide-react';

export const DialysisSpotlight: React.FC = () => {
  const { navigateTo, settings } = useHospital();

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Image with dialysis badge */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src={HOSPITAL_IMAGES.dialysis}
                alt="Modern Dialysis Ward at Anjali Hospital Byndoor"
                className="w-full h-[360px] sm:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-600 px-2.5 py-1 rounded text-white inline-block mb-1">
                  KMC Manipal Nephrology Protocol
                </span>
                <p className="text-sm font-semibold text-slate-100">
                  State-of-the-art multi-station dialysis unit serving Baindur, Uppunda, and Shiroor
                </p>
              </div>
            </div>

            {/* Floating verification badge */}
            <div className="hidden sm:flex absolute -bottom-5 -right-5 bg-white p-4 rounded-xl shadow-xl border border-slate-200 items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Certified RO Water Plant</div>
                <div className="text-[11px] text-slate-500">Ultra-pure dialysis fluid</div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                Advanced Specialty Center
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Modern Hemodialysis Care Directly in Byndoor
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prior to March 2025, chronic kidney disease patients from Byndoor had to undertake strenuous 140km round trips to Kundapura or Manipal twice every week. Through our dedicated collaboration with Kasturba Hospital (KMC Manipal), we bring advanced, hygienic hemodialysis right to your hometown.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">High-Flux Biocompatible Dialyzers:</strong> Minimized patient fatigue, optimal toxin clearance, and strictly monitored blood pressure.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Supervised by KMC Nephrology Faculty:</strong> Monthly prescription reviews and continuous guidance from Kasturba Medical College.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Convenient Daily Shift Timings:</strong> Morning (6:30 AM), Midday (11:00 AM), and Evening (4:00 PM) shifts with emergency on-call backup.
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigateTo('book', { serviceId: 'srv_dialysis' })}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Dialysis Slot</span>
              </button>

              <a
                href={`tel:${settings?.phone || '08254251805'}`}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 rounded-xl transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>Enquire Shift Availability</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

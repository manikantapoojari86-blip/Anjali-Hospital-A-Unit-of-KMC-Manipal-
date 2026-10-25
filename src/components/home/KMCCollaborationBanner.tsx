import React from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { ShieldCheck, Award, CheckCircle, ArrowRight } from 'lucide-react';

export const KMCCollaborationBanner: React.FC = () => {
  const { navigateTo } = useHospital();

  return (
    <section className="py-14 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold border border-blue-600/40">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Collaboration with Kasturba Hospital, KMC Manipal</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Tertiary Medical Excellence Closer to Your Family in Byndoor
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              In a major milestone for coastal Karnataka healthcare, Anjali Hospital officially partnered with Kasturba Hospital (KMC Manipal), inaugurated on <strong>March 8, 2025</strong> by <strong>Dr. H. S. Ballal, Pro Chancellor of MAHE Manipal</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Advanced Dialysis Unit under KMC Nephrology protocols</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Visiting Senior Specialists in Cardiology, Ortho & GI Surgery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Eliminates 70km+ travel to Kundapura or Manipal for regular care</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct referral and ambulance linkage with KMC Tertiary Hospital</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                Outreach & Visiting Clinics
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Check OPD visiting schedules for specialized cardiology, spine, orthopaedic, and surgical consultations.
              </p>
              <button
                onClick={() => navigateTo('about')}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <span>Read Full Collaboration Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

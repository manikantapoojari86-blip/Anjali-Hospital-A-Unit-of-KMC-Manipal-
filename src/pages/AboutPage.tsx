import React from 'react';
import { useHospital } from '../context/HospitalContext.tsx';
import { HOSPITAL_IMAGES } from '../assets/imagesMap.ts';
import { ShieldCheck, Award, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo, settings } = useHospital();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Hospital Background & Mission
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Anjali Hospital (A Unit of KMC Manipal)
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Serving the rural and coastal populations of Byndoor, Baindur, Kundapura Taluk, and surrounding villages with high quality healthcare, emergency trauma care, and advanced hemodialysis.
            </p>
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Historic Milestone:</strong> On <strong>March 8, 2025</strong>, the newly expanded emergency care and advanced hemodialysis facilities were formally inaugurated by <strong>Dr. H. S. Ballal, Pro Chancellor of MAHE Manipal</strong>, establishing Anjali Hospital as an official clinical unit collaborating with Kasturba Hospital, KMC Manipal.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src={HOSPITAL_IMAGES.facade}
                alt="Anjali Hospital Facade"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Why the collaboration matters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Saving Vital Travel Time
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Historically, residents of Byndoor requiring emergency trauma intervention or chronic hemodialysis had to travel over 70 kilometers to Kundapura or Manipal. Our facility brings this capability right to NH 66.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">
              KMC Clinical Standards
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All clinical guidelines, infection control protocols, dialysis water purification, and visiting specialty rotations are supervised under the strict standards of Kasturba Medical College (KMC Manipal).
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Visiting Specialist Outpatient Clinics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Regular visiting clinics in Cardiology, Orthopaedics, Obstetrics & Gynaecology, Ophthalmology, and GI Surgery give patients direct access to renowned surgeons without leaving Byndoor.
            </p>
          </div>
        </div>

        {/* Infrastructure & Facilities */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Key Infrastructure & Capabilities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              { title: '24x7 Casualty & Trauma', desc: 'Medical officer on duty round the clock with oxygen therapy, ECG, and trauma resuscitation.' },
              { title: 'Advanced Dialysis Unit', desc: 'High-flux dialyzers with dedicated Reverse Osmosis (RO) water purification plant.' },
              { title: 'Diagnostic Laboratory', desc: 'Computerized pathology testing for complete blood counts, renal panels, and biochemistry.' },
              { title: '24x7 Pharmacy & Ambulance', desc: 'Fully stocked in-house pharmacy and emergency ambulance for patient transit.' }
            ].map((facility, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{facility.title}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{facility.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 flex-wrap gap-4">
            <div className="text-xs text-slate-500">
              Address: {settings?.address || 'NH 66, Baindur, Kundapur Taluk, Udupi - 576214'}
            </div>
            <button
              onClick={() => navigateTo('book')}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
            >
              <span>Book an OPD Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

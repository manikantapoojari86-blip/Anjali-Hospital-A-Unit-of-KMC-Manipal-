import React from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { HOSPITAL_IMAGES } from '../../assets/imagesMap.ts';
import { Calendar, PhoneCall, MapPin, ShieldCheck, HeartPulse, Stethoscope, Clock } from 'lucide-react';

export const Hero: React.FC = () => {
  const { navigateTo, settings } = useHospital();

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background image with gentle dark overlay for readability */}
      <div className="absolute inset-0 z-0">
        <img
          src={HOSPITAL_IMAGES.facade}
          alt="Anjali Hospital building exterior on NH 66 Byndoor"
          className="w-full h-full object-cover object-center opacity-30 transform scale-105 filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-8 space-y-6">
            {/* Accreditation Header Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-900/70 border border-blue-500/40 text-blue-200 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>A Unit of KMC Manipal · Kasturba Hospital Clinical Alliance</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Anjali Hospital
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-400 mt-1">
                  Advanced Healthcare & Dialysis in Byndoor
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Bringing world-class tertiary medicine from Kasturba Hospital, KMC Manipal directly to Baindur. Providing round-the-clock emergency casualty, advanced dialysis, and visiting specialist OPD clinics.
              </p>
            </div>

            {/* Inauguration Note */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-3 max-w-2xl backdrop-blur-sm">
              <span className="text-sky-400 text-lg leading-none font-black shrink-0">“</span>
              <p className="italic leading-relaxed">
                Inaugurated on March 8, 2025 by Dr. H. S. Ballal, Pro Chancellor of MAHE Manipal, to enhance critical healthcare access for residents of Byndoor and coastal Karnataka.
              </p>
            </div>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigateTo('book')}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-sky-200 group-hover:scale-110 transition-transform" />
                <span>Book Doctor Consultation</span>
              </button>

              <a
                href={`tel:${settings?.phone || '08254251805'}`}
                className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 rounded-xl transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <span>24/7 Casualty: 082542 51805</span>
              </a>

              <a
                href={settings?.directionsUrl || settings?.mapsUrl || 'https://www.google.com/maps/dir/?api=1&destination=13.8662379,74.6293119'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Get Directions (NH 66)</span>
              </a>
            </div>

            {/* Quick highlight metrics */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-900/60 flex items-center justify-center text-sky-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">24x7 Hours</div>
                  <div className="text-[11px] text-slate-400">Emergency & IPD</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-900/60 flex items-center justify-center text-emerald-400">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Dialysis Unit</div>
                  <div className="text-[11px] text-slate-400">KMC Collaboration</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-900/60 flex items-center justify-center text-indigo-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Visiting OPD</div>
                  <div className="text-[11px] text-slate-400">KMC Specialists</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-900/60 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">NH 66 Baindur</div>
                  <div className="text-[11px] text-slate-400">Prime Connectivity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Booking Card / OPD Schedule snapshot */}
          <div className="lg:col-span-4">
            <div className="bg-white text-slate-900 p-6 sm:p-7 rounded-2xl shadow-2xl border border-slate-100 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[11px] font-bold tracking-wider text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
                  OPD & Dialysis Appointments
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Schedule a Consultation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select your clinical department to reserve an assured appointment slot.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { title: 'Hemodialysis Shift Booking', sub: 'High-flux dialysis with nephrologist review', icon: HeartPulse, color: 'text-sky-600', srvId: 'srv_dialysis' },
                  { title: 'Cardiology (KMC Manipal)', sub: 'Senior Cardiologist visiting OPD', icon: HeartPulse, color: 'text-rose-600', srvId: 'srv_cardio' },
                  { title: 'Orthopaedics & Joint Care', sub: 'Bone, joint & spine consultations', icon: Stethoscope, color: 'text-indigo-600', srvId: 'srv_ortho' },
                  { title: 'General Medicine & Diabetology', sub: 'Adult medicine & lifestyle disorders', icon: Stethoscope, color: 'text-emerald-600', srvId: 'srv_genmed' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => navigateTo('book', { serviceId: item.srvId })}
                      className="w-full text-left p-3 rounded-xl border border-slate-150 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500">{item.sub}</div>
                        </div>
                      </div>
                      <span className="text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Book →
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigateTo('book')}
                  className="w-full py-3 text-center text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  View All Specialties & Book
                </button>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-slate-500">
                  Prefer to book by phone? Call{' '}
                  <a href={`tel:${settings?.phone || '08254251805'}`} className="font-bold text-blue-700 hover:underline">
                    {settings?.phone || '082542 51805'}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

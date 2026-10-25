import React from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { Phone, Mail, MapPin, ExternalLink, Clock, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, navigateTo } = useHospital();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Column 1: Hospital Mission & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
                +
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg tracking-tight leading-tight">
                  ANJALI HOSPITAL
                </h3>
                <p className="text-xs font-semibold text-blue-400">A Unit of KMC Manipal</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Serving Byndoor, Baindur, Kundapura, Uppunda, and Shiroor with tertiary healthcare collaboration through Kasturba Hospital, KMC Manipal. Inaugurated by Dr. H. S. Ballal, Pro Chancellor of MAHE.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/70 border border-blue-800/80 text-blue-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>KMC Manipal Clinical Protocols</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Clinical Departments</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Hemodialysis Unit (KMC Collaboration)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  24x7 Emergency Casualty & Trauma
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cardiology OPD (Visiting Specialists)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Orthopaedics & Joint Care
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Obstetrics & Gynaecology
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Ophthalmology & Eye Clinic
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  GI Surgery & Gastroenterology
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Timings & Schedule */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Hospital Timings</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span>Emergency / Casualty:</span>
                <span className="font-semibold text-rose-400">24 Hours / 7 Days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span>Dialysis Unit:</span>
                <span className="font-semibold text-sky-300">Mon - Sun (6 AM - 10 PM)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span>OPD Consultations (Mon-Sat):</span>
                <span className="font-semibold text-slate-200">8:30 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span>Sunday OPD Clinic:</span>
                <span className="font-semibold text-slate-200">9:00 AM - 1:00 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>In-House Pharmacy & Lab:</span>
                <span className="font-semibold text-emerald-400">24x7 Open</span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Google Maps */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Location & Contact</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  {settings?.address || 'NH 66, Baindur, Kundapur Tq, Udupi - 576214, Karnataka'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <a
                  href={`tel:${settings?.phone || '08254251805'}`}
                  className="hover:text-white transition-colors font-medium text-slate-200"
                >
                  {settings?.phone || '082542 51805'} (24/7 Helpline)
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={`mailto:${settings?.email || 'consultations@anjalihospitalbyndoor.in'}`}
                  className="hover:text-white transition-colors"
                >
                  {settings?.email || 'consultations@anjalihospitalbyndoor.in'}
                </a>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={settings?.mapsUrl || 'https://maps.app.goo.gl/jVtpyUdYi1DoFa2B6'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-blue-400 border border-slate-800 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
                <a
                  href={`https://wa.me/91${(settings?.whatsapp || '8254251805').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-xs font-semibold text-emerald-300 border border-emerald-800 transition-colors"
                >
                  <span>Connect on WhatsApp</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Anjali Hospital (A Unit of KMC Manipal). All clinical rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigateTo('about')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Hospital Accreditation
            </button>
            <button
              onClick={() => navigateTo('manage')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Manage Booking
            </button>
            <button
              onClick={() => navigateTo('staff-login')}
              className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

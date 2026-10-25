import React from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { InteractiveHospitalMap } from '../common/InteractiveHospitalMap.tsx';
import { MapPin, Phone, Clock, ExternalLink, Navigation, CheckCircle } from 'lucide-react';

export const LocationHoursSection: React.FC = () => {
  const { settings } = useHospital();

  const scheduleDays = [
    { day: 'Monday', opd: '8:30 AM - 6:00 PM', dialysis: '6:00 AM - 10:00 PM', emergency: '24 Hours Open' },
    { day: 'Tuesday', opd: '8:30 AM - 6:00 PM', dialysis: '6:00 AM - 10:00 PM', emergency: '24 Hours Open' },
    { day: 'Wednesday', opd: '8:30 AM - 6:00 PM', dialysis: '6:00 AM - 10:00 PM', emergency: '24 Hours Open' },
    { day: 'Thursday', opd: '8:30 AM - 6:00 PM', dialysis: '6:00 AM - 10:00 PM', emergency: '24 Hours Open' },
    { day: 'Friday', opd: '8:30 AM - 6:00 PM', dialysis: '6:00 AM - 10:00 PM', emergency: '24 Hours Open' },
    { day: 'Saturday', opd: '8:30 AM - 6:00 PM', dialysis: '6:00 AM - 10:00 PM', emergency: '24 Hours Open' },
    { day: 'Sunday', opd: '9:00 AM - 1:00 PM', dialysis: '6:00 AM - 10:00 PM', emergency: '24 Hours Open' }
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Find Us & Timings
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Location & Operating Hours
          </h2>
          <p className="text-sm text-slate-600">
            Conveniently situated directly along National Highway 66 in Baindur, accessible for all emergency ambulances and patient transport.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Weekly Timings Table */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Weekly Clinical Hours</h3>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Casualty: 24/7
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {scheduleDays.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <span className="font-bold text-slate-800 w-24">{item.day}</span>
                  <div className="flex-1 text-slate-600 text-right space-y-0.5">
                    <div>
                      <span className="text-slate-400">OPD: </span>
                      <span className="font-medium text-slate-800">{item.opd}</span>
                    </div>
                    <div className="text-[11px] text-sky-700 font-semibold">
                      Dialysis: {item.dialysis}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Round-the-clock Services</span>
              </div>
              <p className="text-slate-600">
                Emergency casualty, in-house pharmacy, biochemistry laboratory, and inpatient admissions operate 24 hours a day, 365 days a year.
              </p>
            </div>
          </div>

          {/* Right Column: Address & Embedded Interactive Map */}
          <div className="lg:col-span-6 space-y-4">
            <InteractiveHospitalMap />

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 text-[11px]">Reception & Appointments:</div>
                <a
                  href={`tel:${settings?.phone || '08254251805'}`}
                  className="font-bold text-blue-700 text-sm hover:underline block mt-0.5"
                >
                  {settings?.phone || '082542 51805'}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-rose-600 text-[11px] font-semibold">24x7 Casualty & Trauma:</div>
                <a
                  href={`tel:${settings?.emergencyPhone || '08254251805'}`}
                  className="font-bold text-rose-700 text-sm hover:underline block mt-0.5"
                >
                  {settings?.emergencyPhone || '+91 82542 51805'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

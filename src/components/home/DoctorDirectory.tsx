import React from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { Calendar, Clock, Award, UserCheck } from 'lucide-react';

export const DoctorDirectory: React.FC = () => {
  const { staff, navigateTo } = useHospital();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Medical Faculty & Consultants
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Consult With Our Specialist Doctors
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our team comprises experienced resident consultants and visiting senior super-specialists from Kasturba Hospital (KMC Manipal).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map(doc => {
            const daysDisplay = doc.availableDays.map(d => dayNames[d]).join(', ');
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${doc.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-lg shadow-sm`}>
                        {doc.name.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-snug">
                          {doc.name}
                        </h3>
                        <p className="text-[11px] font-semibold text-blue-700">
                          {doc.degrees}
                        </p>
                      </div>
                    </div>
                  </div>

                  {doc.isVisitingKMC && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                      <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Visiting Specialist · KMC Manipal</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-800">
                      {doc.department}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {doc.specialty}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>OPD Days:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{daysDisplay}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hours:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {doc.workingHours.start} - {doc.workingHours.end}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigateTo('book', { staffId: doc.id })}
                    className="w-full py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Book with {doc.name.split(' ')[1] || doc.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

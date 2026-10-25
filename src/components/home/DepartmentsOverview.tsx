import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { HeartPulse, Stethoscope, Activity, Eye, ShieldAlert, ArrowRight, Clock, IndianRupee } from 'lucide-react';

export const DepartmentsOverview: React.FC = () => {
  const { services, navigateTo } = useHospital();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Specialized Care', 'Emergency', 'Specialty OPD', 'Primary Care'];

  const filtered = selectedCategory === 'All'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const getDepartmentIcon = (category: string) => {
    switch (category) {
      case 'Specialized Care':
        return HeartPulse;
      case 'Emergency':
        return ShieldAlert;
      case 'Specialty OPD':
        return Activity;
      default:
        return Stethoscope;
    }
  };

  return (
    <section className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
              Clinical Specializations
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Our Medical Services & OPD Clinics
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Every department operates under verified medical guidelines, supported by visiting consultants from Kasturba Hospital, KMC Manipal and experienced resident physicians.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-sm self-start md:self-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-smooth cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map(service => {
            const Icon = getDepartmentIcon(service.category);
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {service.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{service.price}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {service.durationMinutes} min
                    </span>
                  </div>

                  <button
                    onClick={() => navigateTo('book', { serviceId: service.id })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Book Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigateTo('services')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <span>View All Clinical Departments & Fees</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

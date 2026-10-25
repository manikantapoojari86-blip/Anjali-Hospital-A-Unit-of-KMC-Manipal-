import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext.tsx';
import { Search, Clock, ArrowRight, HeartPulse, Stethoscope, Activity, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { services, staff, navigateTo } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Specialized Care', 'Emergency', 'Specialty OPD', 'Primary Care', 'Diagnostics'];

  const filtered = services.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDoctorNamesForService = (staffIds: string[]) => {
    return staff
      .filter(doc => staffIds.includes(doc.id))
      .map(doc => doc.name)
      .join(', ');
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Banner */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <span>Clinical Catalog & Consultation Fees</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Medical Services & Specialty OPD Clinics
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            All consultations and medical procedures at Anjali Hospital are delivered in accordance with KMC Manipal clinical standards. Transparent fees, certified specialists, and guaranteed appointments.
          </p>

          {/* Search & Filters */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search specialty, illness, or service..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-smooth cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-blue-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services List */}
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <p className="text-slate-500 text-sm">No services matched your query "{searchTerm}".</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(service => {
              const assignedDocs = getDoctorNamesForService(service.assignedStaffIds);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                          {service.category}
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-2">
                          {service.name}
                        </h2>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-black text-slate-900">
                          ₹{service.price}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          <span>{service.durationMinutes} mins</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {service.description}
                    </p>

                    {service.clinicalDetails && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        {service.clinicalDetails}
                      </p>
                    )}

                    {assignedDocs && (
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">Consultant:</span>
                        <span>{assignedDocs}</span>
                      </div>
                    )}

                    {service.preparationNotes && (
                      <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/70 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Preparation:</strong> {service.preparationNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Online Booking Open</span>
                    </div>

                    <button
                      onClick={() => navigateTo('book', { serviceId: service.id })}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Book Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

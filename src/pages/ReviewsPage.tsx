import React from 'react';
import { useHospital } from '../context/HospitalContext.tsx';
import { Star, MapPin, ExternalLink, MessageSquareHeart, CheckCircle2 } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const { reviews, settings } = useHospital();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Verified Patient Feedback
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Community Reviews & Ratings
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Real reflections from patients and families across Byndoor, Kundapura, Baindur, and Shiroor who have experienced our outpatient and emergency services.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center shrink-0">
            <div className="text-4xl font-black text-slate-900">{settings?.rating || 3.7}</div>
            <div className="flex items-center text-amber-500 my-1">
              {'★'.repeat(4)}{'☆'}
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Based on {settings?.reviewCount || 42} Google Reviews
            </div>
            <a
              href={settings?.mapsUrl || 'https://maps.app.goo.gl/jVtpyUdYi1DoFa2B6'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <span>View & Review on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(review => (
            <div
              key={review.id}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{review.date}</span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{review.text}"
                </p>

                {review.serviceMentioned && (
                  <div className="inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Service: {review.serviceMentioned}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{review.author}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{review.location}</span>
                  </p>
                </div>
                {review.verifiedLocal && (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified Patient</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

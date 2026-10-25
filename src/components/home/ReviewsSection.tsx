import React from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { Star, MapPin, ExternalLink, CheckCircle } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { reviews, settings } = useHospital();

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Community Trust & Feedback
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Patient Experiences at Byndoor
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Authentic reviews from local families and residents across Byndoor, Baindur, Kundapura, and Shiroor who rely on our care.
            </p>
          </div>

          {/* Google Maps Rating Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4 self-start md:self-auto">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{settings?.rating || 3.7}</div>
              <div className="flex items-center text-amber-500 text-xs">
                {'★'.repeat(4)}{'☆'}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4 text-xs">
              <div className="font-bold text-slate-900">Google Maps Rating</div>
              <div className="text-slate-500">{settings?.reviewCount || 42} verified local reviews</div>
              <a
                href={settings?.mapsUrl || 'https://maps.app.goo.gl/jVtpyUdYi1DoFa2B6'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-semibold hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
              >
                <span>View Google Listing</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map(review => (
            <div
              key={review.id}
              className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-500 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">{review.date}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{review.text}"
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{review.author}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{review.location}</span>
                    </p>
                  </div>
                  {review.verifiedLocal && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Verified Local Resident">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { HOSPITAL_IMAGES } from '../assets/imagesMap.ts';
import { Eye, X, ZoomIn } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'img_facade',
      title: 'Hospital Building Exterior & Ambulance Bay',
      category: 'Hospital Facade',
      image: HOSPITAL_IMAGES.facade,
      description: 'The modern multi-specialty facility on National Highway 66, Byndoor with dedicated emergency ambulance driveway.'
    },
    {
      id: 'img_dialysis',
      title: 'Advanced Hemodialysis Unit',
      category: 'Dialysis Unit',
      image: HOSPITAL_IMAGES.dialysis,
      description: 'Multi-bed hemodialysis center with reverse osmosis water plant, launched in collaboration with KMC Manipal.'
    },
    {
      id: 'img_opd',
      title: 'Specialist Doctor Consultation Chamber',
      category: 'OPD Consultations',
      image: HOSPITAL_IMAGES.doctorOpd,
      description: 'Clean, well-equipped outpatient consultation suites for visiting KMC specialists and resident physicians.'
    },
    {
      id: 'img_emergency',
      title: '24/7 Emergency Casualty Bay',
      category: 'Emergency & Facilities',
      image: HOSPITAL_IMAGES.emergencyWard,
      description: 'Round-the-clock emergency casualty with oxygen manifold, vital monitoring, and trauma resuscitation bed.'
    },
    {
      id: 'img_lab',
      title: 'Diagnostic Pathology Laboratory',
      category: 'Emergency & Facilities',
      image: HOSPITAL_IMAGES.lab,
      description: 'Automated clinical chemistry and hematology analyzers for rapid outpatient and inpatient diagnostics.'
    },
    {
      id: 'img_pharmacy',
      title: '24-Hour Hospital Pharmacy',
      category: 'Emergency & Facilities',
      image: HOSPITAL_IMAGES.pharmacy,
      description: 'Fully stocked in-house pharmacy dispensing critical medications, emergency injectables, and surgical consumables.'
    }
  ];

  const categories = ['All', 'Hospital Facade', 'Dialysis Unit', 'OPD Consultations', 'Emergency & Facilities'];

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Hospital Tour
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Facilities & Clinical Infrastructure
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Tour the premises of Anjali Hospital (A Unit of KMC Manipal). Designed for clinical hygiene, patient dignity, and swift emergency access on NH 66 Byndoor.
          </p>

          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 pt-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-smooth cursor-pointer ${
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-60 overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="p-3 bg-white/90 backdrop-blur-md rounded-full text-slate-900 shadow-md">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-950/70 text-white px-2.5 py-1 rounded-md backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl space-y-0 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <h4 className="text-sm font-bold">{activeImage.title}</h4>
                <p className="text-xs text-sky-400">{activeImage.category}</p>
              </div>
              <button
                onClick={() => setActiveImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={activeImage.image}
                alt={activeImage.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="p-4 bg-slate-900 text-xs text-slate-300 leading-relaxed border-t border-slate-800">
              {activeImage.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

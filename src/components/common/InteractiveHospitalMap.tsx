import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { MapPin, Navigation, ExternalLink, Copy, Check, Compass, Layers } from 'lucide-react';

export const InteractiveHospitalMap: React.FC<{
  className?: string;
  showDetails?: boolean;
}> = ({ className = '', showDetails = true }) => {
  const { settings, showToast } = useHospital();
  const [copied, setCopied] = useState(false);

  const lat = settings?.coordinates?.lat || 13.8662379;
  const lng = settings?.coordinates?.lng || 74.6293119;

  // Direct canonical Google Maps listing provided by the user
  const directMapsUrl = settings?.mapsUrl || 'https://maps.app.goo.gl/jVtpyUdYi1DoFa2B6';

  const directionsUrl =
    settings?.directionsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // OpenStreetMap embed URL with exact pin
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.006}%2C${lng + 0.008}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;

  const handleCopyLocation = () => {
    const textToCopy = `Anjali Hospital (A Unit of KMC Manipal), NH 66, Baindur, Kundapur Taluk, Udupi - 576214 (GPS: ${lat}, ${lng})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Hospital address and GPS coordinates copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className={`rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-sm flex flex-col ${className}`}>
      {/* Map Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight">Anjali Hospital Location Map</h4>
            <p className="text-[11px] text-sky-400">NH 66, Baindur · GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLocation}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Copy address and coordinates"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy GPS'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Interactive Map Frame */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-slate-100 overflow-hidden">
        <iframe
          title="Anjali Hospital Byndoor Location Map"
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
        />

        {/* Overlay Marker Badge on top right of map */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md text-[11px] text-slate-800 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
          <span className="font-bold text-blue-900">Anjali Hospital Pin</span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <a
            href={directMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-xl transition-all shadow-sm cursor-pointer group"
          >
            <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Open in Google Maps</span>
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-sm cursor-pointer group"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Get Driving Directions</span>
          </a>
        </div>

        {showDetails && (
          <div className="pt-2 border-t border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
            <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Accessibility:</strong> Directly along National Highway 66 with ambulance ramp. Approx. 3 km from Byndoor Mookambika Road Railway Station.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

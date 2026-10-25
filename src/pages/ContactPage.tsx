import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext.tsx';
import { InteractiveHospitalMap } from '../components/common/InteractiveHospitalMap.tsx';
import { Phone, Mail, MapPin, ExternalLink, Clock, Send, CheckCircle2, MessageSquare, ArrowUpRight } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useHospital();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      showToast('Please provide your name, phone number, and message.', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Your message has been received by our reception team.', 'success');
    }, 600);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Reach Out To Our Medical Team
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact & Hospital Location
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Need emergency support, dialysis shift scheduling, or doctor appointment assistance? Contact our reception desk 24 hours a day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contact & Location info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                Emergency & Contact Lines
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/90 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                    24/7 Casualty & Ambulance Helpline
                  </div>
                  <a
                    href={`tel:${settings?.emergencyPhone || '08254251805'}`}
                    className="text-base font-extrabold text-rose-800 hover:underline block"
                  >
                    {settings?.emergencyPhone || '082542 51805'}
                  </a>
                  <p className="text-[11px] text-rose-600">
                    Casualty Medical Officer on duty 24 hours every day.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-medium">Hospital Reception / Appointments:</div>
                  <a
                    href={`tel:${settings?.phone || '08254251805'}`}
                    className="text-sm font-bold text-blue-700 hover:underline block"
                  >
                    {settings?.phone || '082542 51805'}
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="text-emerald-700 font-semibold flex items-center justify-between">
                    <span>Direct WhatsApp Desk:</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <a
                    href={`https://wa.me/91${(settings?.whatsapp || '8254251805').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-emerald-800 hover:underline block"
                  >
                    +91 {settings?.whatsapp || '82542 51805'}
                  </a>
                  <p className="text-[11px] text-emerald-600">Send reports or inquire about OPD tokens.</p>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Hospital Address:</span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-relaxed pl-5">
                    {settings?.address || 'NH 66, Baindur, Kundapur Taluk, Udupi District, Karnataka - 576214'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={settings?.mapsUrl || 'https://maps.app.goo.gl/jVtpyUdYi1DoFa2B6'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Maps App</span>
                </a>
              </div>
            </div>

            <InteractiveHospitalMap showDetails={false} />
          </div>

          {/* Right Column: Interactive Query Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">
                  Send an Inquiry or Patient Feedback
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Our hospital administrative and nursing coordinators will review and follow up promptly.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-950">Message Sent Successfully</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                    Thank you, {name}. Our duty coordinator will review your request. For immediate medical emergencies, please dial <strong>082542 51805</strong> directly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName('');
                      setPhone('');
                      setMessage('');
                    }}
                    className="mt-3 px-4 py-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Patient or Relative Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98451 00000"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Department / Reason</label>
                      <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="General Enquiry">General Hospital Enquiry</option>
                        <option value="Dialysis">Hemodialysis Unit Shift Scheduling</option>
                        <option value="Cardiology">Cardiology Visiting Specialist</option>
                        <option value="Orthopaedics">Orthopaedics & Joint Clinic</option>
                        <option value="OBG">Maternity & Women's Health</option>
                        <option value="Laboratory">Laboratory Diagnostics</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Your Inquiry or Medical Concern *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please describe your question, required appointment, or feedback..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Transmitting...' : 'Submit Message'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

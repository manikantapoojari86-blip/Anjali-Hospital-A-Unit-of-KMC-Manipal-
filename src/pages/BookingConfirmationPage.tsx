import React, { useEffect, useState } from 'react';
import { useHospital } from '../context/HospitalContext.tsx';
import { fetchAppointmentByRef } from '../services/api.ts';
import type { Appointment } from '../types/index.ts';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Download,
  Share2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  User,
  Stethoscope
} from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { lastConfirmedAppointment, pageParams, navigateTo, settings } = useHospital();
  const [appointment, setAppointment] = useState<Appointment | null>(lastConfirmedAppointment);
  const [isLoading, setIsLoading] = useState(!lastConfirmedAppointment);
  const [error, setError] = useState<string | null>(null);

  const refParam = pageParams.ref;

  useEffect(() => {
    if (!appointment && refParam) {
      setIsLoading(true);
      fetchAppointmentByRef(refParam)
        .then(data => setAppointment(data))
        .catch(err => setError(err?.message || 'Could not load appointment.'))
        .finally(() => setIsLoading(false));
    }
  }, [refParam, appointment]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadIcs = () => {
    if (!appointment) return;
    const [startH, startM] = appointment.startTime.split(':');
    const [endH, endM] = appointment.endTime.split(':');
    const dateFormatted = appointment.date.replace(/-/g, '');

    const dtStart = `${dateFormatted}T${startH}${startM}00`;
    const dtEnd = `${dateFormatted}T${endH}${endM}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Anjali Hospital//Appointment Booking//EN',
      'BEGIN:VEVENT',
      `UID:${appointment.bookingReference}@anjalihospitalbyndoor.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Hospital Appointment: ${appointment.serviceName}`,
      `DESCRIPTION:Appointment at Anjali Hospital (A Unit of KMC Manipal) with ${appointment.doctorName}. Booking Ref: ${appointment.bookingReference}`,
      `LOCATION:Anjali Hospital, NH 66, Baindur, Kundapur Tq, Udupi - 576214`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Anjali_Hospital_${appointment.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGoogleCalendarUrl = () => {
    if (!appointment) return '#';
    const [startH, startM] = appointment.startTime.split(':');
    const [endH, endM] = appointment.endTime.split(':');
    const dateFormatted = appointment.date.replace(/-/g, '');

    const dtStart = `${dateFormatted}T${startH}${startM}00`;
    const dtEnd = `${dateFormatted}T${endH}${endM}00`;

    const title = encodeURIComponent(`Anjali Hospital OPD: ${appointment.serviceName}`);
    const details = encodeURIComponent(
      `Appointment at Anjali Hospital (A Unit of KMC Manipal)\nDoctor: ${appointment.doctorName}\nBooking Reference: ${appointment.bookingReference}\nPatient: ${appointment.customer.fullName}\nFee: ₹${appointment.fee}\nEmergency: 082542 51805`
    );
    const location = encodeURIComponent('Anjali Hospital, NH 66, Baindur, Kundapur Taluk, Udupi - 576214');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}`;
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-semibold text-slate-600">Retrieving appointment record...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Appointment Record Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not locate this appointment reference. Please verify your reference or manage your booking.
        </p>
        <button
          onClick={() => navigateTo('manage')}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-700 rounded-xl"
        >
          Look Up Booking
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Banner */}
        <div className="bg-emerald-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-emerald-800 space-y-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Booking Confirmed
              </span>
              <h1 className="text-2xl font-black">Appointment Successfully Reserved</h1>
            </div>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed max-w-xl">
            A confirmation slip has been generated with your unique booking reference. Please present this reference or mobile number at the hospital reception desk on NH 66 Byndoor.
          </p>
        </div>

        {/* Printable Hospital Appointment Slip */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden p-8 sm:p-10 space-y-6">
          {/* Slip Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-6">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Official Outpatient Slip
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                ANJALI HOSPITAL
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                A Unit of KMC Manipal · Kasturba Hospital Clinical Alliance
              </p>
              <p className="text-[11px] text-slate-500">
                NH 66, Baindur, Kundapur Tq, Udupi - 576214 | Tel: 082542 51805
              </p>
            </div>

            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Booking Reference
              </span>
              <span className="text-xl sm:text-2xl font-mono font-black text-blue-700 tracking-wider">
                {appointment.bookingReference}
              </span>
              <span className="block text-[10px] text-emerald-700 font-bold mt-1">
                STATUS: CONFIRMED
              </span>
              <span className="block text-[10px] text-blue-700 font-semibold mt-0.5">
                ☁ Stored in Supabase Backend
              </span>
            </div>
          </div>

          {/* Slip Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-slate-400 font-medium">Patient Particulars:</span>
              <div className="text-sm font-bold text-slate-900">
                {appointment.customer.fullName}
              </div>
              <div className="text-slate-600">
                {appointment.customer.age} Years, {appointment.customer.gender}
              </div>
              <div className="text-slate-600 font-mono">
                {appointment.customer.phone}
              </div>
              {appointment.customer.uhidNumber && (
                <div className="text-blue-700 font-semibold text-[11px]">
                  UHID: {appointment.customer.uhidNumber}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-slate-400 font-medium">Appointment Schedule:</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{appointment.date}</span>
              </div>
              <div className="text-slate-700 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{appointment.startTime} - {appointment.endTime}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Please arrive 15 minutes before slot time
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-slate-400 font-medium">Department & Doctor:</span>
              <div className="text-sm font-bold text-blue-700">
                {appointment.serviceName}
              </div>
              <div className="text-slate-800 font-semibold">
                {appointment.doctorName}
              </div>
              <div className="text-slate-500 text-[11px]">
                {appointment.doctorSpecialty}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-slate-400 font-medium">Billing & Consultation Fee:</span>
              <div className="text-lg font-black text-slate-900">
                ₹{appointment.fee}
              </div>
              <div className="text-slate-600 font-semibold text-[11px]">
                Payment Mode: Pay at Hospital Counter
              </div>
              <div className="text-emerald-700 text-[11px]">
                Subsidized / Insurance verification at counter
              </div>
            </div>
          </div>

          {/* Slip Footer / Instructions */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-slate-700 space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Important Patient Guidelines</span>
            </div>
            <p>
              Please carry previous medical records, ongoing prescriptions, and laboratory reports. For acute emergency worsening, proceed directly to Casualty 24x7.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print pt-2">
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Appointment Slip</span>
            </button>

            <button
              onClick={handleDownloadIcs}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download iCal (.ics)</span>
            </button>

            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Add to Google Calendar</span>
            </a>
          </div>

          <button
            onClick={() => navigateTo('manage', { ref: appointment.bookingReference })}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <span>Manage or Reschedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

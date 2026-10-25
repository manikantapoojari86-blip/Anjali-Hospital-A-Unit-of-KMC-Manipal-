import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext.tsx';
import {
  fetchAppointmentByRef,
  cancelAppointment,
  rescheduleAppointment,
  fetchAvailableSlots
} from '../services/api.ts';
import type { Appointment, TimeSlot } from '../types/index.ts';
import {
  Search,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Phone
} from 'lucide-react';

export const BookingManagePage: React.FC = () => {
  const { pageParams, showToast, navigateTo } = useHospital();

  const [bookingRef, setBookingRef] = useState(pageParams.ref || '');
  const [phoneNumber, setPhoneNumber] = useState(pageParams.phone || '');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Reschedule Modal State
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  // Cancel Modal State
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Personal reasons / schedule change');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // If ref and phone or token provided in query, attempt auto-load
  useEffect(() => {
    if (pageParams.ref) {
      setBookingRef(pageParams.ref);
      if (pageParams.phone) {
        setPhoneNumber(pageParams.phone);
        handleLookup(pageParams.ref, pageParams.phone);
      } else if (pageParams.token) {
        handleLookup(pageParams.ref, undefined, pageParams.token);
      }
    }
  }, [pageParams.ref, pageParams.phone, pageParams.token]);

  const handleLookup = async (ref = bookingRef, phone = phoneNumber, token = pageParams.token) => {
    if (!ref.trim()) {
      showToast('Please enter your Booking Reference.', 'error');
      return;
    }
    setIsLoading(true);
    setSearchError(null);
    try {
      const data = await fetchAppointmentByRef(ref.trim(), phone.trim() || undefined, token);
      setAppointment(data);
      showToast('Appointment record loaded.', 'info');
    } catch (err: any) {
      setAppointment(null);
      setSearchError(err?.message || 'Could not verify appointment details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reschedule Slots fetch
  useEffect(() => {
    if (!isRescheduling || !appointment) return;
    setIsLoadingSlots(true);
    setSelectedSlot(null);

    fetchAvailableSlots(rescheduleDate, appointment.serviceId, appointment.staffId)
      .then(res => {
        setAvailableSlots(res.slots || []);
      })
      .catch(() => {
        setAvailableSlots([]);
      })
      .finally(() => {
        setIsLoadingSlots(false);
      });
  }, [isRescheduling, rescheduleDate, appointment]);

  const handleConfirmReschedule = async () => {
    if (!appointment || !selectedSlot) return;
    setIsSubmittingReschedule(true);
    try {
      const res = await rescheduleAppointment(
        appointment.bookingReference,
        rescheduleDate,
        selectedSlot.start,
        phoneNumber
      );
      if (res.success && res.appointment) {
        setAppointment(res.appointment);
        setIsRescheduling(false);
        showToast('Appointment rescheduled successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to reschedule.', 'error');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!appointment) return;
    setIsSubmittingCancel(true);
    try {
      const res = await cancelAppointment(appointment.bookingReference, cancelReason, phoneNumber);
      if (res.success) {
        setAppointment({ ...appointment, status: 'cancelled', cancellationReason: cancelReason });
        setIsCancelling(false);
        showToast('Appointment has been cancelled.', 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel appointment.', 'error');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
            Patient Self-Service
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Manage or Reschedule Your Appointment
          </h1>
          <p className="text-xs text-slate-500">
            Verify your booking reference and registered mobile number to review or modify your consultation.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Booking Reference *</label>
              <input
                type="text"
                placeholder="e.g. KMC-ANJ-2026-8812"
                value={bookingRef}
                onChange={e => setBookingRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Registered Mobile Number *</label>
              <input
                type="tel"
                placeholder="e.g. 98451 00000"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleLookup()}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Look Up Appointment'}</span>
            </button>
          </div>

          {searchError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Appointment Record Display */}
        {appointment && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                  Verified Booking
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {appointment.serviceName}
                </h2>
                <div className="text-xs text-slate-500">
                  Doctor: <strong>{appointment.doctorName}</strong>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="font-mono font-bold text-sm text-slate-900 block">
                  {appointment.bookingReference}
                </span>
                <span
                  className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 ${
                    appointment.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : appointment.status === 'checked_in'
                      ? 'bg-blue-100 text-blue-800'
                      : appointment.status === 'completed'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Status: {appointment.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">Scheduled Time:</span>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{appointment.date}</span>
                </div>
                <div className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{appointment.startTime} - {appointment.endTime}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">Patient Details:</span>
                <div className="text-sm font-bold text-slate-900">
                  {appointment.customer.fullName}
                </div>
                <div className="text-slate-600">
                  {appointment.customer.age} Yrs · {appointment.customer.phone}
                </div>
              </div>
            </div>

            {appointment.status === 'cancelled' && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <strong>Appointment Cancelled:</strong>
                <p>{appointment.cancellationReason || 'Cancelled upon patient request.'}</p>
              </div>
            )}

            {/* Actions: Reschedule & Cancel buttons if active */}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setIsCancelling(true)}
                  className="px-4 py-2.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel Appointment
                </button>

                <button
                  onClick={() => setIsRescheduling(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reschedule to Another Time</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESCHEDULE MODAL */}
        {isRescheduling && appointment && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Reschedule Consultation</h3>
                <p className="text-xs text-slate-500">
                  Pick a new date and open slot for {appointment.serviceName}.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={rescheduleDate}
                    onChange={e => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">Available Slots</span>
                    {isLoadingSlots && <span className="text-blue-600 animate-pulse">Loading slots...</span>}
                  </div>

                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-lg text-xs font-bold transition-all ${
                          !slot.available
                            ? 'bg-slate-100 text-slate-300 line-through'
                            : selectedSlot?.start === slot.start
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-50 border border-slate-200 hover:bg-blue-50 text-slate-800'
                        }`}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setIsRescheduling(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReschedule}
                  disabled={!selectedSlot || isSubmittingReschedule}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmittingReschedule ? 'Rescheduling...' : 'Confirm New Time'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CANCEL MODAL */}
        {isCancelling && appointment && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 text-rose-700">Cancel Appointment</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to cancel booking {appointment.bookingReference}?
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-700">Reason for Cancellation:</label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setIsCancelling(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isSubmittingCancel}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

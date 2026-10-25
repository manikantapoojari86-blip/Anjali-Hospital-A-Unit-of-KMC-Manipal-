import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext.tsx';
import { fetchAvailableSlots, createAppointment } from '../services/api.ts';
import type { TimeSlot, CustomerInfo } from '../types/index.ts';
import {
  Calendar,
  Clock,
  User,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Stethoscope,
  Info
} from 'lucide-react';

export const BookingPage: React.FC = () => {
  const {
    services,
    staff,
    settings,
    preselectedServiceId,
    preselectedStaffId,
    setLastConfirmedAppointment,
    navigateTo,
    showToast,
    pageParams
  } = useHospital();

  // Wizard Step: 1 = Service, 2 = Doctor, 3 = Date & Slot, 4 = Patient Details, 5 = Review & Confirm
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    return pageParams.serviceId || preselectedServiceId || (services[0]?.id || 'srv_genmed');
  });

  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return pageParams.staffId || preselectedStaffId || 'any';
  });

  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Slots Loading
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('35');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [reason, setReason] = useState('');
  const [isExisting, setIsExisting] = useState(false);
  const [uhid, setUhid] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Update selected service if preselected changes
  useEffect(() => {
    if (pageParams.serviceId) {
      setSelectedServiceId(pageParams.serviceId);
    }
  }, [pageParams.serviceId]);

  useEffect(() => {
    if (pageParams.staffId) {
      setSelectedStaffId(pageParams.staffId);
    }
  }, [pageParams.staffId]);

  // Load slots when date, service, or staff changes
  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return;

    let isMounted = true;
    setIsLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);

    fetchAvailableSlots(selectedDate, selectedServiceId, selectedStaffId)
      .then(res => {
        if (!isMounted) return;
        setAvailableSlots(res.slots || []);
      })
      .catch(err => {
        if (!isMounted) return;
        setSlotsError(err?.message || 'Could not fetch time slots for this date.');
        setAvailableSlots([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedServiceId, selectedStaffId]);

  const activeService = services.find(s => s.id === selectedServiceId) || services[0];
  const activeDoctor = staff.find(d => d.id === selectedStaffId);

  // Handlers
  const handleProceedToDoctor = () => {
    if (!selectedServiceId) {
      showToast('Please select a medical service.', 'error');
      return;
    }
    setStep(2);
  };

  const handleProceedToDateSlot = () => {
    setStep(3);
  };

  const handleProceedToPatientInfo = () => {
    if (!selectedSlot) {
      showToast('Please select an available appointment time slot.', 'error');
      return;
    }
    setStep(4);
  };

  const handleProceedToReview = () => {
    if (!patientName.trim()) {
      showToast('Please enter the patient full name.', 'error');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!age || Number(age) < 1 || Number(age) > 120) {
      showToast('Please enter a valid age.', 'error');
      return;
    }
    if (!reason.trim()) {
      showToast('Please enter the reason for visit / chief medical complaint.', 'error');
      return;
    }
    setStep(5);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !activeService) return;
    if (!agreeTerms) {
      showToast('Please agree to the hospital booking terms.', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    const customer: CustomerInfo = {
      fullName: patientName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      age: Number(age),
      gender,
      reasonForVisit: reason.trim(),
      isExistingPatient: isExisting,
      uhidNumber: isExisting && uhid.trim() ? uhid.trim() : undefined
    };

    try {
      const res = await createAppointment({
        serviceId: activeService.id,
        staffId: selectedStaffId !== 'any' ? selectedStaffId : undefined,
        date: selectedDate,
        startTime: selectedSlot.start,
        customer,
        notes: reason.trim()
      });

      if (res.success && res.appointment) {
        setLastConfirmedAppointment(res.appointment);
        showToast('Appointment confirmed and stored in Supabase backend!', 'success');
        navigateTo('confirmation', { ref: res.appointment.bookingReference });
      }
    } catch (err: any) {
      setSubmissionError(err?.message || 'Failed to complete booking. The slot might have been taken.');
      showToast(err?.message || 'Booking failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Min and max date calculation (up to 30 days ahead)
  const minDate = getTodayString();
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Wizard Progress Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                Official Booking Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Book an Appointment at Anjali Hospital
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                A Unit of KMC Manipal · NH 66, Byndoor
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500">Step {step} of 5</span>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
            {[
              { num: 1, label: 'Service' },
              { num: 2, label: 'Doctor' },
              { num: 3, label: 'Date & Slot' },
              { num: 4, label: 'Patient Info' },
              { num: 5, label: 'Review' }
            ].map(s => (
              <div
                key={s.num}
                className={`py-2 px-1 rounded-xl transition-all ${
                  step === s.num
                    ? 'bg-blue-700 text-white shadow-sm font-bold'
                    : step > s.num
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <div className="hidden sm:inline">{s.num}. </div>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: CHOOSE SERVICE */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Step 1: Choose Medical Service / OPD Clinic</h2>
              <p className="text-xs text-slate-500">Select the required clinical specialty or consultation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(srv => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          {srv.category}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900">₹{srv.price}</span>
                          <span className="text-[10px] text-slate-500 block">{srv.durationMinutes} mins</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-2">{srv.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Duration: ~{srv.durationMinutes} min</span>
                      <span className={`font-bold ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                        {isSelected ? 'Selected ✓' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleProceedToDoctor}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                <span>Proceed to Doctor Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE DOCTOR */}
        {step === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Step 2: Choose Specialist Doctor</h2>
              <p className="text-xs text-slate-500">
                You may choose a specific consultant or select "Any Available Specialist" for the soonest slot.
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Any Available */}
              <div
                onClick={() => setSelectedStaffId('any')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedStaffId === 'any'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Any Available Specialist</h3>
                    <p className="text-xs text-slate-500">Assigns the earliest available doctor for {activeService.name}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${selectedStaffId === 'any' ? 'text-blue-700' : 'text-slate-400'}`}>
                  {selectedStaffId === 'any' ? 'Selected ✓' : 'Select'}
                </span>
              </div>

              {/* Doctors matching service or all active */}
              {staff
                .filter(d => d.serviceIds.includes(activeService.id) || activeService.assignedStaffIds.includes(d.id))
                .map(doc => {
                  const isSelected = selectedStaffId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedStaffId(doc.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${doc.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-sm`}>
                          {doc.name.charAt(4) || 'D'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                            {doc.isVisitingKMC && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                KMC Manipal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{doc.degrees} · {doc.department}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                        {isSelected ? 'Selected ✓' : 'Select'}
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Service</span>
              </button>
              <button
                onClick={handleProceedToDateSlot}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                <span>Proceed to Select Date & Time</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATE & TIME SLOTS */}
        {step === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Step 3: Select Appointment Date & Slot</h2>
              <p className="text-xs text-slate-500">
                Live availability is refreshed from hospital clinic schedules. Slots in the past or booked by others are unavailable.
              </p>
            </div>

            {/* Date Picker Input */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <label htmlFor="appointment-date" className="text-xs font-bold text-slate-800 block">Select Consultation Date</label>
                  <span className="text-[11px] text-slate-500">Up to 30 days in advance</span>
                </div>
              </div>
              <input
                id="appointment-date"
                type="date"
                min={minDate}
                max={maxDate}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Slots Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Available Slots for {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </h3>
                {isLoadingSlots && <span className="text-xs text-blue-600 font-semibold animate-pulse">Checking clinic schedule...</span>}
              </div>

              {slotsError ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {slotsError}
                </div>
              ) : availableSlots.length === 0 && !isLoadingSlots ? (
                <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-600 font-semibold">
                    No open appointment slots available for this service on this date.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    The doctor may not be on duty or all slots are filled. Please select another date.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availableSlots.map((slot, idx) => {
                    const isSelected = selectedSlot?.start === slot.start;
                    return (
                      <button
                        key={idx}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                          !slot.available
                            ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-600/30'
                            : 'bg-white hover:bg-blue-50 text-slate-800 border border-slate-200 hover:border-blue-400 cursor-pointer'
                        }`}
                      >
                        {slot.start}
                        <span className="block text-[10px] font-normal opacity-80">
                          {slot.available ? 'Open' : 'Booked'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Selected Slot: <strong>{selectedSlot.start} - {selectedSlot.end}</strong> on{' '}
                    <strong>{selectedDate}</strong>
                  </span>
                </div>
                <span className="font-bold text-blue-700">Ready</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleProceedToPatientInfo}
                disabled={!selectedSlot}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>Proceed to Patient Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PATIENT DETAILS */}
        {step === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Step 4: Patient Details</h2>
              <p className="text-xs text-slate-500">
                Please enter accurate patient details so the nursing counter can prepare the outpatient file.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Devadiga"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Mobile Phone Number (SMS / WhatsApp) *</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Patient Age *</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Reason for Visit / Chief Symptoms *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Knee pain since 2 weeks, routine diabetic check, or dialysis appointment..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Existing Patient UHID toggle */}
              <div className="pt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isExisting}
                    onChange={e => setIsExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Has the patient visited Anjali Hospital before?</span>
                </label>

                {isExisting && (
                  <div className="space-y-1">
                    <label className="text-slate-600 text-[11px] font-semibold">
                      Hospital UHID or OP Card Number (if handy):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AH-BYN-1234"
                      value={uhid}
                      onChange={e => setUhid(e.target.value)}
                      className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleProceedToReview}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                <span>Proceed to Review & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {step === 5 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Step 5: Review & Confirm Appointment</h2>
              <p className="text-xs text-slate-500">
                Please double-check all details before final confirmation.
              </p>
            </div>

            {submissionError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* Summary Box */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                <div>
                  <span className="text-slate-500 text-[11px]">Hospital Facility:</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {settings?.name || 'Anjali Hospital (A Unit of KMC Manipal)'}
                  </div>
                  <div className="text-[11px] text-slate-500">NH 66, Baindur, Kundapur Tq</div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px]">Clinical Service:</span>
                  <div className="font-bold text-blue-700 text-sm">{activeService.name}</div>
                  <div className="text-[11px] text-slate-500">{activeService.category} · {activeService.durationMinutes} min</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 pb-2">
                <div>
                  <span className="text-slate-500 text-[11px]">Appointment Date & Time:</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedDate} ({selectedSlot?.start} - {selectedSlot?.end})
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px]">Attending Consultant:</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {activeDoctor ? activeDoctor.name : 'Duty Specialist Doctor'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 pb-2">
                <div>
                  <span className="text-slate-500 text-[11px]">Patient Name & Contact:</span>
                  <div className="font-bold text-slate-900 text-sm">{patientName} ({age} yrs, {gender})</div>
                  <div className="text-slate-600">{phone}</div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px]">Chief Complaint:</span>
                  <div className="text-slate-700 italic">"{reason}"</div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-slate-800">Consultation Fee:</span>
                  <span className="text-xs text-slate-500 block">Pay at Hospital Counter upon arrival</span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  ₹{activeService.price}
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600"
                />
                <span>
                  I confirm the patient details are accurate. I understand that appointments can be rescheduled or cancelled up to 2 hours prior without charge.
                </span>
              </label>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Zero advance payment required online. Pay seamlessly at reception counter upon check-in.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setStep(4)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting || !agreeTerms}
                className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-700/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Generate Appointment Slip</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

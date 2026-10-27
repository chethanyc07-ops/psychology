import React, { useState } from 'react';
import { Counselor, ScheduledAppointment } from '../utils/seedData';
import { validateBookingInput, BookingFormInput } from '../utils/clinicalLogic';
import { Calendar, MapPin, Check, XCircle, AlertCircle } from 'lucide-react';

interface CounselorDirectoryProps {
  counselors: Counselor[];
  selectedSpecialtyFilter: string;
  onChangeSpecialtyFilter: (specialty: string) => void;
  appointments: ScheduledAppointment[];
  onBookAppointment: (appointment: ScheduledAppointment) => void;
  onCancelAppointment: (id: string) => void;
}

const SPECIALTY_FILTERS = [
  'All Specialties',
  'Academic Burnout',
  'Anxiety & Panic',
  'Mood & Depression',
  'Neurodiversity & ADHD',
];

const ClinicianPortraitSvg: React.FC<{ theme: Counselor['portraitTheme']; name: string }> = ({
  theme,
  name,
}) => {
  const palettes = {
    'amber-sage': { bg: '#E6ECE8', accent: '#1B4332', coat: '#344E41', skin: '#E0B899' },
    'slate-forest': { bg: '#E5E9EC', accent: '#1E3A3A', coat: '#1D2D44', skin: '#8D5B4C' },
    'terracotta-stone': { bg: '#EFEAE4', accent: '#2D4A3E', coat: '#4A5D4E', skin: '#E8C5A5' },
    'indigo-moss': { bg: '#E8EAE6', accent: '#243B35', coat: '#2B3A42', skin: '#6F4536' },
  };
  const p = palettes[theme];

  return (
    <svg
      viewBox="0 0 96 96"
      className="w-16 h-16 rounded-xl border border-[#141E19]/10 shrink-0"
      role="img"
      aria-label={`Portrait illustration of ${name}`}
    >
      <rect width="96" height="96" fill={p.bg} />
      <circle cx="48" cy="48" r="42" fill={p.accent} fillOpacity="0.06" />
      {/* Shoulders / Coat */}
      <path d="M18 96C18 75 30 66 48 66C66 66 78 75 78 96H18Z" fill={p.coat} />
      {/* Collar */}
      <path d="M38 66L48 80L58 66" fill="#F8F7F4" />
      {/* Head */}
      <circle cx="48" cy="39" r="16" fill={p.skin} />
      {/* Hair stylization */}
      <path
        d="M32 38C32 25 40 20 48 20C56 20 64 25 64 38C61 31 55 28 48 28C41 28 35 31 32 38Z"
        fill="#1E2421"
      />
    </svg>
  );
};

export const CounselorDirectory: React.FC<CounselorDirectoryProps> = ({
  counselors,
  selectedSpecialtyFilter,
  onChangeSpecialtyFilter,
  appointments,
  onBookAppointment,
  onCancelAppointment,
}) => {
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(counselors[0]?.id || 'c-rostova');
  const [selectedSlot, setSelectedSlot] = useState<string>(counselors[0]?.availableSlots[0] || '');
  const [modality, setModality] = useState<BookingFormInput['modality']>('In-Person Campus Clinic');
  const [studentName, setStudentName] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [bookingSuccessBanner, setBookingSuccessBanner] = useState<string | null>(null);

  const filteredCounselors =
    selectedSpecialtyFilter === 'All Specialties'
      ? counselors
      : counselors.filter((c) => c.specialty === selectedSpecialtyFilter);

  const activeCounselor =
    counselors.find((c) => c.id === selectedCounselorId) || filteredCounselors[0] || counselors[0];

  const handleSelectCounselor = (counselor: Counselor, slot?: string) => {
    setSelectedCounselorId(counselor.id);
    setSelectedSlot(slot || counselor.availableSlots[0]);
    setFormErrors({});
    setBookingSuccessBanner(null);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccessBanner(null);

    const input: BookingFormInput = {
      studentName,
      studentEmail,
      studentId,
      counselorId: activeCounselor.id,
      slot: selectedSlot,
      modality,
      reason,
    };

    const validation = validateBookingInput(input);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    const newAppointment: ScheduledAppointment = {
      id: `apt-${Date.now()}`,
      counselorId: activeCounselor.id,
      counselorName: activeCounselor.name,
      credentials: activeCounselor.credentials,
      specialty: activeCounselor.specialty,
      slot: selectedSlot,
      modality,
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      studentId: studentId.trim().toUpperCase(),
      reason: reason.trim(),
      status: 'Confirmed',
    };

    onBookAppointment(newAppointment);
    setBookingSuccessBanner(
      `Confirmed session with ${activeCounselor.name} (${activeCounselor.credentials}) for ${selectedSlot}.`
    );
    setStudentName('');
    setStudentEmail('');
    setStudentId('');
    setReason('');
  };

  return (
    <section id="counseling" className="py-14 border-b border-[#141E19]/10">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header & Specialty Segmented Filter */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 mb-8">
          <div>
            <div className="text-xs font-medium text-[#4A5550] mb-2">
              02. Free 1-on-1 Counseling (In-Person or Video)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141E19]">
              Book a Campus Counselor in 60 Seconds
            </h2>
            <p className="text-sm text-[#4A5550] mt-2 max-w-2xl">
              <strong>How to book:</strong> Click an available time button on any counselor card on the left, then enter your name and university <code>.edu</code> email in the form on the right.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div
            role="group"
            aria-label="Filter Clinicians by Specialty"
            className="inline-flex items-center gap-1 p-1 bg-[#EFECE6] rounded-lg border border-[#141E19]/10 overflow-x-auto max-w-full shrink-0"
          >
            {SPECIALTY_FILTERS.map((spec) => {
              const active = selectedSpecialtyFilter === spec;
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => onChangeSpecialtyFilter(spec)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#141E19] shadow-xs'
                      : 'text-[#4A5550] hover:text-[#141E19]'
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12-Column Split: Clinician Cards (7 cols) + Intake Booking Panel (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Clinician List */}
          <div className="lg:col-span-7 space-y-4">
            {filteredCounselors.map((counselor) => {
              const isSelected = activeCounselor.id === counselor.id;
              return (
                <article
                  key={counselor.id}
                  className={`p-6 rounded-xl bg-white border transition-colors ${
                    isSelected
                      ? 'border-[#1B4332] ring-1 ring-[#1B4332]'
                      : 'border-[#141E19]/12 hover:border-[#141E19]/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <ClinicianPortraitSvg theme={counselor.portraitTheme} name={counselor.name} />

                    <div className="flex-1 min-w-0">
                      {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A5550] mb-1">
                        <span className="font-semibold text-[#1B4332]">{counselor.specialty}</span>
                        <span aria-hidden="true">·</span>
                        <span>{counselor.languages}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Wait: ~{counselor.waitDays}d
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#141E19]">
                        {counselor.name}, <span className="font-normal text-[#4A5550]">{counselor.credentials}</span>
                      </h3>
                      <p className="text-xs font-medium text-[#4A5550] mt-0.5">
                        {counselor.title}
                      </p>

                      <p className="text-sm text-[#141E19]/90 leading-relaxed mt-3">
                        {counselor.bio}
                      </p>

                      <div className="mt-3 text-xs text-[#4A5550] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1B4332] shrink-0" aria-hidden="true" />
                        <span>{counselor.clinicLocation}</span>
                        <span aria-hidden="true">·</span>
                        <span>{counselor.secondaryFocus}</span>
                      </div>

                      {/* Available Time Slots */}
                      <div className="mt-4 pt-4 border-t border-[#141E19]/10 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-[#4A5550]">Next Available:</span>
                          {counselor.availableSlots.map((slot) => {
                            const slotSelected = isSelected && selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleSelectCounselor(counselor, slot)}
                                className={`px-3 py-1.5 text-xs font-mono tabular-nums rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  slotSelected
                                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                                    : 'bg-[#F8F7F4] text-[#141E19] border-[#141E19]/15 hover:border-[#1B4332]'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectCounselor(counselor)}
                          className="text-xs font-semibold text-[#1B4332] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {isSelected ? 'Selected for Intake' : 'Select Clinician'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Column: Confidential Intake Reservation Form */}
          <div className="lg:col-span-5 bg-white border border-[#141E19]/15 rounded-xl p-6">
            <div className="pb-4 border-b border-[#141E19]/10 mb-5">
              <div className="text-xs font-medium text-[#4A5550]">
                Confidential Student Intake Reservation
              </div>
              <h3 className="text-lg font-bold text-[#141E19] mt-0.5">
                Book Session with {activeCounselor.name}
              </h3>
              <p className="text-xs text-[#4A5550] mt-1">
                {activeCounselor.specialty} · Selected Slot:{' '}
                <span className="font-mono tabular-nums font-semibold text-[#141E19]">
                  {selectedSlot}
                </span>
              </p>
            </div>

            {bookingSuccessBanner && (
              <div
                role="status"
                className="mb-5 p-3.5 rounded-lg bg-[#ECFDF5] border border-[#16A34A]/30 text-xs font-medium text-[#065F46] flex items-start gap-2"
              >
                <Check className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{bookingSuccessBanner}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="booking-student-name"
                  className="block text-xs font-semibold text-[#141E19] mb-1.5"
                >
                  Student Full Name
                </label>
                <input
                  id="booking-student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Jordan Vance"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#141E19]/20 rounded-lg focus:outline-none focus:border-[#1B4332]"
                />
                {formErrors.studentName && (
                  <p role="alert" className="text-xs text-[#991B1B] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{formErrors.studentName}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="booking-student-email"
                    className="block text-xs font-semibold text-[#141E19] mb-1.5"
                  >
                    University Email (.edu)
                  </label>
                  <input
                    id="booking-student-email"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="jordan@university.edu"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#141E19]/20 rounded-lg focus:outline-none focus:border-[#1B4332]"
                  />
                  {formErrors.studentEmail && (
                    <p role="alert" className="text-xs text-[#991B1B] mt-1">
                      {formErrors.studentEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-student-id"
                    className="block text-xs font-semibold text-[#141E19] mb-1.5"
                  >
                    University Student ID
                  </label>
                  <input
                    id="booking-student-id"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="STU-408291"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#F8F7F4] border border-[#141E19]/20 rounded-lg focus:outline-none focus:border-[#1B4332]"
                  />
                  {formErrors.studentId && (
                    <p role="alert" className="text-xs text-[#991B1B] mt-1">
                      {formErrors.studentId}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-modality"
                  className="block text-xs font-semibold text-[#141E19] mb-1.5"
                >
                  Consultation Modality
                </label>
                <select
                  id="booking-modality"
                  value={modality}
                  onChange={(e) => setModality(e.target.value as BookingFormInput['modality'])}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#141E19]/20 rounded-lg focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="In-Person Campus Clinic">In-Person Campus Clinic</option>
                  <option value="Telehealth Encrypted Video">Telehealth Encrypted Video</option>
                  <option value="Same-Day Brief Triage">Same-Day Brief Triage</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="booking-reason"
                  className="block text-xs font-semibold text-[#141E19] mb-1.5"
                >
                  Primary Academic or Personal Focus for Session
                </label>
                <textarea
                  id="booking-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe what you would like to address (e.g., thesis exhaustion, panic before presentations, sleep disruption)..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#141E19]/20 rounded-lg focus:outline-none focus:border-[#1B4332]"
                />
                {formErrors.reason && (
                  <p role="alert" className="text-xs text-[#991B1B] mt-1">
                    {formErrors.reason}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#133124] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Confirm Confidential Appointment
              </button>
            </form>
          </div>
        </div>

        {/* Scheduled Counseling Sessions Table */}
        <div className="mt-10 bg-white border border-[#141E19]/12 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-[#EFECE6]/60 border-b border-[#141E19]/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
              <h3 className="text-sm font-bold text-[#141E19]">
                My Scheduled Counseling Sessions ({appointments.filter((a) => a.status === 'Confirmed').length} Active)
              </h3>
            </div>
            <span className="text-xs text-[#4A5550]">
              Encrypted calendar sync · Zero cancellation penalty up to 2 hours prior
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#4A5550]">
                No counseling sessions currently booked. Select a clinician and time slot above to schedule an intake.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#141E19]/10 text-[11px] font-semibold text-[#4A5550] bg-[#F8F7F4]">
                    <th className="py-3 px-6">Clinician & Specialty</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Modality</th>
                    <th className="py-3 px-4">Student ID & Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141E19]/10 text-xs">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#F8F7F4]/60">
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-[#141E19]">
                          {apt.counselorName}, {apt.credentials}
                        </div>
                        <div className="text-[#4A5550] mt-0.5">{apt.specialty}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-[#141E19]">
                        {apt.slot}
                      </td>
                      <td className="py-3.5 px-4 text-[#4A5550]">{apt.modality}</td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-[#4A5550]">
                        {apt.studentId} · {apt.studentEmail}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {apt.status === 'Confirmed' ? (
                          <span className="text-[#16A34A]">Confirmed</span>
                        ) : (
                          <span className="text-[#991B1B]">Cancelled</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {apt.status === 'Confirmed' ? (
                          <button
                            type="button"
                            onClick={() => onCancelAppointment(apt.id)}
                            aria-label={`Cancel session with ${apt.counselorName} on ${apt.slot}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#991B1B] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Cancel Session</span>
                          </button>
                        ) : (
                          <span className="text-[#4A5550]">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

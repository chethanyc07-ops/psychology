import React, { useState } from 'react';
import { Counselor, ScheduledAppointment } from '../utils/seedData';
import { validateBookingInput, BookingFormInput } from '../utils/clinicalLogic';
import { Calendar, MapPin, Check, XCircle, AlertCircle, HeartHandshake } from 'lucide-react';

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

const CounselorPortraitSvg: React.FC<{ theme: Counselor['portraitTheme']; name: string }> = ({
  theme,
  name,
}) => {
  const palettes = {
    'amber-sage': { bg: '#E0F2FE', accent: '#0D9488', coat: '#0F766E', skin: '#E0B899' },
    'slate-forest': { bg: '#F0FDFA', accent: '#0284C7', coat: '#0369A1', skin: '#8D5B4C' },
    'terracotta-stone': { bg: '#E0F2FE', accent: '#0D9488', coat: '#0E7490', skin: '#E8C5A5' },
    'indigo-moss': { bg: '#F0FDFA', accent: '#0284C7', coat: '#0F766E', skin: '#6F4536' },
  };
  const p = palettes[theme];

  return (
    <svg
      viewBox="0 0 96 96"
      className="w-16 h-16 rounded-2xl border border-[#BAE6FD] shrink-0"
      role="img"
      aria-label={`Portrait illustration of ${name}`}
    >
      <rect width="96" height="96" fill={p.bg} />
      <circle cx="48" cy="48" r="42" fill={p.accent} fillOpacity="0.08" />
      <path d="M18 96C18 75 30 66 48 66C66 66 78 75 78 96H18Z" fill={p.coat} />
      <path d="M38 66L48 80L58 66" fill="#FFFFFF" />
      <circle cx="48" cy="39" r="16" fill={p.skin} />
      <path
        d="M32 38C32 25 40 20 48 20C56 20 64 25 64 38C61 31 55 28 48 28C41 28 35 31 32 38Z"
        fill="#0F2942"
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
      `Scheduled your friendly 1-on-1 chat with ${activeCounselor.name} for ${selectedSlot}.`
    );
    setStudentName('');
    setStudentEmail('');
    setStudentId('');
    setReason('');
  };

  return (
    <section id="counseling" className="py-10 sm:py-14">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Header & Specialty Filter */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#BAE6FD] shadow-[0_12px_32px_-8px_rgba(15,41,66,0.05)] mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0D9488] bg-[#F0FDFA] border border-[#99F6E4] px-3.5 py-1.5 rounded-full mb-3">
              <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Free 1-on-1 Campus Support · In-Person or Video</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942]">
              Meet a Friendly Campus Counselor
            </h2>
            <p className="text-sm text-[#47627B] mt-2 max-w-2xl leading-relaxed">
              Pick a time that works for your schedule on the left, then share your name and university{' '}
              <code>.edu</code> email on the right to reserve a warm, confidential conversation.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div
            role="group"
            aria-label="Filter Counselors by Focus Area"
            className="inline-flex items-center gap-1.5 p-1.5 bg-[#F0F9FF] rounded-2xl border border-[#BAE6FD] overflow-x-auto max-w-full shrink-0"
          >
            {SPECIALTY_FILTERS.map((spec) => {
              const active = selectedSpecialtyFilter === spec;
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => onChangeSpecialtyFilter(spec)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0D9488] text-white shadow-xs'
                      : 'text-[#47627B] hover:text-[#0F2942] hover:bg-white/70'
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12-Column Split: Counselor Cards (7 cols) + Booking Panel (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Counselor List */}
          <div className="lg:col-span-7 space-y-4">
            {filteredCounselors.map((counselor) => {
              const isSelected = activeCounselor.id === counselor.id;
              return (
                <article
                  key={counselor.id}
                  className={`p-6 rounded-3xl bg-white border transition-all ${
                    isSelected
                      ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20 shadow-md'
                      : 'border-[#BAE6FD] hover:border-[#0284C7]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <CounselorPortraitSvg theme={counselor.portraitTheme} name={counselor.name} />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#47627B] mb-1">
                        <span className="font-bold text-[#0D9488]">{counselor.specialty}</span>
                        <span aria-hidden="true">·</span>
                        <span>{counselor.languages}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-[#0284C7]">
                          Wait: ~{counselor.waitDays}d
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-[#0F2942]">
                        {counselor.name},{' '}
                        <span className="font-medium text-[#47627B]">{counselor.credentials}</span>
                      </h3>
                      <p className="text-xs font-semibold text-[#47627B] mt-0.5">
                        {counselor.title}
                      </p>

                      <p className="text-sm text-[#0F2942]/90 leading-relaxed mt-3">
                        {counselor.bio}
                      </p>

                      <div className="mt-3 text-xs text-[#47627B] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" aria-hidden="true" />
                        <span>{counselor.clinicLocation}</span>
                        <span aria-hidden="true">·</span>
                        <span>{counselor.secondaryFocus}</span>
                      </div>

                      {/* Available Time Slots */}
                      <div className="mt-4 pt-4 border-t border-[#E0F2FE] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-[#47627B]">Available Times:</span>
                          {counselor.availableSlots.map((slot) => {
                            const slotSelected = isSelected && selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleSelectCounselor(counselor, slot)}
                                className={`px-3.5 py-1.5 text-xs font-mono tabular-nums rounded-xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  slotSelected
                                    ? 'bg-[#0D9488] text-white border-[#0D9488] font-bold'
                                    : 'bg-[#F0F9FF] text-[#0F2942] border-[#BAE6FD] hover:border-[#0D9488]'
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
                          className="text-xs font-bold text-[#0D9488] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {isSelected ? 'Selected ✓' : 'Choose Counselor'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Column: Confidential Session Reservation Form */}
          <div className="lg:col-span-5 bg-white border border-[#BAE6FD] rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="pb-4 border-b border-[#E0F2FE] mb-5">
              <div className="text-xs font-bold text-[#0D9488]">
                Private Student Session Booking
              </div>
              <h3 className="text-lg font-extrabold text-[#0F2942] mt-0.5">
                Chat with {activeCounselor.name}
              </h3>
              <p className="text-xs text-[#47627B] mt-1">
                {activeCounselor.specialty} · Time:{' '}
                <span className="font-mono tabular-nums font-bold text-[#0284C7]">
                  {selectedSlot}
                </span>
              </p>
            </div>

            {bookingSuccessBanner && (
              <div
                role="status"
                className="mb-5 p-4 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-xs font-semibold text-[#0F766E] flex items-start gap-2"
              >
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#0D9488]" aria-hidden="true" />
                <span>{bookingSuccessBanner}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="booking-student-name"
                  className="block text-xs font-bold text-[#0F2942] mb-1.5"
                >
                  Your Name (or Preferred Name)
                </label>
                <input
                  id="booking-student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Jordan Vance"
                  className="w-full px-4 py-2.5 text-sm bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl text-[#0F2942] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                />
                {formErrors.studentName && (
                  <p role="alert" className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{formErrors.studentName}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="booking-student-email"
                    className="block text-xs font-bold text-[#0F2942] mb-1.5"
                  >
                    University Email (.edu)
                  </label>
                  <input
                    id="booking-student-email"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="jordan@university.edu"
                    className="w-full px-4 py-2.5 text-sm bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl text-[#0F2942] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                  />
                  {formErrors.studentEmail && (
                    <p role="alert" className="text-xs text-[#DC2626] mt-1">
                      {formErrors.studentEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-student-id"
                    className="block text-xs font-bold text-[#0F2942] mb-1.5"
                  >
                    Student ID
                  </label>
                  <input
                    id="booking-student-id"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="STU-408291"
                    className="w-full px-4 py-2.5 text-sm font-mono tabular-nums bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl text-[#0F2942] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                  />
                  {formErrors.studentId && (
                    <p role="alert" className="text-xs text-[#DC2626] mt-1">
                      {formErrors.studentId}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-modality"
                  className="block text-xs font-bold text-[#0F2942] mb-1.5"
                >
                  How Would You Like to Meet?
                </label>
                <select
                  id="booking-modality"
                  value={modality}
                  onChange={(e) => setModality(e.target.value as BookingFormInput['modality'])}
                  className="w-full px-4 py-2.5 text-sm bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl text-[#0F2942] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                >
                  <option value="In-Person Campus Clinic">In-Person Campus Wellness Lounge</option>
                  <option value="Telehealth Encrypted Video">Private Video Call</option>
                  <option value="Same-Day Brief Triage">Same-Day Quick Check-In</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="booking-reason"
                  className="block text-xs font-bold text-[#0F2942] mb-1.5"
                >
                  What’s on Your Mind?
                </label>
                <textarea
                  id="booking-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Share a few words about what you'd like support with (e.g., exam stress, feeling overwhelmed, trouble sleeping)..."
                  className="w-full px-4 py-2.5 text-sm bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl text-[#0F2942] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                />
                {formErrors.reason && (
                  <p role="alert" className="text-xs text-[#DC2626] mt-1">
                    {formErrors.reason}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] rounded-2xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                Reserve Free 1-on-1 Session
              </button>
            </form>
          </div>
        </div>

        {/* Scheduled Counseling Sessions Table */}
        <div className="mt-10 bg-white border border-[#BAE6FD] rounded-3xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#F0F9FF] border-b border-[#BAE6FD] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
              <h3 className="text-sm font-extrabold text-[#0F2942]">
                My Upcoming Sessions ({appointments.filter((a) => a.status === 'Confirmed').length} Active)
              </h3>
            </div>
            <span className="text-xs text-[#47627B]">
              Private calendar reminder · Easy rescheduling anytime
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#47627B]">
                No sessions booked yet. Pick any counselor and time slot above whenever you feel ready.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E0F2FE] text-[11px] font-bold text-[#47627B] bg-[#F8FAFC]">
                    <th className="py-3 px-6">Counselor &amp; Focus</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0F2FE] text-xs">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#F0F9FF]/60">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-[#0F2942]">
                          {apt.counselorName}, {apt.credentials}
                        </div>
                        <div className="text-[#47627B] mt-0.5">{apt.specialty}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-[#0F2942]">
                        {apt.slot}
                      </td>
                      <td className="py-3.5 px-4 text-[#47627B]">{apt.modality}</td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-[#47627B]">
                        {apt.studentId} · {apt.studentEmail}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {apt.status === 'Confirmed' ? (
                          <span className="text-[#0D9488]">Confirmed</span>
                        ) : (
                          <span className="text-[#64748B]">Cancelled</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {apt.status === 'Confirmed' ? (
                          <button
                            type="button"
                            onClick={() => onCancelAppointment(apt.id)}
                            aria-label={`Cancel session with ${apt.counselorName} on ${apt.slot}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284C7] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span className="text-[#64748B]">Cancelled</span>
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

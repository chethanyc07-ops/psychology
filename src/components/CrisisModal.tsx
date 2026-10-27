import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, X, CheckCircle2 } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  const [dispatchRequested, setDispatchRequested] = useState(false);
  const [dormLocation, setDormLocation] = useState('');

  if (!isOpen) return null;

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dormLocation.trim()) return;
    setDispatchRequested(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141E19]/70 backdrop-blur-xs"
    >
      <div className="bg-white border border-[#141E19]/20 rounded-xl max-w-xl w-full p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#141E19]/10">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#9E2A2B] shrink-0" aria-hidden="true" />
            <div>
              <h2 id="crisis-modal-title" className="text-lg font-bold text-[#141E19]">
                24/7 Urgent Psychological & Campus Crisis Support
              </h2>
              <p className="text-xs text-[#4A5550]">
                Immediate confidential connection to licensed crisis counselors
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Crisis Support Dialog"
            className="p-1.5 text-[#4A5550] hover:text-[#141E19] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#9E2A2B]/25">
              <div className="text-xs font-semibold text-[#9E2A2B]">
                National Suicide & Crisis Lifeline
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#141E19] mt-1">
                Call or Text 988
              </div>
              <p className="text-xs text-[#4A5550] mt-1">
                Free, confidential 24/7 support across the United States & Canada.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F8F7F4] border border-[#141E19]/15">
              <div className="text-xs font-semibold text-[#1B4332]">
                Campus 24/7 On-Call Clinician
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#141E19] mt-1 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
                <span>(800) 555-0199</span>
              </div>
              <p className="text-xs text-[#4A5550] mt-1">
                Direct line to the North Quad Psychiatric & Mobile Wellness Team.
              </p>
            </div>
          </div>

          {/* Mobile Peer & Clinician Safe-Walk / Residence Hall Dispatch */}
          <div className="p-4 rounded-lg bg-[#F8F7F4] border border-[#141E19]/12">
            <h3 className="text-xs font-bold text-[#141E19] mb-1">
              Request Non-Police Mobile Clinician Check-In (Campus Residence Halls)
            </h3>
            <p className="text-xs text-[#4A5550] mb-3">
              A plainclothes licensed mental health counselor can meet you at your residence hall lounge or library within 15 minutes.
            </p>

            {dispatchRequested ? (
              <div className="p-3 rounded bg-[#ECFDF5] text-[#065F46] text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  On-Call Mobile Clinician notified for location "{dormLocation}". Estimated arrival: 12 minutes.
                </span>
              </div>
            ) : (
              <form onSubmit={handleDispatchSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  aria-label="Campus Building or Residence Hall Location"
                  value={dormLocation}
                  onChange={(e) => setDormLocation(e.target.value)}
                  placeholder="Enter hall or campus building (e.g., Oak House Room 302)"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#141E19]/20 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#133124] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Request Clinician Visit
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#141E19]/10 flex items-center justify-between">
          <span className="text-xs text-[#4A5550]">
            If you are in immediate physical danger, dial 911.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#141E19] bg-[#EFECE6] hover:bg-[#E2DDD5] rounded-lg cursor-pointer"
          >
            Return to Portal
          </button>
        </div>
      </div>
    </div>
  );
};

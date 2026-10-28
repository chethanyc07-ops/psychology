import React, { useState } from 'react';
import {
  PhoneCall,
  HeartHandshake,
  X,
  CheckCircle2,
  Languages,
  Calendar,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useAppPreferences } from '../utils/i18nAndAccessibility';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCounselor?: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  onBookCounselor,
}) => {
  const { language, toggleLanguage } = useAppPreferences();
  const isKn = language === 'kn';

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
      aria-labelledby="support-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2942]/50 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white border border-[#BAE6FD] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_24px_60px_rgba(15,41,66,0.18)] my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E0F2FE]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] shrink-0">
              <HeartHandshake className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="support-modal-title" className="text-lg sm:text-xl font-extrabold text-[#0F2942]">
                {isKn
                  ? 'ನಾವು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇವೆ — 24/7 ಕ್ಯಾಂಪಸ್ ಬೆಂಬಲ ಕೇಂದ್ರ'
                  : 'Get Support — You Never Have to Carry It Alone'}
              </h2>
              <p className="text-xs sm:text-sm text-[#47627B] mt-0.5">
                {isKn
                  ? 'ಉಚಿತ, ಗೌಪ್ಯ ಮತ್ತು ಸ್ನೇಹಪರ ನೆರವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಲಭ್ಯ (ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್)'
                  : 'Warm, confidential, and judgment-free care whenever you need someone to talk to'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F9FF] hover:bg-[#E0F2FE] text-xs font-bold text-[#0F2942] border border-[#BAE6FD] cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{isKn ? 'English' : 'ಕನ್ನಡ'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Support Dialog"
              className="p-2 text-[#47627B] hover:text-[#0F2942] hover:bg-[#F0F9FF] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Welcoming 3-Step Gentle Guide */}
        <div className="py-5 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#F0F9FF] border border-[#BAE6FD]/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7] mb-3">
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
              <span>
                {isKn ? 'ಈ ಕ್ಷಣದಲ್ಲೇ ಶಾಂತಿ ಮತ್ತು ಸಹಾಯ ಪಡೆಯಲು 3 ಸರಳ ದಾರಿಗಳು:' : '3 Gentle Ways to Connect Right Now:'}
              </span>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#0F2942]">
              <li className="p-3.5 rounded-2xl bg-white border border-[#BAE6FD]/60 shadow-2xs">
                <strong className="block text-[#0D9488] text-sm mb-1">
                  {isKn ? '1. ಆರಾಮದಾಯಕ ಸ್ಥಳಕ್ಕೆ ಬನ್ನಿ' : '1. Pause & Breathe'}
                </strong>
                <span className="text-[#47627B] leading-relaxed">
                  {isKn
                    ? 'ಸ್ನೇಹಿತರ ಕೊಠಡಿ, ಲಾಂಜ್ ಅಥವಾ ಶಾಂತ ಜಾಗದಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳಿ.'
                    : 'Sit somewhere comfortable—a study lounge, courtyard, or with a trusted friend.'}
                </span>
              </li>
              <li className="p-3.5 rounded-2xl bg-white border border-[#BAE6FD]/60 shadow-2xs">
                <strong className="block text-[#0D9488] text-sm mb-1">
                  {isKn ? '2. 14416 ಗೆ ಉಚಿತ ಕರೆ ಮಾಡಿ' : '2. Talk Live (14416)'}
                </strong>
                <span className="text-[#47627B] leading-relaxed">
                  {isKn
                    ? 'ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ 24/7 ಆಪ್ತಸಮಾಲೋಚಕರೊಂದಿಗೆ ಮಾತನಾಡಿ.'
                    : 'Call our 24/7 toll-free listener line in English or Kannada—zero wait.'}
                </span>
              </li>
              <li className="p-3.5 rounded-2xl bg-white border border-[#BAE6FD]/60 shadow-2xs">
                <strong className="block text-[#0D9488] text-sm mb-1">
                  {isKn ? '3. ಕ್ಯಾಂಪಸ್ ತಂಡವನ್ನು ಭೇಟಿ ಮಾಡಿ' : '3. Meet on Campus'}
                </strong>
                <span className="text-[#47627B] leading-relaxed">
                  {isKn
                    ? 'ನಿಮ್ಮ ಹಾಸ್ಟೆಲ್ ಅಥವಾ ವೆಲ್‌ನೆಸ್ ಕೇಂದ್ರದಲ್ಲಿ ನೇರವಾಗಿ ಭೇಟಿ ಮಾಡಿ.'
                    : 'Request a friendly campus counselor to meet you or book a 1-on-1 chat.'}
                </span>
              </li>
            </ol>
          </div>

          {/* Direct Support Cards (Teal & Soft Blue Rounded Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 sm:p-5 rounded-3xl bg-[#F0FDFA] border border-[#99F6E4]">
              <div className="text-xs font-bold text-[#0D9488]">
                {isKn
                  ? 'ಟೆಲಿ-ಮನಸ್ 24/7 ಉಚಿತ ಸಹಾಯವಾಣಿ'
                  : 'Tele-MANAS 24/7 Student Support Line'}
              </div>
              <div className="text-xl font-extrabold font-mono tabular-nums text-[#0F2942] mt-1 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                <span>14416 / 1800-891-4416</span>
              </div>
              <p className="text-xs text-[#47627B] mt-1.5 leading-relaxed">
                {isKn
                  ? 'ಉಚಿತ, 24/7 ಗೌಪ್ಯ ಬೆಂಬಲ (ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಲಭ್ಯ).'
                  : 'Free, confidential 24/7 listening and support in English, Kannada & regional languages.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#F0F9FF] border border-[#BAE6FD]">
              <div className="text-xs font-bold text-[#0284C7]">
                {isKn
                  ? 'ನಿಮ್ಹಾನ್ಸ್ ಮತ್ತು ಕ್ಯಾಂಪಸ್ ವೆಲ್‌ನೆಸ್ ಡೆಸ್ಕ್'
                  : 'Campus Wellness Desk & NIMHANS Line'}
              </div>
              <div className="text-xl font-extrabold font-mono tabular-nums text-[#0F2942] mt-1 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
                <span>080-46110007</span>
              </div>
              <p className="text-xs text-[#47627B] mt-1.5 leading-relaxed">
                {isKn
                  ? 'ಬೆಂಗಳೂರು ಸಹಾಯವಾಣಿ ಮತ್ತು ಕ್ಯಾಂಪಸ್ ಆಪ್ತಸಮಾಲೋಚಕರ ತಂಡ.'
                  : 'Warm human guidance day or night, plus same-day campus walk-in support.'}
              </p>
            </div>
          </div>

          {/* Friendly Campus Lounge / Residence Hall Check-In */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#BAE6FD]">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
              <h3 className="text-xs sm:text-sm font-bold text-[#0F2942]">
                {isKn
                  ? 'ನಿಮ್ಮ ಹಾಸ್ಟೆಲ್ ಅಥವಾ ಗ್ರಂಥಾಲಯದ ಬಳಿ ಆಪ್ತಸಮಾಲೋಚಕರ ಭೇಟಿಗಾಗಿ ವಿನಂತಿಸಿ'
                  : 'Prefer Someone to Come Meet You on Campus?'}
              </h3>
            </div>
            <p className="text-xs text-[#47627B] mb-3">
              {isKn
                ? 'ಸಾದಾ ಉಡುಪಿನಲ್ಲಿರುವ ಕ್ಯಾಂಪಸ್ ವೆಲ್‌ನೆಸ್ ಸಲಹೆಗಾರರು 15 ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಹಾಸ್ಟೆಲ್ ಲಾಂಜ್ ಅಥವಾ ಗ್ರಂಥಾಲಯದ ಬಳಿ ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗುತ್ತಾರೆ.'
                : 'A friendly campus counselor can meet you at your residence hall lounge, student center, or library within 15 minutes.'}
            </p>

            {dispatchRequested ? (
              <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0D9488]" aria-hidden="true" />
                <span>
                  {isKn
                    ? `"${dormLocation}" ಸ್ಥಳಕ್ಕೆ ಕ್ಯಾಂಪಸ್ ಸಲಹೆಗಾರರು ಬರುತ್ತಿದ್ದಾರೆ (ಅಂದಾಜು 12 ನಿಮಿಷ).`
                    : `A friendly campus counselor is on the way to "${dormLocation}" (estimated arrival: 12 minutes).`}
                </span>
              </div>
            ) : (
              <form onSubmit={handleDispatchSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  aria-label="Campus Building or Residence Hall Location"
                  value={dormLocation}
                  onChange={(e) => setDormLocation(e.target.value)}
                  placeholder={
                    isKn
                      ? 'ಹಾಸ್ಟೆಲ್ ಅಥವಾ ಕಟ್ಟಡದ ಹೆಸರು ನಮೂದಿಸಿ (ಉದಾ: ಕಾವೇರಿ ಹಾಸ್ಟೆಲ್ ರೂಮ್ 204)'
                      : 'Enter residence hall or campus spot (e.g., Cauvery Block Lounge)'
                  }
                  className="flex-1 px-4 py-2.5 text-xs bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl text-[#0F2942] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-2xl whitespace-nowrap shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  {isKn ? 'ಭೇಟಿಗಾಗಿ ವಿನಂತಿಸಿ' : 'Request Friendly Check-In'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E0F2FE] flex flex-wrap items-center justify-between gap-3">
          {onBookCounselor ? (
            <button
              type="button"
              onClick={onBookCounselor}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0D9488] bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] rounded-2xl cursor-pointer transition-colors"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>{isKn ? '1-ಆನ್-1 ಸಮಾಲೋಚನೆ ಕಾಯ್ದಿರಿಸಿ' : 'Schedule a 1-on-1 Session'}</span>
            </button>
          ) : (
            <span className="text-xs text-[#47627B]">
              {isKn ? '100% ಗೌಪ್ಯ ಮತ್ತು ಉಚಿತ ವಿದ್ಯಾರ್ಥಿ ಸೇವೆ' : '100% private & free for all students'}
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-[#0F2942] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] rounded-2xl cursor-pointer transition-colors"
          >
            {isKn ? 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Back to Space'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  PhoneCall,
  EyeOff,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  Calendar,
  HeartHandshake,
  Smile,
  Wind,
  Users,
  Sun,
} from 'lucide-react';
import { NavSectionId } from './TopBar';
import { useAppPreferences } from '../utils/i18nAndAccessibility';

interface HeroSectionProps {
  onSelectSection: (section: NavSectionId) => void;
  onOpenCrisisModal: () => void;
}

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale';

type PulseCheckId =
  | 'calm'
  | 'academics'
  | 'lonely'
  | 'anxious'
  | 'urgent';

type AmbientSoundId = 'rain' | 'brown' | 'lofi';

const ANONYMOUS_TOKENS = [
  'Quiet-Willow-408',
  'Calm-River-719',
  'Teal-Harbor-204',
  'Gentle-Breeze-852',
  'Misty-Ocean-316',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectSection,
  onOpenCrisisModal,
}) => {
  const { language } = useAppPreferences();
  const isKn = language === 'kn';

  // 1. Quick Hide (Esc) state & keyboard listener
  const [isQuickHidden, setIsQuickHidden] = useState<boolean>(false);
  const [studentAlias, setStudentAlias] = useState<string>(ANONYMOUS_TOKENS[0]);

  // 2. Interactive "Breathe With Me" Orb (4s Inhale -> 4s Hold -> 4s Exhale)
  const [breathTick, setBreathTick] = useState<number>(0);
  const [isBreathingPaused, setIsBreathingPaused] = useState<boolean>(false);

  // 3. Interactive "Quick Pulse Check" state
  const [selectedPulse, setSelectedPulse] = useState<PulseCheckId | null>(null);
  const [groundingStep, setGroundingStep] = useState<number>(0);
  const [examAudioPlaying, setExamAudioPlaying] = useState<boolean>(false);
  const [examAudioSeconds, setExamAudioSeconds] = useState<number>(180);

  // Ambient Audio synthesizer for Quick Pulse Check
  const [activeSound, setActiveSound] = useState<AmbientSoundId | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceCleanupRef = useRef<(() => void) | null>(null);

  const triggerQuickExit = () => {
    setIsQuickHidden(true);
    stopAmbientAudio();
    setExamAudioPlaying(false);
    try {
      window.location.replace('https://www.wikipedia.org');
    } catch {
      // Fallback neutral study screen remains active if sandboxed iframe blocks external navigation
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerQuickExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 12-second breathing cycle: 0..3 = Inhale (4s), 4..7 = Hold (4s), 8..11 = Exhale (4s)
  useEffect(() => {
    if (isBreathingPaused) return;
    const interval = setInterval(() => {
      setBreathTick((prev) => (prev + 1) % 12);
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathingPaused]);

  const phaseIndex = Math.floor(breathTick / 4);
  const breathPhase: BreathPhase =
    phaseIndex === 0 ? 'Inhale' : phaseIndex === 1 ? 'Hold' : 'Exhale';
  const secondsRemainingInPhase = 4 - (breathTick % 4);

  // Exam stress 3-minute audio timer
  useEffect(() => {
    if (!examAudioPlaying) return;
    const timer = setInterval(() => {
      setExamAudioSeconds((prev) => {
        if (prev <= 1) {
          setExamAudioPlaying(false);
          stopAmbientAudio();
          return 180;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examAudioPlaying]);

  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);

  const stopAmbientAudio = () => {
    if (sourceCleanupRef.current) {
      sourceCleanupRef.current();
      sourceCleanupRef.current = null;
    }
    setActiveSound(null);
  };

  const startSynthesizedSound = (soundId: AmbientSoundId) => {
    stopAmbientAudio();

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (soundId === 'rain' || soundId === 'brown') {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (soundId === 'brown') {
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 0.18;
        } else {
          output[i] = (lastOut + 0.08 * white) / 1.08;
          lastOut = output[i];
          output[i] *= 0.12;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = soundId === 'rain' ? 'bandpass' : 'lowpass';
      filter.frequency.value = soundId === 'rain' ? 950 : 280;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.35;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start(0);

      sourceCleanupRef.current = () => {
        try {
          whiteNoise.stop();
          whiteNoise.disconnect();
          gainNode.disconnect();
        } catch {
          // ignore
        }
      };
    }

    setActiveSound(soundId);
  };

  const handleToggleSound = (soundId: AmbientSoundId) => {
    if (activeSound === soundId) {
      stopAmbientAudio();
    } else {
      startSynthesizedSound(soundId);
    }
  };

  const handleToggleExamAudio = () => {
    if (examAudioPlaying) {
      setExamAudioPlaying(false);
      stopAmbientAudio();
    } else {
      setExamAudioPlaying(true);
      startSynthesizedSound('rain');
    }
  };

  const cycleAlias = () => {
    const idx = ANONYMOUS_TOKENS.indexOf(studentAlias);
    const next = ANONYMOUS_TOKENS[(idx + 1) % ANONYMOUS_TOKENS.length];
    setStudentAlias(next);
  };

  const GROUNDING_PROMPTS = [
    {
      count: 5,
      sense: 'Things You Can See',
      prompt:
        'Look around your desk or room and gently notice 5 everyday objects (a pen, a notebook, a cup, sunlight, the window frame).',
    },
    {
      count: 4,
      sense: 'Things You Can Touch',
      prompt:
        'Notice 4 comforting physical sensations right now (your feet resting on the floor, your sleeve, the cool desk, your hands).',
    },
    {
      count: 3,
      sense: 'Things You Can Hear',
      prompt:
        'Listen for 3 quiet background sounds (a ceiling fan, birds outside, distant footsteps, your own steady breath).',
    },
    {
      count: 2,
      sense: 'Things You Can Smell',
      prompt:
        'Notice 2 subtle scents in the room (tea, coffee, fresh air, paper) or recall your favorite calming place.',
    },
    {
      count: 1,
      sense: 'Kind Truth About Yourself',
      prompt:
        'Remind yourself: "I am doing the best I can today, and I am allowed to take things one step at a time."',
    },
  ];

  if (isQuickHidden) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 p-8 font-sans">
        <div className="max-w-3xl mx-auto border-b border-neutral-200 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-normal text-neutral-900">
              Spaced Repetition &amp; Study Pacing Guide
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              From Wikipedia, the free encyclopedia · Academic Study Reference
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickHidden(false)}
            className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg cursor-pointer"
          >
            Return to Space
          </button>
        </div>
        <p className="text-sm leading-relaxed text-neutral-700 mb-4">
          <strong>Spaced repetition</strong> is an evidence-based learning technique that is usually
          performed with flashcards. Newly introduced and more difficult flashcards are shown more
          frequently, while older and less difficult flashcards are shown less frequently.
        </p>
      </div>
    );
  }

  return (
    <div id="home" className="w-full text-[#0F2942]">
      {/* 1. Persistent Safety & Privacy Top-Bar (Soft Sky Blue & Calm Teal) */}
      <div
        role="region"
        aria-label="Safety and Privacy Utility Bar"
        className="bg-[#E0F2FE]/90 backdrop-blur-xl text-[#0F2942] border-b border-[#BAE6FD] px-4 sm:px-6 py-2.5"
      >
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Immediate Helpline Action */}
          <button
            type="button"
            onClick={onOpenCrisisModal}
            className="inline-flex items-center gap-2 font-semibold text-[#0F2942] hover:text-[#0D9488] transition-colors cursor-pointer text-left"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#0D9488] shrink-0" aria-hidden="true" />
            <span>
              Need someone right now? Call 24/7 Tele-MANAS:{' '}
              <strong className="font-mono text-[#0D9488] underline">14416</strong> | Campus Wellness Desk
            </span>
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Anonymous Mode Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0284C7]">
              <Lock className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
              <span>100% Confidential &amp; Private</span>
            </div>

            {/* Quick Exit Button (Esc) */}
            <button
              type="button"
              onClick={triggerQuickExit}
              title="Immediately switch screen to a neutral academic page (or press Esc)"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#F0F9FF] text-[#0F2942] font-bold text-[11px] border border-[#BAE6FD] transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
            >
              <EyeOff className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />
              <span>Quick Hide (Esc)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. The Hero Section (Welcoming Soft Blue, Teal & White Rounded Card + Prominent "Get Support" CTA) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 pb-10">
        <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#BAE6FD] shadow-[0_16px_48px_-12px_rgba(15,41,66,0.07)] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Hero Content: Warm Grounding Copy & Prominent "Get Support" Button */}
            <div className="lg:col-span-12 flex flex-col justify-between py-1">
              <div>
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-semibold text-[#0284C7] mb-5">
                  <Sun className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
                  <span>Welcoming Student Space</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Private Alias: <strong className="font-mono text-[#0D9488]">{studentAlias}</strong>
                  </span>
                </div>

                <h1 className="text-[clamp(1.9rem,3.2vw,3.1rem)] font-extrabold tracking-tight text-[#0F2942] leading-[1.14] mb-5 text-balance max-w-[28ch]">
                  {isKn
                    ? 'ನಿಮ್ಮ ಪದವಿಯಷ್ಟೇ ನಿಮ್ಮ ಮನಸ್ಸೂ ಮುಖ್ಯ. ಉಸಿರಾಡಲು, ಮಾತನಾಡಲು ಮತ್ತು ಗುಣಮುಖರಾಗಲು ಇದು ಸುರಕ್ಷಿತ ಹಾಗೂ ಗೌಪ್ಯ ತಾಣ.'
                    : 'Your mind matters as much as your degree. A safe, confidential space to breathe, talk, and heal.'}
                </h1>

                <p className="font-editorial text-base sm:text-lg text-[#47627B] leading-relaxed max-w-[65ch] mb-8">
                  {isKn
                    ? 'ಪರೀಕ್ಷೆಯ ಒತ್ತಡವಿರಲಿ, ಹಾಸ್ಟೆಲ್ ಒಂಟಿತನವಿರಲಿ ಅಥವಾ ರಾತ್ರಿ 2 ಗಂಟೆಗೆ ನಿಮ್ಮ ಮಾತು ಕೇಳಲು ಯಾರಾದರೂ ಬೇಕೆನಿಸಿದರೆ—ಯಾವುದೇ ತೀರ್ಪಿಲ್ಲದ ಬೆಂಬಲ ಇಲ್ಲಿದೆ.'
                    : "Whether you're overwhelmed by deadlines, feeling isolated on campus, or just need someone to listen at 2 AM—support is here, completely judgment-free."}
                </p>
              </div>

              <div>
                {/* Prominent "Get Support" CTA + Friendly Campus Actions */}
                <div className="flex flex-wrap items-center gap-3 mb-7">
                  <button
                    type="button"
                    onClick={onOpenCrisisModal}
                    data-testid="hero-get-support-btn"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-extrabold text-white bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] rounded-2xl shadow-[0_10px_28px_-4px_rgba(13,148,136,0.45)] hover:shadow-[0_14px_32px_-4px_rgba(2,132,199,0.55)] transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <HeartHandshake className="w-4 h-4 text-[#CCFBF1]" aria-hidden="true" />
                    <span>
                      {isKn ? 'ಬೆಂಬಲ ಪಡೆಯಿರಿ (Get Support)' : 'Get Support'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSection('counseling')}
                    className="inline-flex items-center gap-2 px-4 py-3.5 text-sm font-bold text-[#0F2942] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] rounded-2xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Calendar className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                    <span>
                      {isKn ? 'ಕ್ಯಾಂಪಸ್ ಆಪ್ತಸಮಾಲೋಚಕರನ್ನು ಭೇಟಿ ಮಾಡಿ' : 'Book a Campus Counselor'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSection('assessment')}
                    className="inline-flex items-center gap-2 px-4 py-3.5 text-sm font-bold text-[#0D9488] bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] rounded-2xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Smile className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                    <span>
                      {isKn ? '2-ನಿಮಿಷ ಮನಸ್ಸಿನ ನೋಟ' : '2-Min Check-In'}
                    </span>
                  </button>
                </div>

                <div className="pt-5 border-t border-[#E0F2FE] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#47627B]">
                  <span>No login required to explore</span>
                  <span aria-hidden="true">·</span>
                  <span>Warm 24/7 listeners &amp; friendly campus counselors</span>
                  <span aria-hidden="true">·</span>
                  <span>100% free for every student</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive "Quick Pulse Check" Widget */}
      <section
        aria-label="Quick Pulse Check"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-10"
      >
        <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#BAE6FD] shadow-[0_8px_30px_rgba(15,41,66,0.05)] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2942]">
                How is your headspace right now?
              </h2>
              <p className="text-xs sm:text-sm text-[#47627B] mt-0.5">
                Tap how you feel for a gentle, zero-login tool tailored to this moment.
              </p>
            </div>
            {selectedPulse && (
              <button
                type="button"
                onClick={() => setSelectedPulse(null)}
                className="self-start md:self-auto text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* 5 Interactive Mood Selector Rounded Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPulse('calm')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'calm'
                  ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                  : 'bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0F2942] border-[#BAE6FD]'
              }`}
            >
              <span className="text-sm font-bold">😌 Calm / Just Exploring</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'calm' ? 'text-white/90' : 'text-[#47627B]'
                }`}
              >
                Focus Sounds &amp; Daily Reflection →
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPulse('academics')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'academics'
                  ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                  : 'bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0F2942] border-[#BAE6FD]'
              }`}
            >
              <span className="text-sm font-bold">😟 Stressed about Studies</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'academics' ? 'text-white/90' : 'text-[#47627B]'
                }`}
              >
                3-Min Study Reset Audio →
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPulse('lonely')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'lonely'
                  ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                  : 'bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0F2942] border-[#BAE6FD]'
              }`}
            >
              <span className="text-sm font-bold">😔 Feeling Low or Lonely</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'lonely' ? 'text-white/90' : 'text-[#47627B]'
                }`}
              >
                Kind Student Peer Circles →
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPulse('anxious');
                setGroundingStep(0);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'anxious'
                  ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                  : 'bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0F2942] border-[#BAE6FD]'
              }`}
            >
              <span className="text-sm font-bold">😰 Anxious / Overwhelmed</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'anxious' ? 'text-white/90' : 'text-[#47627B]'
                }`}
              >
                5-4-3-2-1 Gentle Grounding →
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPulse('urgent')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'urgent'
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                  : 'bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]'
              }`}
            >
              <span className="text-sm font-bold">💙 Need Immediate Support</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'urgent' ? 'text-white/90' : 'text-[#0F766E]'
                }`}
              >
                24/7 Care &amp; Friendly Counselors →
              </span>
            </button>
          </div>

          {/* Interactive Response Panel based on selected Pulse Check */}
          {selectedPulse === 'calm' && (
            <div className="mt-5 pt-5 border-t border-[#E0F2FE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F2942]">
                  Study Focus Soundscapes &amp; Daily Rhythm
                </h3>
                <p className="text-xs text-[#47627B] mt-1">
                  Start a soothing focus track right now or log your daily mood and rest hours.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleSound('brown')}
                  className="px-4 py-2.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold cursor-pointer"
                >
                  {activeSound === 'brown' ? 'Stop Brown Noise' : 'Play Study Brown Noise'}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection('wellness-log')}
                  className="px-4 py-2.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-bold text-[#0F2942] hover:bg-[#E0F2FE] cursor-pointer"
                >
                  Open Mood &amp; Sleep Log →
                </button>
              </div>
            </div>
          )}

          {selectedPulse === 'academics' && (
            <div className="mt-5 pt-5 border-t border-[#E0F2FE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F2942]">
                  3-Minute Study &amp; Exam Calm Audio
                </h3>
                <p className="text-xs text-[#47627B] mt-1">
                  {examAudioPlaying
                    ? `Playing soothing rain (${Math.floor(examAudioSeconds / 60)}:${String(examAudioSeconds % 60).padStart(2, '0')} remaining). Drop your shoulders and take a slow breath.`
                    : 'Listen to a 3-minute soothing rain backdrop while taking a breather from your coursework.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleExamAudio}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold cursor-pointer"
                >
                  {examAudioPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Pause 3-Min Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play 3-Min Calm Audio</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection('counseling')}
                  className="px-4 py-2.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-bold text-[#0F2942] hover:bg-[#E0F2FE] cursor-pointer"
                >
                  Chat with an Academic Counselor →
                </button>
              </div>
            </div>
          )}

          {selectedPulse === 'lonely' && (
            <div className="mt-5 pt-5 border-t border-[#E0F2FE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F2942]">
                  You Are Part of a Caring Campus Community
                </h3>
                <p className="text-xs text-[#47627B] mt-1">
                  Connect with welcoming, anonymous student circles or reach out for a warm 1-on-1 conversation.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectSection('peer-groups')}
                  className="px-4 py-2.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold cursor-pointer"
                >
                  Visit Student Peer Circles →
                </button>
                <button
                  type="button"
                  onClick={onOpenCrisisModal}
                  className="px-4 py-2.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-bold text-[#0F2942] hover:bg-[#E0F2FE] cursor-pointer"
                >
                  Get Support Now
                </button>
              </div>
            </div>
          )}

          {selectedPulse === 'anxious' && (
            <div className="mt-5 pt-5 border-t border-[#E0F2FE]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono font-bold text-[#0D9488]">
                    5-4-3-2-1 Gentle Grounding · Step {groundingStep + 1} of 5
                  </div>
                  <h3 className="text-base font-bold text-[#0F2942] mt-0.5">
                    Notice {GROUNDING_PROMPTS[groundingStep].count}{' '}
                    {GROUNDING_PROMPTS[groundingStep].sense}
                  </h3>
                  <p className="text-xs text-[#47627B] mt-1 max-w-2xl">
                    {GROUNDING_PROMPTS[groundingStep].prompt}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setGroundingStep((prev) => (prev + 1) % GROUNDING_PROMPTS.length)
                    }
                    className="px-4 py-2.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold cursor-pointer"
                  >
                    {groundingStep < 4 ? 'Next Step →' : 'Start Over'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSection('cbt-studio')}
                    className="px-4 py-2.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-bold text-[#0F2942] hover:bg-[#E0F2FE] cursor-pointer"
                  >
                    Open Calm Space →
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedPulse === 'urgent' && (
            <div className="mt-5 pt-5 border-t border-[#BAE6FD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#0284C7]">
                  Immediate 24/7 Care &amp; Friendly Campus Support
                </h3>
                <p className="text-xs text-[#47627B] mt-1">
                  Call Tele-MANAS Toll-Free at{' '}
                  <strong className="font-mono text-[#0F2942]">14416</strong> or connect with a
                  same-day campus counselor right away.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenCrisisModal}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0284C7] text-white text-xs font-bold cursor-pointer"
                >
                  Open Get Support Hub
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection('counseling')}
                  className="px-4 py-2.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-bold text-[#0F2942] hover:bg-[#E0F2FE] cursor-pointer"
                >
                  Book Same-Day Counselor →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. "Ways to Find Your Calm" (4 Welcoming Rounded Feature Cards with Simple Icons) */}
      <section
        aria-label="How We Support You"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1">
              Simple, Welcoming Tools
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942]">
              How We Support Your Everyday Wellbeing
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenCrisisModal}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] text-xs font-bold text-[#0F766E] transition-colors cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>Need Someone to Talk to Right Now? Get Support →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: 2-Minute Mind Check-In */}
          <div className="bg-white rounded-3xl p-6 border border-[#BAE6FD] shadow-[0_8px_24px_-6px_rgba(15,41,66,0.05)] flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] mb-4">
                <Smile className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-xs font-bold text-[#0D9488] mb-1">
                Private &amp; Gentle · 2 Minutes
              </div>
              <h3 className="text-lg font-extrabold text-[#0F2942]">Mind &amp; Mood Check-In</h3>
              <p className="text-sm text-[#47627B] mt-2 leading-relaxed">
                Pause for two minutes to reflect on your energy, spot what is weighing on you, and get calm everyday tools.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E0F2FE]">
              <button
                type="button"
                onClick={() => onSelectSection('assessment')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:text-[#0F766E] cursor-pointer"
              >
                <span>Start 2-Min Check-In</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card 2: Friendly Campus Counselors */}
          <div className="bg-white rounded-3xl p-6 border border-[#BAE6FD] shadow-[0_8px_24px_-6px_rgba(15,41,66,0.05)] flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] mb-4">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-xs font-bold text-[#0284C7] mb-1">
                In-Person or Video · 100% Free
              </div>
              <h3 className="text-lg font-extrabold text-[#0F2942]">Campus Counselors</h3>
              <p className="text-sm text-[#47627B] mt-2 leading-relaxed">
                Schedule a welcoming 1-on-1 chat with a caring campus counselor at a time that fits your class schedule.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E0F2FE]">
              <button
                type="button"
                onClick={() => onSelectSection('counseling')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] cursor-pointer"
              >
                <span>Explore Available Times</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card 3: Calm Space & Breathing */}
          <div className="bg-white rounded-3xl p-6 border border-[#BAE6FD] shadow-[0_8px_24px_-6px_rgba(15,41,66,0.05)] flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] mb-4">
                <Wind className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-xs font-bold text-[#0D9488] mb-1">
                Instant Reset · Guided Pace
              </div>
              <h3 className="text-lg font-extrabold text-[#0F2942]">Calm Breathing &amp; Tools</h3>
              <p className="text-sm text-[#47627B] mt-2 leading-relaxed">
                Follow soothing breathing rhythms, 5-4-3-2-1 sensory grounding, and gentle thought reframing exercises.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E0F2FE]">
              <button
                type="button"
                onClick={() => onSelectSection('cbt-studio')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:text-[#0F766E] cursor-pointer"
              >
                <span>Open Calm Space</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card 4: Student Peer Community */}
          <div className="bg-white rounded-3xl p-6 border border-[#BAE6FD] shadow-[0_8px_24px_-6px_rgba(15,41,66,0.05)] flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] mb-4">
                <Users className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-xs font-bold text-[#0284C7] mb-1">
                Anonymous · Kind Community
              </div>
              <h3 className="text-lg font-extrabold text-[#0F2942]">Peer Support Circles</h3>
              <p className="text-sm text-[#47627B] mt-2 leading-relaxed">
                Share experiences, celebrate small daily wins, and encourage fellow students under a 100% private alias.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E0F2FE]">
              <button
                type="button"
                onClick={() => onSelectSection('peer-groups')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] cursor-pointer"
              >
                <span>Join Peer Circles</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The "Privacy Promise" Banner (Serene Teal & Soft Blue Rounded Card) */}
      <section
        aria-label="Our Privacy Promise"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-14"
      >
        <div className="rounded-3xl bg-gradient-to-br from-[#0F4C5C] via-[#0D6E6E] to-[#0284C7] text-white p-7 sm:p-10 border border-[#7DD3FC]/30 shadow-[0_16px_40px_-10px_rgba(15,76,92,0.25)]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-7 border-b border-white/15">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#99F6E4] mb-1">
                Our Student Privacy Promise
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Always Private, Welcoming &amp; Separate from Academic Records
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#E0F2FE]">
                Active Alias: <strong className="font-mono text-[#99F6E4]">{studentAlias}</strong>
              </span>
              <button
                type="button"
                onClick={cycleAlias}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold text-white border border-white/25 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Shuffle Alias</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 pt-7">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#99F6E4] mb-2">
                <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h3>Zero Academic Linkage</h3>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                Your conversations, mood reflections, and counselor visits are never shared with faculty, departments, or placement cells.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#99F6E4] mb-2">
                <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h3>Explore by Nickname</h3>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                Use a friendly alias or anonymous student token until you feel completely comfortable sharing your name.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#99F6E4] mb-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h3>Free for All Enrolled Students</h3>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                100% supported by your campus wellness community—no fees, paperwork, or insurance needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

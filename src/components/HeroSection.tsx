import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  PhoneCall,
  EyeOff,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Square,
  Send,
  RefreshCw,
  CheckCircle2,
  X,
  Headphones,
  Calendar,
  MessageSquareHeart,
  Compass,
} from 'lucide-react';
import { NavSectionId } from './TopBar';

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

interface ChatMessage {
  id: string;
  sender: 'companion' | 'student';
  text: string;
  timestamp: string;
}

const AFFIRMATIONS = [
  'Reminder: One bad exam or rejected application does not define your worth.',
  'Reminder: Resting is part of the work, not the opposite of it. You are allowed to pause.',
  'Reminder: Everyone on campus is figuring things out at their own pace—comparison is a thief of peace.',
  'Reminder: Asking for support is a sign of self-awareness, never a weakness.',
];

const ANONYMOUS_TOKENS = [
  'Quiet-Willow-408',
  'Calm-River-719',
  'Sage-Lantern-204',
  'Gentle-Cedar-852',
  'Misty-Harbor-316',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectSection,
  onOpenCrisisModal,
}) => {
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

  // 4. Interactive 24/7 AI Companion Drawer state
  const [isCompanionOpen, setIsCompanionOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'companion',
      text: "Hi there. You're in an encrypted, anonymous space. Whether it's 2 AM exam stress, placement anxiety, or feeling isolated on campus—what's weighing on your mind right now?",
      timestamp: 'Just now',
    },
  ]);

  // 6. Instant Micro-Care Footer Strip (Web Audio API synthesizer for Rain, Brown Noise, Soft Lo-Fi)
  const [activeSound, setActiveSound] = useState<AmbientSoundId | null>(null);
  const [affirmationIndex, setAffirmationIndex] = useState<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceCleanupRef = useRef<(() => void) | null>(null);

  // Quick Exit handler (redirects or activates immediate neutral study screen)
  const triggerQuickExit = () => {
    setIsQuickHidden(true);
    stopAmbientAudio();
    setExamAudioPlaying(false);
    try {
      window.location.replace('https://www.wikipedia.org');
    } catch {
      // Fallback decoys remain active if sandboxed iframe blocks external navigation
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCompanionOpen) {
          setIsCompanionOpen(false);
          return;
        }
        triggerQuickExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompanionOpen]);

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

  // Exam Anxiety 3-minute audio timer
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

  // Cleanup audio on unmount
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

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
          // Soft rain texture
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
    } else if (soundId === 'lofi') {
      // Warm ambient lo-fi chord drone (Fmaj7 warm sine/triangle blend)
      const freqs = [174.61, 220.0, 261.63, 329.63];
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.08;
      masterGain.connect(ctx.destination);

      const oscs = freqs.map((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(masterGain);
        osc.start();
        return osc;
      });

      sourceCleanupRef.current = () => {
        oscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        });
        masterGain.disconnect();
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

  const handleSendCompanionMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const studentMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'student',
      text: trimmed,
      timestamp: 'Just now',
    };

    const lower = trimmed.toLowerCase();
    let replyText =
      "Thank you for sharing that with me. When everything piles up at once, your nervous system treats academic deadlines like physical danger. Let's take one slow breath together—what feels like the single heaviest part right now?";

    if (lower.includes('exam') || lower.includes('grade') || lower.includes('placement') || lower.includes('study')) {
      replyText =
        "Exam and placement pressure can feel all-consuming. Remember: a single test or interview measures one moment in time, not your capability or future. Would you like to break today's workload into one tiny 15-minute step, or just vent first?";
    } else if (lower.includes('lonely') || lower.includes('alone') || lower.includes('roommate') || lower.includes('home')) {
      replyText =
        "Feeling isolated on a crowded campus is more common than anyone admits out loud. You don't have to carry it alone here. We can talk for as long as you want, or I can connect you with our anonymous Student Safe Space.";
    } else if (lower.includes('anxious') || lower.includes('panic') || lower.includes('overwhelm') || lower.includes('sleep')) {
      replyText =
        "Let's slow things down right now. Unclench your jaw, drop your shoulders away from your ears, and name 3 things you can see in your room. I'm right here with you.";
    }

    const companionMsg: ChatMessage = {
      id: `c-${Date.now() + 1}`,
      sender: 'companion',
      text: replyText,
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, studentMsg, companionMsg]);
    setChatInput('');
  };

  const cycleAlias = () => {
    const idx = ANONYMOUS_TOKENS.indexOf(studentAlias);
    const next = ANONYMOUS_TOKENS[(idx + 1) % ANONYMOUS_TOKENS.length];
    setStudentAlias(next);
  };

  const GROUNDING_PROMPTS = [
    { count: 5, sense: 'Things You Can See', prompt: 'Look around your desk or room and silently notice 5 distinct objects (a pen, a shadow, a book spine, a mug, the window frame).' },
    { count: 4, sense: 'Things You Can Touch', prompt: 'Notice 4 physical sensations right now (your feet on the floor, the texture of your sleeve, the cool desk surface, your hands resting).' },
    { count: 3, sense: 'Things You Can Hear', prompt: 'Listen for 3 background sounds (a distant fan, birds outside, keyboard clicks, your own steady breath).' },
    { count: 2, sense: 'Things You Can Smell', prompt: 'Notice 2 subtle scents in the air (coffee, paper, fresh air, soap) or recall your favorite calming scent.' },
    { count: 1, sense: 'Kind Truth About Yourself', prompt: 'Name 1 grounding truth: "I am doing the best I can today, and I am allowed to take things one hour at a time."' },
  ];

  // If Quick Hide (Esc) was triggered and iframe prevented external redirect, render neutral Wikipedia/Study screen
  if (isQuickHidden) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 p-8 font-sans">
        <div className="max-w-3xl mx-auto border-b border-neutral-200 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-normal text-neutral-900">
              Spaced Repetition & Cognitive Load Theory
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              From Wikipedia, the free encyclopedia · Academic Study Reference
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickHidden(false)}
            className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded cursor-pointer"
          >
            Return to Portal
          </button>
        </div>
        <p className="text-sm leading-relaxed text-neutral-700 mb-4">
          <strong>Spaced repetition</strong> is an evidence-based learning technique that is usually performed with flashcards. Newly introduced and more difficult flashcards are shown more frequently, while older and less difficult flashcards are shown less frequently in order to exploit the psychological spacing effect.
        </p>
        <p className="text-sm leading-relaxed text-neutral-700">
          <strong>Cognitive load</strong> refers to the used amount of working memory resources. Heavy algorithmic or reading tasks divided into 25-minute intervals improve long-term retention across university coursework.
        </p>
      </div>
    );
  }

  return (
    <div id="home" className="w-full text-[#141E19]">
      {/* 1. Persistent Safety & Privacy Top-Bar */}
      <div
        role="region"
        aria-label="Safety and Privacy Utility Bar"
        className="sticky top-[57px] z-30 bg-[#132A20]/95 backdrop-blur-xl text-white border-b border-white/15 px-4 sm:px-6 py-2"
      >
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Emergency Helpline Action */}
          <button
            type="button"
            onClick={onOpenCrisisModal}
            className="inline-flex items-center gap-2 font-medium text-white/95 hover:text-[#95D5B2] transition-colors cursor-pointer text-left"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#F4A261] shrink-0" aria-hidden="true" />
            <span>
              In crisis? Call 24/7 Tele-MANAS: <strong className="font-mono underline">14416</strong> | Campus Wellness Desk
            </span>
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Anonymous Mode Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[#A3C9B5]">
              <Lock className="w-3.5 h-3.5 text-[#95D5B2]" aria-hidden="true" />
              <span>100% Confidential & Encrypted</span>
            </div>

            {/* Quick Exit Button (Esc) */}
            <button
              type="button"
              onClick={triggerQuickExit}
              title="Immediately switch screen to a neutral academic page (or press Esc)"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] border border-white/25 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <EyeOff className="w-3.5 h-3.5 text-[#F4A261]" aria-hidden="true" />
              <span>Quick Hide (Esc)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. The Hero Section (Empathy + Immediate Action) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Warm Grounding Copy & Dual CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#38443E] mb-4">
                <span>Student Safe Space</span>
                <span aria-hidden="true">·</span>
                <span>Zero Academic Record Linkage</span>
                <span aria-hidden="true">·</span>
                <span>Anonymous Alias: <strong className="font-mono text-[#1B4332]">{studentAlias}</strong></span>
              </div>

              <h1 className="text-[clamp(2rem,3.4vw,3.25rem)] font-bold tracking-tight text-[#141E19] leading-[1.12] mb-5 text-balance">
                Your mind matters as much as your degree. A safe, confidential space to breathe, talk, and heal.
              </h1>

              <p className="font-editorial text-base sm:text-lg text-[#38443E] leading-relaxed max-w-[62ch] mb-8">
                Whether you&apos;re overwhelmed by deadlines, feeling isolated on campus, or just need someone to listen at 2 AM—support is here, completely judgment-free.
              </p>
            </div>

            <div>
              {/* Dual Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-7">
                <button
                  type="button"
                  onClick={() => setIsCompanionOpen(true)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#133124] rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <MessageSquareHeart className="w-4 h-4 text-[#95D5B2]" aria-hidden="true" />
                  <span>Talk to AI Companion Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSection('counseling')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#141E19] bg-white/70 hover:bg-white backdrop-blur-xl border border-[#141E19]/20 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Calendar className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
                  <span>Book a Campus Counselor</span>
                </button>
              </div>

              <div className="pt-5 border-t border-[#141E19]/10 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#4A5550]">
                <span>No login required to explore</span>
                <span aria-hidden="true">·</span>
                <span>24/7 instant companion & licensed campus psychologists</span>
                <span aria-hidden="true">·</span>
                <span>100% free for enrolled students</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive "Breathe With Me" Orb (4s Inhale, 4s Hold, 4s Exhale) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative h-full min-h-[380px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#132A20] via-[#1B4332] to-[#0F221A] text-white p-7 flex flex-col justify-between border border-white/20 shadow-[0_16px_40px_rgba(20,30,25,0.14)]">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span className="font-medium tracking-wide">Interactive Grounding Pacer</span>
                <button
                  type="button"
                  onClick={() => setIsBreathingPaused((prev) => !prev)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {isBreathingPaused ? 'Resume Orb' : 'Pause Orb'}
                </button>
              </div>

              {/* Animated Breathing Orb Centerpiece */}
              <div className="my-6 flex flex-col items-center justify-center relative py-6">
                {/* Outer Soft Halo */}
                <div
                  aria-hidden="true"
                  className={`w-48 h-48 rounded-full bg-[#74C69D]/20 blur-xl transition-transform duration-[4000ms] ease-in-out flex items-center justify-center ${
                    breathPhase === 'Inhale'
                      ? 'scale-125 opacity-95'
                      : breathPhase === 'Hold'
                      ? 'scale-125 opacity-100'
                      : 'scale-75 opacity-60'
                  }`}
                />

                {/* Core Glowing Breathing Sphere */}
                <div
                  role="status"
                  aria-live="polite"
                  className={`absolute w-40 h-40 rounded-full bg-gradient-to-tr from-[#52B788]/85 via-[#95D5B2]/80 to-[#D8F3DC]/90 text-[#0F221A] shadow-[0_0_50px_rgba(149,213,178,0.45),inset_0_2px_12px_rgba(255,255,255,0.9)] flex flex-col items-center justify-center text-center transition-transform duration-[4000ms] ease-in-out ${
                    breathPhase === 'Inhale'
                      ? 'scale-115'
                      : breathPhase === 'Hold'
                      ? 'scale-115'
                      : 'scale-80'
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#132A20]/80">
                    Breathe With Me
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-[#0F221A] mt-0.5">
                    {breathPhase}
                  </span>
                  <span className="text-xs font-mono font-bold tabular-nums text-[#132A20]/90 mt-1">
                    {secondsRemainingInPhase}s
                  </span>
                </div>
              </div>

              {/* Cycle Guide Footer */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span className={breathPhase === 'Inhale' ? 'text-[#95D5B2] font-bold' : ''}>
                    Inhale 4s
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={breathPhase === 'Hold' ? 'text-[#95D5B2] font-bold' : ''}>
                    Hold 4s
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={breathPhase === 'Exhale' ? 'text-[#95D5B2] font-bold' : ''}>
                    Exhale 4s
                  </span>
                </div>
                <span className="text-[11px] text-[#A3C9B5]">Lowers cortisol in 60s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive "Quick Pulse Check" Widget */}
      <section
        aria-label="Quick Pulse Check"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-12"
      >
        <div className="rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgba(20,30,25,0.06)] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#141E19]">
                How is your headspace right now?
              </h2>
              <p className="text-xs text-[#4A5550] mt-0.5">
                Tap how you feel for an instant, zero-login tool tailored to this moment.
              </p>
            </div>
            {selectedPulse && (
              <button
                type="button"
                onClick={() => setSelectedPulse(null)}
                className="self-start md:self-auto text-xs font-semibold text-[#4A5550] hover:text-[#141E19] cursor-pointer"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* 5 Interactive Mood Selector Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPulse('calm')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'calm'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-white/80 hover:bg-white text-[#141E19] border-[#141E19]/12'
              }`}
            >
              <span className="text-sm font-bold">😌 Calm / Just Exploring</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'calm' ? 'text-white/85' : 'text-[#4A5550]'
                }`}
              >
                Wellness Library & Focus Sounds →
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPulse('academics')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'academics'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-white/80 hover:bg-white text-[#141E19] border-[#141E19]/12'
              }`}
            >
              <span className="text-sm font-bold">😟 Stressed about Academics</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'academics' ? 'text-white/85' : 'text-[#4A5550]'
                }`}
              >
                3-Min Exam Anxiety Grounding Audio →
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPulse('lonely')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'lonely'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-white/80 hover:bg-white text-[#141E19] border-[#141E19]/12'
              }`}
            >
              <span className="text-sm font-bold">😔 Feeling Low or Lonely</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'lonely' ? 'text-white/85' : 'text-[#4A5550]'
                }`}
              >
                Anonymous Peer Forum or AI Chat →
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
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-white/80 hover:bg-white text-[#141E19] border-[#141E19]/12'
              }`}
            >
              <span className="text-sm font-bold">😰 Anxious / Overwhelmed</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'anxious' ? 'text-white/85' : 'text-[#4A5550]'
                }`}
              >
                5-4-3-2-1 Grounding Exercise →
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPulse('urgent')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPulse === 'urgent'
                  ? 'bg-[#9E2A2B] text-white border-[#9E2A2B] shadow-sm'
                  : 'bg-[#9E2A2B]/[0.06] hover:bg-[#9E2A2B]/[0.12] text-[#7F1D1D] border-[#9E2A2B]/25'
              }`}
            >
              <span className="text-sm font-bold">🆘 Need Urgent Support</span>
              <span
                className={`text-[11px] mt-2 ${
                  selectedPulse === 'urgent' ? 'text-white/90' : 'text-[#7F1D1D]/85'
                }`}
              >
                Priority Counselor Slot & SOS Numbers →
              </span>
            </button>
          </div>

          {/* Interactive Response Panel based on selected Pulse Check */}
          {selectedPulse === 'calm' && (
            <div className="mt-5 pt-5 border-t border-[#141E19]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#141E19]">
                  Wellness Library & Study Focus Soundscapes
                </h3>
                <p className="text-xs text-[#4A5550] mt-1">
                  Start an ambient focus track right now or log your baseline mood and sleep hours.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleSound('brown')}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold cursor-pointer"
                >
                  {activeSound === 'brown' ? 'Stop Brown Noise' : 'Play Study Brown Noise'}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection('wellness-log')}
                  className="px-4 py-2 rounded-xl bg-white border border-[#141E19]/15 text-xs font-semibold text-[#141E19] hover:bg-[#F3EFEA] cursor-pointer"
                >
                  Open Mood & Sleep Log →
                </button>
              </div>
            </div>
          )}

          {selectedPulse === 'academics' && (
            <div className="mt-5 pt-5 border-t border-[#141E19]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#141E19]">
                  3-Minute Exam & Placement Anxiety Reset Audio
                </h3>
                <p className="text-xs text-[#4A5550] mt-1">
                  {examAudioPlaying
                    ? `Playing calming rain & vagus-nerve pacing (${Math.floor(examAudioSeconds / 60)}:${String(examAudioSeconds % 60).padStart(2, '0')} remaining). Drop your shoulders and unclench your jaw.`
                    : 'Listen to a 3-minute soothing rain backdrop while resetting before studying or entering an exam hall.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleExamAudio}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold cursor-pointer"
                >
                  {examAudioPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Pause 3-Min Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play 3-Min Grounding Audio</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection('counseling')}
                  className="px-4 py-2 rounded-xl bg-white border border-[#141E19]/15 text-xs font-semibold text-[#141E19] cursor-pointer"
                >
                  Book Academic Burnout Specialist →
                </button>
              </div>
            </div>
          )}

          {selectedPulse === 'lonely' && (
            <div className="mt-5 pt-5 border-t border-[#141E19]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#141E19]">
                  You Don&apos;t Have to Carry This Alone Tonight
                </h3>
                <p className="text-xs text-[#4A5550] mt-1">
                  Connect with moderated, pseudonym-only student circles or talk privately with our 24/7 AI Companion.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCompanionOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold cursor-pointer"
                >
                  Open 24/7 AI Companion
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection('peer-groups')}
                  className="px-4 py-2 rounded-xl bg-white border border-[#141E19]/15 text-xs font-semibold text-[#141E19] cursor-pointer"
                >
                  Go to Anonymous Peer Groups →
                </button>
              </div>
            </div>
          )}

          {selectedPulse === 'anxious' && (
            <div className="mt-5 pt-5 border-t border-[#141E19]/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono font-bold text-[#1B4332]">
                    5-4-3-2-1 Sensory Grounding · Step {groundingStep + 1} of 5
                  </div>
                  <h3 className="text-base font-bold text-[#141E19] mt-0.5">
                    Name {GROUNDING_PROMPTS[groundingStep].count} {GROUNDING_PROMPTS[groundingStep].sense}
                  </h3>
                  <p className="text-xs text-[#38443E] mt-1 max-w-2xl">
                    {GROUNDING_PROMPTS[groundingStep].prompt}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setGroundingStep((prev) => (prev + 1) % GROUNDING_PROMPTS.length)
                    }
                    className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold cursor-pointer"
                  >
                    {groundingStep < 4 ? 'Next Step →' : 'Restart 5-4-3-2-1'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSection('cbt-studio')}
                    className="px-4 py-2 rounded-xl bg-white border border-[#141E19]/15 text-xs font-semibold text-[#141E19] cursor-pointer"
                  >
                    More Calm Tools →
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedPulse === 'urgent' && (
            <div className="mt-5 pt-5 border-t border-[#9E2A2B]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#7F1D1D]">
                  Immediate 24/7 Human Support & Same-Day Priority Triage
                </h3>
                <p className="text-xs text-[#4A5550] mt-1">
                  Call Tele-MANAS Toll-Free at <strong className="font-mono text-[#141E19]">14416</strong> or <strong className="font-mono text-[#141E19]">988</strong>, or book a same-day priority campus clinician slot.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenCrisisModal}
                  className="px-4 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold cursor-pointer"
                >
                  Open 24/7 SOS Numbers
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection('counseling')}
                  className="px-4 py-2 rounded-xl bg-white border border-[#141E19]/15 text-xs font-semibold text-[#141E19] cursor-pointer"
                >
                  Book Priority Counselor Slot →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. "How We Support You" (4 Feature Navigation Cards) */}
      <section
        aria-label="How We Support You"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-14"
      >
        <div className="mb-6">
          <div className="text-xs font-medium text-[#4A5550] mb-1">
            01. Campus Support Ecosystem
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141E19]">
            How We Support You
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: 24/7 AI Listener */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#141E19]/12 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-[#1B4332] mb-2">
                Instant & Private · 24/7 Availability
              </div>
              <h3 className="text-lg font-bold text-[#141E19]">24/7 AI Listener</h3>
              <p className="text-sm text-[#4A5550] mt-2 leading-relaxed">
                Vent freely at any hour. Get CBT-backed coping strategies and grounding prompts in real time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#141E19]/10">
              <button
                type="button"
                onClick={() => setIsCompanionOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] hover:underline cursor-pointer"
              >
                <span>Start Chatting</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card 2: Confidential Counseling */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#141E19]/12 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-[#1B4332] mb-2">
                Licensed Pros · In-Person or Video
              </div>
              <h3 className="text-lg font-bold text-[#141E19]">Confidential Counseling</h3>
              <p className="text-sm text-[#4A5550] mt-2 leading-relaxed">
                Book 1-on-1 video, audio, or on-campus sessions with university psychologists.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#141E19]/10">
              <button
                type="button"
                onClick={() => onSelectSection('counseling')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] hover:underline cursor-pointer"
              >
                <span>View Slots</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card 3: Mental Health Checkups */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#141E19]/12 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-[#1B4332] mb-2">
                2-Min Quizzes · PHQ-9 & GAD-7
              </div>
              <h3 className="text-lg font-bold text-[#141E19]">Mental Health Checkups</h3>
              <p className="text-sm text-[#4A5550] mt-2 leading-relaxed">
                Take clinically validated self-assessments (PHQ-9, GAD-7) to understand your stress and anxiety levels.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#141E19]/10">
              <button
                type="button"
                onClick={() => onSelectSection('assessment')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] hover:underline cursor-pointer"
              >
                <span>Take a Test</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card 4: Student Safe Space */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#141E19]/12 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-[#1B4332] mb-2">
                Anonymous · Moderated Circles
              </div>
              <h3 className="text-lg font-bold text-[#141E19]">Student Safe Space</h3>
              <p className="text-sm text-[#4A5550] mt-2 leading-relaxed">
                Share experiences and support fellow students on moderated, pseudonym-only campus boards.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#141E19]/10">
              <button
                type="button"
                onClick={() => onSelectSection('peer-groups')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] hover:underline cursor-pointer"
              >
                <span>Join Community</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The "Privacy Promise" Banner (Stigma Breaker) */}
      <section
        aria-label="Our Privacy Promise"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-14"
      >
        <div className="rounded-3xl bg-[#141E19] text-white p-7 sm:p-10 border border-white/15">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-7 border-b border-white/15">
            <div>
              <div className="text-xs font-medium text-[#95D5B2] mb-1">
                02. Ironclad Student Privacy Promise
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Built So Faculty, HODs & Placement Cells Never Know
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/75">
                Active Alias: <strong className="font-mono text-[#95D5B2]">{studentAlias}</strong>
              </span>
              <button
                type="button"
                onClick={cycleAlias}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white border border-white/20 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>New Alias</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 pt-7">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#95D5B2] mb-2">
                <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h3>Zero Academic Linkage</h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Your sessions, mood logs, and test scores are never shared with faculty, departments, or placement cells.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#95D5B2] mb-2">
                <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h3>Alias Support</h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Use a nickname or anonymous student token until you feel comfortable sharing your real name.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#95D5B2] mb-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h3>Free for All Enrolled Students</h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                100% covered by the institution—no hidden fees or insurance needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 24/7 AI Companion Drawer / Modal */}
      {isCompanionOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="24/7 Confidential AI Companion"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#141E19]/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#141E19]/15 shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
            <div className="px-6 py-4 bg-[#132A20] text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#95D5B2] font-medium">
                  🔒 Encrypted · Alias: {studentAlias}
                </div>
                <h3 className="text-base font-bold">24/7 AI Companion (CBT Listener)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompanionOpen(false)}
                aria-label="Close AI Companion"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-[#F8F7F4]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'student' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'student'
                        ? 'bg-[#1B4332] text-white'
                        : 'bg-white text-[#141E19] border border-[#141E19]/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendCompanionMessage}
              className="p-4 bg-white border-t border-[#141E19]/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Share what's on your mind (100% private)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#141E19]/15 text-sm text-[#141E19] focus:outline-none focus:border-[#1B4332]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#133124] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Flame,
  Wind,
  MessageSquareHeart,
  CalendarHeart,
  PhoneCall,
  Headphones,
  AlertCircle,
  X,
  Send,
  Lock,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { NavSectionId } from './TopBar';

interface AssessmentModuleProps {
  onSelectSection: (section: NavSectionId) => void;
  onOpenCrisisModal: () => void;
}

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  fullText: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'great', emoji: '😄', label: 'Great', fullText: '😄 Great' },
  { id: 'okay', emoji: '🙂', label: 'Okay', fullText: '🙂 Okay' },
  { id: 'meh', emoji: '😐', label: 'Meh / Numb', fullText: '😐 Meh / Numb' },
  { id: 'stressed', emoji: '😟', label: 'Stressed', fullText: '😟 Stressed' },
  { id: 'overwhelmed', emoji: '😣', label: 'Overwhelmed', fullText: '😣 Overwhelmed' },
];

const STRESS_TRIGGER_TAGS: string[] = [
  '📚 Exams & Grades',
  '💼 Placements & Career Fear',
  '🏠 Hostel / Homesickness',
  '💤 Poor Sleep / Exhaustion',
  '💔 Friends / Relationships',
  '💸 Financial Pressure',
  '🎭 Imposter Syndrome ("Not good enough")',
  '🌫️ Nothing specific, just feeling heavy',
];

interface ScreeningQuestion {
  id: string;
  numberLabel: string;
  question: string;
}

const RAPID_SCREENING_QUESTIONS: ScreeningQuestion[] = [
  {
    id: 'q1',
    numberLabel: 'Q1',
    question: 'Feeling nervous, anxious, or on edge?',
  },
  {
    id: 'q2',
    numberLabel: 'Q2',
    question: 'Not being able to stop or control worrying (about studies, future, etc.)?',
  },
  {
    id: 'q3',
    numberLabel: 'Q3',
    question: 'Little interest or pleasure in doing things you usually enjoy?',
  },
  {
    id: 'q4',
    numberLabel: 'Q4',
    question: 'Feeling down, depressed, hopeless, or emotionally burned out?',
  },
];

interface AnswerOption {
  points: number;
  label: string;
  displayLabel: string;
}

const ANSWER_OPTIONS: AnswerOption[] = [
  { points: 0, label: 'Not at all', displayLabel: 'Not at all (0)' },
  { points: 1, label: 'Several days', displayLabel: 'Several days (1)' },
  { points: 2, label: 'More than half the days', displayLabel: 'More than half the days (2)' },
  { points: 3, label: 'Nearly every day', displayLabel: 'Nearly every day (3)' },
];

export interface DayMoodStreakItem {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  emoji: string;
  label: string;
  battery?: number;
  score?: number;
  updatedAt?: string;
}

const STORAGE_KEY_WEEKLY_STREAK = 'solace_weekly_mood_streak_v1';

const DEFAULT_WEEKLY_STREAK: DayMoodStreakItem[] = [
  { day: 'Mon', emoji: '🙂', label: 'Okay', battery: 75, score: 2 },
  { day: 'Tue', emoji: '😄', label: 'Great', battery: 85, score: 1 },
  { day: 'Wed', emoji: '😐', label: 'Meh / Numb', battery: 55, score: 4 },
  { day: 'Thu', emoji: '😟', label: 'Stressed', battery: 40, score: 6 },
  { day: 'Fri', emoji: '🙂', label: 'Okay', battery: 65, score: 3 },
  { day: 'Sat', emoji: '😄', label: 'Great', battery: 80, score: 1 },
  { day: 'Sun', emoji: '🙂', label: 'Okay', battery: 70, score: 2 },
];

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({
  onSelectSection,
  onOpenCrisisModal,
}) => {
  // Step 1 state
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number>(60);
  const [hasTouchedBattery, setHasTouchedBattery] = useState<boolean>(false);

  // Step 2 state
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [triggerLimitNotice, setTriggerLimitNotice] = useState<boolean>(false);

  // Step 3 state (4 questions, 0-3 points each)
  const [screeningAnswers, setScreeningAnswers] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  // Step 4 state
  const [brainDump, setBrainDump] = useState<string>('');

  // Submission & validation state
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [streakSavedMessage, setStreakSavedMessage] = useState<boolean>(false);

  // 7-Day Mood Streak Bar state (Mon to Sun) persisted in localStorage
  const [weeklyStreak, setWeeklyStreak] = useState<DayMoodStreakItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WEEKLY_STREAK);
      return raw ? JSON.parse(raw) : DEFAULT_WEEKLY_STREAK;
    } catch {
      return DEFAULT_WEEKLY_STREAK;
    }
  });

  const [selectedDayForDetail, setSelectedDayForDetail] = useState<DayMoodStreakItem | null>(null);

  // Interactive support modals for Result Card actions
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale (4s)' | 'Hold (4s)' | 'Exhale (4s)'>(
    'Inhale (4s)'
  );
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState<number>(180);

  const [isAiBotOpen, setIsAiBotOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'ai' | 'student'; text: string }[]>([
    {
      sender: 'ai',
      text: "Hi there. I'm your confidential 24/7 Campus Companion. We can unpack what came up in your check-in at your own pace—no judgment, no academic records. What feels heaviest right now?",
    },
  ]);

  useEffect(() => {
    if (!isBreathingModalOpen) return;
    const phaseOrder: ('Inhale (4s)' | 'Hold (4s)' | 'Exhale (4s)')[] = [
      'Inhale (4s)',
      'Hold (4s)',
      'Exhale (4s)',
    ];
    let phaseIdx = 0;

    const phaseInterval = window.setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phaseOrder.length;
      setBreathingPhase(phaseOrder[phaseIdx]);
    }, 4000);

    const countdownInterval = window.setInterval(() => {
      setBreathingSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(phaseInterval);
      window.clearInterval(countdownInterval);
    };
  }, [isBreathingModalOpen]);

  // Calculate step completion for the Progress Bar
  const step1Complete = selectedMood !== null || hasTouchedBattery;
  const step2Complete = selectedTriggers.length > 0;
  const step3AnsweredCount = screeningAnswers.filter((a) => a !== null).length;
  const step3Complete = step3AnsweredCount === 4;
  const step4Complete = isSubmitted || brainDump.trim().length > 0;

  const completedStepsCount = [
    step1Complete,
    step2Complete,
    step3Complete,
    isSubmitted,
  ].filter(Boolean).length;

  const currentStepNumber = isSubmitted
    ? 4
    : !step1Complete
    ? 1
    : !step2Complete
    ? 2
    : !step3Complete
    ? 3
    : 4;

  const totalScore = screeningAnswers.reduce<number>(
    (sum, val) => sum + (val !== null ? val : 0),
    0
  );

  const handleToggleTrigger = (tag: string) => {
    setTriggerLimitNotice(false);
    if (selectedTriggers.includes(tag)) {
      setSelectedTriggers((prev) => prev.filter((t) => t !== tag));
    } else {
      if (selectedTriggers.length >= 3) {
        setTriggerLimitNotice(true);
        return;
      }
      setSelectedTriggers((prev) => [...prev, tag]);
    }
  };

  const handleSelectAnswer = (qIndex: number, points: number) => {
    setValidationMessage(null);
    setScreeningAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = points;
      return next;
    });
  };

  const updateCurrentDayInStreak = (scoreVal: number) => {
    const dayNames: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ];
    const todayName = dayNames[new Date().getDay()];
    const matchedMood =
      MOOD_OPTIONS.find((m) => m.fullText === selectedMood) ||
      (scoreVal <= 3
        ? MOOD_OPTIONS[1]
        : scoreVal <= 8
        ? MOOD_OPTIONS[3]
        : MOOD_OPTIONS[4]);

    const updated = weeklyStreak.map((item) =>
      item.day === todayName
        ? {
            ...item,
            emoji: matchedMood.emoji,
            label: matchedMood.label,
            battery: batteryLevel,
            score: scoreVal,
            updatedAt: 'Today',
          }
        : item
    );
    setWeeklyStreak(updated);
    try {
      localStorage.setItem(STORAGE_KEY_WEEKLY_STREAK, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (screeningAnswers.some((ans) => ans === null)) {
      setValidationMessage(
        'Please answer all 4 rapid screening questions in Step 3 so we can calculate your check-in summary.'
      );
      return;
    }
    setValidationMessage(null);
    setIsSubmitted(true);
    setStreakSavedMessage(false);
    updateCurrentDayInStreak(totalScore);
  };

  const handleSaveStreak = () => {
    updateCurrentDayInStreak(totalScore);
    setStreakSavedMessage(true);
  };

  const handleScrollToSoundscapes = () => {
    const footerEl = document.querySelector('[aria-label="60-Second Reset Ambient Audio Player"]');
    if (footerEl) {
      footerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleResetAll = () => {
    setSelectedMood(null);
    setBatteryLevel(60);
    setHasTouchedBattery(false);
    setSelectedTriggers([]);
    setTriggerLimitNotice(false);
    setScreeningAnswers([null, null, null, null]);
    setBrainDump('');
    setValidationMessage(null);
    setIsSubmitted(false);
    setStreakSavedMessage(false);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const studentMsg = { sender: 'student' as const, text: trimmed };
    const triggerContext =
      selectedTriggers.length > 0
        ? `especially around ${selectedTriggers.map((t) => t.replace(/^[^\s]+\s/, '')).join(' and ')}`
        : 'with everything on your plate';

    const replyText =
      totalScore >= 4
        ? `Thank you for sharing that honestly. Carrying that kind of pressure ${triggerContext} is genuinely exhausting. Let's break it down into one tiny, manageable piece for the next 15 minutes—what is one thing you can give yourself permission to pause tonight?`
        : `I hear you. Even when you're managing overall, dealing with thoughts like that ${triggerContext} takes energy. Would you like a quick 2-minute cognitive reframe or a study grounding tip?`;

    setChatMessages((prev) => [...prev, studentMsg, { sender: 'ai', text: replyText }]);
    setChatInput('');
  };

  const progressWidthClass = isSubmitted
    ? 'w-full'
    : completedStepsCount === 0
    ? 'w-1/4'
    : completedStepsCount === 1
    ? 'w-2/4'
    : completedStepsCount === 2
    ? 'w-3/4'
    : 'w-full';

  return (
    <section
      id="assessment"
      aria-label="2-Minute Mind & Mood Check-In"
      className="py-10 sm:py-14 px-4 sm:px-8 max-w-[1080px] mx-auto"
    >
      {/* 1. Section Header & Disclaimer Strip */}
      <div className="bg-white/85 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(20,30,25,0.05)] mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1B4332] bg-[#E8F3EE] border border-[#1B4332]/15 px-3.5 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>⏱️ Takes less than 2 minutes</span>
            <span aria-hidden="true" className="text-[#1B4332]/40">
              |
            </span>
            <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>🔒 Private &amp; Stored Locally</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectSection('wellness-log')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A5B13] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#F59E0B]/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
            <span>7-Day Mood &amp; Sleep Streak &rarr;</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141E19]">
          2-Minute Mind &amp; Mood Check-In
        </h2>
        <p className="text-sm sm:text-base text-[#4A5550] mt-2 max-w-2xl leading-relaxed">
          Pause for two minutes. Answer 4 quick prompts to understand your current stress level and
          get instant tools tailored to how you feel today.
        </p>

        {/* Visual Step Indicator Progress Bar (Step 1 of 4 -> 25% — 50% — 75% — Done) */}
        <div className="mt-6 pt-5 border-t border-[#141E19]/10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#141E19] mb-2.5">
            <span className="inline-flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#1B4332] text-white font-mono">
                {isSubmitted ? 'Completed' : `Step ${currentStepNumber} of 4`}
              </span>
              <span className="text-[#4A5550] font-medium">
                {isSubmitted
                  ? 'All 4 prompts complete — see your personalized card below'
                  : '25% — 50% — 75% — Done'}
              </span>
            </span>

            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A5550] hover:text-[#141E19] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Check-In</span>
            </button>
          </div>

          {/* Progress Track */}
          <div className="w-full h-2.5 bg-[#EFECE6] rounded-full overflow-hidden p-0.5 border border-[#141E19]/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] transition-all duration-500 ${progressWidthClass}`}
            />
          </div>

          {/* Step Milestones: 25% — 50% — 75% — Done */}
          <div className="grid grid-cols-4 gap-2 mt-2.5 text-[11px] font-mono">
            <div
              className={`flex items-center gap-1.5 ${
                currentStepNumber >= 1 || step1Complete
                  ? 'text-[#1B4332] font-bold'
                  : 'text-[#4A5550]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  step1Complete ? 'bg-[#1B4332]' : 'bg-[#1B4332]/40'
                }`}
              />
              <span>25% · Mood &amp; Battery</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                currentStepNumber >= 2 || step2Complete
                  ? 'text-[#1B4332] font-bold'
                  : 'text-[#4A5550]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  step2Complete ? 'bg-[#1B4332]' : 'bg-[#141E19]/20'
                }`}
              />
              <span>50% · Triggers</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                currentStepNumber >= 3 || step3Complete
                  ? 'text-[#1B4332] font-bold'
                  : 'text-[#4A5550]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  step3Complete ? 'bg-[#1B4332]' : 'bg-[#141E19]/20'
                }`}
              />
              <span>75% · Rapid Screen</span>
            </div>
            <div
              className={`flex items-center justify-end gap-1.5 ${
                isSubmitted || step4Complete ? 'text-[#1B4332] font-bold' : 'text-[#4A5550]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSubmitted ? 'bg-[#16A34A]' : 'bg-[#141E19]/20'
                }`}
              />
              <span>Done · Summary</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitCheckIn} className="space-y-6">
        {/* 2. Step 1: Mood & Social Battery Sliders (30 Seconds) */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#141E19]/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
                Step 1 of 4 · ~30 Seconds
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#141E19] mt-0.5">
                Mood &amp; Social Battery Sliders
              </h3>
            </div>
            {step1Complete && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>25% Complete</span>
              </span>
            )}
          </div>

          <div className="space-y-7">
            {/* Prompt 1: Mood Selector */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-[#141E19] mb-3">
                Overall, how does your mind feel today?
              </label>
              <div
                role="radiogroup"
                aria-label="Overall, how does your mind feel today?"
                className="grid grid-cols-2 sm:grid-cols-5 gap-3"
              >
                {MOOD_OPTIONS.map((option) => {
                  const isSelected = selectedMood === option.fullText;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedMood(option.fullText)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-md scale-[1.02]'
                          : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12 hover:border-[#1B4332]/40'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl" aria-hidden="true">
                        {option.emoji}
                      </span>
                      <span className="text-xs sm:text-sm font-bold tracking-tight">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt 2: Energy Slider */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <label
                  htmlFor="mental-social-battery-slider"
                  className="text-sm sm:text-base font-bold text-[#141E19]"
                >
                  Where is your mental/social battery right now?
                </label>
                <span className="font-mono text-sm font-extrabold text-[#1B4332] bg-[#E8F3EE] px-3 py-1 rounded-lg border border-[#1B4332]/15">
                  {batteryLevel}%{' '}
                  {batteryLevel <= 25
                    ? '· Drained'
                    : batteryLevel <= 55
                    ? '· Low / Recharging'
                    : batteryLevel <= 80
                    ? '· Steady'
                    : '· Fully Charged'}
                </span>
              </div>

              <div className="bg-[#F8F7F4] p-4 sm:p-5 rounded-2xl border border-[#141E19]/10">
                <input
                  id="mental-social-battery-slider"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={batteryLevel}
                  onChange={(e) => {
                    setBatteryLevel(Number(e.target.value));
                    setHasTouchedBattery(true);
                  }}
                  aria-label="Where is your mental/social battery right now?"
                  className="w-full h-2.5 bg-[#DFDCD4] rounded-lg appearance-none cursor-pointer accent-[#1B4332]"
                />
                <div className="flex items-center justify-between text-xs font-semibold text-[#4A5550] mt-2.5">
                  <span>0% Drained</span>
                  <span className="hidden sm:inline text-[#4A5550]/75">50% Half-Tank</span>
                  <span>100% Fully Charged</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Step 2: College Stress Trigger Tags (20 Seconds) */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#141E19]/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
                Step 2 of 4 · ~20 Seconds
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#141E19] mt-0.5">
                College Stress Trigger Tags
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#4A5550] bg-[#F8F7F4] px-3 py-1 rounded-lg border border-[#141E19]/10">
                Selected: {selectedTriggers.length} / 3
              </span>
              {step2Complete && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>50% Complete</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base font-bold text-[#141E19] mb-4">
            What is taking up the most space in your head right now? (Select up to 3)
          </p>

          <div
            role="group"
            aria-label="College Stress Trigger Tags (Select up to 3)"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {STRESS_TRIGGER_TAGS.map((tag) => {
              const isSelected = selectedTriggers.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggleTrigger(tag)}
                  className={`flex items-center justify-between gap-2 px-4 py-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                      : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12 hover:border-[#1B4332]/40'
                  }`}
                >
                  <span className="leading-snug">{tag}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#A7F3D0]" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {triggerLimitNotice && (
            <p className="mt-3 text-xs font-semibold text-[#9A5B13] bg-[#FEF3C7] border border-[#F59E0B]/30 px-3.5 py-2 rounded-xl inline-flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" aria-hidden="true" />
              <span>You can select up to 3 top triggers. Tap an active tag to deselect it first.</span>
            </p>
          )}
        </div>

        {/* 4. Step 3: The 4-Question Rapid Screening (45 Seconds) */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#141E19]/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
                Step 3 of 4 · ~45 Seconds · PHQ-4 + Academic Burnout
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#141E19] mt-0.5">
                The 4-Question Rapid Screening
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#4A5550] bg-[#F8F7F4] px-3 py-1 rounded-lg border border-[#141E19]/10">
                Answered: {step3AnsweredCount} / 4
              </span>
              {step3Complete && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>75% Complete</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base font-bold text-[#141E19] mb-5">
            Over the last 2 weeks, how often have you been bothered by the following?
          </p>

          <div className="divide-y divide-[#141E19]/10 border border-[#141E19]/10 rounded-2xl overflow-hidden bg-[#F8F7F4]/50">
            {RAPID_SCREENING_QUESTIONS.map((q, qIdx) => {
              const currentVal = screeningAnswers[qIdx];
              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 hover:bg-white transition-colors"
                >
                  <div className="max-w-lg">
                    <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#1B4332] mb-1">
                      <span className="px-2 py-0.5 rounded bg-[#E8F3EE]">{q.numberLabel}</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-[#141E19] leading-snug">
                      {q.question}
                    </p>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label={`${q.numberLabel}: ${q.question}`}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 shrink-0"
                  >
                    {ANSWER_OPTIONS.map((opt) => {
                      const isSelected = currentVal === opt.points;
                      return (
                        <button
                          key={opt.points}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectAnswer(qIdx, opt.points)}
                          className={`px-3.5 py-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                              : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12 hover:border-[#1B4332]/40'
                          }`}
                        >
                          <div className="text-xs font-bold whitespace-nowrap">{opt.label}</div>
                          <div
                            className={`text-[11px] font-mono mt-0.5 ${
                              isSelected ? 'text-[#A7F3D0]' : 'text-[#4A5550]'
                            }`}
                          >
                            ({opt.points} {opt.points === 1 ? 'pt' : 'pts'})
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Step 4: "One-Line Brain Dump" (25 Seconds — Optional) */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#141E19]/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
                Step 4 of 4 · ~25 Seconds · Optional
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#141E19] mt-0.5">
                &ldquo;One-Line Brain Dump&rdquo;
              </h3>
            </div>
            <span className="text-xs font-medium text-[#4A5550] bg-[#F8F7F4] px-3 py-1 rounded-lg border border-[#141E19]/10">
              🔒 Never leaves your browser
            </span>
          </div>

          <label
            htmlFor="one-line-brain-dump"
            className="block text-sm sm:text-base font-bold text-[#141E19] mb-3"
          >
            Want to get one thought off your chest? (Optional &amp; private)
          </label>

          <input
            id="one-line-brain-dump"
            type="text"
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="e.g., I have 3 assignments due tomorrow and I can't focus..."
            className="w-full px-4 py-3.5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/15 text-sm sm:text-base text-[#141E19] placeholder:text-[#4A5550]/65 focus:outline-none focus:bg-white focus:border-[#1B4332] transition-colors"
          />

          {validationMessage && (
            <div
              role="alert"
              className="mt-4 p-4 rounded-2xl bg-[#FEF2F2] border border-[#DC2626]/25 text-[#991B1B] text-xs sm:text-sm font-semibold flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{validationMessage}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#141E19]/10">
            <p className="text-xs text-[#4A5550]">
              Your check-in score is calculated immediately from Step 3 (0–12 points).
            </p>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#1B4332] hover:bg-[#133124] text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>See My Check-In Summary &rarr;</span>
            </button>
          </div>
        </div>
      </form>

      {/* 6. Dynamic Result Card (Shown After Clicking Submit) */}
      {isSubmitted && (
        <div
          id="checkin-result-card"
          data-testid="checkin-dynamic-result-card"
          className="mt-8 transition-all"
        >
          {/* 🟢 Score 0–3: Balanced / Mild Stress (Green Card) */}
          {totalScore <= 3 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#ECFDF5] border-2 border-[#10B981]/40 shadow-[0_16px_40px_rgba(16,185,129,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D1FAE5] text-[#065F46] text-xs font-extrabold">
                  <span>🟢 Score 0–3: Balanced / Mild Stress</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#065F46] bg-white/80 px-3 py-1 rounded-lg border border-[#10B981]/30">
                  Total Score: {totalScore} / 12 pts
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#064E3B]">
                &ldquo;You’re managing well right now, even if college gets busy.&rdquo;
              </h3>

              <p className="text-sm text-[#065F46] mt-2 leading-relaxed">
                {selectedMood ? `Mood logged: ${selectedMood} · ` : ''}
                Mental/Social Battery: {batteryLevel}%
                {selectedTriggers.length > 0
                  ? ` · Top focus areas: ${selectedTriggers.join(', ')}`
                  : ''}
              </p>

              {brainDump.trim() && (
                <div className="mt-4 p-3.5 rounded-2xl bg-white/75 border border-[#10B981]/25 text-xs sm:text-sm text-[#064E3B] italic">
                  <span className="font-bold not-italic">Your private note: </span>
                  &ldquo;{brainDump.trim()}&rdquo;
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleScrollToSoundscapes}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Headphones className="w-4 h-4" aria-hidden="true" />
                  <span>Listen to Focus Soundscapes</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveStreak}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#F0FDF4] text-[#065F46] border border-[#059669]/35 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                  <span>
                    {streakSavedMessage ? 'Check-In Streak Saved! ✓' : 'Save Check-In Streak'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 🟡 Score 4–8: Moderate Stress / Academic Burnout (Amber Card) */}
          {totalScore >= 4 && totalScore <= 8 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#FFFBEB] border-2 border-[#F59E0B]/45 shadow-[0_16px_40px_rgba(245,158,11,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FEF3C7] text-[#92400E] text-xs font-extrabold">
                  <span>🟡 Score 4–8: Moderate Stress / Academic Burnout</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#92400E] bg-white/80 px-3 py-1 rounded-lg border border-[#F59E0B]/35">
                  Total Score: {totalScore} / 12 pts
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#78350F]">
                &ldquo;Your mental load is running high. It’s a good time to slow down and unpack
                what’s stressing you.&rdquo;
              </h3>

              <p className="text-sm text-[#92400E] mt-2 leading-relaxed">
                {selectedMood ? `Mood logged: ${selectedMood} · ` : ''}
                Mental/Social Battery: {batteryLevel}%
                {selectedTriggers.length > 0
                  ? ` · Top triggers: ${selectedTriggers.join(', ')}`
                  : ''}
              </p>

              {brainDump.trim() && (
                <div className="mt-4 p-3.5 rounded-2xl bg-white/75 border border-[#F59E0B]/30 text-xs sm:text-sm text-[#78350F] italic">
                  <span className="font-bold not-italic">Your private note: </span>
                  &ldquo;{brainDump.trim()}&rdquo;
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBreathingSecondsLeft(180);
                    setIsBreathingModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Wind className="w-4 h-4" aria-hidden="true" />
                  <span>Try 3-Min Breathing Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAiBotOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#FFFBEB] text-[#78350F] border border-[#D97706]/40 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <MessageSquareHeart className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                  <span>Talk to AI Support Bot</span>
                </button>
              </div>
            </div>
          )}

          {/* 🔴 Score 9–12: High Distress / Overwhelmed (Soft Coral Card) */}
          {totalScore >= 9 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#FFF1F2] border-2 border-[#F43F5E]/40 shadow-[0_16px_40px_rgba(244,63,94,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFE4E6] text-[#9F1239] text-xs font-extrabold">
                  <span>🔴 Score 9–12: High Distress / Overwhelmed</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#9F1239] bg-white/80 px-3 py-1 rounded-lg border border-[#F43F5E]/30">
                  Total Score: {totalScore} / 12 pts
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#881337]">
                &ldquo;You are carrying a heavy emotional load right now. You don&apos;t have to
                figure this out alone.&rdquo;
              </h3>

              <p className="text-sm text-[#9F1239] mt-2 leading-relaxed">
                {selectedMood ? `Mood logged: ${selectedMood} · ` : ''}
                Mental/Social Battery: {batteryLevel}%
                {selectedTriggers.length > 0
                  ? ` · Top triggers: ${selectedTriggers.join(', ')}`
                  : ''}
              </p>

              {brainDump.trim() && (
                <div className="mt-4 p-3.5 rounded-2xl bg-white/75 border border-[#F43F5E]/30 text-xs sm:text-sm text-[#881337] italic">
                  <span className="font-bold not-italic">Your private note: </span>
                  &ldquo;{brainDump.trim()}&rdquo;
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectSection('counseling')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <CalendarHeart className="w-4 h-4" aria-hidden="true" />
                  <span>Book Priority Campus Counselor</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCrisisModal}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#FFF1F2] text-[#9F1239] border border-[#E11D48]/40 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-[#E11D48]" aria-hidden="true" />
                  <span>Call 24/7 Helpline (14416)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bonus UI Widget: 7-Day Mood Streak Bar (Mon to Sun) */}
      <div className="mt-8 bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <CalendarDays className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#141E19]">
                7-Day Mood Streak Bar (Mon &ndash; Sun)
              </h3>
              <p className="text-xs text-[#4A5550]">
                Saved in browser localStorage so you can track emotional patterns across exam weeks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectSection('wellness-log')}
            className="text-xs font-bold text-[#1B4332] hover:underline cursor-pointer"
          >
            Open Full Mood &amp; Sleep Insights &rarr;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weeklyStreak.map((dayItem) => {
            const isSelected = selectedDayForDetail?.day === dayItem.day;
            return (
              <button
                key={dayItem.day}
                type="button"
                onClick={() =>
                  setSelectedDayForDetail(isSelected ? null : dayItem)
                }
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                    : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/10'
                }`}
              >
                <span
                  className={`text-[11px] font-mono font-bold uppercase ${
                    isSelected ? 'text-[#A7F3D0]' : 'text-[#4A5550]'
                  }`}
                >
                  {dayItem.day}
                </span>
                <span className="text-2xl sm:text-3xl my-1.5" aria-hidden="true">
                  {dayItem.emoji}
                </span>
                <span
                  className={`text-[10px] font-semibold truncate max-w-full ${
                    isSelected ? 'text-white' : 'text-[#141E19]'
                  }`}
                >
                  {dayItem.label}
                </span>
              </button>
            );
          })}
        </div>

        {selectedDayForDetail && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#141E19]">
            <span>
              <strong>{selectedDayForDetail.day}:</strong> {selectedDayForDetail.emoji}{' '}
              {selectedDayForDetail.label}
              {selectedDayForDetail.battery !== undefined
                ? ` · Social Battery: ${selectedDayForDetail.battery}%`
                : ''}
              {selectedDayForDetail.score !== undefined
                ? ` · Rapid Screen Score: ${selectedDayForDetail.score}/12`
                : ''}
            </span>
            <span className="text-[#4A5550] font-mono">🔒 Stored locally</span>
          </div>
        )}
      </div>

      {/* Interactive 3-Min Breathing Reset Modal */}
      {isBreathingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141E19]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#141E19]/10 shadow-2xl text-center relative">
            <button
              type="button"
              onClick={() => setIsBreathingModalOpen(false)}
              aria-label="Close breathing reset"
              className="absolute top-4 right-4 p-2 rounded-full text-[#4A5550] hover:bg-[#F8F7F4] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] bg-[#E8F3EE] px-3 py-1 rounded-lg">
              <Wind className="w-3.5 h-3.5" />
              <span>3-Minute Guided Breathing Reset</span>
            </span>

            <h4 className="text-xl font-extrabold text-[#141E19] mt-3">
              Unclench your jaw and drop your shoulders
            </h4>
            <p className="text-xs text-[#4A5550] mt-1 font-mono">
              Time remaining: {Math.floor(breathingSecondsLeft / 60)}:
              {String(breathingSecondsLeft % 60).padStart(2, '0')}
            </p>

            <div className="my-8 flex items-center justify-center">
              <div
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-[4000ms] ease-in-out border-4 border-[#1B4332]/25 bg-gradient-to-br from-[#D8F3DC] to-[#95D5B2] shadow-inner ${
                  breathingPhase === 'Inhale (4s)'
                    ? 'scale-115'
                    : breathingPhase === 'Hold (4s)'
                    ? 'scale-115 opacity-90'
                    : 'scale-90 opacity-75'
                }`}
              >
                <span className="text-base font-extrabold text-[#1B4332]">{breathingPhase}</span>
                <span className="text-[11px] font-medium text-[#1B4332]/80 mt-1">
                  4-4-4 Calm Rhythm
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBreathingModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-[#1B4332] text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              I Feel More Grounded — Return to Summary
            </button>
          </div>
        </div>
      )}

      {/* Interactive 24/7 AI Support Bot Modal */}
      {isAiBotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141E19]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#141E19]/10 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#141E19]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E8F3EE] text-[#1B4332] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#141E19]">
                    24/7 AI Support Companion
                  </h4>
                  <p className="text-[11px] text-[#4A5550]">
                    🔒 Anonymous · Pre-tuned to your check-in (Score: {totalScore}/12)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiBotOpen(false)}
                aria-label="Close AI Support Bot"
                className="p-1.5 rounded-full text-[#4A5550] hover:bg-[#F8F7F4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[220px]">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'student'
                        ? 'bg-[#1B4332] text-white'
                        : 'bg-[#F8F7F4] text-[#141E19] border border-[#141E19]/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendChatMessage}
              className="pt-3 border-t border-[#141E19]/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Share what's on your mind..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#141E19]/15 text-xs sm:text-sm text-[#141E19] focus:outline-none focus:border-[#1B4332]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#133124] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

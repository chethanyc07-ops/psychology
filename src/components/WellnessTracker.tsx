import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Lightbulb,
  Play,
  Pause,
  CheckSquare,
  Square,
  Timer,
  RotateCcw,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { NavSectionId } from './TopBar';

interface WellnessTrackerProps {
  onSelectSection: (section: NavSectionId) => void;
  onOpenCrisisModal: () => void;
}

type DayCode = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface DaySleepMoodEntry {
  day: DayCode;
  hours: number;
  quality: string;
  moodEmoji: string;
  moodLabel: string;
  disruptors: string[];
}

const STORAGE_KEY_SLEEP_TRACKER_V2 = 'solace_sleep_rhythm_v2';
const STORAGE_KEY_SLEEP_STREAK_COUNT = 'solace_sleep_streak_count_v2';
const STORAGE_KEY_SLEEP_CHECKLIST = 'solace_sleep_checklist_v2';

const SLEEP_QUALITY_OPTIONS = [
  { id: 'deep', text: '🌟 Deep & Restful' },
  { id: 'light', text: '😐 Light / Broken' },
  { id: 'tossed', text: '😫 Tossed & Turned' },
  { id: 'allnighter', text: '🦉 Pulled an All-Nighter' },
];

const WAKE_MOOD_OPTIONS = [
  { id: 'refreshed', emoji: '⚡', label: 'Refreshed', full: '⚡ Refreshed' },
  { id: 'calm', emoji: '🙂', label: 'Calm', full: '🙂 Calm' },
  { id: 'groggy', emoji: '🥱', label: 'Groggy', full: '🥱 Groggy' },
  { id: 'anxious', emoji: '😟', label: 'Anxious', full: '😟 Anxious' },
  { id: 'exhausted', emoji: '📉', label: 'Exhausted', full: '📉 Exhausted' },
];

const DISRUPTOR_TAG_PILLS = [
  '☕ Late Caffeine / Tea',
  '📱 Reels / Doomscrolling',
  '📝 Exam / Assignment Grind',
  '🔊 Hostel / Roommate Noise',
  '🌀 Overthinking at 2 AM',
];

// Initial 7-day data that averages 6.2 hrs / night (Total = 43.4 hrs / 7 = 6.2 hrs, Debt = 8.0 - 6.2 = 1.8 hrs)
const DEFAULT_WEEK_ENTRIES: DaySleepMoodEntry[] = [
  {
    day: 'Mon',
    hours: 7.5,
    quality: '🌟 Deep & Restful',
    moodEmoji: '🙂',
    moodLabel: 'Calm',
    disruptors: [],
  },
  {
    day: 'Tue',
    hours: 6.0,
    quality: '😐 Light / Broken',
    moodEmoji: '🥱',
    moodLabel: 'Groggy',
    disruptors: ['📱 Reels / Doomscrolling'],
  },
  {
    day: 'Wed',
    hours: 4.5,
    quality: '😫 Tossed & Turned',
    moodEmoji: '😟',
    moodLabel: 'Anxious',
    disruptors: ['📝 Exam / Assignment Grind', '☕ Late Caffeine / Tea'],
  },
  {
    day: 'Thu',
    hours: 5.5,
    quality: '😐 Light / Broken',
    moodEmoji: '😟',
    moodLabel: 'Anxious',
    disruptors: ['🌀 Overthinking at 2 AM'],
  },
  {
    day: 'Fri',
    hours: 4.4,
    quality: '🦉 Pulled an All-Nighter',
    moodEmoji: '📉',
    moodLabel: 'Exhausted',
    disruptors: ['📝 Exam / Assignment Grind', '🔊 Hostel / Roommate Noise'],
  },
  {
    day: 'Sat',
    hours: 8.0,
    quality: '🌟 Deep & Restful',
    moodEmoji: '⚡',
    moodLabel: 'Refreshed',
    disruptors: [],
  },
  {
    day: 'Sun',
    hours: 7.5,
    quality: '🌟 Deep & Restful',
    moodEmoji: '🙂',
    moodLabel: 'Calm',
    disruptors: [],
  },
];

interface WindDownTrack {
  id: 'brown-blocker' | 'guided-reset' | 'monsoon-rain' | 'delta-cooldown';
  title: string;
  tag: string;
  purpose: string;
}

const WIND_DOWN_TRACKS: WindDownTrack[] = [
  {
    id: 'brown-blocker',
    title: 'Hostel Noise Blocker',
    tag: 'Brown Noise',
    purpose: 'Masks roommate chatter, corridor footsteps, and traffic outside.',
  },
  {
    id: 'guided-reset',
    title: '2 AM Racing Mind Reset',
    tag: '10-Min Guided Audio',
    purpose: 'Voice-guided body scan to stop replaying exam or placement worries.',
  },
  {
    id: 'monsoon-rain',
    title: 'Heavy Monsoon Rain',
    tag: 'Nature Soundscape',
    purpose: 'Steady acoustic masking for deep, uninterrupted sleep.',
  },
  {
    id: 'delta-cooldown',
    title: 'Post-Study Brain Cool-Down',
    tag: 'Delta Waves',
    purpose: 'Helps transition the brain from intense coding/studying to rest.',
  },
];

interface HabitItem {
  id: string;
  title: string;
  quote: string;
}

const SLEEP_CHECKLIST_HABITS: HabitItem[] = [
  {
    id: 'caffeine-cutoff',
    title: 'The 4 PM Caffeine Cutoff:',
    quote: '"Switched from coffee/energy drinks to water after 4 PM."',
  },
  {
    id: 'brain-dump',
    title: "Tomorrow's 3-Item Brain Dump:",
    quote: '"Wrote down tomorrow\'s pending tasks so my brain stops reminding me at 1 AM."',
  },
  {
    id: 'phone-away',
    title: 'Phone Out of Reach:',
    quote: '"Set alarm and placed phone away from the pillow."',
  },
];

// Bar height classes mapped to 0..10h (no inline styles)
const getBarHeightClass = (hours: number): string => {
  if (hours >= 9.5) return 'h-44';
  if (hours >= 8.5) return 'h-40';
  if (hours >= 7.5) return 'h-36';
  if (hours >= 6.5) return 'h-32';
  if (hours >= 5.5) return 'h-28';
  if (hours >= 4.5) return 'h-24';
  if (hours >= 3.5) return 'h-20';
  if (hours >= 2.0) return 'h-14';
  return 'h-10';
};

export const WellnessTracker: React.FC<WellnessTrackerProps> = () => {
  // 1 & 3: 7-Day Sleep & Mood Data
  const [weekData, setWeekData] = useState<DaySleepMoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SLEEP_TRACKER_V2);
      return saved ? JSON.parse(saved) : DEFAULT_WEEK_ENTRIES;
    } catch {
      return DEFAULT_WEEK_ENTRIES;
    }
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SLEEP_STREAK_COUNT);
      return saved ? Number(saved) : 4;
    } catch {
      return 4;
    }
  });

  // 2. Daily Sleep & Wake-Up Mood Logger Form State
  const [selectedDayToLog, setSelectedDayToLog] = useState<DayCode>('Thu');
  const [hoursSlept, setHoursSlept] = useState<number>(5.5);
  const [sleepQuality, setSleepQuality] = useState<string>('😐 Light / Broken');
  const [wakeMood, setWakeMood] = useState<string>('😟 Anxious');
  const [selectedDisruptors, setSelectedDisruptors] = useState<string[]>([
    '📝 Exam / Assignment Grind',
    '🌀 Overthinking at 2 AM',
  ]);
  const [logSuccessBanner, setLogSuccessBanner] = useState<boolean>(false);

  // 4. Student Sleep Cycle & Nap Calculator State
  const [wakeUpHour, setWakeUpHour] = useState<string>('07');
  const [wakeUpMinute, setWakeUpMinute] = useState<string>('30');
  const [wakeUpPeriod, setWakeUpPeriod] = useState<'AM' | 'PM'>('AM');
  const [bedtimeResults, setBedtimeResults] = useState<
    { time: string; label: string; badgeClass: string }[]
  >([
    {
      time: '10:30 PM',
      label: '(6 Cycles - Best)',
      badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]/40',
    },
    {
      time: '12:00 AM',
      label: '(5 Cycles - Good)',
      badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B]/40',
    },
    {
      time: '01:30 AM',
      label: '(4 Cycles - Minimum)',
      badgeClass: 'bg-[#FFF1F2] text-[#9F1239] border-[#F43F5E]/40',
    },
  ]);

  // 20-Min Power Nap Timer State
  const [isNapTimerActive, setIsNapTimerActive] = useState<boolean>(false);
  const [napSecondsLeft, setNapSecondsLeft] = useState<number>(20 * 60);

  // 5. Hostel & Late-Night Wind-Down Audio Player State (with 15-Min Auto-Off Timer)
  const [playingTrackId, setPlayingTrackId] = useState<WindDownTrack['id'] | null>(null);
  const [autoOffSecondsLeft, setAutoOffSecondsLeft] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopAudioNodesRef = useRef<(() => void) | null>(null);

  // 6. "Before You Sleep" Micro-Checklist State
  const [checkedHabits, setCheckedHabits] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SLEEP_CHECKLIST);
      return saved ? JSON.parse(saved) : { 'caffeine-cutoff': true };
    } catch {
      return { 'caffeine-cutoff': true };
    }
  });

  // Power Nap Countdown Effect
  useEffect(() => {
    if (!isNapTimerActive) return;
    const interval = window.setInterval(() => {
      setNapSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsNapTimerActive(false);
          return 20 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isNapTimerActive]);

  // 15-Min Auto-Off Audio Countdown Effect
  useEffect(() => {
    if (autoOffSecondsLeft === null || !playingTrackId) return;
    const timer = window.setInterval(() => {
      setAutoOffSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          stopWindDownAudio();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [autoOffSecondsLeft, playingTrackId]);

  // Cleanup Web Audio on unmount
  useEffect(() => {
    return () => {
      if (stopAudioNodesRef.current) {
        stopAudioNodesRef.current();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const stopWindDownAudio = () => {
    if (stopAudioNodesRef.current) {
      stopAudioNodesRef.current();
      stopAudioNodesRef.current = null;
    }
    setPlayingTrackId(null);
    setAutoOffSecondsLeft(null);
  };

  const handleToggleWindDownTrack = (trackId: WindDownTrack['id']) => {
    if (playingTrackId === trackId) {
      stopWindDownAudio();
      return;
    }

    if (stopAudioNodesRef.current) {
      stopAudioNodesRef.current();
      stopAudioNodesRef.current = null;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.45;
    masterGain.connect(ctx.destination);

    if (trackId === 'brown-blocker') {
      // Deep Hostel Noise Blocker (Brownian Noise)
      const bufSize = 3 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufSize; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 0.3;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 240;
      src.connect(filter);
      filter.connect(masterGain);
      src.start();

      stopAudioNodesRef.current = () => {
        try {
          src.stop();
          src.disconnect();
          masterGain.disconnect();
        } catch {
          // ignore
        }
      };
    } else if (trackId === 'guided-reset') {
      // 2 AM Racing Mind Reset (Warm 432Hz + 528Hz harmonic breathing pad with slow LFO)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.value = 216;
      osc2.frequency.value = 324;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;

      const breathLfo = ctx.createOscillator();
      breathLfo.type = 'sine';
      breathLfo.frequency.value = 0.12; // 8-second gentle swell
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.15;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.22;
      breathLfo.connect(lfoGain);
      lfoGain.connect(padGain.gain);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(padGain);
      padGain.connect(masterGain);

      osc1.start();
      osc2.start();
      breathLfo.start();

      stopAudioNodesRef.current = () => {
        try {
          osc1.stop();
          osc2.stop();
          breathLfo.stop();
          padGain.disconnect();
          masterGain.disconnect();
        } catch {
          // ignore
        }
      };
    } else if (trackId === 'monsoon-rain') {
      // Heavy Monsoon Rain (Filtered pink wash + heavy monsoon patters)
      const bufSize = 3 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.099;
        b1 = 0.963 * b1 + white * 0.296;
        b2 = 0.57 * b2 + white * 1.052;
        const drop = Math.random() > 0.996 ? (Math.random() * 2 - 1) * 0.7 : 0;
        data[i] = (b0 + b1 + b2 + white * 0.2) * 0.05 + drop * 0.12;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 780;
      filter.Q.value = 0.55;
      src.connect(filter);
      filter.connect(masterGain);
      src.start();

      stopAudioNodesRef.current = () => {
        try {
          src.stop();
          src.disconnect();
          masterGain.disconnect();
        } catch {
          // ignore
        }
      };
    } else if (trackId === 'delta-cooldown') {
      // Post-Study Brain Cool-Down (Delta Wave binaural carrier 140Hz & 143Hz)
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      rightOsc.type = 'sine';
      leftOsc.frequency.value = 140;
      rightOsc.frequency.value = 143; // 3 Hz Delta beat

      const deltaGain = ctx.createGain();
      deltaGain.gain.value = 0.25;
      leftOsc.connect(deltaGain);
      rightOsc.connect(deltaGain);
      deltaGain.connect(masterGain);

      leftOsc.start();
      rightOsc.start();

      stopAudioNodesRef.current = () => {
        try {
          leftOsc.stop();
          rightOsc.stop();
          deltaGain.disconnect();
          masterGain.disconnect();
        } catch {
          // ignore
        }
      };
    }

    setPlayingTrackId(trackId);
    setAutoOffSecondsLeft(15 * 60); // 15-Min Auto-Off Timer
  };

  // Toggle disruptor pill
  const handleToggleDisruptor = (pill: string) => {
    setSelectedDisruptors((prev) =>
      prev.includes(pill) ? prev.filter((p) => p !== pill) : [...prev, pill]
    );
  };

  // Log Today's Entry +
  const handleLogEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedMood =
      WAKE_MOOD_OPTIONS.find((m) => m.full === wakeMood) || WAKE_MOOD_OPTIONS[3];

    const updated = weekData.map((d) =>
      d.day === selectedDayToLog
        ? {
            day: selectedDayToLog,
            hours: hoursSlept,
            quality: sleepQuality,
            moodEmoji: matchedMood.emoji,
            moodLabel: matchedMood.label,
            disruptors: selectedDisruptors,
          }
        : d
    );

    setWeekData(updated);
    const nextStreak = streakDays + 1;
    setStreakDays(nextStreak);
    setLogSuccessBanner(true);

    try {
      localStorage.setItem(STORAGE_KEY_SLEEP_TRACKER_V2, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY_SLEEP_STREAK_COUNT, String(nextStreak));
    } catch {
      // Ignore storage errors
    }
  };

  // Calculate Bedtimes (6 cycles = 9.0h, 5 cycles = 7.5h, 4 cycles = 6.0h before wake time)
  const handleCalculateBedtimes = () => {
    const h = parseInt(wakeUpHour, 10) || 7;
    const m = parseInt(wakeUpMinute, 10) || 30;
    let totalWakeMinutes = (h % 12) * 60 + m;
    if (wakeUpPeriod === 'PM') {
      totalWakeMinutes += 12 * 60;
    }

    const formatMinutesTo12Hr = (mins: number) => {
      const normalized = ((mins % 1440) + 1440) % 1440;
      const hrs24 = Math.floor(normalized / 60);
      const minsPart = normalized % 60;
      const period = hrs24 >= 12 ? 'PM' : 'AM';
      const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;
      return `${String(hrs12).padStart(2, '0')}:${String(minsPart).padStart(2, '0')} ${period}`;
    };

    // 6 cycles (540m), 5 cycles (450m), 4 cycles (360m)
    const sixCyclesTime = formatMinutesTo12Hr(totalWakeMinutes - 540);
    const fiveCyclesTime = formatMinutesTo12Hr(totalWakeMinutes - 450);
    const fourCyclesTime = formatMinutesTo12Hr(totalWakeMinutes - 360);

    setBedtimeResults([
      {
        time: sixCyclesTime,
        label: '(6 Cycles - Best)',
        badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]/40',
      },
      {
        time: fiveCyclesTime,
        label: '(5 Cycles - Good)',
        badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B]/40',
      },
      {
        time: fourCyclesTime,
        label: '(4 Cycles - Minimum)',
        badgeClass: 'bg-[#FFF1F2] text-[#9F1239] border-[#F43F5E]/40',
      },
    ]);
  };

  const handleToggleChecklist = (habitId: string) => {
    const next = { ...checkedHabits, [habitId]: !checkedHabits[habitId] };
    setCheckedHabits(next);
    try {
      localStorage.setItem(STORAGE_KEY_SLEEP_CHECKLIST, JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  // Top Summary Calculations
  const avgSleepHrs = Number(
    (weekData.reduce((sum, item) => sum + item.hours, 0) / weekData.length).toFixed(1)
  );
  const sleepDebtHrs = Math.max(0, Number((8.0 - avgSleepHrs).toFixed(1)));

  return (
    <section
      id="wellness-log"
      aria-label="Mood & Sleep Rhythm Tracker"
      className="py-10 sm:py-14 px-4 sm:px-8 max-w-[1160px] mx-auto space-y-8"
    >
      {/* 1. Section Header & Top Summary Cards */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(20,30,25,0.05)]">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141E19]">
            Mood &amp; Sleep Rhythm Tracker
          </h2>
          <p className="text-sm sm:text-base text-[#4A5550] mt-2 leading-relaxed">
            All-nighters and irregular sleep directly rewire how your brain handles exam stress.
            Track your rest, spot emotional patterns, and reset your body clock.
          </p>
        </div>

        {/* 3 Quick Stat Mini-Cards (Top Row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Card 1: Avg. Sleep */}
          <div className="p-5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/10 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#4A5550]">🌙 Avg. Sleep (7 Days)</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFE4E6] text-[#9F1239] border border-[#F43F5E]/25 text-[11px] font-mono font-bold">
                {sleepDebtHrs} hrs Sleep Debt
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#141E19]">
              {avgSleepHrs} hrs / night
            </div>
          </div>

          {/* Card 2: Dominant Mood */}
          <div className="p-5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/10 flex flex-col justify-between gap-2">
            <span className="text-xs font-bold text-[#4A5550]">😊 Dominant Mood</span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#141E19]">
              Slightly Anxious / Tired
            </div>
          </div>

          {/* Card 3: Logging Streak */}
          <div className="p-5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/10 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#4A5550]">🔥 Logging Streak</span>
              <span className="text-[11px] font-mono text-[#1B4332] bg-[#E8F3EE] px-2 py-0.5 rounded-md font-semibold">
                Stored in localStorage
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#141E19]">
              {streakDays} Days Active
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2. Daily Sleep & Wake-Up Mood Logger + 3. 7-Day "Sleep vs. Mood" Visual Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 2. Daily Sleep & Wake-Up Mood Logger (Interactive Form Card) */}
        <form
          onSubmit={handleLogEntrySubmit}
          className="lg:col-span-6 bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#141E19]/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
                Under 15 Seconds
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#141E19] mt-0.5">
                Daily Sleep &amp; Wake-Up Mood Logger
              </h3>
            </div>

            {/* Day selector pill */}
            <div className="inline-flex items-center gap-1 bg-[#F8F7F4] p-1 rounded-xl border border-[#141E19]/10">
              {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as DayCode[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelectedDayToLog(d);
                    setLogSuccessBanner(false);
                    const found = weekData.find((item) => item.day === d);
                    if (found) {
                      setHoursSlept(found.hours);
                      setSleepQuality(found.quality);
                      setWakeMood(`${found.moodEmoji} ${found.moodLabel}`);
                      setSelectedDisruptors(found.disruptors);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    selectedDayToLog === d
                      ? 'bg-[#1B4332] text-white'
                      : 'text-[#4A5550] hover:text-[#141E19]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Hours Slept Slider */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <label
                htmlFor="hours-slept-slider"
                className="text-sm font-bold text-[#141E19]"
              >
                Hours Slept Slider
              </label>
              <span className="px-3 py-1 rounded-xl bg-[#1B4332] text-white font-mono text-xs font-extrabold">
                {hoursSlept >= 10 ? '10+ Hours' : `${hoursSlept} Hours`}
              </span>
            </div>
            <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-[#141E19]/10">
              <input
                id="hours-slept-slider"
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={hoursSlept}
                onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-[#DFDCD4] rounded-lg appearance-none cursor-pointer accent-[#1B4332]"
              />
              <div className="flex items-center justify-between text-xs font-semibold text-[#4A5550] mt-2">
                <span>0 hrs [All-Nighter]</span>
                <span>5 hrs</span>
                <span>10+ hrs</span>
              </div>
            </div>
          </div>

          {/* Sleep Quality Selector */}
          <div>
            <label className="block text-sm font-bold text-[#141E19] mb-2.5">
              Sleep Quality Selector:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SLEEP_QUALITY_OPTIONS.map((opt) => {
                const isSelected = sleepQuality === opt.text;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSleepQuality(opt.text)}
                    className={`px-3.5 py-3 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                        : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12'
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wake-Up Mood Selector */}
          <div>
            <label className="block text-sm font-bold text-[#141E19] mb-2.5">
              Wake-Up Mood Selector:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {WAKE_MOOD_OPTIONS.map((m) => {
                const isSelected = wakeMood === m.full;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setWakeMood(m.full)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                        : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12'
                    }`}
                  >
                    <span className="text-xl mb-1" aria-hidden="true">
                      {m.emoji}
                    </span>
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* "What Disrupted Your Sleep?" (Student Tag Pills) */}
          <div>
            <label className="block text-sm font-bold text-[#141E19] mb-2.5">
              &ldquo;What Disrupted Your Sleep?&rdquo;
            </label>
            <div className="flex flex-wrap gap-2">
              {DISRUPTOR_TAG_PILLS.map((pill) => {
                const active = selectedDisruptors.includes(pill);
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => handleToggleDisruptor(pill)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12'
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          {logSuccessBanner && (
            <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Logged {selectedDayToLog}: {hoursSlept} hrs ({sleepQuality}) &middot; {wakeMood}!
              </span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1B4332] hover:bg-[#133124] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            Log Today&apos;s Entry +
          </button>
        </form>

        {/* 3. 7-Day "Sleep vs. Mood" Visual Chart + 4. Student Sleep Cycle & Nap Calculator */}
        <div className="lg:col-span-6 space-y-6">
          {/* 3. 7-Day "Sleep vs. Mood" Visual Chart */}
          <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#141E19]/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
                  Dual-View Weekly Graph (Mon &ndash; Sun)
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#141E19] mt-0.5">
                  7-Day &ldquo;Sleep vs. Mood&rdquo; Visual Chart
                </h3>
              </div>

              {/* Color Legend */}
              <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 text-[#065F46]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" /> 7–9 hrs
                </span>
                <span className="inline-flex items-center gap-1 text-[#92400E]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" /> 5–6 hrs
                </span>
                <span className="inline-flex items-center gap-1 text-[#9F1239]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]" /> &lt;5 hrs
                </span>
              </div>
            </div>

            {/* Vertical Bars + Emoji Overlay sitting right above each bar */}
            <div className="bg-[#F8F7F4] border border-[#141E19]/10 rounded-2xl p-5 pt-7">
              <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-56 pt-6">
                {weekData.map((d) => {
                  const barColorClass =
                    d.hours >= 7
                      ? 'bg-[#10B981] hover:bg-[#059669]'
                      : d.hours >= 5
                      ? 'bg-[#F59E0B] hover:bg-[#D97706]'
                      : 'bg-[#EF4444] hover:bg-[#DC2626]';
                  const barHeightClass = getBarHeightClass(d.hours);

                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setSelectedDayToLog(d.day)}
                      title={`${d.day}: ${d.hours} hrs · ${d.moodEmoji} ${d.moodLabel}`}
                      className="flex flex-col items-center justify-end h-full group cursor-pointer"
                    >
                      {/* Emoji Overlay sitting right above the bar */}
                      <div className="flex flex-col items-center mb-1.5 transition-transform group-hover:scale-110">
                        <span className="text-xl sm:text-2xl leading-none" aria-hidden="true">
                          {d.moodEmoji}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#141E19] mt-1">
                          {d.hours}h
                        </span>
                      </div>

                      {/* Vertical Color-Coded Sleep Bar */}
                      <div
                        className={`w-full max-w-[38px] rounded-t-xl transition-all duration-300 shadow-xs ${barColorClass} ${barHeightClass}`}
                      />

                      {/* Day Label & Mood Caption */}
                      <div className="mt-2 text-center">
                        <div className="text-xs font-mono font-bold text-[#141E19]">{d.day}</div>
                        <div className="text-[10px] text-[#4A5550] hidden sm:block truncate max-w-[54px]">
                          {d.moodLabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Insight Banner (Below Chart) */}
            <div className="mt-5 p-4 rounded-2xl bg-[#FFFBEB] border border-[#F59E0B]/40 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs sm:text-sm text-[#78350F] leading-relaxed">
                <strong className="font-extrabold">💡 Pattern Detected:</strong> &ldquo;On days you
                sleep less than 6 hours, you are 3x more likely to log &lsquo;Anxious&rsquo; or
                &lsquo;Overwhelmed&rsquo;. Try a 20-minute power nap today.&rdquo;
              </p>
            </div>
          </div>

          {/* 4. Interactive "Student Sleep Cycle & Nap Calculator" */}
          <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
              90-Minute Sleep Cycle Utility
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#141E19] mt-0.5">
              Student Sleep Cycle &amp; Nap Calculator
            </h3>
            <p className="text-xs sm:text-sm text-[#4A5550] mt-1">
              Have an 8:00 AM class or exam? Find the best time to fall asleep:
            </p>

            {/* Time Input + Calculate Bedtimes Button */}
            <div className="mt-4 flex flex-wrap items-center gap-3 bg-[#F8F7F4] p-4 rounded-2xl border border-[#141E19]/10">
              <span className="text-xs sm:text-sm font-bold text-[#141E19]">
                I need to wake up at:
              </span>

              <div className="inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#141E19]/15 font-mono text-sm font-bold">
                <select
                  aria-label="Wake up hour"
                  value={wakeUpHour}
                  onChange={(e) => setWakeUpHour(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(
                    (hr) => (
                      <option key={hr} value={hr}>
                        {hr}
                      </option>
                    )
                  )}
                </select>
                <span>:</span>
                <select
                  aria-label="Wake up minute"
                  value={wakeUpMinute}
                  onChange={(e) => setWakeUpMinute(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  {['00', '15', '30', '45'].map((min) => (
                    <option key={min} value={min}>
                      {min}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="AM or PM"
                  value={wakeUpPeriod}
                  onChange={(e) => setWakeUpPeriod(e.target.value as 'AM' | 'PM')}
                  className="bg-transparent focus:outline-none cursor-pointer ml-1 text-[#1B4332]"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCalculateBedtimes}
                className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#133124] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Calculate Bedtimes
              </button>
            </div>

            {/* Output Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
              {bedtimeResults.map((res) => (
                <div
                  key={res.label}
                  className={`p-3 rounded-2xl border text-center ${res.badgeClass}`}
                >
                  <div className="text-base font-mono font-extrabold">{res.time}</div>
                  <div className="text-[11px] font-bold mt-0.5">{res.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Nap Button */}
            <div className="mt-5 pt-4 border-t border-[#141E19]/10 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs sm:text-sm font-bold text-[#141E19]">
                Exhausted after lectures?
                <span className="block text-[11px] font-normal text-[#4A5550]">
                  Prevents deep-sleep inertia so you wake up sharp
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNapTimerActive((prev) => !prev)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isNapTimerActive
                      ? 'bg-[#D97706] text-white'
                      : 'bg-[#E8F3EE] hover:bg-[#D8F3DC] text-[#1B4332] border border-[#1B4332]/20'
                  }`}
                >
                  <Timer className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {isNapTimerActive
                      ? `Nap Timer: ${String(Math.floor(napSecondsLeft / 60)).padStart(
                          2,
                          '0'
                        )}:${String(napSecondsLeft % 60).padStart(2, '0')} (Pause)`
                      : 'Start 20-Min Power Nap Timer'}
                  </span>
                </button>
                {isNapTimerActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNapTimerActive(false);
                      setNapSecondsLeft(20 * 60);
                    }}
                    aria-label="Reset 20-minute nap timer"
                    className="p-2 rounded-xl bg-[#F8F7F4] text-[#4A5550] hover:text-[#141E19] border border-[#141E19]/10 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. "Hostel & Late-Night Wind-Down" Audio Player */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#141E19]/10">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
              Acoustic Masking &amp; Nervous System Downshift
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#141E19] mt-0.5">
              &ldquo;Hostel &amp; Late-Night Wind-Down&rdquo; Audio Player
            </h3>
            <p className="text-xs sm:text-sm text-[#4A5550] mt-1">
              Block out noisy dorms/PGs and quiet racing thoughts before bed with built-in 15-minute
              auto-off timers.
            </p>
          </div>

          {playingTrackId && autoOffSecondsLeft !== null && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E8F3EE] border border-[#1B4332]/20 text-xs font-mono font-bold text-[#1B4332]">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>
                15-Min Auto-Off: {Math.floor(autoOffSecondsLeft / 60)}:
                {String(autoOffSecondsLeft % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* 4 Clickable Audio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WIND_DOWN_TRACKS.map((track) => {
            const isPlaying = playingTrackId === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleToggleWindDownTrack(track.id)}
                aria-pressed={isPlaying}
                className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-md scale-[1.01]'
                    : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12 hover:border-[#1B4332]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                        isPlaying
                          ? 'bg-white/15 text-[#A7F3D0]'
                          : 'bg-[#E8F3EE] text-[#1B4332]'
                      }`}
                    >
                      {track.tag}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isPlaying
                          ? 'bg-[#A7F3D0] text-[#1B4332]'
                          : 'bg-white text-[#1B4332] border border-[#141E19]/10'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-extrabold leading-snug">{track.title}</h4>
                  <p
                    className={`text-xs mt-1.5 leading-relaxed ${
                      isPlaying ? 'text-white/85' : 'text-[#4A5550]'
                    }`}
                  >
                    {track.purpose}
                  </p>
                </div>

                <div
                  className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
                    isPlaying
                      ? 'border-white/15 text-[#A7F3D0]'
                      : 'border-[#141E19]/10 text-[#4A5550]'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? 'Playing Now' : 'Click to Play'}</span>
                  </span>
                  <span>15-Min Auto-Off</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. "Before You Sleep" Micro-Checklist (3 Toggle Habits) */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
              Night Routine Wind-Down
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#141E19] mt-0.5">
              &ldquo;Before You Sleep&rdquo; Micro-Checklist
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#1B4332] bg-[#E8F3EE] px-3 py-1 rounded-xl">
            {Object.values(checkedHabits).filter(Boolean).length} / 3 Completed Tonight
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SLEEP_CHECKLIST_HABITS.map((habit) => {
            const isChecked = !!checkedHabits[habit.id];
            return (
              <button
                key={habit.id}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => handleToggleChecklist(habit.id)}
                className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  isChecked
                    ? 'bg-[#ECFDF5] border-[#10B981]/45 text-[#064E3B]'
                    : 'bg-[#F8F7F4] hover:bg-white border-[#141E19]/12 text-[#141E19]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-[#059669]" />
                  ) : (
                    <Square className="w-5 h-5 text-[#4A5550]" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold">{habit.title}</div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isChecked ? 'text-[#065F46]' : 'text-[#4A5550]'
                    }`}
                  >
                    {habit.quote}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

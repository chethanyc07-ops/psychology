import React, { useState, useEffect } from 'react';
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Hand,
  Ear,
  Sparkles,
  HeartHandshake,
  Brain,
  CheckCircle2,
  Flame,
  CheckSquare,
  Square,
  Lock,
  Zap,
} from 'lucide-react';
import { NavSectionId } from './TopBar';

interface CbtAndGroundingStudioProps {
  onSelectSection: (section: NavSectionId) => void;
  onOpenCrisisModal: () => void;
}

type BreathingModeId = '4-7-8' | 'box' | 'sigh';

interface BreathingPhase {
  label: string;
  seconds: number;
  cue: string;
  scaleClass: string;
}

const BREATHING_MODES: Record<
  BreathingModeId,
  {
    name: string;
    badge: string;
    useCase: string;
    phases: BreathingPhase[];
  }
> = {
  '4-7-8': {
    name: '4-7-8 Panic & Sleep Reset',
    badge: 'Calms Racing Heart',
    useCase: 'Best for pre-exam panic attacks or 2 AM overthinking in bed.',
    phases: [
      {
        label: 'Inhale Quietly',
        seconds: 4,
        cue: 'Breathe in gently through your nose into your belly...',
        scaleClass: 'scale-115 bg-[#1B4332]/20',
      },
      {
        label: 'Hold Breath',
        seconds: 7,
        cue: 'Rest at the top—let your shoulders drop away from your ears...',
        scaleClass: 'scale-115 bg-[#1B4332]/30',
      },
      {
        label: 'Slow Exhale',
        seconds: 8,
        cue: 'Exhale slowly through pursed lips—release all tension...',
        scaleClass: 'scale-90 bg-[#1B4332]/10',
      },
    ],
  },
  box: {
    name: '4-4-4-4 Box Breathing',
    badge: 'Interview & Viva Focus',
    useCase: 'Used to steady your voice and sharpen focus before presentations or vivas.',
    phases: [
      {
        label: 'Inhale (4s)',
        seconds: 4,
        cue: 'Slow, steady breath in through your nose...',
        scaleClass: 'scale-115 bg-[#1B4332]/20',
      },
      {
        label: 'Hold Full (4s)',
        seconds: 4,
        cue: 'Keep your chest soft and jaw unclenched...',
        scaleClass: 'scale-115 bg-[#1B4332]/30',
      },
      {
        label: 'Exhale (4s)',
        seconds: 4,
        cue: 'Smooth, controlled release out...',
        scaleClass: 'scale-90 bg-[#1B4332]/10',
      },
      {
        label: 'Hold Empty (4s)',
        seconds: 4,
        cue: 'Quiet stillness before the next breath...',
        scaleClass: 'scale-90 bg-[#1B4332]/5',
      },
    ],
  },
  sigh: {
    name: 'Physiological Sigh',
    badge: 'Fastest 30s Reset',
    useCase: 'Two quick inhales followed by a long exhale—biologically drops heart rate fastest.',
    phases: [
      {
        label: 'Deep Inhale',
        seconds: 3,
        cue: 'Inhale deeply through your nose (fill 80% of lungs)...',
        scaleClass: 'scale-105 bg-[#1B4332]/20',
      },
      {
        label: 'Top-Up Sniff Inhale',
        seconds: 2,
        cue: 'Take one quick extra sip of air at the very top!',
        scaleClass: 'scale-120 bg-[#1B4332]/35',
      },
      {
        label: 'Long Sigh Exhale',
        seconds: 6,
        cue: 'Long, slow sigh out through your mouth until lungs are empty...',
        scaleClass: 'scale-85 bg-[#1B4332]/10',
      },
    ],
  },
};

const SENSORY_STEPS = [
  {
    count: 5,
    title: '5 Things You Can See',
    prompt: 'Look around your desk or room. Notice 5 ordinary objects (e.g., pen, water bottle, window frame).',
    icon: Eye,
  },
  {
    count: 4,
    title: '4 Things You Can Physically Feel',
    prompt: 'Notice 4 tactile sensations (e.g., feet flat on the floor, hoodie fabric, cool desk surface).',
    icon: Hand,
  },
  {
    count: 3,
    title: '3 Sounds You Can Hear',
    prompt: 'Listen past your thoughts for 3 ambient sounds (e.g., ceiling fan, distant birds, keyboard clicks).',
    icon: Ear,
  },
  {
    count: 2,
    title: '2 Scents or Deep Breaths',
    prompt: 'Notice 2 scents in the air (coffee, rain, soap) or take 2 slow, grounding belly breaths.',
    icon: Sparkles,
  },
  {
    count: 1,
    title: '1 Kind Anchor Truth',
    prompt: 'Say to yourself: "Right now, in this exact second, I am safe and I only need to handle one step at a time."',
    icon: HeartHandshake,
  },
];

interface SpiralPreset {
  label: string;
  spiral: string;
  trap: string;
  reframe: string;
}

const COLLEGE_SPIRAL_PRESETS: SpiralPreset[] = [
  {
    label: '💻 Bombed a Coding / Placement Round',
    spiral: 'I froze during the technical interview today. I will never get placed.',
    trap: 'Catastrophizing & All-or-Nothing Thinking',
    reframe:
      'One tough interview is practice data, not a final verdict. I can review the 2 questions I missed and apply to the next company stronger.',
  },
  {
    label: '📚 Behind on Exam Syllabus',
    spiral: 'The exam is in 2 days and I still have 3 units left. I am going to fail.',
    trap: 'Fortune Telling & Panic Filtering',
    reframe:
      'I do not need to master 100% tonight. Focusing on high-weightage topics for the next 90 minutes will still earn solid marks.',
  },
  {
    label: '🎭 Imposter Syndrome in Class',
    spiral: 'Everyone else in my batch seems effortless and smart. I do not belong here.',
    trap: 'Mind Reading & Discounting the Positive',
    reframe:
      'People only show their highlight reel in lectures. I earned my seat here, and struggling with new material is how learning works.',
  },
];

const SOMATIC_DESK_HABITS = [
  {
    id: 'jaw',
    title: 'Unclench Your Jaw',
    detail: 'Let your tongue rest gently on the floor of your mouth and part your teeth slightly.',
  },
  {
    id: 'shoulders',
    title: 'Drop Your Shoulders 2 Inches',
    detail: 'Roll your shoulders back and let them fall heavy away from your ears.',
  },
  {
    id: 'eyes',
    title: '20-20-20 Eye & Forehead Softening',
    detail: 'Unfurrow your eyebrows and look at something 20 feet away for 20 seconds.',
  },
  {
    id: 'posture',
    title: 'Plant Both Feet Flat on the Floor',
    detail: 'Feel the solid ground supporting your weight and take one slow belly breath.',
  },
];

export const CbtAndGroundingStudio: React.FC<CbtAndGroundingStudioProps> = () => {
  // 1. Breathing Pacer State
  const [breathingMode, setBreathingMode] = useState<BreathingModeId>('4-7-8');
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [phaseIdx, setPhaseIdx] = useState<number>(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(
    BREATHING_MODES['4-7-8'].phases[0].seconds
  );
  const [completedBreathCycles, setCompletedBreathCycles] = useState<number>(0);

  // 2. 5-4-3-2-1 Sensory Grounding State
  const [completedSenses, setCompletedSenses] = useState<number[]>([]);

  // 3. CBT Spiral Reframer State
  const [spiralThought, setSpiralThought] = useState<string>(
    COLLEGE_SPIRAL_PRESETS[0].spiral
  );
  const [cognitiveTrap, setCognitiveTrap] = useState<string>(
    COLLEGE_SPIRAL_PRESETS[0].trap
  );
  const [groundedReframe, setGroundedReframe] = useState<string>(
    COLLEGE_SPIRAL_PRESETS[0].reframe
  );
  const [stressBefore, setStressBefore] = useState<number>(80);
  const [stressAfter, setStressAfter] = useState<number>(35);
  const [savedReframes, setSavedReframes] = useState<
    { id: string; spiral: string; trap: string; reframe: string; drop: number }[]
  >([
    {
      id: 'sample-1',
      spiral: 'Everyone else in my batch seems effortless and smart.',
      trap: 'Imposter Syndrome / Mind Reading',
      reframe: 'Struggling with hard coursework means I am growing, not failing.',
      drop: 45,
    },
  ]);

  // 4. Ephemeral Worry Burner ("Shred & Let Go") State
  const [worryToBurn, setWorryToBurn] = useState<string>('');
  const [isDissolving, setIsDissolving] = useState<boolean>(false);
  const [dissolvedCount, setDissolvedCount] = useState<number>(0);

  // 5. Somatic Tension Checklist State
  const [checkedSomatic, setCheckedSomatic] = useState<Record<string, boolean>>({
    jaw: true,
  });

  const activeModeConfig = BREATHING_MODES[breathingMode];
  const currentPhase = activeModeConfig.phases[phaseIdx] || activeModeConfig.phases[0];

  useEffect(() => {
    if (!isBreathingActive) return;
    const timer = window.setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setPhaseIdx((curIdx) => {
          const nextIdx = (curIdx + 1) % activeModeConfig.phases.length;
          if (nextIdx === 0) {
            setCompletedBreathCycles((c) => c + 1);
          }
          setPhaseSecondsLeft(activeModeConfig.phases[nextIdx].seconds);
          return nextIdx;
        });
        return 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isBreathingActive, activeModeConfig]);

  const handleSelectBreathingMode = (mode: BreathingModeId) => {
    setBreathingMode(mode);
    setIsBreathingActive(false);
    setPhaseIdx(0);
    setPhaseSecondsLeft(BREATHING_MODES[mode].phases[0].seconds);
  };

  const handleToggleSense = (count: number) => {
    setCompletedSenses((prev) =>
      prev.includes(count) ? prev.filter((c) => c !== count) : [...prev, count]
    );
  };

  const handleSaveReframe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spiralThought.trim() || !groundedReframe.trim()) return;
    const drop = Math.max(0, stressBefore - stressAfter);
    setSavedReframes((prev) => [
      {
        id: `reframe-${Date.now()}`,
        spiral: spiralThought.trim(),
        trap: cognitiveTrap,
        reframe: groundedReframe.trim(),
        drop,
      },
      ...prev,
    ]);
  };

  const handleDissolveWorry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worryToBurn.trim()) return;
    setIsDissolving(true);
    window.setTimeout(() => {
      setWorryToBurn('');
      setIsDissolving(false);
      setDissolvedCount((c) => c + 1);
    }, 650);
  };

  return (
    <section
      id="cbt-studio"
      aria-label="Calm Tools and Grounding Studio"
      className="py-10 sm:py-14 px-4 sm:px-8 max-w-[1160px] mx-auto space-y-8"
    >
      {/* 1. Section Header & Panic-Relief Disclaimer Strip */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(20,30,25,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1B4332] bg-[#E8F3EE] border border-[#1B4332]/15 px-3.5 py-1.5 rounded-xl">
            <Zap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>⚡ 90-Second Anxiety First-Aid</span>
            <span aria-hidden="true" className="text-[#1B4332]/40">
              |
            </span>
            <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>🔒 100% Private &amp; Judgment-Free</span>
          </div>

          <span className="text-xs font-mono font-bold text-[#4A5550] bg-[#F8F7F4] px-3 py-1.5 rounded-xl border border-[#141E19]/10">
            No login required &middot; Instant relief
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141E19]">
          Instant Calm &amp; Grounding Tools
        </h2>
        <p className="text-sm sm:text-base text-[#4A5550] mt-2 max-w-3xl leading-relaxed">
          Heart racing before a viva, placement interview, or exam deadline? Use these somatic
          breathing pacers, 5-4-3-2-1 sensory anchors, and CBT thought reframers to calm your
          nervous system in under 90 seconds.
        </p>
      </div>

      {/* 2. Multi-Mode Breathing Pacer + 3. 5-4-3-2-1 Sensory Grounding Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 6 Cols: Interactive Multi-Mode Breathing Pacer */}
        <div className="lg:col-span-6 bg-[#163024] text-white rounded-3xl p-6 sm:p-8 border border-[#141E19]/15 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#95D5B2]" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#95D5B2]">
                  Interactive Somatic Pacer
                </span>
              </div>
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg text-[#A7F3D0]">
                {activeModeConfig.badge}
              </span>
            </div>

            {/* 3 Breathing Protocol Tabs */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {(['4-7-8', 'box', 'sigh'] as BreathingModeId[]).map((mId) => {
                const active = breathingMode === mId;
                return (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => handleSelectBreathingMode(mId)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-[#141E19] shadow-sm'
                        : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {mId === '4-7-8'
                      ? '4-7-8 Calm'
                      : mId === 'box'
                      ? 'Box Breath'
                      : 'Double Sigh'}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-[#A3C9B5] mt-3">{activeModeConfig.useCase}</p>

            {/* Animated Breathing Orb */}
            <div className="my-8 flex flex-col items-center justify-center text-center">
              <div
                className={`w-48 h-48 rounded-full border-2 border-[#95D5B2]/60 flex flex-col items-center justify-center transition-all duration-1000 ${
                  isBreathingActive ? currentPhase.scaleClass : 'scale-100 bg-white/5'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#95D5B2]">
                  {currentPhase.label}
                </span>
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white my-1.5">
                  {phaseSecondsLeft}s
                </span>
                <span className="text-[11px] font-mono text-white/75">
                  Cycle #{completedBreathCycles + 1}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-white/90 mt-6 max-w-xs leading-relaxed font-medium">
                {currentPhase.cue}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBreathingActive((prev) => !prev)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#95D5B2] hover:bg-[#74C69D] text-[#141E19] text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
            >
              {isBreathingActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Breathing Orb</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Guided Breathing</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsBreathingActive(false);
                setPhaseIdx(0);
                setPhaseSecondsLeft(activeModeConfig.phases[0].seconds);
                setCompletedBreathCycles(0);
              }}
              className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right 6 Cols: Interactive 5-4-3-2-1 Sensory Grounding Stepper */}
        <div className="lg:col-span-6 bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#141E19]/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
                  Stop Dissociation &amp; Overthinking
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#141E19] mt-0.5">
                  5-4-3-2-1 Sensory Grounding Reset
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#1B4332] bg-[#E8F3EE] px-3 py-1 rounded-xl">
                {completedSenses.length} / 5 Anchored
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#4A5550] mb-4">
              Tap each sensory step as you notice it around you to pull your mind out of future
              worries and back into the room:
            </p>

            <div className="space-y-2.5">
              {SENSORY_STEPS.map((step) => {
                const Icon = step.icon;
                const isDone = completedSenses.includes(step.count);
                return (
                  <button
                    key={step.count}
                    type="button"
                    onClick={() => handleToggleSense(step.count)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      isDone
                        ? 'bg-[#ECFDF5] border-[#10B981]/40 text-[#064E3B]'
                        : 'bg-[#F8F7F4] hover:bg-white border-[#141E19]/10 text-[#141E19]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-extrabold ${
                        isDone
                          ? 'bg-[#10B981] text-white'
                          : 'bg-white text-[#1B4332] border border-[#141E19]/10'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.count}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-extrabold">{step.title}</span>
                        <Icon className="w-4 h-4 text-[#4A5550] shrink-0" />
                      </div>
                      <p className="text-xs text-[#4A5550] mt-0.5 leading-relaxed">
                        {step.prompt}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {completedSenses.length === 5 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#10B981]/30 text-xs font-bold text-[#065F46] flex items-center justify-between">
              <span>✨ All 5 senses anchored! Your prefrontal cortex is back online.</span>
              <button
                type="button"
                onClick={() => setCompletedSenses([])}
                className="underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. 90-Second "Exam & Placement Spiral" CBT Thought Reframer */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#141E19]/10">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
              Cognitive Behavioral Micro-Tool
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#141E19] mt-0.5">
              90-Second &ldquo;Academic Spiral&rdquo; Thought Reframer
            </h3>
          </div>

          {/* Relatable Student Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#4A5550]">Quick Example:</span>
            {COLLEGE_SPIRAL_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSpiralThought(preset.spiral);
                  setCognitiveTrap(preset.trap);
                  setGroundedReframe(preset.reframe);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#F8F7F4] hover:bg-[#E8F3EE] text-[#141E19] border border-[#141E19]/12 text-xs font-semibold transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSaveReframe} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Step 1: The Spiraling Thought */}
          <div className="p-4 rounded-2xl bg-[#FFF1F2]/60 border border-[#F43F5E]/25">
            <label
              htmlFor="spiral-input"
              className="block text-xs font-extrabold text-[#9F1239] uppercase tracking-wider mb-2"
            >
              1. The Spiraling Thought
            </label>
            <textarea
              id="spiral-input"
              rows={3}
              value={spiralThought}
              onChange={(e) => setSpiralThought(e.target.value)}
              placeholder="What harsh story is your stress telling you right now?"
              className="w-full p-3 rounded-xl bg-white border border-[#F43F5E]/25 text-xs sm:text-sm text-[#141E19]"
            />
          </div>

          {/* Step 2: Spot the Mental Trap */}
          <div className="p-4 rounded-2xl bg-[#FFFBEB]/70 border border-[#F59E0B]/30 flex flex-col justify-between">
            <div>
              <label
                htmlFor="trap-select"
                className="block text-xs font-extrabold text-[#92400E] uppercase tracking-wider mb-2"
              >
                2. Spot the Mental Trap
              </label>
              <select
                id="trap-select"
                value={cognitiveTrap}
                onChange={(e) => setCognitiveTrap(e.target.value)}
                className="w-full p-3 rounded-xl bg-white border border-[#F59E0B]/30 text-xs sm:text-sm font-semibold text-[#141E19]"
              >
                <option value="Catastrophizing & All-or-Nothing Thinking">
                  Catastrophizing &amp; All-or-Nothing Thinking
                </option>
                <option value="Fortune Telling & Panic Filtering">
                  Fortune Telling &amp; Panic Filtering
                </option>
                <option value="Mind Reading & Discounting the Positive">
                  Mind Reading &amp; Discounting the Positive
                </option>
                <option value="Emotional Reasoning (Feeling = Fact)">
                  Emotional Reasoning (Feeling = Fact)
                </option>
              </select>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#78350F]">
                <span>Distress Before: {stressBefore}%</span>
                <span>After Reframe: {stressAfter}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stressBefore}
                  onChange={(e) => setStressBefore(Number(e.target.value))}
                  aria-label="Distress before reframe"
                  className="accent-[#E11D48]"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stressAfter}
                  onChange={(e) => setStressAfter(Number(e.target.value))}
                  aria-label="Distress after reframe"
                  className="accent-[#10B981]"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Grounded Compassionate Reality Check */}
          <div className="p-4 rounded-2xl bg-[#ECFDF5]/70 border border-[#10B981]/30 flex flex-col justify-between">
            <div>
              <label
                htmlFor="reframe-input"
                className="block text-xs font-extrabold text-[#065F46] uppercase tracking-wider mb-2"
              >
                3. Grounded Reality Check
              </label>
              <textarea
                id="reframe-input"
                rows={3}
                value={groundedReframe}
                onChange={(e) => setGroundedReframe(e.target.value)}
                placeholder="What would you tell your best friend in this exact situation?"
                className="w-full p-3 rounded-xl bg-white border border-[#10B981]/30 text-xs sm:text-sm text-[#141E19]"
              />
            </div>

            <button
              type="submit"
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#133124] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Lock In Grounded Reframe +
            </button>
          </div>
        </form>

        {savedReframes.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#141E19]/10 space-y-2">
            <div className="text-xs font-bold text-[#4A5550]">
              Recent Reframed Thoughts ({savedReframes.length})
            </div>
            {savedReframes.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="line-through text-[#9F1239]/80 mr-2">&ldquo;{item.spiral}&rdquo;</span>
                  <span className="font-bold text-[#1B4332]">&rarr; &ldquo;{item.reframe}&rdquo;</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#166534] font-mono font-bold shrink-0">
                  -{item.drop}% Stress Drop
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. "Shred & Let Go" Ephemeral Worry Burner + 6. 60-Second Somatic Desk Reset */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Ephemeral Worry Burner */}
        <div className="lg:col-span-6 bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-[#141E19]/10">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-lg font-extrabold text-[#141E19]">
                  &ldquo;Shred &amp; Let Go&rdquo; Worry Burner
                </h3>
              </div>
              {dissolvedCount > 0 && (
                <span className="text-xs font-mono font-bold text-[#1B4332] bg-[#E8F3EE] px-2.5 py-1 rounded-lg">
                  {dissolvedCount} released
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#4A5550] mb-4 leading-relaxed">
              Need to vent an angry, petty, or overwhelming thought that you don&apos;t want saved
              anywhere? Type it below and dissolve it into thin air.
            </p>

            <form onSubmit={handleDissolveWorry}>
              <textarea
                rows={3}
                value={worryToBurn}
                onChange={(e) => setWorryToBurn(e.target.value)}
                placeholder="Type what is bothering you right now... (Never saved or transmitted)"
                className={`w-full p-4 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/15 text-xs sm:text-sm text-[#141E19] transition-all duration-500 ${
                  isDissolving ? 'opacity-0 scale-90 blur-sm' : 'opacity-100 scale-100'
                }`}
              />
              <button
                type="submit"
                className="mt-4 w-full py-3.5 px-5 rounded-2xl bg-[#9E2A2B] hover:bg-[#7F1D1D] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Dissolve &amp; Release Thought ✨
              </button>
            </form>
          </div>
        </div>

        {/* Right 6 Cols: 60-Second Physical Desk Tension Checklist */}
        <div className="lg:col-span-6 bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-[#141E19]/10">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#1B4332]" />
              <h3 className="text-lg font-extrabold text-[#141E19]">
                60-Second Physical Desk Release
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#1B4332] bg-[#E8F3EE] px-2.5 py-1 rounded-lg">
              {Object.values(checkedSomatic).filter(Boolean).length} / 4 Done
            </span>
          </div>

          <div className="space-y-3">
            {SOMATIC_DESK_HABITS.map((item) => {
              const checked = !!checkedSomatic[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setCheckedSomatic((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    checked
                      ? 'bg-[#ECFDF5] border-[#10B981]/40 text-[#064E3B]'
                      : 'bg-[#F8F7F4] hover:bg-white border-[#141E19]/10 text-[#141E19]'
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-[#4A5550] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold">{item.title}</div>
                    <p className="text-xs text-[#4A5550] mt-0.5">{item.detail}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

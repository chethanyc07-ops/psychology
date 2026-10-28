export interface AssessmentItem {
  id: number;
  prompt: string;
  domain: string;
}

export const PHQ9_ITEMS: AssessmentItem[] = [
  { id: 1, prompt: 'Little interest or pleasure in doing classes, hobbies, or daily activities', domain: 'Low Motivation' },
  { id: 2, prompt: 'Feeling down, sad, or hopeless about your studies or future', domain: 'Feeling Down' },
  { id: 3, prompt: 'Trouble falling or staying asleep, or sleeping too much', domain: 'Sleep Trouble' },
  { id: 4, prompt: 'Feeling tired or having very little energy for classes and daily routines', domain: 'Low Energy' },
  { id: 5, prompt: 'Poor appetite or overeating during busy study days', domain: 'Appetite Changes' },
  { id: 6, prompt: 'Feeling bad about yourself — or feeling like you have let yourself or your family down', domain: 'Self-Doubt' },
  { id: 7, prompt: 'Trouble focusing on lectures, readings, or assignments', domain: 'Hard to Focus' },
  { id: 8, prompt: 'Moving or speaking much slower than usual, or feeling so restless you cannot sit still', domain: 'Restlessness' },
  { id: 9, prompt: 'Thoughts that you would be better off dead, or of hurting yourself in some way', domain: 'Personal Safety' },
];

export const GAD7_ITEMS: AssessmentItem[] = [
  { id: 1, prompt: 'Feeling nervous, anxious, or on edge before classes, exams, or social events', domain: 'Feeling On Edge' },
  { id: 2, prompt: 'Not being able to stop or control worrying about grades, money, or the future', domain: 'Non-Stop Worry' },
  { id: 3, prompt: 'Worrying too much about many different school and personal things at once', domain: 'Feeling Overwhelmed' },
  { id: 4, prompt: 'Trouble relaxing even when your schoolwork for the day is done', domain: 'Hard to Relax' },
  { id: 5, prompt: 'Being so restless that it is hard to sit still in class or while studying', domain: 'Restlessness' },
  { id: 6, prompt: 'Becoming easily annoyed or irritable with friends, roommates, or classmates', domain: 'Irritability' },
  { id: 7, prompt: 'Feeling afraid, as if something terrible might happen to your grades or life', domain: 'Fear of the Worst' },
];

export const FREQUENCY_OPTIONS = [
  { value: 0, label: 'Not at all', days: '0 days' },
  { value: 1, label: 'Several days', days: '1–6 days' },
  { value: 2, label: 'More than half the days', days: '7–11 days' },
  { value: 3, label: 'Nearly every day', days: '12–14 days' },
] as const;

export type SeverityTier = 'Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe';

export interface ClinicalEvaluationResult {
  instrument: 'PHQ-9' | 'GAD-7';
  totalScore: number;
  maxScore: number;
  severity: SeverityTier;
  requiresSafetyCheck: boolean;
  clinicalSummary: string;
  recommendedPathway: string;
  recommendedSpecialty: 'Academic Burnout' | 'Anxiety & Panic' | 'Mood & Depression' | 'Neurodiversity & ADHD';
}

export function evaluatePhq9(answers: (number | null)[]): { ok: true; result: ClinicalEvaluationResult } | { ok: false; missingIndices: number[]; error: string } {
  if (answers.length !== 9) {
    return { ok: false, missingIndices: [], error: 'PHQ-9 requires exactly 9 responses.' };
  }

  const missingIndices: number[] = [];
  let totalScore = 0;

  for (let i = 0; i < answers.length; i++) {
    const val = answers[i];
    if (val === null || val === undefined || val < 0 || val > 3 || !Number.isInteger(val)) {
      missingIndices.push(i + 1);
    } else {
      totalScore += val;
    }
  }

  if (missingIndices.length > 0) {
    return {
      ok: false,
      missingIndices,
      error: `Please answer all 9 questions to see your results (missing question${missingIndices.length > 1 ? 's' : ''}: ${missingIndices.join(', ')}).`,
    };
  }

  const item9Score = answers[8] ?? 0;
  const requiresSafetyCheck = item9Score > 0 || totalScore >= 20;

  let severity: SeverityTier = 'Minimal';
  let clinicalSummary = '';
  let recommendedPathway = '';
  let recommendedSpecialty: ClinicalEvaluationResult['recommendedSpecialty'] = 'Academic Burnout';

  if (totalScore <= 4) {
    severity = 'Minimal';
    clinicalSummary = 'Your mood and energy look steady over the past 2 weeks. You are experiencing normal day-to-day student ups and downs.';
    recommendedPathway = 'Keep up a steady sleep routine (7+ hours), take short breaks between study blocks, and log your mood once a week.';
    recommendedSpecialty = 'Academic Burnout';
  } else if (totalScore <= 9) {
    severity = 'Mild';
    clinicalSummary = 'You are showing signs of mild burnout or low energy that may make studying and daily routines feel harder than usual.';
    recommendedPathway = 'Try the 4-Step Thought Reframing tool below, join a weekly student support group, or book a single check-in session with a counselor.';
    recommendedSpecialty = 'Academic Burnout';
  } else if (totalScore <= 14) {
    severity = 'Moderate';
    clinicalSummary = 'Your score shows moderate low mood and exhaustion that are actively affecting your sleep, motivation, or schoolwork.';
    recommendedPathway = 'We recommend booking a free 1-on-1 session with a Mood & Depression counselor this week to build a manageable support plan.';
    recommendedSpecialty = 'Mood & Depression';
  } else if (totalScore <= 19) {
    severity = 'Moderately Severe';
    clinicalSummary = 'You are carrying a heavy emotional load right now. You do not have to push through this alone—active support can help lighten the pressure.';
    recommendedPathway = 'Book a priority appointment with a campus psychologist within 48 hours; they can also help arrange deadline extensions if needed.';
    recommendedSpecialty = 'Mood & Depression';
  } else {
    severity = 'Severe';
    clinicalSummary = 'Your responses show severe distress and exhaustion. Please connect with our care team today so we can support you right away.';
    recommendedPathway = 'Speak with our 24/7 on-call counselor today and schedule immediate 1-on-1 support.';
    recommendedSpecialty = 'Mood & Depression';
  }

  if (item9Score > 0) {
    clinicalSummary += ' Important: Because you selected a response on Question 9 about personal safety, please connect with our 24/7 counselor right away.';
  }

  return {
    ok: true,
    result: {
      instrument: 'PHQ-9',
      totalScore,
      maxScore: 27,
      severity,
      requiresSafetyCheck,
      clinicalSummary,
      recommendedPathway,
      recommendedSpecialty,
    },
  };
}

export function evaluateGad7(answers: (number | null)[]): { ok: true; result: ClinicalEvaluationResult } | { ok: false; missingIndices: number[]; error: string } {
  if (answers.length !== 7) {
    return { ok: false, missingIndices: [], error: 'GAD-7 requires exactly 7 responses.' };
  }

  const missingIndices: number[] = [];
  let totalScore = 0;

  for (let i = 0; i < answers.length; i++) {
    const val = answers[i];
    if (val === null || val === undefined || val < 0 || val > 3 || !Number.isInteger(val)) {
      missingIndices.push(i + 1);
    } else {
      totalScore += val;
    }
  }

  if (missingIndices.length > 0) {
    return {
      ok: false,
      missingIndices,
      error: `Please answer all 7 questions to see your results (missing question${missingIndices.length > 1 ? 's' : ''}: ${missingIndices.join(', ')}).`,
    };
  }

  const requiresSafetyCheck = totalScore >= 15;
  let severity: SeverityTier = 'Minimal';
  let clinicalSummary = '';
  let recommendedPathway = '';
  let recommendedSpecialty: ClinicalEvaluationResult['recommendedSpecialty'] = 'Anxiety & Panic';

  if (totalScore <= 4) {
    severity = 'Minimal';
    clinicalSummary = 'Your stress and worry levels are in a healthy, manageable range right now.';
    recommendedPathway = 'Keep a regular sleep schedule and use the 1-Minute Guided Breathing tool before big presentations or exams.';
    recommendedSpecialty = 'Academic Burnout';
  } else if (totalScore <= 9) {
    severity = 'Mild';
    clinicalSummary = 'You are experiencing mild stress and worry, which is very common around midterms, deadlines, or social changes.';
    recommendedPathway = 'Practice 4-7-8 breathing for 2 minutes a day and write down recurring worries in the Thought Reframing worksheet.';
    recommendedSpecialty = 'Anxiety & Panic';
  } else if (totalScore <= 14) {
    severity = 'Moderate';
    clinicalSummary = 'Ongoing worry and physical tension are making it hard for you to relax or rest after studying.';
    recommendedPathway = 'Schedule a free session with an Anxiety & Panic counselor and join the weekly Exam Stress workshop.';
    recommendedSpecialty = 'Anxiety & Panic';
  } else {
    severity = 'Severe';
    clinicalSummary = 'You are experiencing high, constant anxiety that is taking a toll on your focus and wellbeing.';
    recommendedPathway = 'Book a priority session with an Anxiety & Panic specialist within 48 hours to get immediate relief tools and academic support.';
    recommendedSpecialty = 'Anxiety & Panic';
  }

  return {
    ok: true,
    result: {
      instrument: 'GAD-7',
      totalScore,
      maxScore: 21,
      severity,
      requiresSafetyCheck,
      clinicalSummary,
      recommendedPathway,
      recommendedSpecialty,
    },
  };
}

export interface BookingFormInput {
  studentName: string;
  studentEmail: string;
  studentId: string;
  counselorId: string;
  slot: string;
  modality: 'In-Person Campus Clinic' | 'Telehealth Encrypted Video' | 'Same-Day Brief Triage';
  reason: string;
}

export function validateBookingInput(input: BookingFormInput): { valid: true } | { valid: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.studentName || input.studentName.trim().length < 2) {
    errors.studentName = 'Enter your full legal or preferred student name.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.(edu|ac\.[a-z]{2,3}|org)$/i;
  if (!input.studentEmail || !emailRegex.test(input.studentEmail.trim())) {
    errors.studentEmail = 'Enter a valid university email address ending in .edu or .ac.';
  }

  const idRegex = /^[A-Z0-9-]{5,12}$/i;
  if (!input.studentId || !idRegex.test(input.studentId.trim())) {
    errors.studentId = 'Enter your 5–12 character university Student ID (e.g., STU-804921).';
  }

  if (!input.counselorId) {
    errors.counselorId = 'Select a clinician from the directory.';
  }

  if (!input.slot) {
    errors.slot = 'Select an available appointment date and time slot.';
  }

  if (!input.reason || input.reason.trim().length < 10) {
    errors.reason = 'Briefly describe your primary goal or concern (at least 10 characters).';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

export interface WellnessLogEntry {
  id: string;
  date: string;
  moodScore: number; // 1 to 5
  sleepHours: number; // 0 to 14
  academicStress: number; // 1 to 10
  instrumentTag?: string;
  notes: string;
}

export interface WellnessSummary {
  avgMood: number;
  avgSleep: number;
  avgStress: number;
  burnoutRisk: 'Low' | 'Elevated' | 'High';
  entryCount: number;
}

export function computeWellnessSummary(logs: WellnessLogEntry[]): WellnessSummary {
  if (logs.length === 0) {
    return {
      avgMood: 0,
      avgSleep: 0,
      avgStress: 0,
      burnoutRisk: 'Low',
      entryCount: 0,
    };
  }

  const totalMood = logs.reduce((acc, item) => acc + item.moodScore, 0);
  const totalSleep = logs.reduce((acc, item) => acc + item.sleepHours, 0);
  const totalStress = logs.reduce((acc, item) => acc + item.academicStress, 0);

  const avgMood = Number((totalMood / logs.length).toFixed(1));
  const avgSleep = Number((totalSleep / logs.length).toFixed(1));
  const avgStress = Number((totalStress / logs.length).toFixed(1));

  let burnoutRisk: WellnessSummary['burnoutRisk'] = 'Low';
  if (avgStress >= 7.5 || (avgSleep < 6.0 && avgStress >= 6.5) || avgMood <= 2.2) {
    burnoutRisk = 'High';
  } else if (avgStress >= 5.5 || avgSleep < 6.8 || avgMood <= 3.2) {
    burnoutRisk = 'Elevated';
  }

  return {
    avgMood,
    avgSleep,
    avgStress,
    burnoutRisk,
    entryCount: logs.length,
  };
}

export interface WellnessChartPoint {
  id: string;
  date: string;
  shortDate: string;
  moodScore: number;
  sleepHours: number;
  academicStress: number;
  notes: string;
}

export interface WellnessInsightsData {
  series: WellnessChartPoint[];
  moodDelta: number;
  sleepDelta: number;
  optimalSleepDays: number;
  bestDayLabel: string;
}

export function buildWellnessChartData(logs: WellnessLogEntry[]): WellnessInsightsData {
  if (logs.length === 0) {
    return {
      series: [],
      moodDelta: 0,
      sleepDelta: 0,
      optimalSleepDays: 0,
      bestDayLabel: 'N/A',
    };
  }

  // Sort chronologically ascending by date so time-series reads left-to-right
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  const series: WellnessChartPoint[] = sorted.map((entry) => ({
    id: entry.id,
    date: entry.date,
    shortDate: entry.date.slice(5),
    moodScore: entry.moodScore,
    sleepHours: entry.sleepHours,
    academicStress: entry.academicStress,
    notes: entry.notes,
  }));

  const first = series[0];
  const last = series[series.length - 1];
  const moodDelta = Number((last.moodScore - first.moodScore).toFixed(1));
  const sleepDelta = Number((last.sleepHours - first.sleepHours).toFixed(1));
  const optimalSleepDays = series.filter((pt) => pt.sleepHours >= 7.0).length;

  const bestPoint = [...series].sort(
    (a, b) => b.moodScore - a.moodScore || b.sleepHours - a.sleepHours
  )[0];

  return {
    series,
    moodDelta,
    sleepDelta,
    optimalSleepDays,
    bestDayLabel: bestPoint ? `${bestPoint.shortDate} (${bestPoint.sleepHours}h · ${bestPoint.moodScore}/5)` : 'N/A',
  };
}

export interface CbtThoughtRecordInput {
  situation: string;
  automaticThought: string;
  distortion: string;
  evidenceAgainst: string;
  reframedThought: string;
  distressBefore: number;
  distressAfter: number;
}

export function validateCbtEntry(input: CbtThoughtRecordInput): { valid: true } | { valid: false; error: string } {
  if (!input.situation || input.situation.trim().length < 5) {
    return { valid: false, error: 'Describe the academic or personal trigger situation (at least 5 characters).' };
  }
  if (!input.automaticThought || input.automaticThought.trim().length < 5) {
    return { valid: false, error: 'Record the initial automatic thought (at least 5 characters).' };
  }
  if (!input.distortion) {
    return { valid: false, error: 'Select the primary cognitive distortion pattern.' };
  }
  if (!input.reframedThought || input.reframedThought.trim().length < 8) {
    return { valid: false, error: 'Write a balanced, evidence-based reframed perspective (at least 8 characters).' };
  }
  return { valid: true };
}

export type EmpathyReactionType = 'hug' | 'relate' | 'rooting';

export interface EmpathyReactionCounts {
  hugs: number;
  relates: number;
  rooting: number;
  userHugged?: boolean;
  userRelated?: boolean;
  userRooted?: boolean;
}

export interface EmpathySummary {
  totalSupportCount: number;
  activeReactions: EmpathyReactionType[];
  supportiveFeedbackText: string | null;
}

export function toggleEmpathyReaction<T extends EmpathyReactionCounts>(
  post: T,
  type: EmpathyReactionType
): T {
  if (type === 'hug') {
    const nextState = !post.userHugged;
    return {
      ...post,
      userHugged: nextState,
      hugs: Math.max(0, post.hugs + (nextState ? 1 : -1)),
    };
  }
  if (type === 'relate') {
    const nextState = !post.userRelated;
    return {
      ...post,
      userRelated: nextState,
      relates: Math.max(0, post.relates + (nextState ? 1 : -1)),
    };
  }
  const nextState = !post.userRooted;
  return {
    ...post,
    userRooted: nextState,
    rooting: Math.max(0, post.rooting + (nextState ? 1 : -1)),
  };
}

export function computePostEmpathySummary(
  post: EmpathyReactionCounts,
  authorHandle?: string
): EmpathySummary {
  const totalSupportCount = post.hugs + post.relates + post.rooting;
  const activeReactions: EmpathyReactionType[] = [];
  if (post.userHugged) activeReactions.push('hug');
  if (post.userRelated) activeReactions.push('relate');
  if (post.userRooted) activeReactions.push('rooting');

  if (activeReactions.length === 0) {
    return {
      totalSupportCount,
      activeReactions,
      supportiveFeedbackText: null,
    };
  }

  const labels: string[] = [];
  if (post.userHugged) labels.push('sent a warm hug');
  if (post.userRelated) labels.push('shared that you relate');
  if (post.userRooted) labels.push('are rooting for them');

  const joined =
    labels.length === 1
      ? labels[0]
      : labels.length === 2
      ? `${labels[0]} and ${labels[1]}`
      : `${labels[0]}, ${labels[1]}, and ${labels[2]}`;

  const target = authorHandle ? ` — ${authorHandle} knows they aren't alone.` : '.';

  return {
    totalSupportCount,
    activeReactions,
    supportiveFeedbackText: `You ${joined}${target}`,
  };
}


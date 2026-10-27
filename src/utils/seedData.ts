import { WellnessLogEntry } from './clinicalLogic';

export interface Counselor {
  id: string;
  name: string;
  credentials: string;
  title: string;
  specialty: 'Academic Burnout' | 'Anxiety & Panic' | 'Mood & Depression' | 'Neurodiversity & ADHD';
  secondaryFocus: string;
  languages: string;
  clinicLocation: string;
  waitDays: number;
  bio: string;
  availableSlots: string[];
  portraitTheme: 'amber-sage' | 'slate-forest' | 'terracotta-stone' | 'indigo-moss';
}

export interface ScheduledAppointment {
  id: string;
  counselorId: string;
  counselorName: string;
  credentials: string;
  specialty: string;
  slot: string;
  modality: 'In-Person Campus Clinic' | 'Telehealth Encrypted Video' | 'Same-Day Brief Triage';
  studentName: string;
  studentEmail: string;
  studentId: string;
  reason: string;
  status: 'Confirmed' | 'Cancelled';
}

export interface CbtThoughtRecord {
  id: string;
  date: string;
  situation: string;
  automaticThought: string;
  distortion: string;
  evidenceAgainst: string;
  reframedThought: string;
  distressBefore: number;
  distressAfter: number;
}

export interface PeerSupportCircle {
  id: string;
  title: string;
  facilitator: string;
  schedule: string;
  location: string;
  cohortFocus: string;
  seatsTotal: number;
  seatsEnrolled: number;
  isEnrolled: boolean;
}

export const INITIAL_COUNSELORS: Counselor[] = [
  {
    id: 'c-rostova',
    name: 'Dr. Elena Rostova',
    credentials: 'PhD, ABPP',
    title: 'Senior Clinical Psychologist & Director of Graduate Wellness',
    specialty: 'Academic Burnout',
    secondaryFocus: 'Dissertation Stagnation · Imposter Syndrome · Perfectionism',
    languages: 'English · Russian · German',
    clinicLocation: 'North Quad Health Pavilion, Suite 304',
    waitDays: 1,
    bio: 'Specializes in cognitive-behavioral interventions for high-performing undergraduate and doctoral researchers navigating chronic academic exhaustion and advisor dynamics.',
    availableSlots: ['Tue, Oct 27 · 10:30', 'Wed, Oct 28 · 14:00', 'Thu, Oct 29 · 16:15'],
    portraitTheme: 'amber-sage',
  },
  {
    id: 'c-vance',
    name: 'Dr. Marcus Vance',
    credentials: 'PsyD, LCP',
    title: 'Staff Clinical Psychologist — Mood & Affective Disorders',
    specialty: 'Mood & Depression',
    secondaryFocus: 'Major Depressive Episodes · Seasonal Affective Shift · Bereavement',
    languages: 'English · French',
    clinicLocation: 'Student Union Clinical Wing, Room 212',
    waitDays: 2,
    bio: 'Integrates Acceptance and Commitment Therapy (ACT) with interpersonal psychotherapy to support students experiencing depressive withdrawal, circadian disruption, and loss of meaning.',
    availableSlots: ['Tue, Oct 27 · 13:30', 'Thu, Oct 29 · 11:00', 'Fri, Oct 30 · 09:30'],
    portraitTheme: 'slate-forest',
  },
  {
    id: 'c-chen',
    name: 'Mei-Lin Chen',
    credentials: 'LCSW, MPH',
    title: 'Lead Behavioral Clinician — Anxiety & Somatic Regulation',
    specialty: 'Anxiety & Panic',
    secondaryFocus: 'Performance Panic · Social Anxiety · First-Gen & International Transition',
    languages: 'English · Mandarin · Cantonese',
    clinicLocation: 'North Quad Health Pavilion, Suite 208',
    waitDays: 1,
    bio: 'Focuses on somatic grounding, exposure protocols for seminar/oral defense panic, and culturally responsive support for international and first-generation university scholars.',
    availableSlots: ['Mon, Oct 26 · 15:00', 'Wed, Oct 28 · 09:30', 'Fri, Oct 30 · 14:30'],
    portraitTheme: 'terracotta-stone',
  },
  {
    id: 'c-okafor',
    name: 'Dr. Julian Okafor',
    credentials: 'PhD, Neuropsychologist',
    title: 'Executive Function & Neurodiversity Specialist',
    specialty: 'Neurodiversity & ADHD',
    secondaryFocus: 'Adult ADHD · Autism Spectrum Support · Exam Accommodations',
    languages: 'English · Igbo',
    clinicLocation: 'Center for Accessible Learning, Suite 105',
    waitDays: 3,
    bio: 'Conducts executive function coaching and coordinates formal academic accommodations for neurodivergent students managing unstructured university workloads.',
    availableSlots: ['Wed, Oct 28 · 11:30', 'Thu, Oct 29 · 15:00', 'Mon, Nov 02 · 10:00'],
    portraitTheme: 'indigo-moss',
  },
];

export const INITIAL_APPOINTMENTS: ScheduledAppointment[] = [
  {
    id: 'apt-101',
    counselorId: 'c-rostova',
    counselorName: 'Dr. Elena Rostova',
    credentials: 'PhD, ABPP',
    specialty: 'Academic Burnout',
    slot: 'Wed, Oct 28 · 14:00',
    modality: 'In-Person Campus Clinic',
    studentName: 'Alex Rivera',
    studentEmail: 'a.rivera@stanford.edu',
    studentId: 'STU-904182',
    reason: 'Midterm overload and persistent early-morning waking before lab seminars.',
    status: 'Confirmed',
  },
];

export const INITIAL_WELLNESS_LOGS: WellnessLogEntry[] = [
  {
    id: 'log-1',
    date: '2026-10-20',
    moodScore: 4,
    sleepHours: 7.5,
    academicStress: 4,
    instrumentTag: 'Baseline Check',
    notes: 'Completed literature review draft ahead of schedule; walked through campus arboretum.',
  },
  {
    id: 'log-2',
    date: '2026-10-21',
    moodScore: 3,
    sleepHours: 6.5,
    academicStress: 6,
    instrumentTag: 'Routine Log',
    notes: 'Two problem sets due Friday; mild tension headache after 4 hours in library.',
  },
  {
    id: 'log-3',
    date: '2026-10-22',
    moodScore: 2,
    sleepHours: 5.2,
    academicStress: 8,
    instrumentTag: 'GAD-7: 9 (Mild)',
    notes: 'Stayed up late debugging systems project; felt racing heart during morning recitation.',
  },
  {
    id: 'log-4',
    date: '2026-10-23',
    moodScore: 3,
    sleepHours: 6.8,
    academicStress: 7,
    instrumentTag: 'Routine Log',
    notes: 'Used 4-7-8 breathing before colloquium presentation; sleep latency improved.',
  },
  {
    id: 'log-5',
    date: '2026-10-24',
    moodScore: 4,
    sleepHours: 7.8,
    academicStress: 5,
    instrumentTag: 'PHQ-9: 4 (Minimal)',
    notes: 'Attended Graduate Peer Support Circle and disconnected from email after 20:00.',
  },
  {
    id: 'log-6',
    date: '2026-10-25',
    moodScore: 3,
    sleepHours: 6.2,
    academicStress: 7,
    instrumentTag: 'Routine Log',
    notes: 'Preparing for upcoming organic chemistry and econometrics midterms.',
  },
];

export const INITIAL_CBT_RECORDS: CbtThoughtRecord[] = [
  {
    id: 'cbt-1',
    date: '2026-10-24',
    situation: 'Received critical peer-review comments on my senior honors thesis methodology chapter.',
    automaticThought: 'My advisor thinks I am unqualified for research and I will fail my defense.',
    distortion: 'Catastrophizing & Mind Reading',
    evidenceAgainst: 'My advisor explicitly wrote that the dataset is strong and only the regression controls need tightening.',
    reframedThought: 'Detailed methodological critique is standard academic mentorship designed to strengthen my defense, not a verdict on my intelligence.',
    distressBefore: 82,
    distressAfter: 34,
  },
  {
    id: 'cbt-2',
    date: '2026-10-22',
    situation: 'Blanked on a follow-up question during Wednesday constitutional law seminar.',
    automaticThought: 'Everyone in the cohort noticed I froze and assumes I did not read the brief.',
    distortion: 'Spotlight Effect & All-or-Nothing Thinking',
    evidenceAgainst: 'I contributed two solid case analyses earlier in the hour, and three classmates texted afterward to share study notes.',
    reframedThought: 'Pausing on a complex hypothetical is normal in Socratic seminars; my overall preparation remains consistent.',
    distressBefore: 75,
    distressAfter: 28,
  },
];

export const INITIAL_PEER_CIRCLES: PeerSupportCircle[] = [
  {
    id: 'psc-1',
    title: 'Graduate Thesis & Dissertation Resilience Circle',
    facilitator: 'Moderated by Dr. Elena Rostova, PhD',
    schedule: 'Wednesdays · 17:00–18:15',
    location: 'North Quad Pavilion, Room 102',
    cohortFocus: 'PhD & Master’s Candidates',
    seatsTotal: 14,
    seatsEnrolled: 11,
    isEnrolled: true,
  },
  {
    id: 'psc-2',
    title: 'First-Generation & International Scholars Sanctuary',
    facilitator: 'Moderated by Mei-Lin Chen, LCSW',
    schedule: 'Thursdays · 16:00–17:15',
    location: 'Intercultural Center Lounge B',
    cohortFocus: 'Undergraduate & Graduate',
    seatsTotal: 16,
    seatsEnrolled: 12,
    isEnrolled: false,
  },
  {
    id: 'psc-3',
    title: 'STEM & Pre-Med High-Stakes Exam Anxiety Lab',
    facilitator: 'Moderated by Dr. Marcus Vance, PsyD',
    schedule: 'Mondays · 18:00–19:15',
    location: 'Science Library Wellness Studio',
    cohortFocus: 'All STEM Cohorts',
    seatsTotal: 18,
    seatsEnrolled: 15,
    isEnrolled: false,
  },
];

export const COGNITIVE_DISTORTIONS = [
  'Catastrophizing & Mind Reading',
  'All-or-Nothing (Black & White) Thinking',
  'Imposter Discounting the Positive',
  'Spotlight Effect & Social Comparison',
  'Emotional Reasoning ("I feel overwhelmed, so I am failing")',
  'Overgeneralization from a Single Grade',
];

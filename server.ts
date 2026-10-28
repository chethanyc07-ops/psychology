import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

interface NlpAnalysisResult {
  sentimentScore: number; // -1.0 (heavy distress) to +1.0 (positive/calm)
  sentimentLabel: string;
  primaryEmotion: string;
  secondaryEmotions: string[];
  cognitiveDistortions: {
    name: string;
    explanation: string;
    gentleReframe: string;
  }[];
  detectedTriggers: string[];
  urgencyLevel: 'safe' | 'elevated_stress' | 'crisis_urgent';
  supportiveResponseEn: string;
  supportiveResponseKn: string;
  copingStrategies: {
    titleEn: string;
    titleKn: string;
    actionStepsEn: string;
    actionStepsKn: string;
    targetSection: string;
  }[];
  professionalReferralNoteEn: string;
  professionalReferralNoteKn: string;
  engineSource: 'gemini-nlp' | 'local-nlp';
}

function runDeterministicNlpAnalysis(text: string): NlpAnalysisResult {
  const lower = text.toLowerCase();

  // 1. Crisis & Safety Triage Detection (English + Kannada keywords)
  const crisisKeywords = [
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'self harm',
    'hurt myself',
    'no reason to live',
    'better off dead',
    'give up on life',
    'ಆತ್ಮಹತ್ಯೆ',
    'ಸಾಯಬೇಕು',
    'ಬದುಕಲು ಇಷ್ಟವಿಲ್ಲ',
  ];
  const isCrisis = crisisKeywords.some((kw) => lower.includes(kw));

  // 2. Stress Trigger Extraction
  const triggers: string[] = [];
  if (
    lower.includes('exam') ||
    lower.includes('grade') ||
    lower.includes('cgpa') ||
    lower.includes('fail') ||
    lower.includes('backlog') ||
    lower.includes('test') ||
    lower.includes('study') ||
    lower.includes('ಪರೀಕ್ಷೆ') ||
    lower.includes('ಅಂಕ')
  ) {
    triggers.push('Academic & Exam Pressure');
  }
  if (
    lower.includes('placement') ||
    lower.includes('job') ||
    lower.includes('interview') ||
    lower.includes('career') ||
    lower.includes('reject') ||
    lower.includes('internship') ||
    lower.includes('ಉದ್ಯೋಗ') ||
    lower.includes('ಕೆಲಸ')
  ) {
    triggers.push('Placements & Career Uncertainty');
  }
  if (
    lower.includes('sleep') ||
    lower.includes('insomnia') ||
    lower.includes('tired') ||
    lower.includes('exhausted') ||
    lower.includes('all-nighter') ||
    lower.includes('2 am') ||
    lower.includes('3 am') ||
    lower.includes('ನಿದ್ದೆ') ||
    lower.includes('ದಣಿವು')
  ) {
    triggers.push('Sleep Debt & Physical Exhaustion');
  }
  if (
    lower.includes('lonely') ||
    lower.includes('alone') ||
    lower.includes('hostel') ||
    lower.includes('roommate') ||
    lower.includes('homesick') ||
    lower.includes('friends') ||
    lower.includes('isolated') ||
    lower.includes('ಒಂಟಿತನ') ||
    lower.includes('ಹಾಸ್ಟೆಲ್')
  ) {
    triggers.push('Hostel Isolation & Homesickness');
  }
  if (
    lower.includes('money') ||
    lower.includes('fee') ||
    lower.includes('loan') ||
    lower.includes('financial') ||
    lower.includes('ಹಣ')
  ) {
    triggers.push('Financial & Family Expectations');
  }
  if (triggers.length === 0) {
    triggers.push('General Emotional & Mental Load');
  }

  // 3. Cognitive Distortion Detection (NLP Pattern Matching)
  const distortions: NlpAnalysisResult['cognitiveDistortions'] = [];
  if (
    lower.includes('always') ||
    lower.includes('never') ||
    lower.includes('everyone') ||
    lower.includes('nobody') ||
    lower.includes('everything is ruined') ||
    lower.includes('complete failure')
  ) {
    distortions.push({
      name: 'All-or-Nothing Thinking (Black & White Pattern)',
      explanation:
        'Using absolute words like "always", "never", or "everyone" makes a temporary setback feel permanent and total.',
      gentleReframe:
        'One tough exam, semester, or rejection is a single chapter—not your entire story or capability.',
    });
  }
  if (
    lower.includes('going to fail') ||
    lower.includes('ruined') ||
    lower.includes('disaster') ||
    lower.includes('no future') ||
    lower.includes('what if') ||
    lower.includes('worst')
  ) {
    distortions.push({
      name: 'Catastrophizing (Future-Tripping)',
      explanation:
        'Jumping directly to the worst-case future outcome while your nervous system is exhausted.',
      gentleReframe:
        'Focus only on the next 30 minutes. You do not need to solve your entire degree or career tonight.',
    });
  }
  if (
    lower.includes('not good enough') ||
    lower.includes('imposter') ||
    lower.includes('smarter than me') ||
    lower.includes('behind everyone') ||
    lower.includes('fraud')
  ) {
    distortions.push({
      name: 'Imposter Syndrome & Harsh Self-Comparison',
      explanation:
        'Comparing your internal struggles with other students’ curated external highlights.',
      gentleReframe:
        'You earned your seat on this campus. Learning curves look messy for everyone behind closed doors.',
    });
  }

  if (distortions.length === 0) {
    distortions.push({
      name: 'Emotional Overload / High Cognitive Load',
      explanation:
        'Your mind is carrying multiple competing worries simultaneously without enough restorative rest.',
      gentleReframe:
        'Writing down what you feel is already a healthy step toward lowering amygdala stress reactivity.',
    });
  }

  // 4. Sentiment & Emotion Scoring
  const positiveWords = [
    'calm',
    'better',
    'good',
    'grateful',
    'hopeful',
    'passed',
    'slept',
    'happy',
    'relaxed',
    'peace',
    'ಖುಷಿ',
    'ನೆಮ್ಮದಿ',
  ];
  const highStressWords = [
    'panic',
    'overwhelmed',
    'crying',
    'anxious',
    'terrified',
    'hopeless',
    'burnout',
    'exhausted',
    'scared',
    'ಭಯ',
    'ಒತ್ತಡ',
    'ಆತಂಕ',
  ];

  let score = -0.25;
  if (isCrisis) {
    score = -0.95;
  } else if (highStressWords.some((w) => lower.includes(w))) {
    score = -0.65;
  } else if (positiveWords.some((w) => lower.includes(w))) {
    score = 0.55;
  }

  const urgencyLevel: NlpAnalysisResult['urgencyLevel'] = isCrisis
    ? 'crisis_urgent'
    : score <= -0.5
    ? 'elevated_stress'
    : 'safe';

  const sentimentLabel = isCrisis
    ? 'Urgent Distress Detected'
    : score <= -0.5
    ? 'High Academic / Emotional Strain'
    : score < 0
    ? 'Moderate Stress & Mental Fatigue'
    : 'Reflective & Grounded';

  const primaryEmotion = isCrisis
    ? 'Acute Emotional Crisis'
    : triggers[0] === 'Academic & Exam Pressure'
    ? 'Academic & Evaluation Anxiety'
    : triggers[0] === 'Placements & Career Uncertainty'
    ? 'Future & Career Apprehension'
    : triggers[0] === 'Hostel Isolation & Homesickness'
    ? 'Loneliness & Disconnection'
    : score > 0
    ? 'Calm & Self-Aware'
    : 'Emotional Fatigue & Overwhelm';

  const secondaryEmotions =
    score > 0
      ? ['Resilience', 'Mindful Awareness']
      : ['Mental Exhaustion', 'Self-Doubt', 'Restlessness'];

  // 5. Supportive Non-Diagnostic Bilingual Responses
  let supportiveResponseEn =
    "Thank you for putting this into words. Please remember that I am an AI Wellness Assistant here to offer emotional support and practical coping strategies—not a medical diagnosis or a replacement for a therapist. What you're experiencing sounds really heavy, and it makes complete sense that your mind feels taxed right now. Let's slow things down and focus on one small, manageable step today.";
  let supportiveResponseKn =
    'ನಿಮ್ಮ ಮನಸ್ಸಿನ ಭಾವನೆಗಳನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಾನು ಕೇವಲ ಸಾಮಾನ್ಯ ಭಾವನಾತ್ಮಕ ಬೆಂಬಲ ಮತ್ತು ಒತ್ತಡ ನಿರ್ವಹಣಾ ತಂತ್ರಗಳನ್ನು ನೀಡುವ AI ವೆಲ್‌ನೆಸ್ ಸಹಾಯಕನೇ ಹೊರತು, ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯ ಮಾಡುವ ವೈದ್ಯನಲ್ಲ ಅಥವಾ ಚಿಕಿತ್ಸಕನಲ್ಲ ಎಂಬುದನ್ನು ದಯವಿಟ್ಟು ನೆನಪಿಡಿ. ನೀವು ಅನುಭವಿಸುತ್ತಿರುವ ಒತ್ತಡ ಸಹಜವಾಗಿದೆ. ಈಗ ಒಂದು ನಿಧಾನವಾದ ಉಸಿರು ತೆಗೆದುಕೊಳ್ಳೋಣ ಮತ್ತು ಒಂದೇ ಒಂದು ಸಣ್ಣ ಹೆಜ್ಜೆಯತ್ತ ಗಮನ ಹರಿಸೋಣ.';

  if (isCrisis) {
    supportiveResponseEn =
      'I can hear how much pain and exhaustion you are carrying right now, and I am really glad you reached out. Because I am an AI Wellness Assistant and not a crisis clinician or therapist, your safety comes first. You do not have to carry this alone tonight—please connect immediately with a human counselor on Tele-MANAS (14416) or our 24/7 Campus Wellness Desk.';
    supportiveResponseKn =
      'ನೀವು ಎಷ್ಟೊಂದು ನೋವು ಮತ್ತು ಮಾನಸಿಕ ದಣಿವನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ ಎಂಬುದು ನನಗೆ ಅರ್ಥವಾಗುತ್ತದೆ. ನಾನು AI ಸಹಾಯಕನೇ ಹೊರತು ವೈದ್ಯನಲ್ಲದ ಕಾರಣ, ನಿಮ್ಮ ಸುರಕ್ಷತೆಯೇ ನಮಗೆ ಮೊದಲ ಆದ್ಯತೆ. ದಯವಿಟ್ಟು ಈ ಕ್ಷಣವೇ ಟೆಲಿ-ಮನಸ್ (14416) ಉಚಿತ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಕ್ಯಾಂಪಸ್ ಆಪ್ತಸಮಾಲೋಚಕರನ್ನು ಸಂಪರ್ಕಿಸಿ. ನೀವು ಒಬ್ಬಂಟಿಯಲ್ಲ.';
  } else if (triggers.includes('Academic & Exam Pressure')) {
    supportiveResponseEn =
      "Academic pressure and exam deadlines can trick your nervous system into feeling like you're in constant danger. As a supportive AI wellness companion (and not a therapist or diagnostician), I want to remind you: your grades measure a single test, never your human worth. Let's break your study load into tiny 20-minute blocks with guilt-free rest in between.";
    supportiveResponseKn =
      'ಪರೀಕ್ಷೆಯ ಒತ್ತಡ ಮತ್ತು ಅಂಕಗಳ ಚಿಂತೆ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ದಣಿವು ಉಂಟುಮಾಡಬಹುದು. ನಾನು AI ವೆಲ್‌ನೆಸ್ ಸಹಾಯಕನಾಗಿ (ಚಿಕಿತ್ಸಕನಲ್ಲ) ನಿಮಗೆ ನೆನಪಿಸಲು ಬಯಸುವುದೇನೆಂದರೆ: ಒಂದು ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶ ನಿಮ್ಮ ಜೀವನದ ಮೌಲ್ಯವನ್ನು ನಿರ್ಧರಿಸುವುದಿಲ್ಲ. ನಿಮ್ಮ ಓದನ್ನು ಸಣ್ಣ 20 ನಿಮಿಷಗಳ ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಿ ಮತ್ತು ನಡುವೆ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.';
  } else if (triggers.includes('Hostel Isolation & Homesickness')) {
    supportiveResponseEn =
      "Feeling lonely in a crowded hostel or campus is one of the most common—yet least talked about—parts of college life. While I provide general emotional support rather than clinical therapy, I'm right here with you. Reaching out to our moderated Peer Support Community or booking a warm chat with a campus counselor can help bridge that isolation.";
    supportiveResponseKn =
      'ಹಾಸ್ಟೆಲ್ ಅಥವಾ ಕಾಲೇಜಿನಲ್ಲಿ ಜನರ ನಡುವೆ ಇದ್ದರೂ ಒಂಟಿತನ ಕಾಡುವುದು ಬಹಳಷ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು ಅನುಭವಿಸುವ ಸತ್ಯ. ನಾನು ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸಕನಲ್ಲದಿದ್ದರೂ, ನಿಮಗೆ ಭಾವನಾತ್ಮಕ ಬೆಂಬಲ ನೀಡಲು ಇಲ್ಲಿದ್ದೇನೆ. ನಮ್ಮ ಅನಾಮಧೇಯ ಸಹಪಾಠಿ ವೇದಿಕೆ ಅಥವಾ ಕ್ಯಾಂಪಸ್ ಆಪ್ತಸಮಾಲೋಚಕರೊಂದಿಗೆ ಮಾತನಾಡುವುದು ನಿಮಗೆ ಸಮಾಧಾನ ನೀಡಬಲ್ಲದು.';
  }

  return {
    sentimentScore: score,
    sentimentLabel,
    primaryEmotion,
    secondaryEmotions,
    cognitiveDistortions: distortions,
    detectedTriggers: triggers,
    urgencyLevel,
    supportiveResponseEn,
    supportiveResponseKn,
    copingStrategies: [
      {
        titleEn: '4-7-8 Nervous System Reset',
        titleKn: '4-7-8 ಉಸಿರಾಟದ ಶಾಂತಗೊಳಿಸುವ ವ್ಯಾಯಾಮ',
        actionStepsEn: 'Inhale quietly for 4s, hold for 7s, and exhale slowly for 8s to lower heart rate.',
        actionStepsKn: '4 ಸೆಕೆಂಡ್ ಉಸಿರು ಎಳೆದುಕೊಳ್ಳಿ, 7 ಸೆಕೆಂಡ್ ಹಿಡಿದಿಡಿ ಮತ್ತು 8 ಸೆಕೆಂಡ್ ನಿಧಾನವಾಗಿ ಹೊರಬಿಡಿ.',
        targetSection: 'cbt-studio',
      },
      {
        titleEn: 'Chunk Tasks in Academic Stress Planner',
        titleKn: 'ಶೈಕ್ಷಣಿಕ ಒತ್ತಡ ಯೋಜಕದಲ್ಲಿ ಕೆಲಸಗಳನ್ನು ವಿಭಜಿಸಿ',
        actionStepsEn: 'Break overwhelming syllabus topics into one 25-minute low-pressure study block.',
        actionStepsKn: 'ದೊಡ್ಡ ಪಠ್ಯಕ್ರಮವನ್ನು 25 ನಿಮಿಷಗಳ ಸಣ್ಣ ಓದಿನ ಅವಧಿಗಳಾಗಿ ವಿಂಗಡಿಸಿ.',
        targetSection: 'nlp-ai',
      },
      {
        titleEn: 'Speak with a Licensed Campus Counselor',
        titleKn: 'ಕ್ಯಾಂಪಸ್ ಆಪ್ತಸಮಾಲೋಚಕರೊಂದಿಗೆ ಮಾತನಾಡಿ',
        actionStepsEn: 'Book a free, 100% confidential 1-on-1 session with a university psychologist.',
        actionStepsKn: 'ವಿಶ್ವವಿದ್ಯಾಲಯದ ಮನಃಶಾಸ್ತ್ರಜ್ಞರೊಂದಿಗೆ ಉಚಿತ ಮತ್ತು ಗೌಪ್ಯ ಸಮಾಲೋಚನೆ ಕಾಯ್ದಿರಿಸಿ.',
        targetSection: 'counseling',
      },
    ],
    professionalReferralNoteEn:
      'Disclaimer: This AI Wellness Assistant provides general emotional support and coping strategies only. It does not diagnose medical or psychological conditions and does not claim to be a licensed therapist.',
    professionalReferralNoteKn:
      'ಗಮನಿಸಿ: ಈ AI ವೆಲ್‌ನೆಸ್ ಸಹಾಯಕವು ಸಾಮಾನ್ಯ ಭಾವನಾತ್ಮಕ ಬೆಂಬಲ ಮತ್ತು ಒತ್ತಡ ನಿರ್ವಹಣಾ ತಂತ್ರಗಳನ್ನು ಮಾತ್ರ ನೀಡುತ್ತದೆ. ಇದು ಯಾವುದೇ ರೋಗನಿರ್ಣಯ ಮಾಡುವುದಿಲ್ಲ ಮತ್ತು ಪರವಾನಗಿ ಪಡೆದ ಚಿಕಿತ್ಸಕನಲ್ಲ.',
    engineSource: 'local-nlp',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/nlp/analyze', async (req, res) => {
    const { text = '' } = req.body || {};
    const trimmed = String(text).trim();

    if (!trimmed) {
      res.status(400).json({ error: 'Text input is required for NLP analysis.' });
      return;
    }

    const fallbackResult = runDeterministicNlpAnalysis(trimmed);

    // If urgent crisis keywords are present, immediately return the crisis-safe deterministic + AI response
    if (!process.env.GEMINI_API_KEY) {
      res.json(fallbackResult);
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze the following university student reflection/message using Natural Language Processing (NLP) for emotional support and stress triage.
Student message: "${trimmed}"

CRITICAL ETHICAL RULES:
1. You are an AI Wellness Assistant for college students. You MUST NOT diagnose any medical, psychiatric, or psychological condition (do not diagnose depression, GAD, ADHD, PTSD, etc.).
2. You MUST NOT claim to be a licensed therapist, psychologist, or doctor.
3. Provide warm, validating, non-judgmental general emotional support, practical student coping strategies, and encourage connecting with licensed campus counselors or helplines when appropriate.
4. Provide responses in BOTH English and Kannada (ಕನ್ನಡ).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentimentScore: {
                type: Type.NUMBER,
                description: 'Float between -1.0 (severe distress) and 1.0 (calm/positive)',
              },
              sentimentLabel: {
                type: Type.STRING,
                description: 'Short human-readable sentiment tone label',
              },
              primaryEmotion: {
                type: Type.STRING,
                description: 'Primary emotion detected in the student text',
              },
              secondaryEmotions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              cognitiveDistortions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    gentleReframe: { type: Type.STRING },
                  },
                  required: ['name', 'explanation', 'gentleReframe'],
                },
              },
              detectedTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              urgencyLevel: {
                type: Type.STRING,
                description: 'One of: safe, elevated_stress, crisis_urgent',
              },
              supportiveResponseEn: {
                type: Type.STRING,
                description:
                  'Warm, non-diagnostic supportive response in English explicitly respecting ethical boundaries',
              },
              supportiveResponseKn: {
                type: Type.STRING,
                description:
                  'Warm, non-diagnostic supportive response in Kannada (ಕನ್ನಡ) script',
              },
              copingStrategies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    titleEn: { type: Type.STRING },
                    titleKn: { type: Type.STRING },
                    actionStepsEn: { type: Type.STRING },
                    actionStepsKn: { type: Type.STRING },
                    targetSection: {
                      type: Type.STRING,
                      description: 'One of: cbt-studio, counseling, peer-groups, wellness-log, nlp-ai',
                    },
                  },
                  required: [
                    'titleEn',
                    'titleKn',
                    'actionStepsEn',
                    'actionStepsKn',
                    'targetSection',
                  ],
                },
              },
            },
            required: [
              'sentimentScore',
              'sentimentLabel',
              'primaryEmotion',
              'secondaryEmotions',
              'cognitiveDistortions',
              'detectedTriggers',
              'urgencyLevel',
              'supportiveResponseEn',
              'supportiveResponseKn',
              'copingStrategies',
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        const urgency =
          fallbackResult.urgencyLevel === 'crisis_urgent'
            ? 'crisis_urgent'
            : parsed.urgencyLevel === 'crisis_urgent' ||
              parsed.urgencyLevel === 'elevated_stress' ||
              parsed.urgencyLevel === 'safe'
            ? parsed.urgencyLevel
            : fallbackResult.urgencyLevel;

        res.json({
          ...fallbackResult,
          ...parsed,
          urgencyLevel: urgency,
          professionalReferralNoteEn: fallbackResult.professionalReferralNoteEn,
          professionalReferralNoteKn: fallbackResult.professionalReferralNoteKn,
          engineSource: 'gemini-nlp',
        });
        return;
      }

      res.json(fallbackResult);
    } catch {
      res.json(fallbackResult);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Solace Campus NLP AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

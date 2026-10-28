import React, { useState } from 'react';
import {
  ShieldCheck,
  Flag,
  MessageCircleHeart,
  Headphones,
  Send,
  Eye,
  CheckSquare,
  Square,
  HeartHandshake,
  AlertTriangle,
  PhoneCall,
  CalendarHeart,
  X,
  CheckCircle2,
  Users,
  Sparkles,
  Heart,
} from 'lucide-react';
import { NavSectionId } from './TopBar';
import {
  EmpathyReactionType,
  toggleEmpathyReaction,
  computePostEmpathySummary,
} from '../utils/clinicalLogic';

interface PeerSupportAndProofProps {
  onSelectSection: (section: NavSectionId) => void;
  onOpenCrisisModal: () => void;
}

interface AliasIdentity {
  avatar: string;
  handle: string;
}

const ALIAS_POOL: AliasIdentity[] = [
  { avatar: '🦉', handle: 'QuietOwl_402' },
  { avatar: '💻', handle: 'MidnightCoder_19' },
  { avatar: '🪷', handle: 'CalmLotus_88' },
  { avatar: '☕', handle: 'CoffeeSurvivor' },
  { avatar: '🦊', handle: 'GentleFox_73' },
  { avatar: '🌿', handle: 'BanyanBreeze_14' },
  { avatar: '✨', handle: 'StarlightScholar_09' },
];

type CircleFilterId =
  | 'all'
  | 'exam-stress'
  | 'placements'
  | 'hostel'
  | 'small-wins';

interface SupportCircleTab {
  id: CircleFilterId;
  name: string;
  icon: string;
  badgeText: string;
  description: string;
}

const SUPPORT_CIRCLES: SupportCircleTab[] = [
  {
    id: 'all',
    name: 'All Campus Voices',
    icon: '🌐',
    badgeText: '🌐 All Campus Voices',
    description: 'The main live feed of anonymous student posts and encouragement.',
  },
  {
    id: 'exam-stress',
    name: 'Exam & Backlog Stress',
    icon: '📚',
    badgeText: '📚 Exam & Backlog Stress',
    description:
      'Coping with tough semesters, academic burnout, CGPA anxiety, and study pressure.',
  },
  {
    id: 'placements',
    name: 'Placements & Career',
    icon: '💼',
    badgeText: '💼 Placements & Career',
    description:
      'Handling rejection emails, interview nervousness, internship FOMO, and future uncertainty.',
  },
  {
    id: 'hostel',
    name: 'Hostel & Homesickness',
    icon: '🏠',
    badgeText: '🏠 Hostel & Homesickness',
    description:
      'First-year adjustment, roommate conflicts, feeling lonely in a crowd, and missing home.',
  },
  {
    id: 'small-wins',
    name: 'Small Wins & Gratitude',
    icon: '🌱',
    badgeText: '🌱 Small Wins & Gratitude',
    description:
      'Positive milestones: "Finally got out of bed today," "Cleared my viva," or "Slept 8 hours."',
  },
];

const NEED_TAGS = [
  {
    id: 'venting',
    shortLabel: '👂 Just Venting',
    fullLabel: '👂 Just venting (No advice please, just hugs)',
  },
  {
    id: 'advice',
    shortLabel: '💡 Looking for Advice',
    fullLabel: '💡 Looking for advice / study tips',
  },
  {
    id: 'relate',
    shortLabel: '🤝 Anyone else feeling this way?',
    fullLabel: '🤝 Anyone else feeling this way?',
  },
];

const QUICK_REPLY_CHIPS = [
  "You are not behind; everyone's timeline is different.",
  'Sending strength from another final-year student!',
  "One test doesn't define your capability.",
];

const HIGH_RISK_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'self harm',
  'self-harm',
  'want to die',
  'hurt myself',
  'overdose',
  'give up on life',
  'better off dead',
];

interface PeerReply {
  id: string;
  avatar: string;
  handle: string;
  timeAgo: string;
  text: string;
  hugs?: number;
  userHugged?: boolean;
  flagged?: boolean;
}

interface PeerPost {
  id: string;
  avatar: string;
  handle: string;
  timeAgo: string;
  circleId: Exclude<CircleFilterId, 'all'>;
  circleBadge: string;
  needTag: string;
  body: string;
  contentWarning?: string;
  hugs: number;
  relates: number;
  rooting: number;
  userHugged?: boolean;
  userRelated?: boolean;
  userRooted?: boolean;
  flagged?: boolean;
  replies: PeerReply[];
}

const INITIAL_POSTS: PeerPost[] = [
  {
    id: 'post-1',
    avatar: '🦊',
    handle: 'AnonFox_21',
    timeAgo: '14 mins ago',
    circleId: 'placements',
    circleBadge: '💼 Placements & Career',
    needTag: '👂 Just Venting',
    body: "Everyone in my hostel corridor is getting placed or getting internship offers, and I couldn't even clear the coding round today. Feel like I'm falling behind everyone.",
    hugs: 24,
    relates: 41,
    rooting: 15,
    replies: [
      {
        id: 'rep-101',
        avatar: '🪷',
        handle: 'CalmLotus_88',
        timeAgo: '9 mins ago',
        text: "When I failed my first 4 technical rounds last semester, what helped me was muting placement WhatsApp groups for a week. You are not behind; everyone's timeline is different.",
        hugs: 9,
      },
    ],
  },
  {
    id: 'post-2',
    avatar: '🐢',
    handle: 'SteadyTurtle_55',
    timeAgo: '42 mins ago',
    circleId: 'exam-stress',
    circleBadge: '📚 Exam & Backlog Stress',
    needTag: '💡 Looking for advice / study tips',
    contentWarning: 'Heavy Anxiety & Academic Backlog',
    body: 'I got a backlog in Engineering Maths II and I have been too scared to tell my parents at home. Every time I open the textbook my chest tightens up. Has anyone cleared a backlog while keeping their sanity?',
    hugs: 32,
    relates: 29,
    rooting: 27,
    replies: [
      {
        id: 'rep-102',
        avatar: '💻',
        handle: 'MidnightCoder_19',
        timeAgo: '25 mins ago',
        text: 'I had two backlogs in 2nd year and cleared both! Start with past 5-year university question papers—just 45 mins a day. One test doesn’t define your capability.',
        hugs: 14,
      },
    ],
  },
  {
    id: 'post-3',
    avatar: '🦌',
    handle: 'HostelWanderer_08',
    timeAgo: '1 hr ago',
    circleId: 'hostel',
    circleBadge: '🏠 Hostel & Homesickness',
    needTag: '🤝 Anyone else feeling this way?',
    body: 'Dining hall dinners feel extra lonely on Sunday nights when everyone sits in their own cliques. Missing home-cooked food and quiet evenings with family.',
    hugs: 38,
    relates: 52,
    rooting: 19,
    replies: [],
  },
  {
    id: 'post-4',
    avatar: '🌱',
    handle: 'SproutInRain_11',
    timeAgo: '2 hrs ago',
    circleId: 'small-wins',
    circleBadge: '🌱 Small Wins & Gratitude',
    needTag: '👂 Just Venting',
    body: 'Finally got out of bed on time today, showered, attended my 9 AM lecture, and slept 8 hours last night without doomscrolling. Small step, but I feel human again.',
    hugs: 46,
    relates: 34,
    rooting: 63,
    replies: [],
  },
];

interface EmpathyButtonDescriptor {
  type: EmpathyReactionType;
  label: string;
  subtitle: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClasses: string;
  idleClasses: string;
  badgeActiveClasses: string;
  badgeIdleClasses: string;
}

const EMPATHY_BUTTON_META: EmpathyButtonDescriptor[] = [
  {
    type: 'hug',
    label: 'Send a Hug',
    subtitle: 'Warm comfort',
    emoji: '🫂',
    icon: HeartHandshake,
    activeClasses:
      'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white border-[#0D9488] shadow-[0_6px_18px_-4px_rgba(13,148,136,0.45)]',
    idleClasses:
      'bg-[#F0FDFA] hover:bg-[#CCFBF1]/80 text-[#0F2942] border-[#99F6E4]',
    badgeActiveClasses: 'bg-white/20 text-white',
    badgeIdleClasses: 'bg-white text-[#0D9488] border border-[#99F6E4]',
  },
  {
    type: 'relate',
    label: 'Relate',
    subtitle: 'I feel this too',
    emoji: '🤝',
    icon: Users,
    activeClasses:
      'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white border-[#0284C7] shadow-[0_6px_18px_-4px_rgba(2,132,199,0.42)]',
    idleClasses:
      'bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0F2942] border-[#BAE6FD]',
    badgeActiveClasses: 'bg-white/20 text-white',
    badgeIdleClasses: 'bg-white text-[#0284C7] border border-[#BAE6FD]',
  },
  {
    type: 'rooting',
    label: 'Rooting for You',
    subtitle: 'Cheering you on',
    emoji: '🌟',
    icon: Sparkles,
    activeClasses:
      'bg-gradient-to-r from-[#0D9488] via-[#0891B2] to-[#0284C7] text-white border-[#0891B2] shadow-[0_6px_18px_-4px_rgba(8,145,178,0.45)]',
    idleClasses:
      'bg-[#F0F9FF]/80 hover:bg-[#E0F2FE]/80 text-[#0F2942] border-[#BAE6FD]',
    badgeActiveClasses: 'bg-white/20 text-white',
    badgeIdleClasses: 'bg-white text-[#0F766E] border border-[#99F6E4]',
  },
];

export const PeerSupportAndProof: React.FC<PeerSupportAndProofProps> = ({
  onSelectSection,
  onOpenCrisisModal,
}) => {
  // 1. Anonymous Identity Bar State
  const [aliasIdx, setAliasIdx] = useState<number>(0);
  const currentAlias = ALIAS_POOL[aliasIdx];

  // 2. Active Topic Circle Filter
  const [activeCircle, setActiveCircle] = useState<CircleFilterId>('all');

  // 3. "Safe Vent" Composer State
  const [composerText, setComposerText] = useState<string>('');
  const [composerCircle, setComposerCircle] =
    useState<Exclude<CircleFilterId, 'all'>>('exam-stress');
  const [composerNeedTag, setComposerNeedTag] = useState<string>(NEED_TAGS[0].fullLabel);
  const [hasContentWarning, setHasContentWarning] = useState<boolean>(false);
  const [contentWarningLabel, setContentWarningLabel] = useState<string>(
    'Heavy Anxiety, Academic Failure'
  );
  const [isCrisisGuardrailOpen, setIsCrisisGuardrailOpen] = useState<boolean>(false);

  // 4. Feed Posts State + Revealed Content Warnings + Custom Reply Drafts
  const [posts, setPosts] = useState<PeerPost[]>(INITIAL_POSTS);
  const [revealedWarnings, setRevealedWarnings] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  // 5. Peer Buddy 1-on-1 Chat & Audio Huddle State
  const [isPeerBuddyModalOpen, setIsPeerBuddyModalOpen] = useState<boolean>(false);
  const [buddyMessages, setBuddyMessages] = useState<
    { sender: 'peer' | 'me'; text: string }[]
  >([
    {
      sender: 'peer',
      text: "Hey! I'm Senior Peer Listener @BanyanMentor_04 (4th Year CSE, trained in active listening). Everything here is 100% anonymous and disappears when we close the chat. What's on your mind today?",
    },
  ]);
  const [buddyDraft, setBuddyDraft] = useState<string>('');

  const [remindedRooms, setRemindedRooms] = useState<Record<string, boolean>>({});
  const [activeAudioRoomModal, setActiveAudioRoomModal] = useState<string | null>(null);

  const handleShuffleAlias = () => {
    setAliasIdx((prev) => (prev + 1) % ALIAS_POOL.length);
  };

  // Smart Crisis Guardrail Check + Post Submission
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = composerText.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const containsHighRisk = HIGH_RISK_KEYWORDS.some((kw) => lower.includes(kw));
    if (containsHighRisk) {
      setIsCrisisGuardrailOpen(true);
      return;
    }

    const matchedCircle =
      SUPPORT_CIRCLES.find((c) => c.id === composerCircle) || SUPPORT_CIRCLES[1];
    const matchedNeed =
      NEED_TAGS.find((n) => n.fullLabel === composerNeedTag) || NEED_TAGS[0];

    const newPost: PeerPost = {
      id: `post-${Date.now()}`,
      avatar: currentAlias.avatar,
      handle: currentAlias.handle,
      timeAgo: 'Just now',
      circleId: composerCircle,
      circleBadge: matchedCircle.badgeText,
      needTag: matchedNeed.shortLabel,
      body: trimmed,
      contentWarning: hasContentWarning ? contentWarningLabel.trim() : undefined,
      hugs: 1,
      relates: 0,
      rooting: 1,
      userHugged: true,
      replies: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setComposerText('');
    setHasContentWarning(false);
  };

  const handleToggleReaction = (postId: string, type: EmpathyReactionType) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? toggleEmpathyReaction(post, type) : post))
    );
  };

  const handleToggleReplyHug = (postId: string, replyId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          replies: post.replies.map((r) => {
            if (r.id !== replyId) return r;
            const nextHugged = !r.userHugged;
            const currentHugs = r.hugs ?? 0;
            return {
              ...r,
              userHugged: nextHugged,
              hugs: Math.max(0, currentHugs + (nextHugged ? 1 : -1)),
            };
          }),
        };
      })
    );
  };

  const handleAddReply = (postId: string, replyText: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [
                ...post.replies,
                {
                  id: `reply-${Date.now()}-${Math.random()}`,
                  avatar: currentAlias.avatar,
                  handle: currentAlias.handle,
                  timeAgo: 'Just now',
                  text: trimmed,
                  hugs: 1,
                  userHugged: true,
                },
              ],
            }
          : post
      )
    );
    setReplyInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleFlagPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, flagged: true } : p))
    );
  };

  const handleFlagReply = (postId: string, replyId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: p.replies.map((r) =>
                r.id === replyId ? { ...r, flagged: true } : r
              ),
            }
          : p
      )
    );
  };

  const handleSendBuddyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = buddyDraft.trim();
    if (!trimmed) return;

    const myMsg = { sender: 'me' as const, text: trimmed };
    const peerReply = {
      sender: 'peer' as const,
      text: "I really hear you on that. When I was going through something similar in my 2nd year, just talking it out without someone judging my GPA made a huge difference. Take a breath—I'm right here listening.",
    };
    setBuddyMessages((prev) => [...prev, myMsg, peerReply]);
    setBuddyDraft('');
  };

  const visiblePosts = posts.filter(
    (p) => !p.flagged && (activeCircle === 'all' || p.circleId === activeCircle)
  );

  const currentCircleMeta =
    SUPPORT_CIRCLES.find((c) => c.id === activeCircle) || SUPPORT_CIRCLES[0];

  const totalHugsInFeed = visiblePosts.reduce((sum, p) => sum + p.hugs, 0);
  const totalRelatesInFeed = visiblePosts.reduce((sum, p) => sum + p.relates, 0);
  const totalRootingInFeed = visiblePosts.reduce((sum, p) => sum + p.rooting, 0);

  return (
    <section
      id="peer-groups"
      aria-label="Anonymous Campus Peer Space"
      className="py-10 sm:py-14 px-4 sm:px-8 max-w-[1180px] mx-auto space-y-8"
    >
      {/* 1. Section Header & Anonymous Identity Bar */}
      <div className="bg-white/95 backdrop-blur-xl border border-[#BAE6FD] rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,41,66,0.06)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1">
              Empathy-First Community · No Public Likes or Follower Counts
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942]">
              Anonymous Campus Peer Space
            </h2>
            <p className="text-sm sm:text-base text-[#47627B] mt-2 leading-relaxed">
              You aren&apos;t the only one feeling this way. Share your struggles, celebrate small
              wins, and encourage fellow students with empathy-first reactions under a 100%
              anonymous alias.
            </p>
          </div>

          {/* Live Empathy Atmosphere Summary */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#47627B] bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl px-4 py-3 shrink-0">
            <span className="font-bold text-[#0F2942]">Campus Empathy Pulse:</span>
            <span className="font-mono font-bold text-[#0D9488] tabular-nums">
              🫂 {totalHugsInFeed} Hugs
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-[#0284C7] tabular-nums">
              🤝 {totalRelatesInFeed} Relates
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-[#0F766E] tabular-nums">
              🌟 {totalRootingInFeed} Rooting
            </span>
          </div>
        </div>

        {/* Anonymous Alias Bar (Top Strip) */}
        <div className="mt-6 p-4 sm:px-5 rounded-2xl bg-[#F0F9FF]/90 border border-[#BAE6FD] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#BAE6FD] text-xs sm:text-sm font-extrabold text-[#0F2942] shadow-2xs">
              <span className="text-lg" aria-hidden="true">
                {currentAlias.avatar}
              </span>
              <span>
                Posting as: <span className="text-[#0D9488] font-mono">{currentAlias.handle}</span>
              </span>
            </span>

            <button
              type="button"
              onClick={handleShuffleAlias}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <span>🎲 Shuffle Alias</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-xs font-bold text-[#0F766E]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#0D9488]" aria-hidden="true" />
            <span>🛡️ AI &amp; Peer Moderated — Zero Bullying Policy</span>
          </div>
        </div>
      </div>

      {/* 2. Campus Support Circles (Topic Filter Tabs) */}
      <div className="bg-white/95 backdrop-blur-xl border border-[#BAE6FD] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#0D9488]">
            Campus Support Circles (Topic Filter Tabs)
          </span>
          <span className="text-xs text-[#47627B]">{currentCircleMeta.description}</span>
        </div>

        <div
          role="tablist"
          aria-label="Campus Support Circles"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5"
        >
          {SUPPORT_CIRCLES.map((circle) => {
            const isSelected = activeCircle === circle.id;
            return (
              <button
                key={circle.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveCircle(circle.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#0D9488] to-[#0284C7] text-white border-[#0D9488] shadow-sm'
                    : 'bg-[#F0F9FF]/70 hover:bg-white text-[#0F2942] border-[#BAE6FD]'
                }`}
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold">
                  <span className="text-base" aria-hidden="true">
                    {circle.icon}
                  </span>
                  <span className="leading-snug">{circle.name}</span>
                </div>
                <p
                  className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-white/90' : 'text-[#47627B]'
                  }`}
                >
                  {circle.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Left 8 Cols (Safe Vent Composer + Anonymous Feed) + Right 4 Cols (Kindness Pledge & Peer Buddy Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* 3. The "Safe Vent" Composer Card */}
          <form
            onSubmit={handlePublishPost}
            className="bg-white/95 backdrop-blur-xl border border-[#BAE6FD] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E0F2FE]">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#0D9488]">
                  The &ldquo;Safe Vent&rdquo; Composer Card
                </span>
                <h3 className="text-lg font-extrabold text-[#0F2942] mt-0.5">
                  Share With Fellow Students (100% Hidden Identity)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#0F766E] bg-[#F0FDFA] px-3 py-1 rounded-xl border border-[#99F6E4]">
                {currentAlias.avatar} {currentAlias.handle}
              </span>
            </div>

            {/* Prompt Input Box */}
            <div>
              <label htmlFor="safe-vent-textarea" className="sr-only">
                What is on your mind today?
              </label>
              <textarea
                id="safe-vent-textarea"
                rows={3}
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="What’s on your mind today? Share freely—your identity is completely hidden..."
                className="w-full p-4 rounded-2xl bg-[#F0F9FF]/70 border border-[#BAE6FD] text-sm text-[#0F2942] placeholder:text-[#47627B]/70 focus:outline-none focus:bg-white focus:border-[#0D9488] transition-colors"
              />
            </div>

            {/* Select a Circle Dropdown + "What do you need right now?" Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="composer-circle-select"
                  className="block text-xs font-bold text-[#0F2942] mb-1.5"
                >
                  Select a Circle Dropdown:
                </label>
                <select
                  id="composer-circle-select"
                  value={composerCircle}
                  onChange={(e) =>
                    setComposerCircle(e.target.value as Exclude<CircleFilterId, 'all'>)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0F9FF]/70 border border-[#BAE6FD] text-xs sm:text-sm font-semibold text-[#0F2942]"
                >
                  <option value="exam-stress">📚 Exam &amp; Backlog Stress</option>
                  <option value="placements">💼 Placements &amp; Career</option>
                  <option value="hostel">🏠 Hostel &amp; Homesickness</option>
                  <option value="small-wins">🌱 Small Wins &amp; Gratitude</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="composer-need-select"
                  className="block text-xs font-bold text-[#0F2942] mb-1.5"
                >
                  &ldquo;What do you need right now?&rdquo; Tag:
                </label>
                <select
                  id="composer-need-select"
                  value={composerNeedTag}
                  onChange={(e) => setComposerNeedTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0F9FF]/70 border border-[#BAE6FD] text-xs sm:text-sm font-semibold text-[#0F2942]"
                >
                  {NEED_TAGS.map((tag) => (
                    <option key={tag.id} value={tag.fullLabel}>
                      {tag.fullLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Trigger Warning Toggle + Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={hasContentWarning}
                  onClick={() => setHasContentWarning((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#47627B] hover:text-[#0F2942] cursor-pointer"
                >
                  {hasContentWarning ? (
                    <CheckSquare className="w-4 h-4 text-[#0D9488]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#47627B]" />
                  )}
                  <span>
                    Add Content Warning (e.g., Heavy Anxiety, Academic Failure) — blurs text until
                    clicked
                  </span>
                </button>

                {hasContentWarning && (
                  <input
                    type="text"
                    value={contentWarningLabel}
                    onChange={(e) => setContentWarningLabel(e.target.value)}
                    placeholder="Content warning label..."
                    className="block w-full sm:w-72 px-3 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#F59E0B]/40 text-xs font-semibold text-[#92400E]"
                  />
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer shrink-0"
              >
                Post Anonymously
              </button>
            </div>
          </form>

          {/* 4. Anonymous Feed Cards & Empathy-First Reactions */}
          <div className="space-y-5">
            {visiblePosts.map((post) => {
              const isBlurred =
                Boolean(post.contentWarning) && !revealedWarnings[post.id];
              const empathySummary = computePostEmpathySummary(post, post.handle);

              return (
                <article
                  key={post.id}
                  data-testid={`peer-post-${post.id}`}
                  className="bg-white/95 backdrop-blur-xl border border-[#BAE6FD] rounded-3xl p-6 sm:p-7 shadow-[0_8px_28px_-6px_rgba(15,41,66,0.05)] space-y-4"
                >
                  {/* Top Row: Avatar + Handle • Time • Circle • Need Tag + Flag Icon */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-extrabold text-[#0F2942] inline-flex items-center gap-1.5">
                        <span className="text-base" aria-hidden="true">
                          {post.avatar}
                        </span>
                        <span>{post.handle}</span>
                      </span>
                      <span className="text-[#47627B]" aria-hidden="true">
                        &middot;
                      </span>
                      <span className="text-[#47627B] font-mono">{post.timeAgo}</span>
                      <span className="text-[#47627B]" aria-hidden="true">
                        &middot;
                      </span>
                      <span className="text-[#0D9488] font-bold">{post.circleBadge}</span>
                      <span className="text-[#47627B]" aria-hidden="true">
                        &middot;
                      </span>
                      <span className="text-[#0284C7] font-semibold">{post.needTag}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFlagPost(post.id)}
                      title="Flag post for moderator review"
                      aria-label={`Flag post by ${post.handle} for moderator`}
                      className="inline-flex items-center gap-1 text-[11px] text-[#47627B] hover:text-[#E11D48] px-2.5 py-1 rounded-xl hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Flag</span>
                    </button>
                  </div>

                  {/* Content Warning Blur Wrapper if applicable */}
                  {post.contentWarning && (
                    <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/35 text-xs font-bold text-[#92400E]">
                      <span>⚠️ Content Warning: {post.contentWarning}</span>
                      {isBlurred && (
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedWarnings((prev) => ({ ...prev, [post.id]: true }))
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#D97706] text-white text-xs font-bold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Post</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Post Body */}
                  <div className="relative">
                    <p
                      className={`text-sm sm:text-base text-[#0F2942] leading-relaxed transition-all ${
                        isBlurred ? 'blur-md select-none' : ''
                      }`}
                    >
                      &ldquo;{post.body}&rdquo;
                    </p>
                  </div>

                  {/* Empathy-First Reaction Bar (Replaces Traditional Likes) */}
                  <div
                    role="group"
                    aria-label={`Empathy-First reactions for ${post.handle}'s post`}
                    className="pt-3 border-t border-[#E0F2FE] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#47627B]">
                      <span className="font-bold text-[#0F766E] flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
                        <span>Empathy-First Reactions · Zero vanity likes, only peer warmth</span>
                      </span>
                      <span className="font-mono font-semibold text-[#0284C7] tabular-nums">
                        {empathySummary.totalSupportCount} peers supporting {post.handle}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {EMPATHY_BUTTON_META.map((meta) => {
                        const IconComponent = meta.icon;
                        const isActive =
                          meta.type === 'hug'
                            ? Boolean(post.userHugged)
                            : meta.type === 'relate'
                            ? Boolean(post.userRelated)
                            : Boolean(post.userRooted);
                        const count =
                          meta.type === 'hug'
                            ? post.hugs
                            : meta.type === 'relate'
                            ? post.relates
                            : post.rooting;

                        return (
                          <button
                            key={meta.type}
                            type="button"
                            aria-pressed={isActive}
                            data-testid={`reaction-${meta.type}-${post.id}`}
                            onClick={() => handleToggleReaction(post.id, meta.type)}
                            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              isActive ? meta.activeClasses : meta.idleClasses
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="text-base leading-none shrink-0"
                                aria-hidden="true"
                              >
                                {meta.emoji}
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-extrabold leading-tight flex items-center gap-1">
                                  <IconComponent
                                    className="w-3.5 h-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                  <span className="truncate">{meta.label}</span>
                                </div>
                                <div
                                  className={`text-[10px] leading-tight mt-0.5 truncate ${
                                    isActive ? 'text-white/90' : 'text-[#47627B]'
                                  }`}
                                >
                                  {meta.subtitle}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold tabular-nums shrink-0 ${
                                isActive ? meta.badgeActiveClasses : meta.badgeIdleClasses
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {empathySummary.supportiveFeedbackText && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="px-3.5 py-2 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-xs font-semibold text-[#0F766E] flex items-center justify-between gap-2"
                      >
                        <span>✨ {empathySummary.supportiveFeedbackText}</span>
                        <span className="text-[11px] font-mono text-[#0D9488] shrink-0">
                          Anonymous Care Sent
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Supportive Replies Section */}
                  <div className="pt-4 border-t border-[#E0F2FE] space-y-3">
                    <div className="text-[11px] font-bold text-[#47627B] uppercase tracking-wider">
                      Quick Supportive Reply Chips (1-Click):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLY_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAddReply(post.id, chip)}
                          className="px-3 py-1.5 rounded-xl bg-[#F0F9FF] hover:bg-[#0D9488] text-[#0F2942] hover:text-white border border-[#BAE6FD] text-xs font-semibold transition-colors cursor-pointer text-left"
                        >
                          &ldquo;{chip}&rdquo;
                        </button>
                      ))}
                    </div>

                    {/* Existing Replies */}
                    {post.replies.filter((r) => !r.flagged).length > 0 && (
                      <div className="space-y-2 pt-2">
                        {post.replies
                          .filter((r) => !r.flagged)
                          .map((reply) => (
                            <div
                              key={reply.id}
                              className="p-3.5 rounded-2xl bg-[#F0F9FF]/70 border border-[#BAE6FD] flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="font-bold text-[#0F2942]">
                                  {reply.avatar} {reply.handle}{' '}
                                  <span className="font-mono font-normal text-[#47627B] ml-1">
                                    &middot; {reply.timeAgo}
                                  </span>
                                </div>
                                <p className="text-[#0F2942] leading-relaxed">{reply.text}</p>
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    aria-pressed={Boolean(reply.userHugged)}
                                    onClick={() => handleToggleReplyHug(post.id, reply.id)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                      reply.userHugged
                                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                                        : 'bg-white text-[#0F766E] border-[#99F6E4] hover:bg-[#F0FDFA]'
                                    }`}
                                  >
                                    <span>🫂 Warmth ({reply.hugs ?? 0})</span>
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFlagReply(post.id, reply.id)}
                                title="Flag reply for moderator"
                                aria-label={`Flag reply by ${reply.handle}`}
                                className="text-[#47627B] hover:text-[#E11D48] shrink-0 cursor-pointer"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Custom Supportive Reply Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <label htmlFor={`reply-input-${post.id}`} className="sr-only">
                        Write a kind reply to {post.handle}
                      </label>
                      <input
                        id={`reply-input-${post.id}`}
                        type="text"
                        value={replyInputs[post.id] || ''}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder={`Write a kind reply as ${currentAlias.handle}...`}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#F0F9FF]/70 border border-[#BAE6FD] text-xs text-[#0F2942]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReply(post.id, replyInputs[post.id] || '')}
                        className="px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: 5. "Peer Buddy" 1-on-1 Chat & Scheduled Huddles + 6. Community Kindness Pledge */}
        <div className="lg:col-span-4 space-y-6">
          {/* 5A. 1-on-1 Trained Peer Listener (Anonymous Text Chat) */}
          <div className="bg-white/95 backdrop-blur-xl border border-[#BAE6FD] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-xs font-extrabold text-[#0F766E]">
              <span>6 Peer Listeners Available Now</span>
            </div>

            <h3 className="text-lg font-extrabold text-[#0F2942]">
              1-on-1 Trained Peer Listener (Anonymous Text Chat)
            </h3>
            <p className="text-xs sm:text-sm text-[#47627B] leading-relaxed">
              Connect privately with a trained senior student volunteer certified in active
              listening for a 15-minute judgment-free chat.
            </p>

            <button
              type="button"
              onClick={() => setIsPeerBuddyModalOpen(true)}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircleHeart className="w-4 h-4" />
              <span>Match with a Peer Buddy</span>
            </button>
          </div>

          {/* 5B. Weekly Guided Audio Circles (Drop-In Rooms) */}
          <div className="bg-white/95 backdrop-blur-xl border border-[#BAE6FD] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold">
              <Headphones className="w-3.5 h-3.5" />
              <span>Camera-Off Audio Rooms</span>
            </div>

            <h3 className="text-lg font-extrabold text-[#0F2942]">
              Weekly Guided Audio Circles (Drop-In Rooms)
            </h3>
            <p className="text-xs sm:text-sm text-[#47627B] leading-relaxed">
              Join small, camera-off group sessions moderated by a campus counselor or senior
              mentor.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: 'sun-room',
                  pill: 'Sun 8 PM: Sunday Night Academic Anxiety Reset',
                },
                {
                  id: 'wed-room',
                  pill: 'Wed 9 PM: Overcoming Imposter Syndrome in Tech/College',
                },
              ].map((room) => {
                const isReminded = !!remindedRooms[room.id];
                return (
                  <div
                    key={room.id}
                    className="p-3.5 rounded-2xl bg-[#F0F9FF]/70 border border-[#BAE6FD] space-y-2.5"
                  >
                    <div className="text-xs font-bold text-[#0F2942]">{room.pill}</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRemindedRooms((prev) => ({ ...prev, [room.id]: !prev[room.id] }))
                        }
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isReminded
                            ? 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]'
                            : 'bg-white text-[#0F2942] border-[#BAE6FD]'
                        }`}
                      >
                        {isReminded ? '✓ Reminder Set' : 'Remind Me'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAudioRoomModal(room.pill)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold cursor-pointer"
                      >
                        Join Room
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Community Kindness Pledge (Sidebar / Footer Box) */}
          <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#0F766E]">
              <HeartHandshake className="w-5 h-5 shrink-0 text-[#0D9488]" />
              <h3 className="text-base font-extrabold text-[#0F2942]">
                Empathy-First Community Pledge
              </h3>
            </div>

            <div className="space-y-3 text-xs text-[#47627B] leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-white border border-[#99F6E4]">
                <strong className="block font-extrabold text-[#0F2942] mb-0.5">
                  1. Support Over Popularity:
                </strong>
                We replaced traditional likes with <em>Send a Hug</em>, <em>Relate</em>, and{' '}
                <em>Rooting for You</em> so no student ever feels judged by metrics.
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#99F6E4]">
                <strong className="block font-extrabold text-[#0F2942] mb-0.5">
                  2. Speak from &ldquo;I&rdquo; Experience:
                </strong>
                Share what helped you rather than giving harsh instructions (&ldquo;When I failed
                my midterm, what helped me was...&rdquo;).
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#99F6E4]">
                <strong className="block font-extrabold text-[#0F2942] mb-0.5">
                  3. Zero Naming or Shaming:
                </strong>
                Never mention real names of students, professors, or specific hostel room numbers.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Crisis Guardrail Modal (Intercepts high-risk keywords before publishing) */}
      {isCrisisGuardrailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2942]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-[#BAE6FD] shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F0F9FF] text-[#0284C7] text-xs font-extrabold border border-[#BAE6FD]">
                <AlertTriangle className="w-4 h-4 text-[#0D9488]" />
                <span>Gentle Support Guardrail</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCrisisGuardrailOpen(false)}
                aria-label="Close safety modal"
                className="p-1.5 rounded-full text-[#47627B] hover:bg-[#F0F9FF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-base sm:text-lg font-extrabold text-[#0F2942] leading-snug">
              &ldquo;It sounds like you are going through a really painful moment. While this post
              is being reviewed for safety, please connect with a live counselor or call Tele-MANAS
              (14416) right now.&rdquo;
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCrisisGuardrailOpen(false);
                  onOpenCrisisModal();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Tele-MANAS (14416) / 24/7 Helpline Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCrisisGuardrailOpen(false);
                  onSelectSection('counseling');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0F2942] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarHeart className="w-4 h-4 text-[#0D9488]" />
                <span>Connect with a Live Campus Counselor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-on-1 Peer Buddy Anonymous Chat Modal */}
      {isPeerBuddyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2942]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#BAE6FD] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E0F2FE]">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E] bg-[#F0FDFA] border border-[#99F6E4] px-2.5 py-0.5 rounded-lg">
                  Connected to Trained Peer Buddy
                </span>
                <h4 className="text-base font-extrabold text-[#0F2942] mt-1">
                  15-Min Anonymous Peer Listener Chat
                </h4>
                <p className="text-[11px] text-[#47627B]">
                  Chatting as {currentAlias.avatar} {currentAlias.handle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPeerBuddyModalOpen(false)}
                aria-label="Close Peer Buddy chat"
                className="p-1.5 rounded-full text-[#47627B] hover:bg-[#F0F9FF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[220px]">
              {buddyMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'me'
                        ? 'bg-gradient-to-r from-[#0D9488] to-[#0284C7] text-white'
                        : 'bg-[#F0F9FF] text-[#0F2942] border border-[#BAE6FD]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendBuddyMessage}
              className="pt-3 border-t border-[#E0F2FE] flex items-center gap-2"
            >
              <label htmlFor="peer-buddy-input" className="sr-only">
                Type a message to your Peer Buddy
              </label>
              <input
                id="peer-buddy-input"
                type="text"
                value={buddyDraft}
                onChange={(e) => setBuddyDraft(e.target.value)}
                placeholder="Type a message to your Peer Buddy..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F0F9FF]/70 border border-[#BAE6FD] text-xs sm:text-sm text-[#0F2942]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Drop-In Audio Circle Modal */}
      {activeAudioRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2942]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#BAE6FD] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center mx-auto">
              <Headphones className="w-7 h-7" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] bg-[#F0FDFA] border border-[#99F6E4] px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Camera-Off &middot; Mic Muted by Default</span>
            </span>
            <h4 className="text-lg font-extrabold text-[#0F2942]">{activeAudioRoomModal}</h4>
            <p className="text-xs sm:text-sm text-[#47627B] leading-relaxed">
              You have reserved an anonymous listener spot as{' '}
              <strong>
                {currentAlias.avatar} {currentAlias.handle}
              </strong>
              . You can listen quietly with your camera off and raise your hand whenever you feel
              ready.
            </p>
            <button
              type="button"
              onClick={() => setActiveAudioRoomModal(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0284C7] text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              Got It — Back to Peer Space
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

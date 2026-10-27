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
} from 'lucide-react';
import { NavSectionId } from './TopBar';

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

  const handleToggleReaction = (
    postId: string,
    type: 'hug' | 'relate' | 'rooting'
  ) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        if (type === 'hug') {
          const nextState = !post.userHugged;
          return {
            ...post,
            userHugged: nextState,
            hugs: nextState ? post.hugs + 1 : post.hugs - 1,
          };
        }
        if (type === 'relate') {
          const nextState = !post.userRelated;
          return {
            ...post,
            userRelated: nextState,
            relates: nextState ? post.relates + 1 : post.relates - 1,
          };
        }
        const nextState = !post.userRooted;
        return {
          ...post,
          userRooted: nextState,
          rooting: nextState ? post.rooting + 1 : post.rooting - 1,
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

  return (
    <section
      id="peer-groups"
      aria-label="Anonymous Campus Peer Space"
      className="py-10 sm:py-14 px-4 sm:px-8 max-w-[1180px] mx-auto space-y-8"
    >
      {/* 1. Section Header & Anonymous Identity Bar */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(20,30,25,0.05)]">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141E19]">
            Anonymous Campus Peer Space
          </h2>
          <p className="text-sm sm:text-base text-[#4A5550] mt-2 leading-relaxed">
            You aren&apos;t the only one feeling this way. Share your struggles, celebrate small
            wins, and support fellow students under a 100% anonymous alias.
          </p>
        </div>

        {/* Anonymous Alias Bar (Top Strip) */}
        <div className="mt-6 p-4 sm:px-5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/12 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#141E19]/12 text-xs sm:text-sm font-extrabold text-[#141E19] shadow-2xs">
              <span className="text-lg" aria-hidden="true">
                {currentAlias.avatar}
              </span>
              <span>
                Posting as: <span className="text-[#1B4332] font-mono">{currentAlias.handle}</span>
              </span>
            </span>

            <button
              type="button"
              onClick={handleShuffleAlias}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#133124] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <span>🎲 Shuffle Alias</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30 text-xs font-bold text-[#065F46]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#059669]" aria-hidden="true" />
            <span>🛡️ AI &amp; Peer Moderated — Zero Bullying Policy</span>
          </div>
        </div>
      </div>

      {/* 2. Campus Support Circles (Topic Filter Tabs) */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
            Campus Support Circles (Topic Filter Tabs)
          </span>
          <span className="text-xs text-[#4A5550]">{currentCircleMeta.description}</span>
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
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                    : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/10'
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
                    isSelected ? 'text-white/80' : 'text-[#4A5550]'
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
            className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#141E19]/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#1B4332]">
                  The &ldquo;Safe Vent&rdquo; Composer Card
                </span>
                <h3 className="text-lg font-extrabold text-[#141E19] mt-0.5">
                  Share With Fellow Students (100% Hidden Identity)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#4A5550] bg-[#F8F7F4] px-3 py-1 rounded-xl border border-[#141E19]/10">
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
                className="w-full p-4 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/15 text-sm text-[#141E19] placeholder:text-[#4A5550]/70 focus:outline-none focus:bg-white focus:border-[#1B4332] transition-colors"
              />
            </div>

            {/* Select a Circle Dropdown + "What do you need right now?" Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="composer-circle-select"
                  className="block text-xs font-bold text-[#141E19] mb-1.5"
                >
                  Select a Circle Dropdown:
                </label>
                <select
                  id="composer-circle-select"
                  value={composerCircle}
                  onChange={(e) =>
                    setComposerCircle(e.target.value as Exclude<CircleFilterId, 'all'>)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#141E19]/15 text-xs sm:text-sm font-semibold text-[#141E19]"
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
                  className="block text-xs font-bold text-[#141E19] mb-1.5"
                >
                  &ldquo;What do you need right now?&rdquo; Tag:
                </label>
                <select
                  id="composer-need-select"
                  value={composerNeedTag}
                  onChange={(e) => setComposerNeedTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#141E19]/15 text-xs sm:text-sm font-semibold text-[#141E19]"
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
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A5550] hover:text-[#141E19] cursor-pointer"
                >
                  {hasContentWarning ? (
                    <CheckSquare className="w-4 h-4 text-[#1B4332]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#4A5550]" />
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
                className="px-6 py-3 rounded-2xl bg-[#1B4332] hover:bg-[#133124] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer shrink-0"
              >
                Post Anonymously
              </button>
            </div>
          </form>

          {/* 4. Anonymous Feed Cards & Empathy Reactions */}
          <div className="space-y-5">
            {visiblePosts.map((post) => {
              const isBlurred =
                Boolean(post.contentWarning) && !revealedWarnings[post.id];

              return (
                <article
                  key={post.id}
                  className="bg-white/95 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4"
                >
                  {/* Top Row: Avatar + Handle • Time • Circle Badge • Need Tag + Flag Icon */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-extrabold text-[#141E19] inline-flex items-center gap-1.5">
                        <span className="text-base" aria-hidden="true">
                          {post.avatar}
                        </span>
                        <span>{post.handle}</span>
                      </span>
                      <span className="text-[#4A5550]">&bull;</span>
                      <span className="text-[#4A5550] font-mono">{post.timeAgo}</span>
                      <span className="text-[#4A5550]">&bull;</span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#E8F3EE] text-[#1B4332] font-bold">
                        {post.circleBadge}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#F8F7F4] border border-[#141E19]/10 text-[#4A5550] font-semibold">
                        {post.needTag}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFlagPost(post.id)}
                      title="Flag post for moderator review"
                      aria-label="Flag post for moderator"
                      className="inline-flex items-center gap-1 text-[11px] text-[#4A5550] hover:text-[#9E2A2B] px-2 py-1 rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>🚩 Flag</span>
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
                      className={`text-sm sm:text-base text-[#141E19] leading-relaxed transition-all ${
                        isBlurred ? 'blur-md select-none' : ''
                      }`}
                    >
                      &ldquo;{post.body}&rdquo;
                    </p>
                  </div>

                  {/* Empathy-First Reaction Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleReaction(post.id, 'hug')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        post.userHugged
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12'
                      }`}
                    >
                      <span>🫂 Send a Hug ({post.hugs})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleReaction(post.id, 'relate')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        post.userRelated
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12'
                      }`}
                    >
                      <span>🤝 Relate / Me Too ({post.relates})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleReaction(post.id, 'rooting')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        post.userRooted
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-[#F8F7F4] hover:bg-white text-[#141E19] border-[#141E19]/12'
                      }`}
                    >
                      <span>🌟 Rooting for You ({post.rooting})</span>
                    </button>
                  </div>

                  {/* Supportive Replies Section */}
                  <div className="pt-4 border-t border-[#141E19]/10 space-y-3">
                    <div className="text-[11px] font-bold text-[#4A5550] uppercase tracking-wider">
                      Quick Supportive Reply Chips (1-Click):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLY_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAddReply(post.id, chip)}
                          className="px-3 py-1.5 rounded-xl bg-[#E8F3EE]/80 hover:bg-[#1B4332] text-[#1B4332] hover:text-white border border-[#1B4332]/15 text-xs font-semibold transition-colors cursor-pointer text-left"
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
                              className="p-3.5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/10 flex items-start justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-bold text-[#141E19] mb-1">
                                  {reply.avatar} {reply.handle}{' '}
                                  <span className="font-mono font-normal text-[#4A5550] ml-1">
                                    &bull; {reply.timeAgo}
                                  </span>
                                </div>
                                <p className="text-[#141E19] leading-relaxed">{reply.text}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFlagReply(post.id, reply.id)}
                                title="Flag reply for moderator"
                                className="text-[#4A5550] hover:text-[#9E2A2B] shrink-0 cursor-pointer"
                              >
                                🚩
                              </button>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Custom Supportive Reply Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={replyInputs[post.id] || ''}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder={`Write a kind reply as ${currentAlias.handle}...`}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8F7F4] border border-[#141E19]/15 text-xs text-[#141E19]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReply(post.id, replyInputs[post.id] || '')}
                        className="px-3.5 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
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
          <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30 text-xs font-extrabold text-[#065F46]">
              <span>🟢 6 Peer Listeners Online Now</span>
            </div>

            <h3 className="text-lg font-extrabold text-[#141E19]">
              1-on-1 Trained Peer Listener (Anonymous Text Chat)
            </h3>
            <p className="text-xs sm:text-sm text-[#4A5550] leading-relaxed">
              Connect privately with a trained senior student volunteer certified in active
              listening for a 15-minute judgment-free chat.
            </p>

            <button
              type="button"
              onClick={() => setIsPeerBuddyModalOpen(true)}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#1B4332] hover:bg-[#133124] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircleHeart className="w-4 h-4" />
              <span>Match with a Peer Buddy</span>
            </button>
          </div>

          {/* 5B. Weekly Guided Audio Circles (Drop-In Rooms) */}
          <div className="bg-white/90 backdrop-blur-xl border border-[#141E19]/10 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8F3EE] text-[#1B4332] text-xs font-bold">
              <Headphones className="w-3.5 h-3.5" />
              <span>Camera-Off Audio Rooms</span>
            </div>

            <h3 className="text-lg font-extrabold text-[#141E19]">
              Weekly Guided Audio Circles (Drop-In Rooms)
            </h3>
            <p className="text-xs sm:text-sm text-[#4A5550] leading-relaxed">
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
                    className="p-3.5 rounded-2xl bg-[#F8F7F4] border border-[#141E19]/10 space-y-2.5"
                  >
                    <div className="text-xs font-bold text-[#141E19]">{room.pill}</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRemindedRooms((prev) => ({ ...prev, [room.id]: !prev[room.id] }))
                        }
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isReminded
                            ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]/40'
                            : 'bg-white text-[#141E19] border-[#141E19]/15'
                        }`}
                      >
                        {isReminded ? '✓ Reminder Set' : 'Remind Me'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAudioRoomModal(room.pill)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#1B4332] text-white text-xs font-bold cursor-pointer"
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
          <div className="bg-[#FFFBEB]/90 border border-[#F59E0B]/35 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#92400E]">
              <HeartHandshake className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-extrabold">Community Kindness Pledge</h3>
            </div>

            <div className="space-y-3 text-xs text-[#78350F] leading-relaxed">
              <div className="p-3 rounded-2xl bg-white/80 border border-[#F59E0B]/20">
                <strong className="block font-extrabold text-[#141E19] mb-0.5">
                  1. Speak from &ldquo;I&rdquo; Experience:
                </strong>
                Share what helped you rather than giving harsh instructions (&ldquo;When I failed
                my midterm, what helped me was...&rdquo;).
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-[#F59E0B]/20">
                <strong className="block font-extrabold text-[#141E19] mb-0.5">
                  2. Zero Naming or Shaming:
                </strong>
                Never mention real names of students, professors, or specific hostel room numbers.
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-[#F59E0B]/20">
                <strong className="block font-extrabold text-[#141E19] mb-0.5">
                  3. One-Click Report:
                </strong>
                Every post and reply has a discreet 🚩 Flag for Moderator icon to hide unkind or
                triggering content immediately.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Crisis Guardrail Modal (Intercepts high-risk keywords before publishing) */}
      {isCrisisGuardrailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141E19]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-[#E11D48]/35 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FFE4E6] text-[#9F1239] text-xs font-extrabold">
                <AlertTriangle className="w-4 h-4" />
                <span>Smart Crisis Guardrail</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCrisisGuardrailOpen(false)}
                aria-label="Close safety modal"
                className="p-1.5 rounded-full text-[#4A5550] hover:bg-[#F8F7F4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-base sm:text-lg font-extrabold text-[#141E19] leading-snug">
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
                className="w-full py-3.5 px-5 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
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
                className="w-full py-3.5 px-5 rounded-2xl bg-[#1B4332] hover:bg-[#133124] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarHeart className="w-4 h-4" />
                <span>Connect with a Live Campus Counselor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-on-1 Peer Buddy Anonymous Chat Modal */}
      {isPeerBuddyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141E19]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#141E19]/10 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#141E19]/10">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#065F46] bg-[#DCFCE7] px-2.5 py-0.5 rounded-lg">
                  🟢 Connected to Trained Peer Buddy
                </span>
                <h4 className="text-base font-extrabold text-[#141E19] mt-1">
                  15-Min Anonymous Peer Listener Chat
                </h4>
                <p className="text-[11px] text-[#4A5550]">
                  Chatting as {currentAlias.avatar} {currentAlias.handle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPeerBuddyModalOpen(false)}
                aria-label="Close Peer Buddy chat"
                className="p-1.5 rounded-full text-[#4A5550] hover:bg-[#F8F7F4] cursor-pointer"
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
              onSubmit={handleSendBuddyMessage}
              className="pt-3 border-t border-[#141E19]/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={buddyDraft}
                onChange={(e) => setBuddyDraft(e.target.value)}
                placeholder="Type a message to your Peer Buddy..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#141E19]/15 text-xs sm:text-sm text-[#141E19]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141E19]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#141E19]/10 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] text-[#1B4332] flex items-center justify-center mx-auto">
              <Headphones className="w-7 h-7" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#065F46] bg-[#DCFCE7] px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Camera-Off &middot; Mic Muted by Default</span>
            </span>
            <h4 className="text-lg font-extrabold text-[#141E19]">{activeAudioRoomModal}</h4>
            <p className="text-xs sm:text-sm text-[#4A5550] leading-relaxed">
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
              className="w-full py-3 rounded-2xl bg-[#1B4332] text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              Got It — Back to Peer Space
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

import React, { useRef, useState } from 'react';
import {
  Home,
  CheckCircle2,
  Calendar,
  Activity,
  Wind,
  Users,
  PhoneCall,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from 'lucide-react';

export type NavSectionId =
  | 'home'
  | 'assessment'
  | 'counseling'
  | 'wellness-log'
  | 'cbt-studio'
  | 'peer-groups';

export interface SectionMeta {
  id: NavSectionId;
  stepNumber: string;
  label: string;
  shortLabel: string;
  shortTitle: string;
  href: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export const SEPARATE_SECTIONS: SectionMeta[] = [
  {
    id: 'home',
    stepNumber: '00',
    label: 'Home',
    shortLabel: 'Home',
    shortTitle: 'Campus Overview & Section Directory',
    href: '#home',
    description: 'Dashboard summary & quick access to all separate support sections',
    icon: Home,
  },
  {
    id: 'assessment',
    stepNumber: '01',
    label: '2-Min Check-In',
    shortLabel: 'Check-In',
    shortTitle: '2-Minute Mental Health Check-In (PHQ-9 & GAD-7)',
    href: '#assessment',
    description: 'Private mood & anxiety self-check with instant care recommendations',
    icon: CheckCircle2,
  },
  {
    id: 'counseling',
    stepNumber: '02',
    label: 'Book Counselor',
    shortLabel: 'Counselors',
    shortTitle: 'Book a Free Campus Counselor',
    href: '#counseling',
    description: '1-on-1 licensed campus psychologist directory & session scheduling',
    icon: Calendar,
  },
  {
    id: 'wellness-log',
    stepNumber: '03',
    label: 'Mood & Sleep',
    shortLabel: 'Mood',
    shortTitle: 'Daily Mood, Sleep & Wellness Insights',
    href: '#wellness-log',
    description: 'Interactive Recharts trends & daily sleep and exam stress tracker',
    icon: Activity,
  },
  {
    id: 'cbt-studio',
    stepNumber: '04',
    label: 'Calm Tools',
    shortLabel: 'Calm',
    shortTitle: '1-Minute Breathing Timer & Worry Journal',
    href: '#cbt-studio',
    description: 'Guided 4-7-8 & box breathing pacer plus CBT thought reframing',
    icon: Wind,
  },
  {
    id: 'peer-groups',
    stepNumber: '05',
    label: 'Peer Groups',
    shortLabel: 'Groups',
    shortTitle: 'Weekly Student Support Groups',
    href: '#peer-groups',
    description: 'Small, counselor-guided student circles with 1-click seat reservation',
    icon: Users,
  },
];

const SLIDE_X_CLASSES = [
  'translate-x-0',
  'translate-x-[100%]',
  'translate-x-[200%]',
  'translate-x-[300%]',
  'translate-x-[400%]',
  'translate-x-[500%]',
] as const;

interface TopBarProps {
  activeSection: NavSectionId;
  onSelectSection: (section: NavSectionId) => void;
  onOpenCrisisModal: () => void;
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
  activeAppointmentsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onSelectSection,
  onOpenCrisisModal,
  isSidebarExpanded,
  onToggleSidebar,
  activeAppointmentsCount = 1,
}) => {
  const [isPressingDock, setIsPressingDock] = useState(false);
  const dockGridRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = Math.max(
    0,
    SEPARATE_SECTIONS.findIndex((s) => s.id === activeSection)
  );
  const currentMeta = SEPARATE_SECTIONS[activeIndex] || SEPARATE_SECTIONS[0];
  const slideXClass = SLIDE_X_CLASSES[activeIndex] || 'translate-x-0';

  const handleSelect = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    id: NavSectionId
  ) => {
    e.preventDefault();
    onSelectSection(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectTabAtClientX = (clientX: number) => {
    if (!dockGridRef.current) return;
    const rect = dockGridRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    const idx = Math.min(
      SEPARATE_SECTIONS.length - 1,
      Math.max(0, Math.floor(ratio * SEPARATE_SECTIONS.length))
    );
    const targetSection = SEPARATE_SECTIONS[idx];
    if (targetSection && targetSection.id !== activeSection) {
      onSelectSection(targetSection.id);
    }
  };

  return (
    <>
      {/* Top App Bar (Transparent Frosted Glass Header) */}
      <header className="sticky top-0 z-40 bg-white/65 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_24px_-4px_rgba(20,30,25,0.06)]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
          {/* Left: Sidebar Rail Toggle + Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-expanded={isSidebarExpanded}
              aria-controls="app-navigation-rail"
              aria-label={isSidebarExpanded ? 'Collapse navigation sidebar' : 'Expand navigation sidebar'}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-[#141E19] bg-white/75 hover:bg-white border border-[#141E19]/12 transition-all cursor-pointer shadow-2xs backdrop-blur-xl"
            >
              {isSidebarExpanded ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
                  <span className="hidden sm:inline">Compact Bar</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
                  <span className="hidden sm:inline">Expand Menu</span>
                </>
              )}
            </button>

            <a
              href="#home"
              onClick={(e) => handleSelect(e, 'home')}
              className="text-lg font-bold tracking-tight text-[#141E19] whitespace-nowrap shrink-0"
            >
              Solace Campus
            </a>
          </div>

          {/* Center: Active Tab Indicator Pill */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/65 backdrop-blur-xl border border-white/90 shadow-2xs text-xs">
            <span className="w-2 h-2 rounded-full bg-[#1B4332]" aria-hidden="true" />
            <span className="font-semibold text-[#141E19]">{currentMeta.shortTitle}</span>
          </div>

          {/* Right: Confidential Status & 24/7 Urgent Help */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-[#4A5550]">
              <ShieldCheck className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
              <span>HIPAA & FERPA Private</span>
            </span>

            <button
              type="button"
              onClick={onOpenCrisisModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9E2A2B] hover:bg-[#7F1D1D] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
              <span>24/7 Urgent Help</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Transparent Liquid-Glass Bottom Pill Bar with Moving Toggle Bubble (Hidden on Computer/Desktop) */}
      <nav
        aria-label="Mobile Floating Liquid Glass Bottom Navigation"
        className="md:hidden fixed bottom-3 inset-x-3 z-40 pointer-events-none flex justify-center"
      >
        <div
          ref={dockGridRef}
          onPointerDown={(e) => {
            setIsPressingDock(true);
            selectTabAtClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (isPressingDock) {
              selectTabAtClientX(e.clientX);
            }
          }}
          onPointerUp={() => setIsPressingDock(false)}
          onPointerCancel={() => setIsPressingDock(false)}
          onPointerLeave={() => setIsPressingDock(false)}
          onTouchStart={(e) => {
            setIsPressingDock(true);
            if (e.touches[0]) {
              selectTabAtClientX(e.touches[0].clientX);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) {
              selectTabAtClientX(e.touches[0].clientX);
            }
          }}
          onTouchEnd={() => setIsPressingDock(false)}
          className="pointer-events-auto relative w-full max-w-[460px] rounded-full bg-white/55 backdrop-blur-2xl border border-white/85 shadow-[0_12px_36px_rgba(20,30,25,0.16),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] p-1.5 grid grid-cols-6 items-center select-none touch-none"
        >
          {/* Smoothly Moving Translucent Liquid-Glass Toggle Pill */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/6)] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${slideXClass}`}
          >
            <div
              className={`w-full h-full rounded-full transition-all duration-200 ${
                isPressingDock
                  ? 'scale-110 bg-white/75 backdrop-blur-2xl border border-white shadow-[0_6px_22px_rgba(20,30,25,0.18),inset_0_2px_3px_rgba(255,255,255,1)]'
                  : 'scale-100 bg-[#141E19]/[0.09] backdrop-blur-xl border border-white/90 shadow-[0_3px_12px_rgba(20,30,25,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)]'
              }`}
            />
          </div>

          {SEPARATE_SECTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const showBadge = item.id === 'counseling' && activeAppointmentsCount > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleSelect(e, item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative z-10 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-transform duration-200 cursor-pointer select-none"
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive
                        ? 'text-[#141E19] stroke-[2.5] scale-110'
                        : 'text-[#141E19]/75 stroke-[1.8]'
                    }`}
                    aria-hidden="true"
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-1 rounded-full bg-[#1B4332] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-2xs">
                      {activeAppointmentsCount}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-0.5 text-[10px] leading-tight whitespace-nowrap truncate max-w-full transition-all duration-200 ${
                    isActive
                      ? 'font-extrabold text-[#141E19]'
                      : 'font-medium text-[#141E19]/80'
                  }`}
                >
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};


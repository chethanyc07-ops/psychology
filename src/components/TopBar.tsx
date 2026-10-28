import React, { useRef, useState } from 'react';
import {
  Home,
  Smile,
  Calendar,
  Sun,
  Wind,
  Users,
  HeartHandshake,
  PanelLeftClose,
  PanelLeftOpen,
  Languages,
  Eye,
  Keyboard,
} from 'lucide-react';
import { useAppPreferences } from '../utils/i18nAndAccessibility';

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
  labelKn: string;
  shortLabel: string;
  shortLabelKn: string;
  shortTitle: string;
  shortTitleKn: string;
  href: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export const SEPARATE_SECTIONS: SectionMeta[] = [
  {
    id: 'home',
    stepNumber: '00',
    label: 'Home',
    labelKn: 'ಮುಖಪುಟ (Home)',
    shortLabel: 'Home',
    shortLabelKn: 'ಮುಖಪುಟ',
    shortTitle: 'Welcome & Campus Support Space',
    shortTitleKn: 'ಕ್ಯಾಂಪಸ್ ಬೆಂಬಲ ಮತ್ತು ಮುಖಪುಟ',
    href: '#home',
    description: 'Welcoming overview & quick access to calm tools and friendly support',
    icon: Home,
  },
  {
    id: 'assessment',
    stepNumber: '01',
    label: '2-Min Check-In',
    labelKn: '2-ನಿಮಿಷ ಮನಸ್ಸಿನ ನೋಟ',
    shortLabel: 'Check-In',
    shortLabelKn: 'ನೋಟ',
    shortTitle: '2-Minute Mind & Mood Check-In',
    shortTitleKn: '2-ನಿಮಿಷದ ಮನಸ್ಸು ಮತ್ತು ಭಾವನೆಗಳ ನೋಟ',
    href: '#assessment',
    description: 'Gentle, private reflection with supportive everyday tools',
    icon: Smile,
  },
  {
    id: 'counseling',
    stepNumber: '02',
    label: 'Campus Counselors',
    labelKn: 'ಆಪ್ತಸಮಾಲೋಚಕರು',
    shortLabel: 'Counselors',
    shortLabelKn: 'ಸಮಾಲೋಚನೆ',
    shortTitle: 'Meet a Friendly Campus Counselor',
    shortTitleKn: 'ಕ್ಯಾಂಪಸ್ ಆಪ್ತಸಮಾಲೋಚಕರನ್ನು ಭೇಟಿ ಮಾಡಿ',
    href: '#counseling',
    description: 'Free, welcoming 1-on-1 conversations in person or over video',
    icon: Calendar,
  },
  {
    id: 'wellness-log',
    stepNumber: '03',
    label: 'Mood & Sleep',
    labelKn: 'ಮನಸ್ಥಿತಿ ಮತ್ತು ನಿದ್ದೆ',
    shortLabel: 'Rest',
    shortLabelKn: 'ನಿದ್ದೆ',
    shortTitle: 'Daily Mood & Sleep Rhythm',
    shortTitleKn: 'ದೈನಂದಿನ ಮನಸ್ಥಿತಿ ಮತ್ತು ನಿದ್ದೆಯ ಅಭ್ಯಾಸ',
    href: '#wellness-log',
    description: 'Track your rest, energy, and daily balance across the week',
    icon: Sun,
  },
  {
    id: 'cbt-studio',
    stepNumber: '04',
    label: 'Calm Space',
    labelKn: 'ಶಾಂತ ತಾಣ',
    shortLabel: 'Calm',
    shortLabelKn: 'ಶಾಂತಿ',
    shortTitle: 'Guided Breathing & Quiet Reflection',
    shortTitleKn: 'ಉಸಿರಾಟದ ಅಭ್ಯಾಸ ಮತ್ತು ಮನಸ್ಸಿನ ಶಾಂತಿ',
    href: '#cbt-studio',
    description: 'Soothing breathing rhythms and gentle perspective shifts',
    icon: Wind,
  },
  {
    id: 'peer-groups',
    stepNumber: '05',
    label: 'Peer Community',
    labelKn: 'ಸಹಪಾಠಿ ಸಮುದಾಯ',
    shortLabel: 'Peers',
    shortLabelKn: 'ಸಮುದಾಯ',
    shortTitle: 'Anonymous Student Peer Circles',
    shortTitleKn: 'ಅನಾಮಧೇಯ ಕ್ಯಾಂಪಸ್ ಸಹಪಾಠಿ ಬೆಂಬಲ ವೇದಿಕೆ',
    href: '#peer-groups',
    description: 'Kind, moderated student circles & shared encouragement',
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
  const { language, toggleLanguage, a11y, toggleA11yOption, resetA11y } = useAppPreferences();
  const isKn = language === 'kn';

  const [isPressingDock, setIsPressingDock] = useState(false);
  const [isA11yMenuOpen, setIsA11yMenuOpen] = useState(false);
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

  const activeA11yCount = Object.values(a11y).filter(Boolean).length;

  return (
    <>
      {/* Skip to Main Content Link for Keyboard & Screen-Reader Users */}
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#0D9488] focus:text-white focus:text-xs focus:font-bold"
      >
        {isKn ? 'ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ತೆರಳಿ (Skip to Main Content)' : 'Skip to Main Content'}
      </a>

      {/* Top App Bar (Soft Blue, Teal & White Frosted Header) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-[#BAE6FD]/80 shadow-[0_4px_24px_-4px_rgba(15,41,66,0.06)]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3">
          {/* Left: Sidebar Rail Toggle + Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-expanded={isSidebarExpanded}
              aria-controls="app-navigation-rail"
              aria-label={
                isSidebarExpanded ? 'Collapse navigation sidebar' : 'Expand navigation sidebar'
              }
              className="inline-flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold text-[#0F2942] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] transition-all cursor-pointer shadow-2xs shrink-0"
            >
              {isSidebarExpanded ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                  <span className="hidden sm:inline">{isKn ? 'ಪಟ್ಟಿ ಕುಗ್ಗಿಸಿ' : 'Menu'}</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                  <span className="hidden sm:inline">{isKn ? 'ಮೆನು ಹಿಗ್ಗಿಸಿ' : 'Menu'}</span>
                </>
              )}
            </button>

            <a
              href="#home"
              onClick={(e) => handleSelect(e, 'home')}
              className="text-base sm:text-lg font-extrabold tracking-tight text-[#0F2942] whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#0D9488] to-[#38BDF8]" aria-hidden="true" />
              <span>{isKn ? 'ಸೊಲೇಸ್' : 'Solace Campus'}</span>
            </a>
          </div>

          {/* Center: Active Section Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD]/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true" />
            <span className="font-semibold text-[#0F2942]">
              {isKn ? currentMeta.shortTitleKn : currentMeta.shortTitle}
            </span>
          </div>

          {/* Right: Multilingual (EN / ಕನ್ನಡ), Accessibility Options & Prominent "Get Support" Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 relative">
            {/* Multilingual Switcher: English <-> ಕನ್ನಡ */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle Language between English and Kannada"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold text-[#0F2942] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] transition-colors cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
              <span className="hidden sm:inline">{isKn ? 'EN / ಕನ್ನಡ ✓' : 'EN ✓ / ಕನ್ನಡ'}</span>
              <span className="sm:hidden">{isKn ? 'EN' : 'ಕನ್ನಡ'}</span>
            </button>

            {/* Accessibility Options Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsA11yMenuOpen((prev) => !prev)}
                aria-expanded={isA11yMenuOpen}
                aria-label="Accessibility Options: Readable Fonts, Keyboard Navigation, Low Distraction"
                className={`inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  activeA11yCount > 0
                    ? 'bg-[#0D9488] text-white border-[#0D9488]'
                    : 'bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0F2942] border-[#BAE6FD]'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#0D9488] group-hover:text-[#0F766E]" aria-hidden="true" />
                <span className="hidden md:inline">
                  {isKn ? 'ಪ್ರವೇಶಸಾಧ್ಯತೆ' : 'Accessibility'}
                </span>
                {activeA11yCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-[#0D9488] text-[10px] font-mono">
                    {activeA11yCount}
                  </span>
                )}
              </button>

              {isA11yMenuOpen && (
                <div
                  role="dialog"
                  aria-label="Accessibility Preferences"
                  className="absolute right-0 mt-2 w-80 rounded-3xl bg-white border border-[#BAE6FD] shadow-xl p-4 z-50 space-y-3 text-left"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E0F2FE]">
                    <span className="text-xs font-bold text-[#0F2942]">
                      {isKn
                        ? 'ಪ್ರವೇಶಸಾಧ್ಯತೆ ಆಯ್ಕೆಗಳು (Accessibility)'
                        : 'Comfort & Accessibility Options'}
                    </span>
                    <button
                      type="button"
                      onClick={resetA11y}
                      className="text-[11px] font-semibold text-[#0D9488] hover:underline cursor-pointer"
                    >
                      {isKn ? 'ಮರುಹೊಂದಿಸಿ' : 'Reset'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleA11yOption('readableFont')}
                    aria-pressed={a11y.readableFont}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs cursor-pointer ${
                      a11y.readableFont
                        ? 'bg-[#F0FDFA] border-[#0D9488] font-bold text-[#0F2942]'
                        : 'bg-[#F0F9FF] border-[#BAE6FD]/60 text-[#0F2942]'
                    }`}
                  >
                    <div>
                      <div>{isKn ? 'ಓದಲು ಸುಲಭವಾದ ದೊಡ್ಡ ಅಕ್ಷರಗಳು (A+)' : 'Readable Font & Larger Text (A+)'}</div>
                      <div className="text-[10px] text-[#47627B]">
                        {isKn ? 'ಹೆಚ್ಚಿನ ಸಾಲಿನ ಅಂತರ ಮತ್ತು ಸ್ಪಷ್ಟ ಅಕ್ಷರ' : 'Generous line spacing & comfortable scale'}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#0D9488]">{a11y.readableFont ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleA11yOption('lowDistraction')}
                    aria-pressed={a11y.lowDistraction}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs cursor-pointer ${
                      a11y.lowDistraction
                        ? 'bg-[#F0FDFA] border-[#0D9488] font-bold text-[#0F2942]'
                        : 'bg-[#F0F9FF] border-[#BAE6FD]/60 text-[#0F2942]'
                    }`}
                  >
                    <div>
                      <div>{isKn ? 'ಕಡಿಮೆ ಗೊಂದಲದ ಇಂಟರ್ಫೇಸ್' : 'Low-Distraction Interface'}</div>
                      <div className="text-[10px] text-[#47627B]">
                        {isKn ? 'ಸರಳ ಹಿನ್ನೆಲೆ ಮತ್ತು ಶಾಂತ ವಿನ್ಯಾಸ' : 'Softens background gradients & motion'}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#0D9488]">{a11y.lowDistraction ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleA11yOption('highContrast')}
                    aria-pressed={a11y.highContrast}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs cursor-pointer ${
                      a11y.highContrast
                        ? 'bg-[#F0FDFA] border-[#0D9488] font-bold text-[#0F2942]'
                        : 'bg-[#F0F9FF] border-[#BAE6FD]/60 text-[#0F2942]'
                    }`}
                  >
                    <div>
                      <div>{isKn ? 'ಹೈ-ಕಾಂಟ್ರಾಸ್ಟ್ ಮೋಡ್' : 'Clear Borders & High Contrast'}</div>
                      <div className="text-[10px] text-[#47627B]">
                        {isKn ? 'ಗರಿಷ್ಠ ಸ್ಪಷ್ಟತೆಗಾಗಿ ದಪ್ಪಂಚುಗಳು' : 'Stronger visual boundaries & focus rings'}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#0D9488]">{a11y.highContrast ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleA11yOption('screenReaderAndKeyboard')}
                    aria-pressed={a11y.screenReaderAndKeyboard}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs cursor-pointer ${
                      a11y.screenReaderAndKeyboard
                        ? 'bg-[#F0FDFA] border-[#0D9488] font-bold text-[#0F2942]'
                        : 'bg-[#F0F9FF] border-[#BAE6FD]/60 text-[#0F2942]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1">
                        <Keyboard className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>{isKn ? 'ಕೀಬೋರ್ಡ್ ಮತ್ತು ಸ್ಕ್ರೀನ್ ರೀಡರ್ ಸಹಾಯ' : 'Keyboard Shortcuts & Screen Reader'}</span>
                      </div>
                      <div className="text-[10px] text-[#47627B]">
                        {isKn ? 'Alt + 1..6 ಶಾರ್ಟ್‌ಕಟ್ ಬ್ಯಾಡ್ಜ್‌ಗಳನ್ನು ತೋರಿಸಿ' : 'Displays Alt+1..6 keys & audio cues'}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#0D9488]">
                      {a11y.screenReaderAndKeyboard ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Prominent "Get Support" Button */}
            <button
              type="button"
              onClick={onOpenCrisisModal}
              data-testid="topbar-get-support-btn"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-[0_6px_20px_-3px_rgba(13,148,136,0.45)] hover:shadow-[0_8px_24px_-3px_rgba(2,132,199,0.55)]"
            >
              <HeartHandshake className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{isKn ? 'ಬೆಂಬಲ ಪಡೆಯಿರಿ' : 'Get Support'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Rounded Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-3 inset-x-2 z-40 pointer-events-none flex justify-center"
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
          className="pointer-events-auto relative w-full max-w-[490px] rounded-full bg-white/90 backdrop-blur-2xl border border-[#BAE6FD] shadow-[0_12px_36px_rgba(15,41,66,0.14),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] p-1.5 grid grid-cols-6 items-center select-none touch-none"
        >
          {/* Smoothly Moving Soft Teal/Blue Toggle Pill */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/6)] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${slideXClass}`}
          >
            <div
              className={`w-full h-full rounded-full transition-all duration-200 ${
                isPressingDock
                  ? 'scale-105 bg-[#E0F2FE] border border-[#7DD3FC] shadow-sm'
                  : 'scale-100 bg-[#F0FDFA] border border-[#99F6E4] shadow-2xs'
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
                className="relative z-10 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-full transition-transform duration-200 cursor-pointer select-none"
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-4 h-4 transition-all duration-200 ${
                      isActive
                        ? 'text-[#0D9488] stroke-[2.5] scale-110'
                        : 'text-[#47627B] stroke-[1.8]'
                    }`}
                    aria-hidden="true"
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-1 rounded-full bg-[#0D9488] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-2xs">
                      {activeAppointmentsCount}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-0.5 text-[9px] leading-tight whitespace-nowrap truncate max-w-full transition-all duration-200 ${
                    isActive
                      ? 'font-extrabold text-[#0F2942]'
                      : 'font-medium text-[#47627B]'
                  }`}
                >
                  {isKn ? item.shortLabelKn : item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

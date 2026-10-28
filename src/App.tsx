/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  HeartHandshake,
  X,
} from 'lucide-react';
import { TopBar, NavSectionId, SEPARATE_SECTIONS } from './components/TopBar';
import { HeroSection } from './components/HeroSection';
import { AssessmentModule } from './components/AssessmentModule';
import { CounselorDirectory } from './components/CounselorDirectory';
import { WellnessTracker } from './components/WellnessTracker';
import { CbtAndGroundingStudio } from './components/CbtAndGroundingStudio';
import { PeerSupportAndProof } from './components/PeerSupportAndProof';
import { FooterAudioPlayer } from './components/FooterAudioPlayer';
import { CrisisModal } from './components/CrisisModal';
import {
  INITIAL_COUNSELORS,
  INITIAL_APPOINTMENTS,
  ScheduledAppointment,
} from './utils/seedData';
import {
  AppPreferencesProvider,
  useAppPreferences,
} from './utils/i18nAndAccessibility';

const STORAGE_KEY_APPOINTMENTS = 'solace_appointments_v1';

function AppShell() {
  const { language, a11y, announceToScreenReader } = useAppPreferences();
  const isKn = language === 'kn';

  const [activeSection, setActiveSection] = useState<NavSectionId>('home');
  const [transitionDirection, setTransitionDirection] = useState<number>(1);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);

  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('All Specialties');
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
    } catch {
      // Ignore storage errors
    }
  }, [appointments]);

  // Apply low-distraction class to document.body when toggled
  useEffect(() => {
    if (a11y.lowDistraction) {
      document.body.classList.add('a11y-low-distraction');
    } else {
      document.body.classList.remove('a11y-low-distraction');
    }
  }, [a11y.lowDistraction]);

  const handleBookAppointment = (newAppointment: ScheduledAppointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' } : apt))
    );
  };

  const activeAppointmentsCount = appointments.filter((a) => a.status === 'Confirmed').length;

  const handleSelectSection = (section: NavSectionId) => {
    const currentIdx = SEPARATE_SECTIONS.findIndex((s) => s.id === activeSection);
    const nextIdx = SEPARATE_SECTIONS.findIndex((s) => s.id === section);
    if (currentIdx !== -1 && nextIdx !== -1 && currentIdx !== nextIdx) {
      setTransitionDirection(nextIdx > currentIdx ? 1 : -1);
    }
    setActiveSection(section);
    setIsMobileDrawerOpen(false);
    const targetMeta = SEPARATE_SECTIONS[nextIdx];
    if (targetMeta) {
      announceToScreenReader(
        isKn ? `ವಿಭಾಗ ತೆರೆಯಲಾಗಿದೆ: ${targetMeta.labelKn}` : `Navigated to ${targetMeta.label}`
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard Navigation Shortcuts (Alt + 1..6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key >= '1' && e.key <= '6') {
        const idx = Number(e.key) - 1;
        const target = SEPARATE_SECTIONS[idx];
        if (target) {
          e.preventDefault();
          handleSelectSection(target.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, isKn]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileDrawerOpen((prev) => !prev);
    } else {
      setIsSidebarExpanded((prev) => !prev);
    }
  };

  const activeIndex = Math.max(
    0,
    SEPARATE_SECTIONS.findIndex((s) => s.id === activeSection)
  );
  const slideYClasses = [
    'translate-y-0',
    'translate-y-[100%]',
    'translate-y-[200%]',
    'translate-y-[300%]',
    'translate-y-[400%]',
    'translate-y-[500%]',
  ] as const;
  const slideYClass = slideYClasses[activeIndex] || 'translate-y-0';

  const a11yWrapperClasses = [
    a11y.readableFont ? 'a11y-readable-font' : '',
    a11y.highContrast ? 'a11y-high-contrast' : '',
    a11y.lowDistraction ? 'a11y-low-distraction' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`min-h-screen flex flex-col bg-transparent text-[#0F2942] pb-24 md:pb-0 ${a11yWrapperClasses}`}
    >
      <TopBar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
        isSidebarExpanded={isSidebarExpanded}
        onToggleSidebar={handleToggleSidebar}
        activeAppointmentsCount={activeAppointmentsCount}
      />

      {/* Mobile Slide-Over Drawer (Soft Blue, Teal & White Sheet) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F2942]/30 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white/95 backdrop-blur-2xl h-full border-r border-[#BAE6FD] p-5 flex flex-col justify-between shadow-[0_16px_48px_rgba(15,41,66,0.18)]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E0F2FE]">
                <span className="text-base font-extrabold text-[#0F2942]">
                  {isKn ? 'ಸೊಲೇಸ್ ಕ್ಯಾಂಪಸ್' : 'Solace Campus'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close mobile menu"
                  className="p-1.5 rounded-full text-[#47627B] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative grid grid-rows-6 p-1.5 rounded-3xl bg-[#F0F9FF] border border-[#BAE6FD]/80">
                {/* Smoothly Moving Vertical Soft Teal Pill Indicator */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1.5 right-1.5 top-1.5 h-[calc((100%-12px)/6)] rounded-2xl bg-white border border-[#99F6E4] shadow-[0_4px_14px_rgba(13,148,136,0.08)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${slideYClass}`}
                />

                {SEPARATE_SECTIONS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSection(item.id)}
                      className={`relative z-10 w-full flex items-center gap-3.5 px-3.5 py-2 rounded-2xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'text-[#0F2942] font-extrabold'
                          : 'text-[#47627B] hover:text-[#0F2942] font-medium'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? 'text-[#0D9488] stroke-[2.4] scale-110'
                            : 'text-[#0284C7] stroke-[1.8]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs leading-tight truncate">
                          {isKn ? item.labelKn : item.label}
                        </div>
                        <div className="text-[10px] truncate mt-0.5 text-[#47627B]">
                          {isKn ? item.shortTitleKn : item.shortTitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMobileDrawerOpen(false);
                setIsCrisisModalOpen(true);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0284C7] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{isKn ? 'ಬೆಂಬಲ ಪಡೆಯಿರಿ (Get Support)' : 'Get Support (24/7 Care)'}</span>
            </button>
          </aside>
        </div>
      )}

      {/* App Shell: Left Collapsible Navigation Rail (Desktop Only) + Main Stage */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Collapsible Navigation Rail with Soft Blue, Teal & White Rounded Design */}
        <aside
          id="app-navigation-rail"
          aria-label="Primary Campus Support Navigation Rail"
          className={`hidden md:flex flex-col justify-between shrink-0 sticky top-[61px] h-[calc(100vh-61px)] bg-white/80 backdrop-blur-2xl border-r border-[#BAE6FD]/80 transition-all duration-300 px-3 py-4 ${
            isSidebarExpanded ? 'w-64' : 'w-[82px]'
          }`}
        >
          <div className="relative grid grid-rows-6 p-1.5 rounded-3xl bg-[#F0F9FF]/90 border border-[#BAE6FD]/80 shadow-[0_8px_24px_rgba(15,41,66,0.04)]">
            {/* Smoothly Moving Vertical Toggle Pill */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-1.5 right-1.5 top-1.5 h-[calc((100%-12px)/6)] rounded-2xl bg-white border border-[#99F6E4] shadow-[0_4px_14px_rgba(13,148,136,0.08)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${slideYClass}`}
            />

            {SEPARATE_SECTIONS.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSection(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={!isSidebarExpanded ? `${item.label} — ${item.shortTitle}` : undefined}
                  className={`group relative z-10 w-full flex items-center gap-3.5 rounded-2xl transition-all cursor-pointer ${
                    isSidebarExpanded ? 'px-3.5 py-2.5 text-left' : 'p-2.5 justify-center'
                  } ${
                    isActive
                      ? 'text-[#0F2942] font-extrabold'
                      : 'text-[#47627B] hover:text-[#0F2942]'
                  }`}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <Icon
                      className={`w-5 h-5 transition-all duration-200 group-hover:scale-105 ${
                        isActive
                          ? 'text-[#0D9488] stroke-[2.4] scale-110'
                          : 'text-[#0284C7] stroke-[1.8]'
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  {isSidebarExpanded && (
                    <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
                      <div className="text-xs leading-snug truncate">
                        {isKn ? item.labelKn : item.label}
                      </div>
                      {a11y.screenReaderAndKeyboard && (
                        <kbd className="px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[9px] font-mono text-[#0284C7] shrink-0">
                          Alt+{index + 1}
                        </kbd>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Rail Footer: Collapse/Expand Toggle */}
          <div className="pt-3 border-t border-[#E0F2FE] space-y-2">
            <button
              type="button"
              onClick={() => setIsSidebarExpanded((prev) => !prev)}
              aria-label={isSidebarExpanded ? 'Switch to icon-only rail' : 'Expand sidebar labels'}
              className={`w-full flex items-center gap-3 rounded-2xl py-2.5 px-3 text-xs font-semibold text-[#0F2942] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] transition-all cursor-pointer ${
                isSidebarExpanded ? 'justify-start' : 'justify-center'
              }`}
            >
              {isSidebarExpanded ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#0D9488] shrink-0" aria-hidden="true" />
                  <span className="truncate">{isKn ? 'ಐಕಾನ್ ಮಾತ್ರ ತೋರಿಸಿ' : 'Compact Sidebar'}</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#0D9488] shrink-0" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Separate Section Workspace */}
        <main id="main-workspace" className="flex-1 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait" custom={transitionDirection} initial={false}>
            <motion.div
              key={activeSection}
              custom={transitionDirection}
              variants={{
                enter: (dir: number) => ({
                  opacity: 0,
                  y: 16,
                  x: dir * 24,
                  scale: 0.985,
                  filter: 'blur(6px)',
                }),
                center: {
                  opacity: 1,
                  y: 0,
                  x: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                },
                exit: (dir: number) => ({
                  opacity: 0,
                  y: -12,
                  x: dir * -24,
                  scale: 0.985,
                  filter: 'blur(6px)',
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: a11y.lowDistraction ? 0.05 : 0.34,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full min-h-[calc(100vh-140px)]"
            >
              {activeSection === 'home' && (
                <HeroSection
                  onSelectSection={handleSelectSection}
                  onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
                />
              )}
              {activeSection === 'assessment' && (
                <AssessmentModule
                  onSelectSection={handleSelectSection}
                  onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
                />
              )}
              {activeSection === 'counseling' && (
                <CounselorDirectory
                  counselors={INITIAL_COUNSELORS}
                  selectedSpecialtyFilter={selectedSpecialtyFilter}
                  onChangeSpecialtyFilter={setSelectedSpecialtyFilter}
                  appointments={appointments}
                  onBookAppointment={handleBookAppointment}
                  onCancelAppointment={handleCancelAppointment}
                />
              )}
              {activeSection === 'wellness-log' && (
                <WellnessTracker
                  onSelectSection={handleSelectSection}
                  onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
                />
              )}
              {activeSection === 'cbt-studio' && (
                <CbtAndGroundingStudio
                  onSelectSection={handleSelectSection}
                  onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
                />
              )}
              {activeSection === 'peer-groups' && (
                <PeerSupportAndProof
                  onSelectSection={handleSelectSection}
                  onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Footer Web Audio Player (Rain on a Window, Brown Noise, Soft Lo-Fi) */}
      <FooterAudioPlayer />

      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        onBookCounselor={() => {
          setIsCrisisModalOpen(false);
          handleSelectSection('counseling');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppPreferencesProvider>
      <AppShell />
    </AppPreferencesProvider>
  );
}

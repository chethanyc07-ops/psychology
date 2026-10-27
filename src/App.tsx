/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PhoneCall,
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

const STORAGE_KEY_APPOINTMENTS = 'solace_appointments_v1';

export default function App() {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#141E19] pb-24 md:pb-0">
      <TopBar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
        isSidebarExpanded={isSidebarExpanded}
        onToggleSidebar={handleToggleSidebar}
        activeAppointmentsCount={activeAppointmentsCount}
      />

      {/* Mobile Slide-Over Drawer (Transparent Liquid-Glass Sheet with Moving Toggle Pill) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#141E19]/25 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white/60 backdrop-blur-2xl h-full border-r border-white/85 p-5 flex flex-col justify-between shadow-[0_16px_48px_rgba(20,30,25,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#141E19]/10">
                <span className="text-base font-bold text-[#141E19]">Solace Campus</span>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close mobile menu"
                  className="p-1.5 rounded-full text-[#4A5550] bg-white/60 hover:bg-white border border-white/80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative grid grid-rows-6 p-1.5 rounded-3xl bg-white/45 backdrop-blur-xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                {/* Smoothly Moving Vertical Liquid-Glass Pill Indicator */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1.5 right-1.5 top-1.5 h-[calc((100%-12px)/6)] rounded-2xl bg-[#141E19]/[0.09] backdrop-blur-xl border border-white/95 shadow-[0_4px_14px_rgba(20,30,25,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${slideYClass}`}
                />

                {SEPARATE_SECTIONS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSection(item.id)}
                      className={`relative z-10 w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'text-[#141E19] font-extrabold'
                          : 'text-[#141E19]/80 hover:text-[#141E19] font-medium'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? 'text-[#1B4332] stroke-[2.4] scale-110'
                            : 'text-[#1B4332]/80 stroke-[1.8]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs leading-tight truncate">{item.label}</div>
                        <div className="text-[10px] truncate mt-0.5 text-[#4A5550]">
                          {item.shortTitle}
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
              className="w-full py-2.5 px-4 rounded-full bg-[#9E2A2B] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>24/7 Urgent Crisis Line (988)</span>
            </button>
          </aside>
        </div>
      )}

      {/* App Shell: Left Collapsible Navigation Rail (Desktop Only) + Main Stage */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Collapsible Navigation Rail with Transparent Glass & Moving Toggle Pill */}
        <aside
          id="app-navigation-rail"
          aria-label="Instagram and WhatsApp Style Collapsible Sidebar Rail"
          className={`hidden md:flex flex-col justify-between shrink-0 sticky top-[61px] h-[calc(100vh-61px)] bg-white/50 backdrop-blur-2xl border-r border-white/85 transition-all duration-300 px-3 py-4 ${
            isSidebarExpanded ? 'w-64' : 'w-[82px]'
          }`}
        >
          <div className="relative grid grid-rows-6 p-1.5 rounded-3xl bg-white/45 backdrop-blur-xl border border-white/80 shadow-[0_8px_24px_rgba(20,30,25,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)]">
            {/* Smoothly Moving Vertical Liquid-Glass Toggle Pill */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-1.5 right-1.5 top-1.5 h-[calc((100%-12px)/6)] rounded-2xl bg-[#141E19]/[0.09] backdrop-blur-xl border border-white/95 shadow-[0_4px_14px_rgba(20,30,25,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${slideYClass}`}
            />

            {SEPARATE_SECTIONS.map((item) => {
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
                      ? 'text-[#141E19] font-extrabold'
                      : 'text-[#141E19]/75 hover:text-[#141E19]'
                  }`}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <Icon
                      className={`w-5 h-5 transition-all duration-200 group-hover:scale-105 ${
                        isActive
                          ? 'text-[#1B4332] stroke-[2.4] scale-110'
                          : 'text-[#1B4332]/80 stroke-[1.8]'
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  {isSidebarExpanded && (
                    <div className="min-w-0 flex-1">
                      <div className="text-xs leading-snug truncate">{item.label}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Rail Footer: Collapse/Expand Toggle */}
          <div className="pt-3 border-t border-[#141E19]/10 space-y-2">
            <button
              type="button"
              onClick={() => setIsSidebarExpanded((prev) => !prev)}
              aria-label={isSidebarExpanded ? 'Switch to icon-only rail' : 'Expand sidebar labels'}
              className={`w-full flex items-center gap-3 rounded-full py-2.5 px-3 text-xs font-semibold text-[#141E19] bg-white/55 hover:bg-white/85 border border-white/85 shadow-2xs transition-all cursor-pointer ${
                isSidebarExpanded ? 'justify-start' : 'justify-center'
              }`}
            >
              {isSidebarExpanded ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#1B4332] shrink-0" aria-hidden="true" />
                  <span className="truncate">Icon-Only Rail</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#1B4332] shrink-0" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Separate Section Workspace with Liquid AnimatePresence Transitions */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
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
                duration: 0.34,
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

      <CrisisModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div>
  );
}

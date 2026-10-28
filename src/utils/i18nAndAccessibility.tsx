import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'kn';

export interface AccessibilitySettings {
  readableFont: boolean; // Larger, high-legibility font & generous line spacing
  lowDistraction: boolean; // Simplified, low-visual-noise interface
  highContrast: boolean; // Enhanced border & text contrast
  screenReaderAndKeyboard: boolean; // Keyboard shortcut hints & ARIA live announcements
}

interface AppPreferencesContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  a11y: AccessibilitySettings;
  toggleA11yOption: (key: keyof AccessibilitySettings) => void;
  resetA11y: () => void;
  announceToScreenReader: (message: string) => void;
  srAnnouncement: string;
}

const STORAGE_KEY_PREFS = 'solace_campus_prefs_v1';

const DEFAULT_A11Y: AccessibilitySettings = {
  readableFont: false,
  lowDistraction: false,
  highContrast: false,
  screenReaderAndKeyboard: false,
};

const AppPreferencesContext = createContext<AppPreferencesContextValue>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  a11y: DEFAULT_A11Y,
  toggleA11yOption: () => {},
  resetA11y: () => {},
  announceToScreenReader: () => {},
  srAnnouncement: '',
});

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language === 'kn' || parsed.language === 'en') {
          return parsed.language;
        }
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const [a11y, setA11y] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.a11y) {
          return { ...DEFAULT_A11Y, ...parsed.a11y };
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_A11Y;
  });

  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify({ language, a11y }));
    } catch {
      // ignore
    }
    document.documentElement.lang = language === 'kn' ? 'kn' : 'en';
  }, [language, a11y]);

  const announceToScreenReader = (message: string) => {
    setSrAnnouncement(message);
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    announceToScreenReader(
      lang === 'kn'
        ? 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ (Language switched to Kannada)'
        : 'Language switched to English'
    );
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  const toggleA11yOption = (key: keyof AccessibilitySettings) => {
    setA11y((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      announceToScreenReader(`${key} ${next[key] ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  const resetA11y = () => {
    setA11y(DEFAULT_A11Y);
    announceToScreenReader('Accessibility settings reset to default');
  };

  return (
    <AppPreferencesContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        a11y,
        toggleA11yOption,
        resetA11y,
        announceToScreenReader,
        srAnnouncement,
      }}
    >
      {/* Screen-Reader Polite Live Region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>
      {children}
    </AppPreferencesContext.Provider>
  );
};

export const useAppPreferences = () => useContext(AppPreferencesContext);

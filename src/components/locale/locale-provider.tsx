"use client";

import * as React from "react";

type Locale = "en" | "ar";

interface LocaleContextValue {
  locale: Locale;
  direction: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = React.createContext<LocaleContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "glp-locale";

function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function LocaleProvider({
  children,
  defaultLocale = "en",
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(defaultLocale);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? (window.localStorage.getItem(STORAGE_KEY) as Locale | null) : null;
    if (stored === "en" || stored === "ar") {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const dir = getDirection(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale, mounted]);

  const setLocale = React.useCallback((value: Locale) => {
    setLocaleState(value);
  }, []);

  const toggleLocale = React.useCallback(() => {
    setLocaleState((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const value = React.useMemo(
    () => ({
      locale,
      direction: getDirection(locale),
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = React.useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

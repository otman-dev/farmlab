"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Locale = "en" | "fr" | "ar";
const DEFAULT_LOCALE: Locale = "en";

type I18nContextValue = {
  t: (k: string) => string;
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nContextValue>({
  t: (k) => k,
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    // Order of precedence: query param ?lang= -> localStorage -> default
    try {
      const qp = new URLSearchParams(window.location.search).get("lang") as Locale | null;
      const stored = (localStorage.getItem("app.locale") as Locale | null) || null;
      const chosen = (qp || stored || DEFAULT_LOCALE) as Locale;
      setLocale(chosen);
    } catch (e) {
      setLocale(DEFAULT_LOCALE);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const mod = await import(`../locales/${locale}.json`);
        if (!active) return;
        setMessages(mod.default || mod);
        // set document attributes for lang and direction
        try {
          document.documentElement.lang = locale;
          document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
        } catch (e) {
          // ignore when running in test env without DOM
        }
        localStorage.setItem("app.locale", locale);
      } catch (err) {
        console.error("Failed to load locale", locale, err);
      }
    })();
    return () => {
      active = false;
    };
  }, [locale]);

  const t = (key: string) => {
    if (!messages) return key;
    return messages[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

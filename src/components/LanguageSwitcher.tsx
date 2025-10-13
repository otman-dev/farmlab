"use client";

import React from "react";
import { useI18n } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const l = e.target.value as "en" | "fr" | "ar";
    setLocale(l);
    // Mirror choice into the URL so E2E tests / manual refreshes are deterministic
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", l);
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      // ignore in non-browser environments
    }
  };

  // Flag emojis for each language
  const flags: Record<string, string> = {
    en: "🇬🇧",
    fr: "🇫🇷",
    ar: "🇲🇦",
  };

  // Dropdown design with flags, branding, and compact style
  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ar", label: "العربية", flag: "🇲🇦" }
  ];

  return (
    <div className="inline-flex items-center bg-white border border-gray-200 rounded-full px-2 py-1 shadow-md">
      <span className="text-lg mr-2" aria-hidden="true">{languages.find(l => l.code === locale)?.flag}</span>
      <select
        id="lang-select"
        value={locale}
        onChange={handleChange}
        className="text-sm bg-transparent focus:outline-none text-black font-bold cursor-pointer appearance-none pr-6"
        aria-label="Select language"
        style={{
          backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          backgroundSize: "1em",
          minWidth: 80
        }}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

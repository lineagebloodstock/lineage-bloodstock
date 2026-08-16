"use client";

import { useEffect, useState } from "react";

const VALID_LANGUAGES = ["es", "pt", "en"];

export function useLineageLanguage() {
  const [language, setLanguageState] = useState("es");

  useEffect(() => {
    const saved = window.localStorage.getItem("lineage_language");

    if (VALID_LANGUAGES.includes(saved)) {
      setLanguageState(saved);
    }

    function handleLanguageChange(event) {
      const nextLanguage = event.detail;

      if (VALID_LANGUAGES.includes(nextLanguage)) {
        setLanguageState(nextLanguage);
      }
    }

    function handleStorageChange() {
      const stored = window.localStorage.getItem("lineage_language");

      if (VALID_LANGUAGES.includes(stored)) {
        setLanguageState(stored);
      }
    }

    window.addEventListener("lineage-language-change", handleLanguageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "lineage-language-change",
        handleLanguageChange
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function setLanguage(nextLanguage) {
    if (!VALID_LANGUAGES.includes(nextLanguage)) return;

    setLanguageState(nextLanguage);
    window.localStorage.setItem("lineage_language", nextLanguage);

    window.dispatchEvent(
      new CustomEvent("lineage-language-change", {
        detail: nextLanguage,
      })
    );
  }

  return { language, setLanguage };
}
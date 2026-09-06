import React, { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";
import { defaultStrings, hindiStrings } from "../i18n/strings";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(
    localStorage.getItem("appLanguage") || "English"
  );
  const [strings, setStrings] = useState(defaultStrings);
  const [loading, setLoading] = useState(false);

  const applyLanguage = async (langName) => {
    setLanguageState(langName);
    localStorage.setItem("appLanguage", langName);

    if (langName.trim().toLowerCase() === "hindi" || langName.trim().toLowerCase() === "hi") {
      setStrings({ ...defaultStrings, ...hindiStrings });
      return;
    }

    setStrings(defaultStrings);
  };

  useEffect(() => {
    if (language && language.trim().toLowerCase() !== "english") {
      applyLanguage(language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = (key) => strings[key] || defaultStrings[key] || key;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: applyLanguage, t, loading }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
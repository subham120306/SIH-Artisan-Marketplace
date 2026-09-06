import React from "react";
import { useLanguage } from "../context/LanguageContext";

const LANGUAGES = ["English", "Hindi"];

const LanguageSwitcher = () => {
  const { language, setLanguage, loading } = useLanguage();

  const handleSelect = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <select
        value={language}
        onChange={handleSelect}
        style={{
          padding: "6px 12px",
          borderRadius: "8px",
          border: "1px solid #d9cbaf",
          background: "#ffffff",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          color: "#2b251e",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang === "English" ? "🇬🇧 English" : "🇮🇳 Hindi (हिंदी)"}
          </option>
        ))}
      </select>

      {loading && <span style={{ fontSize: 11, color: "#b45309", fontWeight: 600 }}>Translating...</span>}
    </div>
  );
};

export default LanguageSwitcher;
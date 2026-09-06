import React, { useState } from "react";
import "./AIPricePredictor.css";
import { useLanguage } from "../context/LanguageContext";

const ART_TYPES = [
  "Oil painting",
  "Acrylic painting",
  "Watercolor painting",
  "Pastel art",
  "Finger painting",
  "Graphite sketching",
  "Charcoal drawing",
  "Zentangle art",
  "Hand-carved sculpture",
  "Clay pottery",
  "Hand embroidery",
  "Handloom weaving",
  "Madhubani painting",
  "Warli art",
  "Gond art"
];

const AGE_OPTIONS = [
  { value: "new", labelEn: "Newly Crafted (0 - 6 Months)", labelHi: "नवीनतम निर्मित (0 - 6 महीने)", multiplier: 1.0 },
  { value: "medium", labelEn: "Aged Craft (1 - 3 Years)", labelHi: "विंटेज कला (1 - 3 वर्ष)", multiplier: 1.25 },
  { value: "vintage", labelEn: "Heritage Vintage (5+ Years)", labelHi: "विरासत धरोहर (5+ वर्ष)", multiplier: 1.6 },
  { value: "heirloom", labelEn: "Master Heirloom (10+ Years)", labelHi: "मास्टर हेरिटेज (10+ वर्ष)", multiplier: 2.2 }
];

const SIZE_OPTIONS = [
  { value: "small", labelEn: "Small (up to 12\" x 12\")", labelHi: "छोटा (12\" x 12\" तक)", multiplier: 1.0 },
  { value: "medium", labelEn: "Medium (18\" x 24\")", labelHi: "मध्यम (18\" x 24\")", multiplier: 1.85 },
  { value: "large", labelEn: "Large (36\" x 48\")", labelHi: "बड़ा (36\" x 48\")", multiplier: 3.2 },
  { value: "monumental", labelEn: "Monumental / Grand (60\"+)", labelHi: "विशाल / भव्य (60\"+)", multiplier: 5.5 }
];

const AIPricePredictor = ({ onApplyPrice }) => {
  const { language } = useLanguage();
  const [artType, setArtType] = useState(ART_TYPES[0]);
  const [artAge, setArtAge] = useState(AGE_OPTIONS[0].value);
  const [artSize, setArtSize] = useState(SIZE_OPTIONS[1].value);
  const [intricacy, setIntricacy] = useState("high"); // standard | high | masterwork
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculatePrice = () => {
    setLoading(true);

    setTimeout(() => {
      // Base price matrix by art type
      const basePrices = {
        "Oil painting": 2400,
        "Acrylic painting": 2100,
        "Watercolor painting": 1800,
        "Pastel art": 1500,
        "Finger painting": 1200,
        "Graphite sketching": 1400,
        "Charcoal drawing": 1600,
        "Zentangle art": 1300,
        "Hand-carved sculpture": 3500,
        "Clay pottery": 1900,
        "Hand embroidery": 2200,
        "Handloom weaving": 3200,
        "Madhubani painting": 2800,
        "Warli art": 2000,
        "Gond art": 2500
      };

      const base = basePrices[artType] || 2000;
      const ageObj = AGE_OPTIONS.find((a) => a.value === artAge) || AGE_OPTIONS[0];
      const sizeObj = SIZE_OPTIONS.find((s) => s.value === artSize) || SIZE_OPTIONS[1];

      let intricacyMult = 1.0;
      if (intricacy === "high") intricacyMult = 1.3;
      if (intricacy === "masterwork") intricacyMult = 1.75;

      const rawEstimatedPrice = base * sizeObj.multiplier * ageObj.multiplier * intricacyMult;
      const roundedRecommended = Math.round(rawEstimatedPrice / 50) * 50;
      const minRange = Math.round((roundedRecommended * 0.85) / 50) * 50;
      const maxRange = Math.round((roundedRecommended * 1.2) / 50) * 50;

      const materialLabor = Math.round(roundedRecommended * 0.55);
      const heritageValue = Math.round(roundedRecommended * 0.28);
      const marketDemand = roundedRecommended - materialLabor - heritageValue;

      setPrediction({
        recommendedPrice: roundedRecommended,
        minPrice: minRange,
        maxPrice: maxRange,
        materialLabor,
        heritageValue,
        marketDemand,
        demandScore: Math.min(98, Math.round(75 + Math.random() * 20))
      });

      setLoading(false);
    }, 450);
  };

  return (
    <div className="ai-price-predictor-card">
      <div className="predictor-header">
        <div className="predictor-title-box">
          <span className="predictor-badge">🤖 AI Valuation Engine</span>
          <h3>{language === "hi" ? "AI मूल्य भविष्यवक्ता (मूल्य निर्धारण)" : "AI Craft Price Predictor"}</h3>
          <p>{language === "hi" ? "अपनी कला के प्रकार, आयु और आकार के आधार पर सर्वोत्तम बाजार मूल्य जानें।" : "Predict optimal marketplace pricing using Art Type, Heritage Age, and Size."}</p>
        </div>
      </div>

      <div className="predictor-form-grid">
        {/* Art Type */}
        <div className="predictor-field">
          <label>🎨 {language === "hi" ? "कला का प्रकार (Art Type)" : "Art Type"}</label>
          <select value={artType} onChange={(e) => setArtType(e.target.value)} className="predictor-select">
            {ART_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Heritage Age */}
        <div className="predictor-field">
          <label>⏳ {language === "hi" ? "कला की आयु / अनुभव (Art Age)" : "Art / Craft Age"}</label>
          <select value={artAge} onChange={(e) => setArtAge(e.target.value)} className="predictor-select">
            {AGE_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {language === "hi" ? a.labelHi : a.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Size */}
        <div className="predictor-field">
          <label>📐 {language === "hi" ? "आकार (Artwork Size)" : "Artwork Size"}</label>
          <select value={artSize} onChange={(e) => setArtSize(e.target.value)} className="predictor-select">
            {SIZE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {language === "hi" ? s.labelHi : s.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Intricacy */}
        <div className="predictor-field">
          <label>✨ {language === "hi" ? "कारीगरी का स्तर (Intricacy)" : "Craftsmanship Level"}</label>
          <select value={intricacy} onChange={(e) => setIntricacy(e.target.value)} className="predictor-select">
            <option value="standard">{language === "hi" ? "मानक हस्तशिल्प (Standard)" : "Standard Handcraft"}</option>
            <option value="high">{language === "hi" ? "बारीक कारीगरी (Fine Detail)" : "Fine Intricate Detail"}</option>
            <option value="masterwork">{language === "hi" ? "मास्टरवर्क कृति (Masterpiece)" : "Masterpiece Work"}</option>
          </select>
        </div>
      </div>

      <button type="button" className="calculate-price-btn" onClick={calculatePrice} disabled={loading}>
        {loading ? (
          <span>Analyzing Market Signals...</span>
        ) : (
          <span>⚡ {language === "hi" ? "AI मूल्य का अनुमान लगाएं" : "Calculate AI Fair Price"}</span>
        )}
      </button>

      {/* Prediction Output Results */}
      {prediction && (
        <div className="prediction-results-box">
          <div className="recommended-price-card">
            <div className="price-tag-label">{language === "hi" ? "अनुशंसित सूची मूल्य" : "Recommended Listing Price"}</div>
            <div className="recommended-amount">₹{prediction.recommendedPrice.toLocaleString("en-IN")}</div>
            <div className="price-range">
              {language === "hi" ? "उचित बाजार सीमा: " : "Fair Market Range: "}
              <strong>₹{prediction.minPrice.toLocaleString("en-IN")} – ₹{prediction.maxPrice.toLocaleString("en-IN")}</strong>
            </div>
            <span className="demand-chip">🔥 {prediction.demandScore}% Buyer Demand Rating</span>
          </div>

          <div className="price-breakdown-grid">
            <div className="breakdown-item">
              <span className="breakdown-label">🎨 Material & Labor</span>
              <span className="breakdown-value">₹{prediction.materialLabor.toLocaleString("en-IN")}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">⏳ Heritage & Art Age</span>
              <span className="breakdown-value">+₹{prediction.heritageValue.toLocaleString("en-IN")}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">📈 Market Demand</span>
              <span className="breakdown-value">+₹{prediction.marketDemand.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {onApplyPrice && (
            <button
              type="button"
              className="apply-predicted-price-btn"
              onClick={() => onApplyPrice(prediction.recommendedPrice)}
            >
              ✓ {language === "hi" ? `इस मूल्य (₹${prediction.recommendedPrice.toLocaleString("en-IN")}) को लागू करें` : `Apply Price (₹${prediction.recommendedPrice.toLocaleString("en-IN")}) to Listing`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPricePredictor;

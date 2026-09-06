import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const Sidebar = ({ onSearchChange, onCategorySelect, selectedCategory }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported on this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      if (text) {
        setSearchTerm(text);
        if (onSearchChange) onSearchChange(text);
      }
    };

    recognition.start();
  };

  const categories = [
    { name: "Oil painting", count: 12 },
    { name: "Acrylic painting", count: 15 },
    { name: "Watercolor painting", count: 10 },
    { name: "Pastel art", count: 8 },
    { name: "Finger painting", count: 5 },
    { name: "Graphite sketching", count: 14 },
    { name: "Charcoal drawing", count: 11 },
    { name: "Zentangle art", count: 9 },
    { name: "Hand-carved sculpture", count: 16 },
    { name: "Clay pottery", count: 18 },
    { name: "Hand embroidery", count: 20 },
    { name: "Handloom weaving", count: 25 },
    { name: "Madhubani painting", count: 14 },
    { name: "Warli art", count: 12 },
    { name: "Gond art", count: 10 },
  ];

  const tags = [
    "Handcrafted",
    "Natural Dye",
    "Eco Friendly",
    "Traditional",
    "GI Tagged",
    "Silk",
    "Terracotta",
    "Woodwork",
  ];

  const recentCrafts = [
    {
      title: "Handcarved Wooden Elephant",
      date: "28 AUG 2026",
      img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=200&auto=format&fit=crop",
    },
    {
      title: "Terracotta Ritual Clay Pot",
      date: "27 AUG 2026",
      img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=200&auto=format&fit=crop",
    },
    {
      title: "Sambalpuri Handloom Saree",
      date: "25 AUG 2026",
      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200&auto=format&fit=crop",
    },
  ];

  return (
    <aside className="regalia-sidebar">
      {/* Search Widget */}
      <div className="sidebar-widget">
        <h3 className="widget-title">Search</h3>
        <div className="sidebar-search-box">
          <span className="search-icon-inside">🔍</span>
          <input
            type="text"
            placeholder={isListening ? "Listening... speak now" : "Search craft or speak..."}
            value={searchTerm}
            onChange={handleSearch}
            className="sidebar-search-input"
            style={{ paddingRight: 36 }}
          />
          <button
            type="button"
            className={`voice-search-mic-btn ${isListening ? "listening" : ""}`}
            onClick={startVoiceSearch}
            title="Voice Search (Hindi / English)"
            style={{ position: "absolute", right: 8 }}
          >
            🎙️
          </button>
        </div>
      </div>

      {/* Recent Posts / Featured Crafts */}
      <div className="sidebar-widget">
        <h3 className="widget-title">Recent Works</h3>
        <div className="recent-craft-list">
          {recentCrafts.map((craft, idx) => (
            <div
              key={idx}
              className="recent-craft-item"
              style={{ cursor: "pointer" }}
              onClick={() => onSearchChange && onSearchChange(craft.title)}
            >
              <img src={craft.img} alt={craft.title} className="recent-craft-thumb" />
              <div className="recent-craft-info">
                <span className="recent-craft-date">{craft.date}</span>
                <span className="recent-craft-title">{craft.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Widget Grouped in 3 Parts (5, 5, 5) */}
      <div className="sidebar-widget">
        <h3 className="widget-title">Categories</h3>

        {/* Part 1: Fine Paintings */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            <span>🎨 Part 1: Fine Paintings (1-5)</span>
          </div>
          <ul className="category-list">
            {categories.slice(0, 5).map((cat, idx) => (
              <li
                key={idx}
                className={`category-item ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => onCategorySelect && onCategorySelect(cat.name)}
              >
                <span className="category-name">
                  <span className="check-mark">✓</span>
                  {t(cat.name)}
                </span>
                <span className="category-count">({cat.count})</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Part 2: Sketches & Sculptures */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            <span>✏️ Part 2: Sketches & Pottery (6-10)</span>
          </div>
          <ul className="category-list">
            {categories.slice(5, 10).map((cat, idx) => (
              <li
                key={idx + 5}
                className={`category-item ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => onCategorySelect && onCategorySelect(cat.name)}
              >
                <span className="category-name">
                  <span className="check-mark">✓</span>
                  {t(cat.name)}
                </span>
                <span className="category-count">({cat.count})</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Part 3: Heritage Textiles & Folk Art */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            <span>🧵 Part 3: Textiles & Folk Art (11-15)</span>
          </div>
          <ul className="category-list">
            {categories.slice(10, 15).map((cat, idx) => (
              <li
                key={idx + 10}
                className={`category-item ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => onCategorySelect && onCategorySelect(cat.name)}
              >
                <span className="category-name">
                  <span className="check-mark">✓</span>
                  {t(cat.name)}
                </span>
                <span className="category-count">({cat.count})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="sidebar-widget">
        <h3 className="widget-title">Tags</h3>
        <div className="tag-cloud">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className={`sidebar-tag ${selectedCategory === tag ? "active" : ""}`}
              onClick={() => onCategorySelect && onCategorySelect(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Vertical Art Poster Card */}
      <div className="sidebar-poster-card">
        <img
          src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop"
          alt="Artisan Craft"
        />
        <div className="poster-overlay">
          <h4>INDIAN CRAFT LEGACY</h4>
          <p>Direct from rural artisan micro-cooperatives.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

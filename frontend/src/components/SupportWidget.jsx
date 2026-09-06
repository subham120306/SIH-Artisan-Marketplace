import React, { useState, useRef, useEffect } from "react";
import "./SupportWidget.css";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

const SupportWidget = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: language === "hi"
        ? "नमस्ते! मैं कारीगर 24/7 AI सहायक हूं। मैं ऑर्डर, कारीगर लिस्टिंग, शिपिंग या क्राफ्ट्स में आपकी मदद कर सकता हूं।"
        : "Namaste! I am your 24/7 Kaarigar AI Assistant. How can I help you today with orders, artisans, or shipping?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  // Listen for global navbar trigger event
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("open-support-widget", handleOpenEvent);
    return () => window.removeEventListener("open-support-widget", handleOpenEvent);
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Voice Recognition (Speech to Text)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === "hi" ? "आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता है।" : "Voice input is not supported in your browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMsg(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  // Text-to-Speech audio playback
  const handleSpeak = (msgId, text) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: "user", text: query, time };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg("");
    setIsTyping(true);

    try {
      // Call Django backend AI Chatbot endpoint
      const response = await client.post("/chatbot/", {
        query,
        language: language === "hi" ? "hi" : "en",
        role: user?.role || "buyer"
      });

      const botReply = response.data?.reply || (
        language === "hi"
          ? "धन्यवाद! हमारे 24/7 सहायता प्रतिनिधि ने आपका प्रश्न नोट कर लिया है। हेल्पलाइन: +91 9040276663"
          : "Thank you! Our 24/7 support specialist has noted your request. Helpline: +91 9040276663"
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      // Local intelligent fallback response if network fails
      let fallbackText = language === "hi"
        ? "माफ़ कीजिये, अभी सहायता सेवा उपलब्ध कराने में दिक्कत हो रही है। कृपया हमारे 24/7 हेल्पलाइन +91 9040276663 पर कॉल करें।"
        : "For immediate assistance, please call our 24/7 helpline at +91 9040276663 or email support@kaarigar.com.";

      const qLower = query.toLowerCase();
      if (qLower.includes("track") || qLower.includes("order") || qLower.includes("ऑर्डर")) {
        fallbackText = language === "hi"
          ? "📍 ऑर्डर ट्रैकिंग: फ़ुटर में 'ऑर्डर ट्रैक करें' विकल्प में अपना ऑर्डर आईडी दर्ज करें या लाइव कूरियर अपडेट के लिए अपने डैशबोर्ड में 'मेरे ऑर्डर' देखें।"
          : "📍 Order Tracking: Enter your Order ID in the 'Track Order' option in the footer or check 'My Orders' in your dashboard for live updates.";
      } else if (qLower.includes("artisan") || qLower.includes("sell") || qLower.includes("voice") || qLower.includes("कारीगर")) {
        fallbackText = language === "hi"
          ? "🎨 कारीगर बिक्री: लॉगिन स्क्रीन पर 'कारीगर' पर क्लिक करें। आप हिंदी/क्षेत्रीय भाषा में बोलकर लिस्टिंग बना सकते हैं!"
          : "🎨 Selling as an Artisan: Select 'Artisan' at login. You can record your voice in Hindi/regional language to automatically list products!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: fallbackText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: language === "hi"
          ? "चैट रीसेट कर दी गई है। मैं आपकी क्या मदद कर सकता हूं?"
          : "Chat history cleared. How can I assist you now?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const [activeRoleTab, setActiveRoleTab] = useState(user?.role === "artisan" ? "artisan" : "buyer");
  const [showProblemsList, setShowProblemsList] = useState(true);

  // Sync role tab when user logs in/changes
  useEffect(() => {
    if (user?.role === "artisan") {
      setActiveRoleTab("artisan");
    } else {
      setActiveRoleTab("buyer");
    }
  }, [user]);

  const buyerProblems = [
    {
      icon: "📍",
      en: "Track Order & Live Status",
      hi: "ऑर्डर ट्रैकिंग व लाइव स्थिति",
      queryEn: "Where is my order? How do I track live dispatch status?",
      queryHi: "मेरा ऑर्डर कहां है? मैं लाइव स्थिति कैसे ट्रैक करूं?"
    },
    {
      icon: "🚚",
      en: "Delivery Timeline & Cash on Delivery (COD)",
      hi: "डिलीवरी समय व कैश ऑन डिलीवरी (COD)",
      queryEn: "What is the delivery timeline and is Cash on Delivery (COD) available?",
      queryHi: "डिलीवरी में कितना समय लगता है और क्या कैश ऑन डिलीवरी उपलब्ध है?"
    },
    {
      icon: "🛡️",
      en: "7-Day Authenticity Guarantee & Returns",
      hi: "7-दिवसीय प्रामाणिकता गारंटी व रिटर्न",
      queryEn: "What is the 7-day authenticity guarantee and return policy?",
      queryHi: "7-दिवसीय गारंटी और रिटर्न नियम क्या हैं?"
    },
    {
      icon: "💬",
      en: "Ask Question directly about a Craft",
      hi: "किसी हस्तशिल्प के बारे में सवाल पूछें",
      queryEn: "How can I ask the artisan a question about a craft listing?",
      queryHi: "मैं किसी उत्पाद के बारे में कारीगर से सवाल कैसे पूछूं?"
    },
    {
      icon: "📞",
      en: "Contact 24/7 Helpline & Support",
      hi: "24/7 हेल्पलाइन व सहायता संपर्क",
      queryEn: "What is the 24/7 helpline number and support email?",
      queryHi: "24/7 हेल्पलाइन नंबर और सपोर्ट ईमेल क्या है?"
    }
  ];

  const artisanProblems = [
    {
      icon: "🎨",
      en: "How to list & sell crafts using Voice (Hindi/Regional)",
      hi: "आवाज (वॉयस) से उत्पाद कैसे बनाएं व बेचें",
      queryEn: "How can an artisan record voice in Hindi to create product listings?",
      queryHi: "कारीगर हिंदी में बोलकर अपनी सूची (लिस्टिंग) कैसे बना सकते हैं?"
    },
    {
      icon: "💰",
      en: "Zero Platform Fee & Direct Bank Payouts",
      hi: "शून्य फ़ीस व बैंक खाते में सीधा भुगतान",
      queryEn: "How does 0% platform fee and direct bank payment work for artisans?",
      queryHi: "0% फ़ीस और कारीगर बैंक खाते में सीधा भुगतान कैसे काम करता है?"
    },
    {
      icon: "🏷️",
      en: "Smart AI Pricing & Cataloging",
      hi: "स्मार्ट AI मूल्य निर्धारण व कैटलॉगिंग",
      queryEn: "How does AI suggest product prices based on craft market data?",
      queryHi: "AI कारीगर के उत्पाद का सही मूल्य कैसे तय करता है?"
    },
    {
      icon: "📦",
      en: "Cluster Manufacturing & Bulk Production Orders",
      hi: "क्लस्टर निर्माण व थोक ऑर्डर पूरा करना",
      queryEn: "How do artisan clusters work together to complete bulk orders?",
      queryHi: "बल्क ऑर्डर पूरे करने के लिए कारीगर क्लस्टर कैसे मिलकर काम करते हैं?"
    },
    {
      icon: "🛡️",
      en: "Artisan Verification & Trust Badge",
      hi: "कारीगर पहचान सत्यापन व ट्रस्ट बैज",
      queryEn: "How can I get my artisan trust badge and account verified?",
      queryHi: "कारीगर ट्रस्ट बैज और खाता सत्यापन कैसे प्राप्त करें?"
    }
  ];

  return (
    <div className="support-widget-container">
      {/* Floating 3D AI Robot Logo Button */}
      {!isOpen && (
        <button
          type="button"
          className="support-float-ai-logo"
          onClick={() => setIsOpen(true)}
          title="Launch 24/7 AI Support Chatbot"
        >
          <div className="ai-logo-glow-ring" />
          <div className="ai-logo-img-wrapper">
            <img
              src="/ai-bot-avatar.png"
              alt="24/7 AI Assistant"
              className="ai-logo-img"
            />
          </div>
          <span className="ai-logo-badge">24/7 AI</span>
        </button>
      )}

      {/* Expanded Support Chat Drawer */}
      {isOpen && (
        <div className="support-chat-card">
          {/* Header */}
          <div className="support-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="support-avatar-box">
                <img src="/ai-bot-avatar.png" alt="AI Robot" className="support-avatar-img" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, color: "#ffffff" }}>
                  {language === "hi" ? "कारीगर 24/7 AI सहायता" : "Kaarigar 24/7 AI Support"}
                </h4>
                <span style={{ fontSize: 10, color: "#86efac", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  {language === "hi" ? "ऑनलाइन • तत्काल प्रतिक्रिया" : "Online • Instant Gemini AI"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                className="support-clear-btn"
                onClick={handleClearChat}
                title="Clear Chat History"
              >
                🗑️
              </button>
              <button
                type="button"
                className="support-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Drawer"
              >
                ×
              </button>
            </div>
          </div>

          {/* Problem List Subheader (Role Specific) */}
          <div className="support-problems-header">
            <span>
              {user?.role === "artisan"
                ? (language === "hi" ? "🎨 कारीगर समस्याएं व सवाल:" : "🎨 Artisan Common Problems:")
                : (language === "hi" ? "📦 खरीदार समस्याएं व सवाल:" : "📦 Buyer Common Problems:")
              }
            </span>
            <button
              type="button"
              className="toggle-problems-btn"
              onClick={() => setShowProblemsList(!showProblemsList)}
            >
              {showProblemsList ? "▲ " + (language === "hi" ? "छुपाएं" : "Hide") : "▼ " + (language === "hi" ? "दिखाएं" : "Show")}
            </button>
          </div>

          {/* Vertical Problem List (Only shows items relevant to current role) */}
          {showProblemsList && (
            <div className="support-vertical-problems">
              {(user?.role === "artisan" ? artisanProblems : buyerProblems).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="vertical-problem-item"
                  onClick={() => handleSend(language === "hi" ? item.queryHi : item.queryEn)}
                >
                  <span className="problem-icon">{item.icon}</span>
                  <span className="problem-text">{language === "hi" ? item.hi : item.en}</span>
                  <span className="problem-arrow">➔</span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages */}
          <div className="support-messages-box">
            {messages.map((msg) => (
              <div key={msg.id} className={`support-msg ${msg.sender}`}>
                <div className="support-msg-bubble">
                  {msg.text}
                  {msg.sender === "bot" && (
                    <button
                      type="button"
                      className={`support-speak-btn ${speakingMsgId === msg.id ? "speaking" : ""}`}
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      title={speakingMsgId === msg.id ? "Stop Listening" : "Listen Audio"}
                    >
                      {speakingMsgId === msg.id ? "🔊 Stop" : "🔊 Listen"}
                    </button>
                  )}
                </div>
                <span className="support-msg-time">{msg.time}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="support-msg bot">
                <div className="support-msg-bubble typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="support-input-row"
          >
            <button
              type="button"
              className={`support-mic-btn ${isListening ? "listening" : ""}`}
              onClick={handleVoiceInput}
              title={isListening ? "Listening..." : "Click to Speak"}
            >
              🎤
            </button>

            <input
              type="text"
              placeholder={
                isListening
                  ? (language === "hi" ? "सुन रहा हूं... बोलें" : "Listening... Speak now")
                  : (language === "hi" ? "अपना प्रश्न लिखें या बोलें..." : "Ask any question in English or Hindi...")
              }
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="support-input"
            />

            <button type="submit" className="support-send-btn" disabled={!inputMsg.trim() && !isTyping}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportWidget;


import React, { useState, useRef, useEffect } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../components/VoicePanel.css";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import OrderStatusStepper from "../components/OrderStatusStepper";
import AIPricePredictor from "../components/AIPricePredictor";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const ArtisanDashboard = () => {
  const { user, logout } = useAuth();

  // ---------- PRODUCT PHOTO ----------
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoMediaType, setPhotoMediaType] = useState(null);
  const [catalogResult, setCatalogResult] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [catalogSaveState, setCatalogSaveState] = useState("idle"); // idle | saving | saved | error
  const [marketPricing, setMarketPricing] = useState(null); // Dynamic Pricing Assistant result

  // ---------- AI IMAGE STUDIO ----------
  const [enhancePreset, setEnhancePreset] = useState("marketplace_standard");
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState(null);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [enhanceError, setEnhanceError] = useState(null);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(true); // true = after, false = before

  const IMAGE_STUDIO_PRESETS = [
    { id: "marketplace_standard", label: "Marketplace standard" },
    { id: "clean_white", label: "Clean white background" },
    { id: "warm_lifestyle", label: "Warm lifestyle shot" },
  ];

  // ---------- TRUST BADGE (verification) ----------
  const [verifLoading, setVerifLoading] = useState(true);
  const [verificationRequest, setVerificationRequest] = useState(null); // null = no request submitted yet
  const [verifPhotoDataUrl, setVerifPhotoDataUrl] = useState(null);
  const [verifReferenceName, setVerifReferenceName] = useState("");
  const [verifReferencePhone, setVerifReferencePhone] = useState("");
  const [verifReferenceRelation, setVerifReferenceRelation] = useState("");
  const [verifNote, setVerifNote] = useState("");
  const [verifSubmitting, setVerifSubmitting] = useState(false);
  const [verifError, setVerifError] = useState(null);

  const verifPhotoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetPhotoState = () => {
    setPhotoDataUrl(null);
    setPhotoMediaType(null);
    setCatalogResult(null);
    setCatalogError(null);
    setMarketPricing(null);
    setEnhancedPhotoUrl(null);
    setEnhanceError(null);
    setShowEnhancedPreview(true);
  };

  const handleChoosePhoto = () => fileInputRef.current?.click();

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetPhotoState();

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result);
      setPhotoMediaType(file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      resetPhotoState();
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoDataUrl(reader.result);
        setPhotoMediaType(file.type || "image/jpeg");
      };
      reader.readAsDataURL(file);
    }
  };

  // ---------- AI IMAGE STUDIO ----------
  const handleRunEnhance = async (preset) => {
    if (!photoDataUrl) return;
    setEnhancePreset(preset);
    setEnhanceLoading(true);
    setEnhanceError(null);

    try {
      const base64 = photoDataUrl.split(",")[1];
      const { data } = await client.post("/enhance/", {
        imageBase64: base64,
        preset,
      });
      setEnhancedPhotoUrl(data.imageDataUrl);
      setShowEnhancedPreview(true);
    } catch (err) {
      console.error("Enhance error:", err?.response?.data || err.message);
      setEnhanceError("Could not enhance this photo. Please try again.");
    } finally {
      setEnhanceLoading(false);
    }
  };

  // Replaces the working photo with the enhanced version so it's what
  // gets sent to the AI listing generator and saved with the product.
  const handleUseEnhancedPhoto = () => {
    if (!enhancedPhotoUrl) return;
    setPhotoDataUrl(enhancedPhotoUrl);
    setPhotoMediaType("image/png");
    setEnhancedPhotoUrl(null);
  };

  const handleGenerateListing = async () => {
    if (!photoDataUrl) return;
    setCatalogLoading(true);
    setCatalogError(null);
    setCatalogResult(null);

    try {
      const base64 = photoDataUrl.split(",")[1];
      const { data } = await client.post("/catalog/", {
        imageBase64: base64,
        mediaType: photoMediaType,
      });
      setCatalogResult(data);
      fetchMarketPricing(data);
    } catch (err) {
      console.error("Catalog error:", err?.response?.data || err.message);
      setCatalogError(
        err?.response?.data?.error || "Could not generate a listing. Please try again."
      );
    } finally {
      setCatalogLoading(false);
    }
  };

  // Looks up the market-grounded price band (Dynamic Pricing Assistant)
  // for whatever category/technique/tags the AI just detected. Silently
  // no-ops if there isn't enough comparable data yet — the AI's own
  // price_reasoning already covers that case in the UI below.
  const fetchMarketPricing = async (result) => {
    setMarketPricing(null);
    try {
      const { data } = await client.post("/pricing/", {
        category: result.category || "",
        craft_technique: result.craft_technique_guess || "",
        tags: result.tags || [],
      });
      if (data?.has_market_data) {
        setMarketPricing(data);
      }
    } catch (err) {
      console.error("Pricing lookup error:", err?.response?.data || err.message);
    }
  };

  const parsePriceRange = (rangeText) => {
    if (!rangeText) return { min: null, max: null };
    const numbers = rangeText.match(/\d[\d,]*/g);
    if (!numbers) return { min: null, max: null };
    const parsed = numbers.map((n) => parseInt(n.replace(/,/g, ""), 10));
    return { min: parsed[0] ?? null, max: parsed[1] ?? parsed[0] ?? null };
  };

  const handleSaveCatalogListing = async () => {
    if (!catalogResult) return;
    setCatalogSaveState("saving");

    const { min, max } = parsePriceRange(catalogResult.suggested_price_range_inr);

    try {
      await client.post("/products/", {
        title: catalogResult.title,
        description: catalogResult.description,
        tags: catalogResult.tags || [],
        category: catalogResult.category || "",
        craft_technique: catalogResult.craft_technique_guess || "",
        price_min_inr: min,
        price_max_inr: max,
        image_data_url: photoDataUrl || "",
        source: "photo",
        status: "published",
      });
      setCatalogSaveState("saved");
    } catch (err) {
      console.error("Save listing error:", err?.response?.data || err.message);
      setCatalogSaveState("error");
    }
  };

  // ---------- VOICE CATALOGING ----------
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [audioDataUrl, setAudioDataUrl] = useState(null);
  const [audioMediaType, setAudioMediaType] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [voicePrice, setVoicePrice] = useState({ min: "", max: "" });
  const [voiceSaveState, setVoiceSaveState] = useState("idle"); // idle | saving | saved | error

  // ---------- COMBINED LISTING (Photo + Voice) ----------
  const [combinedSaveState, setCombinedSaveState] = useState("idle"); // idle | saving | saved | error

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  const resetVoiceState = () => {
    setAudioDataUrl(null);
    setAudioMediaType(null);
    setVoiceResult(null);
    setVoiceError(null);
    setLiveTranscript("");
  };

  const startRecording = async () => {
    resetVoiceState();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const preferredType = "audio/webm";
      const mimeType =
        typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(preferredType)
          ? preferredType
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blobType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: blobType });
        const reader = new FileReader();
        reader.onload = () => {
          setAudioDataUrl(reader.result);
          setAudioMediaType(blobType);
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((t) => t.stop());
        audioStreamRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();

      // Start Web Speech Recognition if available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "hi-IN";
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (e) => {
            let text = "";
            for (let i = 0; i < e.results.length; i++) {
              text += e.results[i][0].transcript + " ";
            }
            setLiveTranscript(text);
          };
          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.log("Web Speech API notice:", recErr);
        }
      }

      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      setVoiceError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const handleGenerateVoiceListing = async () => {
    if (!audioDataUrl) return;
    setVoiceLoading(true);
    setVoiceError(null);
    setVoiceResult(null);

    try {
      const base64 = audioDataUrl.split(",")[1];
      const { data } = await client.post("/voice/", {
        audioBase64: base64,
        mediaType: audioMediaType,
      });
      setVoiceResult(data);
    } catch (err) {
      console.error("Voice catalog error:", err?.response?.data || err.message);
      setVoiceError(
        err?.response?.data?.error || "Could not generate a listing. Please try again."
      );
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleSaveVoiceListing = async () => {
    if (!voiceResult) return;
    setVoiceSaveState("saving");

    try {
      await client.post("/products/", {
        title: voiceResult.english?.title || "",
        description: voiceResult.english?.description || "",
        tags: voiceResult.english?.tags || [],
        title_hi: voiceResult.local?.title || "",
        description_hi: voiceResult.local?.description || "",
        tags_hi: voiceResult.local?.tags || [],
        price_min_inr: voicePrice.min ? Number(voicePrice.min) : null,
        price_max_inr: voicePrice.max ? Number(voicePrice.max) : null,
        source: "voice",
        status: "published",
      });
      setVoiceSaveState("saved");
    } catch (err) {
      console.error("Save voice listing error:", err?.response?.data || err.message);
      setVoiceSaveState("error");
    }
  };

  // Merges the photo-drafted listing (visual details: title, category,
  // technique, tags, price) with the voice-drafted listing (spoken story,
  // bilingual description) into one richer listing. Only ever shown once
  // both a photo and a voice listing exist for this session — no new AI
  // call needed, it's a client-side merge of what's already been generated.
  const getCombinedListing = () => {
    if (!catalogResult || !voiceResult) return null;

    const { min: photoMin, max: photoMax } = parsePriceRange(
      catalogResult.suggested_price_range_inr
    );
    const min = photoMin ?? (voicePrice.min ? Number(voicePrice.min) : null);
    const max = photoMax ?? (voicePrice.max ? Number(voicePrice.max) : null);

    const mergedTags = Array.from(
      new Set([...(catalogResult.tags || []), ...(voiceResult.english?.tags || [])])
    );

    const description = [catalogResult.description, voiceResult.english?.description]
      .filter(Boolean)
      .join(" ");

    return {
      title: catalogResult.title || voiceResult.english?.title || "",
      description,
      tags: mergedTags,
      category: catalogResult.category || "",
      craft_technique: catalogResult.craft_technique_guess || "",
      price_min_inr: min,
      price_max_inr: max,
      title_hi: voiceResult.local?.title || "",
      description_hi: voiceResult.local?.description || "",
      tags_hi: voiceResult.local?.tags || [],
    };
  };

  const handleSaveCombinedListing = async () => {
    const combined = getCombinedListing();
    if (!combined) return;
    setCombinedSaveState("saving");

    try {
      await client.post("/products/", {
        ...combined,
        image_data_url: photoDataUrl || "",
        source: "photo+voice",
        status: "published",
      });
      setCombinedSaveState("saved");
    } catch (err) {
      console.error("Save combined listing error:", err?.response?.data || err.message);
      setCombinedSaveState("error");
    }
  };

  // ---------- ORDERS RECEIVED ----------
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const STATUS_FLOW = ["placed", "in_production", "shipped", "delivered"];
  const STATUS_LABELS = {
    placed: "Placed",
    in_production: "In Production",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const { data } = await client.get("/orders/received/");
      setOrders(data.results ?? data);
    } catch (err) {
      console.error("Orders load error:", err?.response?.data || err.message);
      setOrdersError("Could not load orders. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ---------- TRUST BADGE (verification) ----------
  const loadVerificationStatus = async () => {
    setVerifLoading(true);
    try {
      const { data } = await client.get("/verification/");
      setVerificationRequest(data); // null if the artisan has never submitted one
    } catch (err) {
      console.error("Verification status error:", err?.response?.data || err.message);
    } finally {
      setVerifLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.is_verified) loadVerificationStatus();
    else setVerifLoading(false);
  }, [user]);

  const handleVerifPhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setVerifPhotoDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async () => {
    if (!verifPhotoDataUrl) {
      setVerifError("Please add a photo first.");
      return;
    }
    if (!verifReferenceName.trim()) {
      setVerifError("Please add at least one reference name.");
      return;
    }

    setVerifSubmitting(true);
    setVerifError(null);

    try {
      const { data } = await client.post("/verification/", {
        photo_data_url: verifPhotoDataUrl,
        reference_name: verifReferenceName.trim(),
        reference_phone: verifReferencePhone.trim(),
        reference_relation: verifReferenceRelation.trim(),
        note: verifNote.trim(),
      });
      setVerificationRequest(data);
    } catch (err) {
      console.error("Verification submit error:", err?.response?.data || err.message);
      setVerifError(
        err?.response?.data?.error || "Could not submit your request. Please try again."
      );
    } finally {
      setVerifSubmitting(false);
    }
  };

  const advanceOrder = async (order) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) return;

    setUpdatingOrderId(order.id);
    try {
      await client.patch(`/orders/${order.id}/status/`, { status: nextStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
      );
    } catch (err) {
      console.error("Order update error:", err?.response?.data || err.message);
      setOrdersError("Could not update that order. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="voice-panel-page">
      <Navbar activeTab="home" />

      {/* Regalia Hero Exhibition Header Banner */}
      <div className="regalia-hero-banner">
        <h1>ARTISAN STUDIO & EXHIBITION</h1>
        <div className="regalia-breadcrumb">
          Home <span>/</span> Artisan Workspace <span>/</span> AI Cataloging & Orders
        </div>
      </div>

      <div className="regalia-container">
        <div className="regalia-layout">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Studio Workspace */}
          <main className="regalia-workspace">

        {/* ============ TRUST BADGE ============ */}
        <div className="workspace-card" style={{ marginBottom: 20 }}>
          <div className="card-top">
            <div className="step-number">✓</div>
            <div>
              <h3>Trust Badge</h3>
              <p>Verify your account once so buyers see a "✓ Verified" badge on your listings — no formal documents required.</p>
            </div>
          </div>

          {user?.is_verified ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 12,
                background: "#e3f0e6",
                border: "1px solid #2f6f4f",
              }}
            >
              <span style={{ fontSize: 20 }}>✓</span>
              <div>
                <strong style={{ color: "#2f6f4f" }}>You're a verified artisan</strong>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#4a6e5a" }}>
                  This badge is now visible on all your listings.
                </p>
              </div>
            </div>
          ) : verifLoading ? (
            <p style={{ fontSize: 13, color: "#8b8279" }}>Checking your verification status...</p>
          ) : verificationRequest?.status === "pending" ? (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "#fdf6e3",
                border: "1px solid #d8c48c",
              }}
            >
              <strong style={{ fontSize: 13 }}>⏳ Under review</strong>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6f665f" }}>
                Submitted on {new Date(verificationRequest.submitted_at).toLocaleDateString("en-IN")}.
                Reference: {verificationRequest.reference_name}. We'll update this once it's reviewed.
              </p>
            </div>
          ) : (
            <div>
              {verificationRequest?.status === "rejected" && (
                <div
                  className="error-box"
                  style={{ marginBottom: 14 }}
                >
                  <div className="error-icon">!</div>
                  <div>
                    <strong>Previous request wasn't approved</strong>
                    <p>
                      {verificationRequest.admin_note ||
                        "Please double-check your photo and reference details, then resubmit."}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "0 0 140px" }}>
                  {verifPhotoDataUrl ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={verifPhotoDataUrl}
                        alt="Verification"
                        style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 12 }}
                      />
                      <button
                        type="button"
                        onClick={() => setVerifPhotoDataUrl(null)}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          border: "none",
                          borderRadius: 20,
                          padding: "2px 8px",
                          fontSize: 11,
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Retake
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => verifPhotoInputRef.current?.click()}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 12,
                        border: "1px dashed #d8d0c4",
                        background: "#faf7f2",
                        color: "#8b8279",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      📷
                      <br />
                      Add photo
                    </button>
                  )}
                  <input
                    ref={verifPhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleVerifPhotoSelected}
                    style={{ display: "none" }}
                  />
                </div>

                <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Reference name (a cluster coordinator, NGO contact, or fellow verified artisan)"
                    value={verifReferenceName}
                    onChange={(e) => setVerifReferenceName(e.target.value)}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d7cb", fontSize: 13 }}
                  />
                  <input
                    type="text"
                    placeholder="Reference phone (optional)"
                    value={verifReferencePhone}
                    onChange={(e) => setVerifReferencePhone(e.target.value)}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d7cb", fontSize: 13 }}
                  />
                  <input
                    type="text"
                    placeholder="How do you know them? (optional)"
                    value={verifReferenceRelation}
                    onChange={(e) => setVerifReferenceRelation(e.target.value)}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d7cb", fontSize: 13 }}
                  />
                </div>
              </div>

              {verifError && (
                <p style={{ marginTop: 10, fontSize: 12, color: "#b3432b" }}>{verifError}</p>
              )}

              <button
                type="button"
                className="create-listing-button"
                style={{ marginTop: 14 }}
                onClick={handleSubmitVerification}
                disabled={verifSubmitting}
              >
                {verifSubmitting ? <span className="button-spinner" /> : <span className="sparkle">✦</span>}
                {verifSubmitting ? "Submitting..." : "Submit for verification"}
              </button>
            </div>
          )}
        </div>

        <div className="workspace">
        </div>

        {/* ============ AI PRICE PREDICTOR ============ */}
        <AIPricePredictor />

        {/* ============ VOICE CATALOGING ============ */}
        <div className="workspace-card" style={{ marginTop: 20 }}>
          <div className="card-top">
            <div className="step-number">🎙️</div>
            <div>
              <h3>Voice Cataloging & Search</h3>
              <p>Describe your craft out loud in Hindi or English. We'll transcribe it, detect details, and draft your listing automatically.</p>
            </div>
          </div>

          {!audioDataUrl && (
            <div className="record-area">
              <button
                type="button"
                className={`record-button ${isRecording ? "recording" : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <div className="record-button-inner">
                  <span className="mic-icon">{isRecording ? "⏹" : "🎙"}</span>
                </div>
              </button>

              <div className="record-status">
                <strong>{isRecording ? "Recording in progress... Tap to stop" : "Tap microphone to start speaking"}</strong>
                <span>
                  {isRecording
                    ? "Speak clearly about your craft — material, color, technique, and suggested price."
                    : "Describe the piece out loud in Hindi, English, or your local regional dialect."}
                </span>
              </div>

              {liveTranscript && (
                <div className="live-speech-box">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 4, letterSpacing: 0.5 }}>
                    🎙️ LIVE TRANSCRIPT
                  </div>
                  <div>{liveTranscript}</div>
                </div>
              )}
            </div>
          )}

          {audioDataUrl && (
            <div style={{ marginTop: 4 }}>
              <audio controls src={audioDataUrl} className="audio-player" style={{ width: "100%" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="create-listing-button"
                  style={{ flex: 1 }}
                  onClick={handleGenerateVoiceListing}
                  disabled={voiceLoading}
                >
                  {voiceLoading ? <span className="button-spinner" /> : <span className="sparkle">✦</span>}
                  {voiceLoading ? "Generating listing..." : "Generate listing"}
                </button>
                <button
                  type="button"
                  className="upload-button"
                  onClick={resetVoiceState}
                  disabled={voiceLoading}
                >
                  Re-record
                </button>
              </div>
            </div>
          )}

          {voiceError && (
            <div className="error-box" style={{ marginTop: 16 }}>
              <div className="error-icon">!</div>
              <div>
                <strong>Error</strong>
                <p>{voiceError}</p>
              </div>
            </div>
          )}

          {voiceResult && (
            <div style={{ marginTop: 18 }}>
              {voiceResult.transcript && (
                <>
                  <p className="result-label" style={{ marginBottom: 8 }}>
                    TRANSCRIPT
                  </p>
                  <div className="transcript-box" style={{ marginBottom: 20 }}>
                    <p>{voiceResult.transcript}</p>
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {voiceResult.english && (
                  <div style={{ flex: "1 1 260px" }}>
                    <p className="result-label" style={{ marginBottom: 8 }}>
                      ENGLISH
                    </p>
                    <h3 style={{ margin: "0 0 10px", fontSize: 18 }}>{voiceResult.english.title}</h3>
                    <p style={{ fontSize: 13, color: "#6f665f", lineHeight: 1.7, marginBottom: 10 }}>
                      {voiceResult.english.description}
                    </p>
                    {voiceResult.english.tags?.length > 0 && (
                      <div className="listing-tags">
                        {voiceResult.english.tags.map((t, i) => (
                          <span key={i}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {voiceResult.local && (
                  <div style={{ flex: "1 1 260px" }}>
                    <p className="result-label" style={{ marginBottom: 8 }}>
                      {voiceResult.detected_language ? voiceResult.detected_language.toUpperCase() : "LOCAL LANGUAGE"}
                    </p>
                    <h3 style={{ margin: "0 0 10px", fontSize: 18 }}>{voiceResult.local.title}</h3>
                    <p style={{ fontSize: 13, color: "#6f665f", lineHeight: 1.7, marginBottom: 10 }}>
                      {voiceResult.local.description}
                    </p>
                    {voiceResult.local.tags?.length > 0 && (
                      <div className="listing-tags">
                        {voiceResult.local.tags.map((t, i) => (
                          <span key={i}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 12, display: "block", marginBottom: 6 }}>Min price (₹)</strong>
                  <input
                    type="number"
                    min="0"
                    value={voicePrice.min}
                    onChange={(e) => setVoicePrice((p) => ({ ...p, min: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d7cb" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 12, display: "block", marginBottom: 6 }}>Max price (₹)</strong>
                  <input
                    type="number"
                    min="0"
                    value={voicePrice.max}
                    onChange={(e) => setVoicePrice((p) => ({ ...p, max: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d7cb" }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="create-listing-button"
                style={{ marginTop: 14 }}
                onClick={handleSaveVoiceListing}
                disabled={voiceSaveState === "saving" || voiceSaveState === "saved"}
              >
                {voiceSaveState === "saving" && <span className="button-spinner" />}
                {voiceSaveState === "idle" && <span className="sparkle">⇧</span>}
                {voiceSaveState === "saving" && "Saving..."}
                {voiceSaveState === "idle" && "Save & publish to marketplace"}
                {voiceSaveState === "saved" && "✓ Published"}
                {voiceSaveState === "error" && "Could not save — tap to retry"}
              </button>
            </div>
          )}
        </div>

        {/* ============ COMBINED LISTING (Photo + Voice) ============ */}
        {catalogResult && voiceResult && (
          <div className="workspace-card" style={{ marginTop: 20, border: "1px solid #2f6f4f" }}>
            <div className="card-top">
              <div className="step-number">✦</div>
              <div>
                <h3>Combined Listing (Photo + Voice)</h3>
                <p>
                  Both a photo and a voice listing are ready for this piece — combine the visual
                  details with your spoken story into one richer, bilingual listing.
                </p>
              </div>
            </div>

            {(() => {
              const combined = getCombinedListing();
              if (!combined) return null;
              return (
                <div>
                  <p className="result-label" style={{ marginBottom: 4 }}>
                    {combined.category?.toUpperCase()}
                  </p>
                  <h3 style={{ margin: "0 0 10px", fontSize: 20 }}>{combined.title}</h3>
                  <p style={{ fontSize: 13, color: "#6f665f", lineHeight: 1.7, marginBottom: 10 }}>
                    {combined.description}
                  </p>
                  {combined.craft_technique && (
                    <p style={{ fontSize: 12, color: "#8b8279", marginBottom: 12 }}>
                      <strong>Technique:</strong> {combined.craft_technique}
                    </p>
                  )}
                  {combined.tags?.length > 0 && (
                    <div className="listing-tags" style={{ marginTop: 0, marginBottom: 16 }}>
                      {combined.tags.map((t, i) => (
                        <span key={i}>{t}</span>
                      ))}
                    </div>
                  )}
                  {(combined.price_min_inr || combined.price_max_inr) && (
                    <div className="price-highlight" style={{ marginBottom: 16 }}>
                      <strong>
                        ₹{combined.price_min_inr?.toLocaleString("en-IN") ?? "?"} - ₹
                        {combined.price_max_inr?.toLocaleString("en-IN") ?? "?"}
                      </strong>
                    </div>
                  )}

                  {combined.title_hi && (
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                      <p className="result-label" style={{ marginBottom: 8 }}>
                        {voiceResult.detected_language
                          ? voiceResult.detected_language.toUpperCase()
                          : "LOCAL LANGUAGE"}
                      </p>
                      <h3 style={{ margin: "0 0 10px", fontSize: 18 }}>{combined.title_hi}</h3>
                      <p style={{ fontSize: 13, color: "#6f665f", lineHeight: 1.7, marginBottom: 10 }}>
                        {combined.description_hi}
                      </p>
                      {combined.tags_hi?.length > 0 && (
                        <div className="listing-tags">
                          {combined.tags_hi.map((t, i) => (
                            <span key={i}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="create-listing-button"
                    style={{ marginTop: 18 }}
                    onClick={handleSaveCombinedListing}
                    disabled={combinedSaveState === "saving" || combinedSaveState === "saved"}
                  >
                    {combinedSaveState === "saving" && <span className="button-spinner" />}
                    {combinedSaveState === "idle" && <span className="sparkle">⇧</span>}
                    {combinedSaveState === "saving" && "Saving..."}
                    {combinedSaveState === "idle" && "Save & publish combined listing"}
                    {combinedSaveState === "saved" && "✓ Published"}
                    {combinedSaveState === "error" && "Could not save — tap to retry"}
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============ ORDERS RECEIVED ============ */}
        <div className="workspace-card" style={{ marginTop: 20 }}>
          <div className="card-top">
            <div className="step-number">3</div>
            <div>
              <h3>Orders Received</h3>
              <p>Orders buyers have placed on your published listings.</p>
            </div>
          </div>

          {ordersLoading && <p>Loading orders...</p>}

          {ordersError && (
            <div className="error-box" style={{ marginTop: 12 }}>
              <div className="error-icon">!</div>
              <div>
                <strong>Error</strong>
                <p>{ordersError}</p>
              </div>
            </div>
          )}

          {!ordersLoading && !ordersError && orders.length === 0 && (
            <p className="empty-state">No orders yet. Once a buyer orders one of your listings, it'll show up here.</p>
          )}

          {orders.map((o) => (
            <div key={o.id} className="regalia-order-card">
              <div className="order-card-header">
                <div className="order-card-main">
                  {o.product_image ? (
                    <img src={o.product_image} alt={o.product_title} className="order-card-thumb" />
                  ) : (
                    <div className="order-card-thumb" style={{ background: "#f4efe6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎨</div>
                  )}
                  <div className="order-card-details">
                    <h4>{o.product_title} <span style={{ color: "#b45309", fontWeight: 700 }}>× {o.quantity}</span></h4>
                    <p>
                      Ordered by: <strong>{o.buyer_username}</strong>
                      {o.total_price_inr ? ` · Total Revenue: ₹${o.total_price_inr.toLocaleString("en-IN")}` : ""}
                    </p>
                  </div>
                </div>

                <div className="order-card-actions">
                  {STATUS_FLOW.indexOf(o.status) >= 0 && STATUS_FLOW.indexOf(o.status) < STATUS_FLOW.length - 1 && (
                    <button
                      type="button"
                      className="create-listing-button"
                      style={{ padding: "8px 16px", fontSize: 13, margin: 0 }}
                      onClick={() => advanceOrder(o)}
                      disabled={updatingOrderId === o.id}
                    >
                      {updatingOrderId === o.id ? <span className="button-spinner" /> : "➔ "}
                      {updatingOrderId === o.id
                        ? "Updating..."
                        : `Mark ${STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1]]}`}
                    </button>
                  )}
                </div>
              </div>

              {/* Order Lifecycle Progress Bar */}
              <OrderStatusStepper status={o.status} />
            </div>
          ))}
        </div>

        {/* Regalia Pagination Navigation */}
        <div className="regalia-pagination">
          <button type="button" className="page-num active">1</button>
          <button type="button" className="page-num">2</button>
          <button type="button" className="page-num">→</button>
        </div>
        </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArtisanDashboard;

import React, { useState, useRef } from "react";
import client from "../api/client";
import "./VoicePanel.css";

const VoicePanel = () => {
  // ---------- BULK ORDER ----------
  const [productType, setProductType] = useState("");
  const [quantityNeeded, setQuantityNeeded] = useState("");
  const [unitPriceInr, setUnitPriceInr] = useState("");
  const [clusterResult, setClusterResult] = useState(null);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [clusterError, setClusterError] = useState(null);

  const handleFormCluster = async (e) => {
    e.preventDefault();
    setClusterError(null);
    setClusterResult(null);

    if (!productType.trim() || !quantityNeeded) {
      setClusterError("Product type and quantity needed are required.");
      return;
    }

    setClusterLoading(true);
    try {
      const { data } = await client.post("/cluster/", {
        order: {
          productType: productType.trim(),
          quantityNeeded: Number(quantityNeeded),
          unitPriceInr: unitPriceInr ? Number(unitPriceInr) : 0,
        },
      });
      setClusterResult(data);
    } catch (err) {
      console.error("Cluster error:", err?.response?.data || err.message);
      setClusterError(
        err?.response?.data?.error || "Could not form a cluster. Please try again."
      );
    } finally {
      setClusterLoading(false);
    }
  };

  // ---------- VOICE CATALOGING ----------
  const [isRecording, setIsRecording] = useState(false);
  const [audioDataUrl, setAudioDataUrl] = useState(null);
  const [audioMediaType, setAudioMediaType] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  const resetVoiceState = () => {
    setAudioDataUrl(null);
    setAudioMediaType(null);
    setVoiceResult(null);
    setVoiceError(null);
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
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      setVoiceError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
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

  return (
    <div className="voice-panel-page">
      <div className="voice-panel-container">
        {/* Header */}
        <div className="voice-header">
          <div className="brand-area">
            <div className="brand-icon">K</div>
            <div>
              <h1>Kaarigar</h1>
              <p>Cluster fulfillment and AI-drafted catalog listings, built for independent artisans.</p>
            </div>
          </div>
          <div className="header-badge">
            <span className="status-dot" />
            Live
          </div>
        </div>

        <div className="workspace">
          {/* ============ BULK ORDER ============ */}
          <div className="workspace-card">
            <div className="card-top">
              <div className="step-number">1</div>
              <div>
                <h3>Bulk Order</h3>
                <p>Enter what a buyer needs. We'll pool the right artisans together until the order is covered.</p>
              </div>
            </div>

            <form onSubmit={handleFormCluster}>
              <div style={{ marginBottom: 14 }}>
                <label className="record-status" style={{ alignItems: "flex-start", marginTop: 0 }}>
                  <strong style={{ marginBottom: 6 }}>Product type</strong>
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="audio-player"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d7cb", height: "auto" }}
                >
                  <option value="" disabled>
                    Select product type
                  </option>
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 12, display: "block", marginBottom: 6 }}>Quantity needed</strong>
                  <input
                    type="number"
                    min="1"
                    value={quantityNeeded}
                    onChange={(e) => setQuantityNeeded(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d7cb" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 12, display: "block", marginBottom: 6 }}>Unit price (₹)</strong>
                  <input
                    type="number"
                    min="0"
                    value={unitPriceInr}
                    onChange={(e) => setUnitPriceInr(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d7cb" }}
                  />
                </div>
              </div>

              <button type="submit" className="create-listing-button" disabled={clusterLoading}>
                {clusterLoading ? <span className="button-spinner" /> : <span className="sparkle">⬢</span>}
                {clusterLoading ? "Forming cluster..." : "Form cluster"}
              </button>
            </form>

            {clusterError && (
              <div className="error-box" style={{ marginTop: 16 }}>
                <div className="error-icon">!</div>
                <div>
                  <strong>Error</strong>
                  <p>{clusterError}</p>
                </div>
              </div>
            )}

            {clusterResult && (
              <div style={{ marginTop: 18 }}>
                <div
                  className="transcript-box"
                  style={{
                    background: clusterResult.success ? "#eef6ec" : "#fff5f4",
                  }}
                >
                  <p style={{ color: clusterResult.success ? "#3d6b3d" : "#8d3d36" }}>
                    {clusterResult.success
                      ? `Fulfilled — ${clusterResult.clusterSize} artisans covering ${clusterResult.totalUnitsAllocated} units${
                          clusterResult.totalRevenueInr ? ` for ₹${clusterResult.totalRevenueInr.toLocaleString("en-IN")}` : ""
                        }`
                      : clusterResult.reason}
                  </p>
                </div>

                {clusterResult.allocation?.map((a) => (
                  <div
                    key={a.artisanId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      marginTop: 10,
                      borderRadius: 14,
                      background: "#faf7f3",
                      border: "1px solid #e9e0d6",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        flex: "0 0 44px",
                        borderRadius: "50%",
                        border: "2px dashed #c98f6a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#9a5d3e",
                      }}
                    >
                      {a.matchScore}%
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: 14, color: "#2c2824" }}>{a.name}</strong>
                      <span style={{ fontSize: 12, color: "#8b8279" }}>
                        {a.unitsAllocated} units
                        {a.revenueShareInr != null ? ` · ₹${a.revenueShareInr.toLocaleString("en-IN")}` : ""}
                        {a.distanceKm != null ? ` · ${a.distanceKm} km` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          </div>
        </div>

        {/* ============ VOICE CATALOGING ============ */}
        <div className="workspace-card" style={{ marginTop: 20 }}>
          <div className="card-top">
            <div className="step-number">3</div>
            <div>
              <h3>Voice Cataloging</h3>
              <p>Describe the piece out loud, in Hindi or English. We'll transcribe it and draft a bilingual listing.</p>
            </div>
          </div>

          {!audioDataUrl && (
            <div className="record-area">
              <button
                type="button"
                className="record-button"
                onClick={isRecording ? stopRecording : startRecording}
                style={
                  isRecording
                    ? { borderColor: "#c0392b", background: "#fdecea" }
                    : undefined
                }
              >
                <div className="record-button-inner">
                  <span className="mic-icon">{isRecording ? "⏹" : "🎙"}</span>
                </div>
              </button>
              <div className="record-status">
                <strong>{isRecording ? "Recording... tap to stop" : "Tap to start recording"}</strong>
                <span>
                  {isRecording
                    ? "Speak clearly about the piece — material, technique, price idea."
                    : "Describe the piece out loud, in Hindi or English."}
                </span>
              </div>
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

                {voiceResult.hindi && (
                  <div style={{ flex: "1 1 260px" }}>
                    <p className="result-label" style={{ marginBottom: 8 }}>
                      हिन्दी
                    </p>
                    <h3 style={{ margin: "0 0 10px", fontSize: 18 }}>{voiceResult.hindi.title}</h3>
                    <p style={{ fontSize: 13, color: "#6f665f", lineHeight: 1.7, marginBottom: 10 }}>
                      {voiceResult.hindi.description}
                    </p>
                    {voiceResult.hindi.tags?.length > 0 && (
                      <div className="listing-tags">
                        {voiceResult.hindi.tags.map((t, i) => (
                          <span key={i}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="voice-footer">Kaarigar · Built for SIH26090</div>
      </div>
    </div>
  );
};

export default VoicePanel;

import React, { useState } from "react";
import officialCertAsset from "../assets/official_kaarigar_certificate.png";
import "./ProductDetailModal.css";

const ProductDetailModal = ({
  product,
  user,
  onClose,
  onAddToBag,
  askQuestion,
  setAskQuestion,
  askAnswer,
  askLoading,
  askError,
  onAskQuestion
}) => {
  const [activeTab, setActiveTab] = useState("photo"); // photo | certificate | cluster | qr
  const [quantity, setQuantity] = useState(1);
  const [modalLang, setModalLang] = useState("en");

  if (!product) return null;

  const buyerName = user?.username || user?.email?.split("@")[0] || "Authorised Buyer";
  const blockchainHash = `0x${(product.id * 18492047 + 94827104).toString(16).toUpperCase()}78F1`;

  const handleDownloadCertificate = () => {
    window.print();
  };

  return (
    <div className="pdm-overlay" onClick={onClose}>
      <div className="pdm-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pdm-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="pdm-layout-grid">
          {/* ============ LEFT COLUMN: THUMBNAILS & MAIN GALLERY VIEW (FLIPKART STYLE) ============ */}
          <div className="pdm-gallery-container">
            {/* Main Preview Screen */}
            <div className="pdm-main-preview">
              {activeTab === "photo" && (
                product.image_data_url ? (
                  <img src={product.image_data_url} alt={product.title} className="pdm-main-img" />
                ) : (
                  <div className="pdm-img-placeholder">
                    <span>🎨 Handcrafted Masterpiece</span>
                  </div>
                )
              )}

              {activeTab === "certificate" && (
                <div className="pdm-certificate-card" style={{ padding: 0, overflow: "hidden", background: "none", border: "none" }}>
                  <div style={{ background: "#78350f", color: "#fef3c7", padding: "6px 12px", borderRadius: "6px 6px 0 0", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                    📜 Official Certificate Preview (Unlocks in 'My Orders' when status is SHIPPED)
                  </div>
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <img
                      src={officialCertAsset}
                      alt="Official Authorised Buyer Certificate"
                      style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "0 0 8px 8px", display: "block" }}
                    />
                  </div>
                  <div className="cert-physical-notice" style={{ marginTop: 8 }}>
                    📦 <strong>Physical Hardcopy Certificate</strong> included with package delivery!
                  </div>
                </div>
              )}

              {activeTab === "cluster" && (
                <div className="pdm-cluster-view">
                  <span className="pdm-view-badge">🛡️ GI-Tag Certified Artisan Cluster</span>
                  <div className="pdm-artisan-avatar">
                    {product.artisan_username ? product.artisan_username[0].toUpperCase() : "A"}
                  </div>
                  <h3>Master Artisan: {product.artisan_username || "Verified Kaarigar"}</h3>
                  <p className="pdm-cluster-location">📍 Raghurajpur Craft Heritage Cluster, Odisha</p>

                  <div className="pdm-cluster-highlights">
                    <div className="highlight-item">
                      <span>✓ GI-Tag Registered</span>
                      <strong>Certified Genuine</strong>
                    </div>
                    <div className="highlight-item">
                      <span>🌱 Eco Material</span>
                      <strong>100% Organic Dyes</strong>
                    </div>
                    <div className="highlight-item">
                      <span>⏳ Handcraft Time</span>
                      <strong>14 Days Dedicated Work</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "qr" && (
                <div className="pdm-qr-view">
                  <span className="pdm-view-badge">📜 Blockchain Authenticity Passport</span>
                  
                  <div className="pdm-qr-box">
                    <svg viewBox="0 0 100 100" width="140" height="140">
                      <path d="M0,0 h100 v100 h-100 z" fill="#fff"/>
                      <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M20,20 h10 v10 h-10 z" fill="#2b251e"/>
                      <path d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M70,20 h10 v10 h-10 z" fill="#2b251e"/>
                      <path d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M20,70 h10 v10 h-10 z" fill="#2b251e"/>
                      <path d="M50,10 h5 v10 h-5 z M45,25 h15 v5 h-15 z M50,40 h10 v10 h-10 z" fill="#b45309"/>
                      <path d="M50,60 h20 v5 h-20 z M75,50 h15 v15 h-15 z M60,75 h30 v15 h-30 z" fill="#b45309"/>
                    </svg>
                  </div>

                  <div className="pdm-blockchain-hash">
                    <span>Block Hash:</span>
                    <code>{blockchainHash}</code>
                  </div>
                  <p style={{ fontSize: 12, color: "#786c5e" }}>
                    Scan QR code with smartphone to verify digital ownership on Hyperledger ledger.
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail Selector Bar (Flipkart Style) */}
            <div className="pdm-thumbnail-list">
              <button
                type="button"
                className={`pdm-thumb-btn ${activeTab === "photo" ? "active" : ""}`}
                onClick={() => setActiveTab("photo")}
              >
                {product.image_data_url ? (
                  <img src={product.image_data_url} alt="Photo" />
                ) : (
                  <span>🎨</span>
                )}
                <span>1. Craft Image</span>
              </button>

              <button
                type="button"
                className={`pdm-thumb-btn ${activeTab === "certificate" ? "active" : ""}`}
                onClick={() => setActiveTab("certificate")}
              >
                <span style={{ fontSize: 18 }}>📜</span>
                <span>2. Official Certificate</span>
              </button>

              <button
                type="button"
                className={`pdm-thumb-btn ${activeTab === "cluster" ? "active" : ""}`}
                onClick={() => setActiveTab("cluster")}
              >
                <span style={{ fontSize: 18 }}>🛡️</span>
                <span>3. GI Cluster</span>
              </button>

              <button
                type="button"
                className={`pdm-thumb-btn ${activeTab === "qr" ? "active" : ""}`}
                onClick={() => setActiveTab("qr")}
              >
                <span style={{ fontSize: 18 }}>🔗</span>
                <span>4. Blockchain QR</span>
              </button>
            </div>
          </div>

          {/* ============ RIGHT COLUMN: PRODUCT INFO & BUYING ACTIONS ============ */}
          <div className="pdm-details-container">
            {/* Language Selector */}
            <div className="pdm-lang-bar">
              <button
                type="button"
                className={`pdm-lang-chip ${modalLang === "en" ? "active" : ""}`}
                onClick={() => setModalLang("en")}
              >
                English
              </button>
              {product.title_hi && (
                <button
                  type="button"
                  className={`pdm-lang-chip ${modalLang === "hi" ? "active" : ""}`}
                  onClick={() => setModalLang("hi")}
                >
                  हिंदी
                </button>
              )}
            </div>

            <h1 className="pdm-title">
              {modalLang === "hi" && product.title_hi ? product.title_hi : product.title}
            </h1>

            <div className="pdm-meta-row">
              <span className="pdm-artisan-tag">
                Crafted by <strong>{product.artisan_username || "Master Artisan"}</strong>
              </span>
              {product.artisan_is_verified && (
                <span className="pdm-verified-badge">✓ Verified Artisan</span>
              )}
              {product.category && <span className="pdm-cat-badge">🏷️ {product.category}</span>}
            </div>

            <div className="pdm-price-box">
              <span className="pdm-price-amount">
                {product.price_min_inr
                  ? `₹${product.price_min_inr.toLocaleString("en-IN")}${
                      product.price_max_inr && product.price_max_inr !== product.price_min_inr
                        ? ` - ₹${product.price_max_inr.toLocaleString("en-IN")}`
                        : ""
                    }`
                  : "Price on request"}
              </span>
              <span className="pdm-payout-chip">💯 100% Direct to Artisan Bank Account</span>
            </div>

            <p className="pdm-description">
              {modalLang === "hi" && product.description_hi ? product.description_hi : product.description}
            </p>

            {/* Quantity Selector */}
            <div className="pdm-qty-block">
              <label>Select Quantity:</label>
              <div className="pdm-qty-controls">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            {/* Main CTA Buttons */}
            <div className="pdm-cta-group">
              <button
                type="button"
                className="pdm-add-bag-btn"
                onClick={() => {
                  if (onAddToBag) onAddToBag(product, quantity);
                  onClose();
                }}
              >
                🛍️ Add to Collection Bag ({quantity})
              </button>

              <button
                type="button"
                className="pdm-certificate-btn"
                onClick={() => setActiveTab("certificate")}
              >
                📜 View Authorised Buyer Certificate
              </button>
            </div>

            {/* Ask the Artisan AI Component */}
            {onAskQuestion && (
              <div className="pdm-ask-artisan-section">
                <h4>💬 ASK THE ARTISAN (AI ASSISTANT)</h4>
                <form onSubmit={onAskQuestion} className="pdm-ask-form">
                  <input
                    type="text"
                    placeholder="e.g. Is this made with natural organic dye?"
                    value={askQuestion}
                    onChange={(e) => setAskQuestion(e.target.value)}
                    className="pdm-ask-input"
                  />
                  <button type="submit" className="pdm-ask-btn" disabled={askLoading || !askQuestion?.trim()}>
                    {askLoading ? "Asking..." : "Ask"}
                  </button>
                </form>

                {askError && <p className="pdm-ask-error">{askError}</p>}
                {askAnswer && (
                  <div className="pdm-ask-answer">
                    <strong>Artisan Answer:</strong>
                    <p>{askAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

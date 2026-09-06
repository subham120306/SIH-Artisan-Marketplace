import React, { useState } from "react";
import { createPortal } from "react-dom";
import "./Footer.css";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setToastMsg("✨ Thank you for subscribing! You will receive exclusive artisan drops & story updates.");
    setEmail("");
    setTimeout(() => setToastMsg(""), 5000);
  };

  const handleScrollToGrid = (e) => {
    e.preventDefault();
    const gridEl = document.querySelector(".workspace-card") || document.querySelector(".product-grid");
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const closeModal = () => setActiveModal(null);

  const modalContents = {
    track: {
      title: "📍 Track Your Artisan Order",
      subtitle: "Real-time fulfillment tracking from rural artisan clusters directly to your doorstep.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13, color: "#524a41" }}>
            Enter your 8-digit Order Reference ID or registered phone number to view live courier status & dispatch updates:
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="e.g. KRG-9082-2026"
              className="newsletter-input"
              style={{ border: "1px solid #d9cbaf", padding: "10px 14px", borderRadius: 8 }}
            />
            <button
              type="button"
              className="create-listing-button"
              style={{ background: "#b45309", borderColor: "#78350f" }}
              onClick={() => {
                alert("✓ Order Status: In Transit from Odisha Craft Cooperative. Estimated Delivery: 2-3 Days.");
              }}
            >
              Search
            </button>
          </div>
          <div style={{ background: "#faf8f5", padding: 12, borderRadius: 8, border: "1px solid #e5dec9", fontSize: 12 }}>
            <strong>Recent Dispatch:</strong> Order #KRG-8802 (Sambalpuri Handloom) — Handed over to BlueDart Express.
          </div>
        </div>
      ),
    },
    delivery: {
      title: "📦 Delivery & Artisan Returns",
      subtitle: "Direct cluster shipping, handcrafted protection, and buyer peace-of-mind.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#524a41" }}>
          <div>
            <strong style={{ color: "#1c1815", display: "block" }}>🚚 Direct Cluster Dispatch</strong>
            Every piece is carefully packaged by local artisan SHGs using eco-friendly jute and reusable wooden crates within 24–48 hours of order confirmation.
          </div>
          <div>
            <strong style={{ color: "#1c1815", display: "block" }}>🛡️ 7-Day Handcrafted Guarantee</strong>
            If your hand art arrives damaged or fails to match the authentic craft specifications, enjoy 100% free returns with direct replacement from the master artisan.
          </div>
          <div>
            <strong style={{ color: "#1c1815", display: "block" }}>🌐 Pan-India & Global Delivery</strong>
            Integrated with major logistics partners (India Post, BlueDart, Delhivery) for seamless rural-to-urban delivery tracking.
          </div>
        </div>
      ),
    },
    cooperative: {
      title: "🌾 Rural Cluster Cooperatives",
      subtitle: "Empowering 50+ regional artisan cooperatives and Self-Help Groups (SHGs).",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#524a41" }}>
          <p>
            Kaarigar works directly with artisan micro-cooperatives across Odisha, Bihar, Rajasthan, West Bengal, and Jammu & Kashmir.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "#faf8f5", padding: 10, borderRadius: 8, border: "1px solid #e5dec9" }}>
              <strong style={{ color: "#b45309" }}>Madhubani SHG</strong>
              <span style={{ display: "block", fontSize: 11, color: "#695e52" }}>Mithila, Bihar (42 Master Painters)</span>
            </div>
            <div style={{ background: "#faf8f5", padding: 10, borderRadius: 8, border: "1px solid #e5dec9" }}>
              <strong style={{ color: "#b45309" }}>Raghurajpur Pattachitra</strong>
              <span style={{ display: "block", fontSize: 11, color: "#695e52" }}>Puri, Odisha (65 Master Artists)</span>
            </div>
            <div style={{ background: "#faf8f5", padding: 10, borderRadius: 8, border: "1px solid #e5dec9" }}>
              <strong style={{ color: "#b45309" }}>Warli Tribal Collective</strong>
              <span style={{ display: "block", fontSize: 11, color: "#695e52" }}>Palghar, Maharashtra (30 Weavers)</span>
            </div>
            <div style={{ background: "#faf8f5", padding: 10, borderRadius: 8, border: "1px solid #e5dec9" }}>
              <strong style={{ color: "#b45309" }}>Gond Folk Art Guild</strong>
              <span style={{ display: "block", fontSize: 11, color: "#695e52" }}>Dindori, MP (28 Folk Artisans)</span>
            </div>
          </div>
        </div>
      ),
    },
    trust: {
      title: "🛡️ Trust Badge Verification",
      subtitle: "100% direct artisan revenue, zero middlemen commissions, and authentic GI verification.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#524a41" }}>
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: 12, borderRadius: 8 }}>
            <strong style={{ color: "#065f46" }}>💯 Zero Platform Commission Guarantee</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#047857" }}>
              Unlike commercial marketplaces charging 25–40% commission, 100% of your order value goes directly to the master artisan's bank account.
            </p>
          </div>
          <div>
            <strong style={{ color: "#1c1815" }}>🏷️ Geographical Indication (GI) Verified</strong>
            <p style={{ margin: "2px 0 0" }}>
              Every product listing features digital verification tags confirming authentic traditional technique and village cluster origin.
            </p>
          </div>
        </div>
      ),
    },
    catalog: {
      title: "🎙️ AI Voice & Photo Cataloging",
      subtitle: "Empowering rural craftspeople who cannot type in English to publish catalog listings in seconds.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#524a41" }}>
          <p>
            Our multilingual AI Voice Assistant allows master artisans to simply speak in their native tongue (Hindi, Odia, Bengali, Tamil, etc.) while snapping a photo of their artwork.
          </p>
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", padding: 12, borderRadius: 8 }}>
            <strong style={{ color: "#92400e" }}>Instant AI Processing pipeline:</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12, color: "#78350f" }}>
              <li>Auto-generates English & Hindi titles & descriptions</li>
              <li>Calculates fair pricing based on material & labor hours</li>
              <li>Publishes listings to global buyers automatically</li>
            </ul>
          </div>
        </div>
      ),
    },
    about: {
      title: "🏛️ Our Mission — Kaarigar SIH 2026",
      subtitle: "Preserving India's 5,000-year heritage of hand arts while ensuring economic dignity.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#524a41" }}>
          <p>
            Developed for Smart India Hackathon 2026, Kaarigar bridges the digital divide for marginalized rural artisans across India. By eliminating exploitation from middlemen traders, we restore fair earnings directly to original creators.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ flex: 1, textCenter: "center", background: "#faf8f5", padding: 12, borderRadius: 8, border: "1px solid #e5dec9" }}>
              <h3 style={{ margin: 0, color: "#b45309", fontSize: 20 }}>15+</h3>
              <span style={{ fontSize: 11 }}>Hand Art Forms</span>
            </div>
            <div style={{ flex: 1, textCenter: "center", background: "#faf8f5", padding: 12, borderRadius: 8, border: "1px solid #e5dec9" }}>
              <h3 style={{ margin: 0, color: "#2f6f4f", fontSize: 20 }}>100%</h3>
              <span style={{ fontSize: 11 }}>Direct Earnings</span>
            </div>
            <div style={{ flex: 1, textCenter: "center", background: "#faf8f5", padding: 12, borderRadius: 8, border: "1px solid #e5dec9" }}>
              <h3 style={{ margin: 0, color: "#1c1815", fontSize: 20 }}>0%</h3>
              <span style={{ fontSize: 11 }}>Platform Fee</span>
            </div>
          </div>
        </div>
      ),
    },
    artisans: {
      title: "🎨 Master Artisan Heritage Stories",
      subtitle: "Meet the traditional custodians keeping ancient Indian art forms alive.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#524a41" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#faf8f5", padding: 10, borderRadius: 8, border: "1px solid #e5dec9" }}>
            <span style={{ fontSize: 24 }}>🖌️</span>
            <div>
              <strong style={{ color: "#1c1815" }}>Shri Sitaram Devi (Madhubani Painter)</strong>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#695e52" }}>
                3rd generation Mithila artist preserving natural dye recipes passed down over 120 years.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#faf8f5", padding: 10, borderRadius: 8, border: "1px solid #e5dec9" }}>
            <span style={{ fontSize: 24 }}>🏺</span>
            <div>
              <strong style={{ color: "#1c1815" }}>Ramdas Kumhar (Terracotta Artisan)</strong>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#695e52" }}>
                Master potter shaping ritual clay lamps and terracotta sculptures in Bankura, West Bengal.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    terms: {
      title: "📄 Terms of Use",
      subtitle: "Transparent terms governing transactions on the Kaarigar Regalia Artisan Marketplace.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "#524a41", maxHeight: 260, overflowY: "auto" }}>
          <p><strong>1. Authentic Handcrafted Declaration:</strong> All items listed must be genuinely handcrafted by verified Indian artisans or cooperative members.</p>
          <p><strong>2. Direct Payments:</strong> Buyer payments are escrow-secured and released directly to artisans upon order confirmation.</p>
          <p><strong>3. Intellectual Property:</strong> Master artisans retain full copyright and cultural authorship of all original artwork designs.</p>
        </div>
      ),
    },
    privacy: {
      title: "🔒 Privacy Policy & Data Security",
      subtitle: "Your personal information and payment transactions are strictly encrypted and protected.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "#524a41", maxHeight: 260, overflowY: "auto" }}>
          <p><strong>1. Data Protection:</strong> Kaarigar never sells or shares buyer or artisan personal data to third-party advertisers.</p>
          <p><strong>2. Secure Transactions:</strong> Payments processed using SSL encryption via RuPay, UPI, Visa, and Mastercard portals.</p>
          <p><strong>3. Voice Data Privacy:</strong> Voice recordings captured during AI cataloging are processed solely for listing translation.</p>
        </div>
      ),
    },
  };

  return (
    <footer className="regalia-footer">
      {/* Toast Banner */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1c1815",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            zIndex: 99999,
            border: "1px solid #b45309",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {toastMsg}
        </div>
      )}

      <div className="regalia-footer-container">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <img
              src="/logo.png"
              alt="Kaarigar — Crafting Imagination, Creating Art"
              style={{
                maxHeight: 84,
                maxWidth: 230,
                objectFit: "contain",
                marginBottom: 12,
                borderRadius: 10,
                background: "#ffffff",
                padding: "8px 12px",
                border: "1px solid #d4cbb8",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
              }}
            />
          </div>
          <p className="footer-tagline">
            Connecting traditional Indian master craftspeople directly with buyers. Preserving heritage, empowering communities.
          </p>
          <form onSubmit={handleSubscribe} className="newsletter-box">
            <input
              type="email"
              placeholder="Enter Your Email Address..."
              className="newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn" aria-label="Subscribe">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
          <span className="newsletter-note">We honour your privacy. No spam ever.</span>
        </div>

        {/* Useful Links */}
        <div className="footer-col">
          <h4>Useful Links</h4>
          <ul>
            <li>
              <a href="#track" onClick={(e) => { e.preventDefault(); setActiveModal("track"); }}>
                Track Order
              </a>
            </li>
            <li>
              <a href="#delivery" onClick={(e) => { e.preventDefault(); setActiveModal("delivery"); }}>
                Delivery & Returns
              </a>
            </li>
            <li>
              <a href="#cooperative" onClick={(e) => { e.preventDefault(); setActiveModal("cooperative"); }}>
                Cluster Cooperatives
              </a>
            </li>
            <li>
              <a href="#trust" onClick={(e) => { e.preventDefault(); setActiveModal("trust"); }}>
                Trust Badge Verification
              </a>
            </li>
            <li>
              <a href="#catalog" onClick={(e) => { e.preventDefault(); setActiveModal("catalog"); }}>
                AI Voice Cataloging
              </a>
            </li>
          </ul>
        </div>

        {/* About Kaarigar */}
        <div className="footer-col">
          <h4>About Kaarigar</h4>
          <ul>
            <li>
              <a href="#about" onClick={(e) => { e.preventDefault(); setActiveModal("about"); }}>
                Our Mission
              </a>
            </li>
            <li>
              <a href="#artisans" onClick={(e) => { e.preventDefault(); setActiveModal("artisans"); }}>
                Artisan Stories
              </a>
            </li>
            <li>
              <a href="#gallery" onClick={handleScrollToGrid}>
                Craft Exhibition
              </a>
            </li>
            <li>
              <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveModal("terms"); }}>
                Terms of Use
              </a>
            </li>
            <li>
              <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveModal("privacy"); }}>
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div className="footer-col contact-col">
          <h4>Social & Contact</h4>
          <a
            href="https://maps.google.com/?q=Odisha,+India"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <span className="icon">📍</span>
            <span>ArtisanX Hub, Odisha, India</span>
          </a>
          <a
            href="tel:+919040276663"
            className="contact-item"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <span className="icon">📞</span>
            <span>+91 9040276663</span>
          </a>
          <a
            href="mailto:support@kaarigar.com"
            className="contact-item"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <span className="icon">✉️</span>
            <span>support@kaarigar.com</span>
          </a>
          <div className="social-links">
            <a
              href="#instagram"
              onClick={(e) => {
                e.preventDefault();
                setToastMsg("📸 Opening @KaarigarArtisans Instagram");
                setTimeout(() => setToastMsg(""), 3000);
              }}
            >
              Instagram
            </a>
            <a
              href="#twitter"
              onClick={(e) => {
                e.preventDefault();
                setToastMsg("🐦 Opening @KaarigarArtisans Twitter");
                setTimeout(() => setToastMsg(""), 3000);
              }}
            >
              Twitter
            </a>
            <a
              href="#facebook"
              onClick={(e) => {
                e.preventDefault();
                setToastMsg("📘 Opening @KaarigarArtisans Facebook");
                setTimeout(() => setToastMsg(""), 3000);
              }}
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="regalia-footer-bottom">
        <div className="bottom-container">
          <div className="payment-badges">
            <span className="pay-chip" style={{ background: "#2f6f4f", color: "#ffffff", fontWeight: 700, padding: "6px 14px", borderRadius: 8 }}>
              💵 Cash on Delivery (COD)
            </span>
          </div>
          <p className="copyright-text">
            © 2026 Kaarigar Artisan Marketplace — Developed by <strong>Team ArtisanX (Odisha)</strong>. Built for Smart India Hackathon. All rights reserved.
          </p>
        </div>
      </div>

      {/* ============ FOOTER INFORMATION MODAL PORTAL ============ */}
      {activeModal && modalContents[activeModal] && createPortal(
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeModal}>
              ×
            </button>

            <h2 className="modal-title" style={{ fontSize: 20, color: "#1c1815", marginBottom: 4 }}>
              {modalContents[activeModal].title}
            </h2>
            <p style={{ fontSize: 13, color: "#695e52", margin: "0 0 18px", lineHeight: 1.5 }}>
              {modalContents[activeModal].subtitle}
            </p>

            {modalContents[activeModal].body}

            <div style={{ marginTop: 22, textAlign: "right" }}>
              <button
                type="button"
                className="upload-button"
                style={{ background: "#2b251e", color: "#ffffff", borderColor: "#1c1815" }}
                onClick={closeModal}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </footer>
  );
};

export default Footer;

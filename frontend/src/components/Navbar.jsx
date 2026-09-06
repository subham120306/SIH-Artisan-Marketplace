import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import AddProductModal from "./AddProductModal";
import SupportModal from "./SupportModal";
import "./Navbar.css";

const Navbar = ({ activeTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const handleOpenChatbot = () => {
    window.dispatchEvent(new CustomEvent("open-support-widget"));
  };

  return (
    <header className="regalia-header">
      {/* Upper Line Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <span>✦ SMART INDIA HACKATHON 2026 EDITION — DIRECT FROM INDIAN ARTISAN CLUSTERS ✦</span>
          <button
            type="button"
            className="topbar-support-btn"
            onClick={() => setIsSupportModalOpen(true)}
            title="Click to open Support & Feedback"
          >
            💬 24/7 Support Helpline: <strong>+91 9040276663</strong>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="regalia-navbar">
        <div className="nav-left">
          <Link to="/" className="brand-link" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img
              src="/logo.png"
              alt="Kaarigar — Crafting Imagination, Creating Art"
              style={{
                height: 48,
                objectFit: "contain",
                background: "#ffffff",
                borderRadius: 8,
                padding: "4px 8px",
                border: "1px solid #d4cbb8"
              }}
            />
          </Link>

          <div className="nav-links">
            <Link to="/" className={`nav-item ${activeTab === "home" ? "active" : ""}`}>
              Home
            </Link>
            <Link to="/gallery" className={`nav-item ${activeTab === "gallery" ? "active" : ""}`}>
              Craft Gallery
            </Link>
          </div>
        </div>

        <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Green Square Add Product Button (Show ONLY for Artisans or Guest visitors, hide for Buyers) */}
          {(!user || user.role === "artisan") && (
            <button
              type="button"
              className="green-add-product-btn"
              onClick={() => setIsModalOpen(true)}
              title="Click to list a new product"
            >
              ➕ Add Product
            </button>
          )}

          {/* Clean Navbar Support Button */}
          <button
            type="button"
            className="nav-chatbot-btn"
            onClick={() => setIsSupportModalOpen(true)}
            title="Open Customer Support & 5-Star Feedback"
          >
            🎧 Support
          </button>

          <LanguageSwitcher />

          {user ? (
            <div className="user-profile-menu">
              <span className="user-role-badge">
                {user.role === "artisan" ? "🎨 Artisan" : "📦 Buyer"}
              </span>
              <span className="username-tag">{user.username}</span>
              <button type="button" className="nav-logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-nav-btns">
              <button type="button" className="nav-login-btn" onClick={() => navigate("/login")}>
                Sign In
              </button>
              <button type="button" className="nav-reg-btn" onClick={() => navigate("/register")}>
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Add Product Form Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Support & Feedback Small Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onOpenChatbot={handleOpenChatbot}
      />
    </header>
  );
};

export default Navbar;

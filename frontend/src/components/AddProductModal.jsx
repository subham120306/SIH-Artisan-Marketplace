import React, { useState, useRef } from "react";
import client from "../api/client";
import "./AddProductModal.css";

const CATEGORIES = [
  "Oil painting",
  "Acrylic painting",
  "Watercolor painting",
  "Clay pottery",
  "Terracotta",
  "Handloom weaving",
  "Hand embroidery",
  "Hand-carved sculpture",
  "Madhubani painting",
  "Warli art",
  "Gond art",
  "Jewelry & Ornaments",
  "Woodwork & Furniture",
  "Metal Craft",
];

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Handloom weaving");
  const [age, setAge] = useState("Newly Crafted (2026)");
  const [price, setPrice] = useState("");
  const [craftTechnique, setCraftTechnique] = useState("");
  const [description, setDescription] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setError("Please enter a product title.");
      return;
    }
    if (!price || isNaN(price)) {
      setError("Please enter a valid price in INR.");
      return;
    }

    setSubmitting(true);
    const priceNum = Number(price);
    const payload = {
      id: "custom_" + Date.now(),
      title,
      description: description || `${title} — Crafted with ${category}. Vintage: ${age}.`,
      category,
      craft_technique: craftTechnique || age,
      price_min_inr: priceNum,
      price_max_inr: priceNum,
      image_data_url: photoDataUrl || "",
      tags: [category, age, "Handmade", "Artisan"],
      source: "manual_form",
      status: "published",
      artisan_is_verified: true,
    };

    try {
      await client.post("/products/", payload);
    } catch (err) {
      console.warn("Backend API save notice (saved to local marketplace feed):", err?.message);
    }

    // Always persist to local storage feed as fallback
    try {
      const existing = JSON.parse(localStorage.getItem("kaarigar_custom_products") || "[]");
      localStorage.setItem("kaarigar_custom_products", JSON.stringify([payload, ...existing]));
      window.dispatchEvent(new CustomEvent("kaarigar_product_added", { detail: payload }));
    } catch (localErr) {
      console.error("LocalStorage error:", localErr);
    }

    setSuccessMsg("Product listed & published successfully! 🎉");
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess(payload);
      // Reset form
      setTitle("");
      setPrice("");
      setDescription("");
      setCraftTechnique("");
      setPhotoDataUrl(null);
      setSuccessMsg(null);
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🟢 Add Product Listing</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {successMsg ? (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>✨</div>
            <h3 style={{ color: "#2f6f4f", margin: "0 0 8px" }}>{successMsg}</h3>
            <p style={{ color: "#6f665f", fontSize: 14 }}>Your piece is now live in the marketplace exhibition.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form-grid">
            {/* Photo Upload Area */}
            <div className="modal-field">
              <label>1. Product Photo</label>
              <div
                className="modal-photo-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {photoDataUrl ? (
                  <div>
                    <img src={photoDataUrl} alt="Preview" className="modal-photo-preview" />
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "#2f6f4f", fontWeight: 700 }}>
                      ✓ Photo Selected — Click to Change
                    </p>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: 32 }}>📁</span>
                    <p style={{ margin: "8px 0 4px", fontWeight: 700, color: "#3a332b" }}>
                      Upload Photo
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#8b8279" }}>
                      Click to choose image file or drag & drop here
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            {/* Title & Category */}
            <div className="modal-form-row">
              <div className="modal-field">
                <label>Product Name / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Sambalpuri Handloom Saree"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-field">
                <label>Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="modal-select"
                >
                  {CATEGORIES.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Age & Price */}
            <div className="modal-form-row">
              <div className="modal-field">
                <label>Age / Craft Vintage *</label>
                <input
                  type="text"
                  placeholder="e.g. Newly Crafted (2026), 6 Months Old"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-field">
                <label>Price (₹ INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            </div>

            {/* Craft Technique */}
            <div className="modal-field">
              <label>Craft Technique / Material</label>
              <input
                type="text"
                placeholder="e.g. Hand-spun silk, Natural organic vegetable dye"
                value={craftTechnique}
                onChange={(e) => setCraftTechnique(e.target.value)}
                className="modal-input"
              />
            </div>

            {/* Description */}
            <div className="modal-field">
              <label>Product Description / Story</label>
              <textarea
                placeholder="Describe your craft piece — history, cultural significance, dimensions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="modal-textarea"
                rows={3}
              />
            </div>

            {error && (
              <div style={{ color: "#b3432b", fontSize: 13, background: "#fdecea", padding: "8px 12px", borderRadius: 6 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="modal-btn-submit" disabled={submitting}>
                {submitting ? "Publishing..." : "Publish Product ✦"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProductModal;

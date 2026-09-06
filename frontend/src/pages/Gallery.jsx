import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import ProductDetailModal from "../components/ProductDetailModal";
import "../components/VoicePanel.css";

const Gallery = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [caption, setCaption] = useState("");
  const [craftType, setCraftType] = useState("");
  const [mediaType, setMediaType] = useState("photo");
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const loadGallery = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.get("/gallery/");
      setItems(data);
    } catch (err) {
      setError("Could not load the exhibition gallery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaType(file.type.startsWith("video") ? "video" : "photo");
    const reader = new FileReader();
    reader.onload = () => setFileDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (!fileDataUrl) {
      setUploadError("Please choose a photo or video first.");
      return;
    }

    setUploading(true);
    try {
      await client.post("/gallery/", {
        media_type: mediaType,
        media_data_url: fileDataUrl,
        caption,
        craft_type: craftType,
      });
      setCaption("");
      setCraftType("");
      setFileDataUrl(null);
      loadGallery();
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="voice-panel-page">
      <Navbar activeTab="gallery" />

      {/* Regalia Hero Exhibition Header Banner */}
      <div className="regalia-hero-banner">
        <h1>EXHIBITION CRAFT GALLERY</h1>
        <div className="regalia-breadcrumb">
          Home <span>/</span> Craft Exhibition <span>/</span> Artisan Stories & Media
        </div>
      </div>

      <div className="regalia-container">
        <div className="regalia-layout">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Gallery Content */}
          <main className="regalia-workspace">
            {user?.role === "artisan" && (
              <div className="workspace-card" style={{ marginBottom: 28 }}>
                <div className="card-top">
                  <div className="step-number">✦</div>
                  <div>
                    <h3>Share Your Craft Story</h3>
                    <p>Upload high-resolution photos or behind-the-scenes videos of your crafting process.</p>
                  </div>
                </div>

                <form onSubmit={handleUpload}>
                  <div className="photo-empty" style={{ marginBottom: 16 }}>
                    {fileDataUrl ? (
                      mediaType === "video" ? (
                        <video src={fileDataUrl} controls style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8 }} />
                      ) : (
                        <img src={fileDataUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8 }} />
                      )
                    ) : (
                      <>
                        <div className="camera-large-icon">📸</div>
                        <h4>Select Craft Photo or Video</h4>
                        <p>PNG, JPG, MP4 supported</p>
                      </>
                    )}
                    
                    <label className="upload-button" style={{ marginTop: 12, cursor: "pointer", display: "inline-flex" }}>
                      <span>{fileDataUrl ? "Change File" : "Choose File..."}</span>
                      <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: "none" }} />
                    </label>
                  </div>

                  <div className="field-block" style={{ marginBottom: 12 }}>
                    <label className="field-block-label">Craft Category / Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Terracotta, Sambalpuri Handloom, Woodcarving"
                      value={craftType}
                      onChange={(e) => setCraftType(e.target.value)}
                      className="sidebar-search-input"
                    />
                  </div>

                  <div className="field-block" style={{ marginBottom: 16 }}>
                    <label className="field-block-label">Story Caption</label>
                    <textarea
                      placeholder="Share the history, technique, or cultural significance of this piece..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="sidebar-search-input"
                      rows={3}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {uploadError && (
                    <div className="error-box" style={{ marginBottom: 14 }}>
                      <div className="error-icon">!</div>
                      <div>
                        <strong>Upload Error</strong>
                        <p>{uploadError}</p>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="regalia-btn-primary" disabled={uploading}>
                    {uploading ? "Publishing Piece..." : "Publish to Gallery"}
                  </button>
                </form>
              </div>
            )}

            {/* Gallery Exhibition Grid */}
            <h2 className="widget-title" style={{ fontSize: 22, marginBottom: 20 }}>
              CURATED ARTISAN EXHIBITION
            </h2>

            {loading && <p>Loading curated gallery pieces...</p>}
            {error && (
              <div className="error-box">
                <div className="error-icon">!</div>
                <div>
                  <strong>Gallery Error</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="regalia-card-grid">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="workspace-card"
                  style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
                  onClick={() => setSelectedItem({
                    id: item.id,
                    title: item.caption || item.craft_type || "Artisan Masterpiece",
                    description: item.caption || "Authentic handcrafted masterpiece.",
                    image_data_url: item.media_data_url,
                    artisan_username: item.artisan_username || "Verified Kaarigar",
                    category: item.craft_type || "Handicraft",
                    price_min_inr: 2500,
                    artisan_is_verified: true,
                  })}
                >
                  {item.media_type === "video" ? (
                    <video src={item.media_data_url} controls style={{ width: "100%", height: 240, objectFit: "cover" }} />
                  ) : (
                    <img
                      src={item.media_data_url}
                      alt={item.caption}
                      style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
                    />
                  )}
                  <div style={{ padding: 20 }}>
                    <span className="regalia-tag-pill">{item.craft_type || "Handicraft"}</span>
                    <h3 style={{ fontFamily: "'Petrona', serif", fontSize: 18, marginTop: 10, marginBottom: 8 }}>
                      {item.caption || "Artisan Masterpiece"}
                    </h3>
                    <p style={{ fontSize: 12, color: "#8c7f70", margin: 0 }}>
                      Crafted by <strong>{item.artisan_username}</strong>
                    </p>
                    <div style={{ marginTop: 10, fontSize: 11, color: "#b45309", fontWeight: 700 }}>
                      📜 Click to View Authorised Certificate & Details →
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!loading && items.length === 0 && (
              <p style={{ color: "#8c7f70" }}>No exhibition pieces uploaded yet. Be the first artisan to publish!</p>
            )}

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

      {selectedItem && createPortal(
        <ProductDetailModal
          product={selectedItem}
          user={user}
          onClose={() => setSelectedItem(null)}
          onAddToBag={() => alert(`Added "${selectedItem.title}" to Collection Bag!`)}
        />,
        document.body
      )}
    </div>
  );
};

export default Gallery;
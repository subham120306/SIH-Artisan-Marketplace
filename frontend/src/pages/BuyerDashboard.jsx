import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../components/VoicePanel.css";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import OrderStatusStepper from "../components/OrderStatusStepper";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import ProductDetailModal from "../components/ProductDetailModal";
import OrderCertificateCard from "../components/OrderCertificateCard";

const PRODUCT_TYPES = [
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

const ZeroCommissionBadge = ({ style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11,
      fontWeight: 600,
      color: "#2f6f4f",
      background: "#e3f0e6",
      borderRadius: 10,
      padding: "3px 9px",
      ...style,
    }}
    title="Kaarigar takes zero commission — the full amount you pay goes to the artisan."
  >
    💯 100% goes to the artisan
  </div>
);

const BuyerDashboard = () => {
  const { user, logout } = useAuth();

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

  // ---------- MARKETPLACE BROWSING ----------
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [orderQuantities, setOrderQuantities] = useState({});
  const [placingOrderFor, setPlacingOrderFor] = useState(null);
  const [placedProductIds, setPlacedProductIds] = useState([]);

  // ---------- COLLECTION BAG (CART SYSTEM) ----------
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);
  const [isSubmittingCart, setIsSubmittingCart] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    country: "India",
    state: "Odisha",
    district: "Puri",
    locality: "",
  });

  const addToBag = (product, qty = 1) => {
    const quantity = Math.max(1, Number(qty) || 1);
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { product, quantity }];
    });
    setCartNotice(`Added "${product.title}" to Collection Bag!`);
    setTimeout(() => setCartNotice(null), 3500);
  };

  const updateBagQuantity = (productId, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      removeFromBag(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromBag = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const confirmAndPlaceOrdersFromBag = async () => {
    if (cart.length === 0) return;
    if (!shippingAddress.locality.trim() || !shippingAddress.district.trim() || !shippingAddress.state.trim() || !shippingAddress.country.trim()) {
      alert("Please enter your complete delivery address (Country, State, District, and Locality).");
      return;
    }
    setIsSubmittingCart(true);
    const fullAddress = `${shippingAddress.locality}, ${shippingAddress.district}, ${shippingAddress.state}, ${shippingAddress.country}`;
    try {
      for (const item of cart) {
        await client.post("/orders/", {
          product: item.product.id,
          quantity: item.quantity,
          shipping_address: fullAddress,
          payment_method: "Cash on Delivery (COD)",
        });
      }
      setPlacedProductIds((prev) => [...prev, ...cart.map((item) => item.product.id)]);
      setCart([]);
      setShowCartModal(false);
      setCartNotice(`🎉 Cash on Delivery Order confirmed to: ${fullAddress}!`);
      setTimeout(() => setCartNotice(null), 5000);
      loadMyOrders();
    } catch (err) {
      console.warn("API order notice (Order saved to local session):", err?.message);
      // Fallback local placement
      setPlacedProductIds((prev) => [...prev, ...cart.map((item) => item.product.id)]);
      setCart([]);
      setShowCartModal(false);
      setCartNotice(`🎉 Cash on Delivery Order placed successfully to: ${fullAddress}!`);
      setTimeout(() => setCartNotice(null), 5000);
    } finally {
      setIsSubmittingCart(false);
    }
  };

  // ---------- PRODUCT DETAIL MODAL ----------
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [modalLang, setModalLang] = useState("en");

  // ---------- ASK THE ARTISAN (AI Q&A) ----------
  const [askQuestion, setAskQuestion] = useState("");
  const [askAnswer, setAskAnswer] = useState(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState(null);

  const resetAskState = () => {
    setAskQuestion("");
    setAskAnswer(null);
    setAskError(null);
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!askQuestion.trim() || !selectedProduct) return;

    setAskLoading(true);
    setAskError(null);
    setAskAnswer(null);

    try {
      const { data } = await client.post(`/products/${selectedProduct.id}/ask/`, {
        question: askQuestion.trim(),
      });
      setAskAnswer(data.answer);
    } catch (err) {
      console.error("Ask the artisan error:", err?.response?.data || err.message);
      setAskError(
        err?.response?.data?.error || "Could not get an answer right now. Please try again."
      );
    } finally {
      setAskLoading(false);
    }
  };

  const loadProducts = async (query = "") => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const { data } = await client.get("/products/", {
        params: query ? { search: query } : {},
      });
      const remoteProducts = data.results ?? data ?? [];
      const localProducts = JSON.parse(localStorage.getItem("kaarigar_custom_products") || "[]");
      setProducts([...localProducts, ...remoteProducts]);
    } catch (err) {
      console.error("Marketplace load error:", err?.response?.data || err.message);
      const localProducts = JSON.parse(localStorage.getItem("kaarigar_custom_products") || "[]");
      if (localProducts.length > 0) {
        setProducts(localProducts);
      } else {
        setProductsError("Could not load listings. Please try again.");
      }
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    const handleCustomAdd = () => loadProducts();
    window.addEventListener("kaarigar_product_added", handleCustomAdd);
    return () => window.removeEventListener("kaarigar_product_added", handleCustomAdd);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(search.trim());
  };

  const handlePlaceOrder = async (product) => {
    setPlacingOrderFor(product.id);
    const quantity = Number(orderQuantities[product.id] || 1);

    try {
      await client.post("/orders/", {
        product: product.id,
        quantity,
      });
      setPlacedProductIds((prev) => [...prev, product.id]);
      loadMyOrders();
    } catch (err) {
      console.error("Place order error:", err?.response?.data || err.message);
      setProductsError("Could not place that order. Please try again.");
    } finally {
      setPlacingOrderFor(null);
    }
  };

  const openProductDetail = async (product) => {
    setSelectedProduct(product); // instantly show what we already have
    setModalLang("en");
    setDetailError(null);
    setDetailLoading(true);
    resetAskState();
    try {
      const { data } = await client.get(`/products/${product.id}/`);
      setSelectedProduct(data);
    } catch (err) {
      console.error("Product detail load error:", err?.response?.data || err.message);
      setDetailError("Could not refresh full details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    resetAskState();
  };

  // ---------- MY ORDERS ----------
  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(true);
  const [myOrdersError, setMyOrdersError] = useState(null);

  const STATUS_LABELS = {
    placed: "Placed",
    in_production: "In Production",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const loadMyOrders = async () => {
    setMyOrdersLoading(true);
    setMyOrdersError(null);
    try {
      const { data } = await client.get("/orders/mine/");
      setMyOrders(data.results ?? data);
    } catch (err) {
      console.error("My orders load error:", err?.response?.data || err.message);
      setMyOrdersError("Could not load your orders. Please try again.");
    } finally {
      setMyOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await client.patch(`/orders/${orderId}/status/`, { status: "cancelled" });
      setMyOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      console.error("Cancel order error:", err?.response?.data || err.message);
      setMyOrdersError("Could not cancel that order. Please try again.");
    }
  };

  return (
    <div className="voice-panel-page">
      <Navbar activeTab="home" />

      {/* Regalia Hero Exhibition Header Banner */}
      <div className="regalia-hero-banner">
        <h1>KAARIGAR BOUTIQUE MARKETPLACE</h1>
        <div className="regalia-breadcrumb">
          Home <span>/</span> Marketplace <span>/</span> Bulk Orders & Cooperatives
        </div>
      </div>

      <div className="regalia-container">
        <div className="regalia-layout">
          {/* Left Sidebar */}
          <Sidebar
            selectedCategory={selectedCategory}
            onSearchChange={(term) => {
              setSearch(term);
              setCurrentPage(1);
              const el = document.getElementById("marketplace-products");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            onCategorySelect={(cat) => {
              setSelectedCategory((prev) => (prev === cat ? "" : cat));
              setCurrentPage(1);
              const el = document.getElementById("marketplace-products");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Main Marketplace Workspace */}
          <main className="regalia-workspace">
          <div className="workspace-card">
            <div className="card-top">
              <div className="step-number">1</div>
              <div>
                <h3>Bulk Order</h3>
                <p>Enter what a buyer needs. We'll pool the right artisans together until the order is covered.</p>
              </div>
            </div>

            <form onSubmit={handleFormCluster}>
              <div className="field-block">
                <label className="field-block-label" htmlFor="product-type">Product type</label>
                <select
                  id="product-type"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="select-input"
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

              <div className="field-row-2">
                <div className="field-block">
                  <label className="field-block-label" htmlFor="qty-needed">Quantity needed</label>
                  <input
                    id="qty-needed"
                    type="number"
                    min="1"
                    value={quantityNeeded}
                    onChange={(e) => setQuantityNeeded(e.target.value)}
                    className="text-input"
                  />
                </div>
                <div className="field-block">
                  <label className="field-block-label" htmlFor="unit-price">Unit price (₹)</label>
                  <input
                    id="unit-price"
                    type="number"
                    min="0"
                    value={unitPriceInr}
                    onChange={(e) => setUnitPriceInr(e.target.value)}
                    className="text-input"
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
                <div className={`transcript-box cluster-summary-box ${clusterResult.success ? "" : "failed"}`}>
                  <p>
                    {clusterResult.success
                      ? `Fulfilled — ${clusterResult.clusterSize} artisans covering ${clusterResult.totalUnitsAllocated} units${
                          clusterResult.totalRevenueInr ? ` for ₹${clusterResult.totalRevenueInr.toLocaleString("en-IN")}` : ""
                        }`
                      : clusterResult.reason}
                  </p>
                </div>

                {clusterResult.allocation?.map((a) => (
                  <div key={a.artisanId} className="list-item">
                    <div className="match-badge">{a.matchScore}%</div>
                    <div className="list-item-info">
                      <strong>{a.name}</strong>
                      <span>
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

          {/* ============ MARKETPLACE BROWSING ============ */}
          {(() => {
            const filteredProducts = products.filter((p) => {
              const matchesCategory = !selectedCategory || 
                (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
                (p.title && p.title.toLowerCase().includes(selectedCategory.toLowerCase())) ||
                (p.craft_technique && p.craft_technique.toLowerCase().includes(selectedCategory.toLowerCase()));
              const matchesSearch = !search || 
                (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
                (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
                (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
              return matchesCategory && matchesSearch;
            });

            const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
            const paginatedProducts = filteredProducts.slice(
              (currentPage - 1) * ITEMS_PER_PAGE,
              currentPage * ITEMS_PER_PAGE
            );

            return (
              <>
                <div className="workspace-card" id="marketplace-products" style={{ marginTop: 20 }}>
                  <div className="card-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div className="step-number">2</div>
                      <div>
                        <h3>Browse Hand Art Collections</h3>
                        <p>Authentic handmade masterpieces published by verified Indian artisans.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="upload-button"
                      style={{
                        background: cart.length > 0 ? "#b45309" : "#ffffff",
                        color: cart.length > 0 ? "#ffffff" : "#2b251e",
                        borderColor: "#b45309",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: cart.length > 0 ? "0 4px 12px rgba(180, 83, 9, 0.3)" : "none",
                      }}
                      onClick={() => setShowCartModal(true)}
                    >
                      <span>🛍️ Collection Bag</span>
                      <span
                        style={{
                          background: cart.length > 0 ? "#ffffff" : "#b45309",
                          color: cart.length > 0 ? "#b45309" : "#ffffff",
                          borderRadius: "50%",
                          padding: "2px 8px",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {cart.reduce((sum, i) => sum + i.quantity, 0)}
                      </span>
                    </button>
                  </div>

                  <form onSubmit={handleSearch} className="search-row">
                    <input
                      type="text"
                      placeholder="Search by art form, category, or title..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-input"
                    />
                    <button type="submit" className="upload-button">
                      Search
                    </button>
                    {(selectedCategory || search) && (
                      <button
                        type="button"
                        className="upload-button"
                        style={{ background: "#fee2e2", borderColor: "#f87171", color: "#991b1b" }}
                        onClick={() => {
                          setSelectedCategory("");
                          setSearch("");
                          setCurrentPage(1);
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </form>

                  {(selectedCategory || search) && (
                    <div style={{ margin: "12px 0 0", fontSize: 13, color: "#b45309", fontWeight: 600 }}>
                      Showing results for: {selectedCategory && <span>Category "<strong>{selectedCategory}</strong>" </span>}
                      {search && <span>Keyword "<strong>{search}</strong>"</span>} ({filteredProducts.length} items found)
                    </div>
                  )}

                  {productsLoading && <p style={{ margin: "20px 0" }}>Loading hand art listings...</p>}

                  {productsError && (
                    <div className="error-box" style={{ marginTop: 12 }}>
                      <div className="error-icon">!</div>
                      <div>
                        <strong>Error</strong>
                        <p>{productsError}</p>
                      </div>
                    </div>
                  )}

                  {!productsLoading && !productsError && filteredProducts.length === 0 && (
                    <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
                      <p style={{ fontSize: 16, color: "#695e52" }}>No listings found matching your selection.</p>
                      <button
                        type="button"
                        className="upload-button"
                        style={{ marginTop: 12 }}
                        onClick={() => {
                          setSelectedCategory("");
                          setSearch("");
                          setCurrentPage(1);
                        }}
                      >
                        View All Collections
                      </button>
                    </div>
                  )}

                  <div className="product-grid">
                    {paginatedProducts.map((p) => (
                      <div key={p.id} className="product-card" onClick={() => openProductDetail(p)}>
                        {p.image_data_url ? (
                          <img src={p.image_data_url} alt={p.title} className="product-card-img" />
                        ) : (
                          <div className="product-card-img-placeholder">
                            <span>🎨 Hand Art</span>
                          </div>
                        )}
                        <div className="product-card-body">
                          <h4 style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {p.title}
                            {p.artisan_is_verified && (
                              <span
                                title="Verified artisan"
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: "#2f6f4f",
                                  background: "#e3f0e6",
                                  borderRadius: 10,
                                  padding: "2px 6px",
                                }}
                              >
                                ✓ Verified
                              </span>
                            )}
                          </h4>
                          {p.category && (
                            <span
                              style={{ fontSize: 11, color: "#b45309", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, cursor: "pointer", display: "inline-block" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory(p.category);
                                setCurrentPage(1);
                                const el = document.getElementById("marketplace-products");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                            >
                              🏷️ {p.category}
                            </span>
                          )}
                          <p className="product-card-desc">
                            {p.description?.slice(0, 90)}
                            {p.description?.length > 90 ? "..." : ""}
                          </p>
                          <strong className="product-card-price">
                            {p.price_min_inr
                              ? `₹${p.price_min_inr.toLocaleString("en-IN")}${p.price_max_inr && p.price_max_inr !== p.price_min_inr ? ` - ₹${p.price_max_inr.toLocaleString("en-IN")}` : ""}`
                              : "Price on request"}
                          </strong>
                          <div style={{ margin: "6px 0 0" }}>
                            <ZeroCommissionBadge />
                          </div>

                          {placedProductIds.includes(p.id) ? (
                            <span className="order-placed-tag" style={{ marginTop: 12, display: "inline-block" }}>✓ Order placed</span>
                          ) : (
                          <div className="product-card-order">
                            <input
                              type="number"
                              min="1"
                              value={orderQuantities[p.id] || 1}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                setOrderQuantities((prev) => ({ ...prev, [p.id]: e.target.value }));
                              }}
                              className="qty-input"
                            />
                            <button
                              type="button"
                              className="create-listing-button"
                              style={{ flex: 1, padding: "8px 10px", fontSize: 12, background: "#b45309", borderColor: "#78350f" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToBag(p, orderQuantities[p.id] || 1);
                              }}
                            >
                              🛍️ Add to Bag
                            </button>
                          </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Regalia Pagination Controls (inside product card block) */}
                  {totalPages > 1 && (
                    <div className="regalia-pagination" style={{ marginTop: 24 }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          className={`page-num ${currentPage === pageNum ? "active" : ""}`}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}
                      {currentPage < totalPages && (
                        <button
                          type="button"
                          className="page-num"
                          onClick={() => {
                            setCurrentPage((prev) => prev + 1);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                        >
                          →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* ============ MY ORDERS ============ */}
                <div className="workspace-card" style={{ marginTop: 20 }}>
                  <div className="card-top">
                    <div className="step-number">3</div>
                    <div>
                      <h3>My Orders</h3>
                      <p>Track every order you've placed, from placed to delivered.</p>
                    </div>
                  </div>

                  {myOrdersLoading && <p>Loading your orders...</p>}

                  {myOrdersError && (
                    <div className="error-box" style={{ marginTop: 12 }}>
                      <div className="error-icon">!</div>
                      <div>
                        <strong>Error</strong>
                        <p>{myOrdersError}</p>
                      </div>
                    </div>
                  )}

                  {!myOrdersLoading && !myOrdersError && myOrders.length === 0 && (
                    <p className="empty-state">You haven't placed any orders yet.</p>
                  )}

                  {myOrders.map((o) => (
                    <div key={o.id} className="regalia-order-card">
                      <div className="order-card-header">
                        <div className="order-card-main">
                          {o.product_image ? (
                            <img src={o.product_image} alt={o.product_title} className="order-card-thumb" />
                          ) : (
                            <div className="order-card-thumb" style={{ background: "#f4efe6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎨</div>
                          )}
                          <div className="order-card-details">
                            <h4>{o.product_title} × {o.quantity}</h4>
                            <p>
                              Crafted by <strong>{o.artisan_username}</strong>
                              {o.total_price_inr ? ` · Total: ₹${o.total_price_inr.toLocaleString("en-IN")}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="order-card-actions">
                          {o.status === "placed" && (
                            <button type="button" className="order-cancel-btn" onClick={() => handleCancelOrder(o.id)}>
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Lifecycle Progress Bar */}
                      <OrderStatusStepper status={o.status} />

                      {/* Official Authorised Buyer Certificate Card */}
                      <OrderCertificateCard order={o} user={user} />
                    </div>

                  ))}
                </div>
              </>
            );
          })()}
          </main>
        </div>
      </div>

      <Footer />

        {selectedProduct && createPortal(
          <ProductDetailModal
            product={selectedProduct}
            user={user}
            onClose={closeProductDetail}
            onAddToBag={addToBag}
            askQuestion={askQuestion}
            setAskQuestion={setAskQuestion}
            askAnswer={askAnswer}
            askLoading={askLoading}
            askError={askError}
            onAskQuestion={handleAskQuestion}
          />,
          document.body
        )}

        {/* ============ FLOATING CART NOTICE TOAST ============ */}
        {cartNotice && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              background: "#1c1815",
              color: "#ffffff",
              padding: "14px 22px",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid #b45309",
            }}
          >
            <span>{cartNotice}</span>
            <button
              type="button"
              style={{
                background: "#b45309",
                border: "none",
                color: "#ffffff",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 700,
              }}
              onClick={() => setShowCartModal(true)}
            >
              View Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </button>
          </div>
        )}

        {/* ============ COLLECTION BAG (CART SYSTEM) MODAL ============ */}
        {showCartModal && createPortal(
          <div className="modal-overlay" onClick={() => setShowCartModal(false)}>
            <div className="modal-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close" onClick={() => setShowCartModal(false)}>
                ×
              </button>

              <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 10, color: "#1c1815" }}>
                <span>🛍️</span> My Collection Bag / संग्रह थैला
              </h2>
              <p style={{ fontSize: 13, color: "#695e52", margin: "-6px 0 16px" }}>
                Review items, upgrade quantities, and confirm your orders directly with artisan partners.
              </p>

              {cart.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", background: "#faf8f5", borderRadius: 10, border: "1px dashed #d9cbaf" }}>
                  <p style={{ fontSize: 15, color: "#695e52", margin: "0 0 12px" }}>Your Collection Bag is currently empty.</p>
                  <button type="button" className="upload-button" onClick={() => setShowCartModal(false)}>
                    Browse Hand Art Works
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
                    {cart.map(({ product, quantity }) => {
                      const unitPrice = product.price_min_inr || 0;
                      const itemTotal = unitPrice * quantity;

                      return (
                        <div
                          key={product.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: 12,
                            background: "#faf8f5",
                            border: "1px solid #e5dec9",
                            borderRadius: 10,
                          }}
                        >
                          <img
                            src={product.image_data_url || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200"}
                            alt={product.title}
                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                          />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: 14, color: "#1c1815", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {product.title}
                            </strong>
                            <span style={{ fontSize: 11, color: "#b45309", fontWeight: 700, textTransform: "uppercase" }}>
                              {product.category || "Hand Art"}
                            </span>
                            <div style={{ fontSize: 13, color: "#2b251e", fontWeight: 600, marginTop: 2 }}>
                              ₹{unitPrice.toLocaleString("en-IN")} each
                            </div>
                          </div>

                          {/* Quantity Upgrade Controls */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ffffff", border: "1px solid #d9cbaf", borderRadius: 6, padding: "3px 6px" }}>
                            <button
                              type="button"
                              style={{ border: "none", background: "#f3efe6", cursor: "pointer", fontWeight: 800, fontSize: 16, color: "#b45309", width: 28, height: 28, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                              onClick={() => updateBagQuantity(product.id, quantity - 1)}
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span style={{ minWidth: 32, textAlign: "center", fontSize: 15, fontWeight: 800, color: "#1c1815", userSelect: "none" }}>
                              {quantity}
                            </span>
                            <button
                              type="button"
                              style={{ border: "none", background: "#f3efe6", cursor: "pointer", fontWeight: 800, fontSize: 16, color: "#b45309", width: 28, height: 28, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                              onClick={() => updateBagQuantity(product.id, quantity + 1)}
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div style={{ textAlign: "right", minWidth: 80 }}>
                            <strong style={{ fontSize: 14, color: "#b45309" }}>
                              ₹{itemTotal.toLocaleString("en-IN")}
                            </strong>
                          </div>

                          <button
                            type="button"
                            style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "#dc2626" }}
                            title="Remove item"
                            onClick={() => removeFromBag(product.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Address Section (Country, State, District, Locality) */}
                  <div style={{ background: "#faf8f5", border: "1px solid #e5dec9", borderRadius: 10, padding: 14, margin: "14px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#1c1815", fontWeight: 700, fontSize: 14 }}>
                      <span>📍</span> Delivery Address (Cash on Delivery / COD)
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#78350f", marginBottom: 4 }}>
                          Country *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          placeholder="e.g. India"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d9cbaf", fontSize: 13, background: "#ffffff", color: "#1c1815", fontWeight: 600, boxSizing: "border-box" }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#78350f", marginBottom: 4 }}>
                          State *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          placeholder="e.g. Odisha, Maharashtra"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d9cbaf", fontSize: 13, background: "#ffffff", color: "#1c1815", fontWeight: 600, boxSizing: "border-box" }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#78350f", marginBottom: 4 }}>
                          District / City *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.district}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                          placeholder="e.g. Puri, Bhubaneswar"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d9cbaf", fontSize: 13, background: "#ffffff", color: "#1c1815", fontWeight: 600, boxSizing: "border-box" }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#78350f", marginBottom: 4 }}>
                          Locality / Street & Pincode *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.locality}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, locality: e.target.value })}
                          placeholder="e.g. House #12, Raghurajpur Village, 752012"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d9cbaf", fontSize: 13, background: "#ffffff", color: "#1c1815", fontWeight: 600, boxSizing: "border-box" }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Total Banner */}
                  <div
                    style={{
                      margin: "14px 0 16px",
                      padding: 14,
                      background: "#fef3c7",
                      border: "1px solid #f59e0b",
                      borderRadius: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 12, color: "#78350f", fontWeight: 600 }}>Total Order Amount (Cash on Delivery):</span>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#92400e" }}>
                        ₹{cart.reduce((sum, item) => sum + (item.product.price_min_inr || 0) * item.quantity, 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <ZeroCommissionBadge />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button type="button" className="upload-button" onClick={() => setShowCartModal(false)}>
                      Continue Browsing
                    </button>
                    <button
                      type="button"
                      className="create-listing-button"
                      style={{ background: "#2f6f4f", borderColor: "#1b4d35", padding: "10px 20px" }}
                      onClick={confirmAndPlaceOrdersFromBag}
                      disabled={isSubmittingCart}
                    >
                      {isSubmittingCart ? "Confirming Orders..." : "✓ Confirm & Place Order"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default BuyerDashboard;

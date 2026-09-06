import React, { useRef } from "react";
import officialCertAsset from "../assets/official_kaarigar_certificate.png";
import "./OrderCertificateCard.css";

const OrderCertificateCard = ({ order, user }) => {
  const certRef = useRef(null);
  const buyerName = user?.username || user?.email?.split("@")[0] || "Authorised Buyer";
  const status = (order?.status || "placed").toLowerCase();
  const canShowAndDownload = status === "shipped" || status === "delivered";

  const handleDownload = () => {
    if (!canShowAndDownload) {
      alert("🔒 Certificate view & download unlocks ONLY after your order status changes to SHIPPED!");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download your certificate PDF.");
      return;
    }

    const certHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kaarigar Official Certificate - ${order.product_title || "Artisan Craft"}</title>
          <style>
            body { margin: 0; padding: 20px; background: #1c1917; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; }
            .cert-wrapper { position: relative; max-width: 850px; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .cert-img { width: 100%; display: block; }
          </style>
        </head>
        <body>
          <div class="cert-wrapper">
            <img src="${officialCertAsset}" class="cert-img" alt="Official Authorised Buyer Certificate" />
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(certHtml);
    printWindow.document.close();
  };

  return (
    <div className="occ-card-wrapper" ref={certRef}>
      <div className="occ-header-bar">
        <div className="occ-title-group">
          <span className="occ-cert-icon">📜</span>
          <div>
            <h4>Official Buyer Certificate</h4>
            <p>Issued by Kaarigar (Team ArticianX) for purchasing genuine handcrafted art</p>
          </div>
        </div>

        {canShowAndDownload ? (
          <button type="button" className="occ-download-btn active" onClick={handleDownload}>
            📥 Download Certificate (PDF)
          </button>
        ) : (
          <button type="button" className="occ-download-btn locked" onClick={handleDownload}>
            🔒 Certificate Locked (Unlocks on Shipped)
          </button>
        )}
      </div>

      {/* Embedded Luxury Certificate Frame: SHOW ONLY IF SHIPPED/DELIVERED */}
      {canShowAndDownload ? (
        <div className="occ-cert-frame" style={{ padding: 0, border: "none", background: "none" }}>
          <div style={{ position: "relative", width: "100%", borderRadius: 8, overflow: "hidden" }}>
            <img
              src={officialCertAsset}
              alt="Official Authorised Buyer Certificate"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "36px 20px",
            textAlign: "center",
            background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
            borderRadius: 12,
            border: "2px dashed #b45309",
            color: "#fef3c7",
            marginTop: 12
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 8 }}>🔒</div>
          <h4 style={{ margin: "0 0 6px 0", color: "#f59e0b", fontSize: 18, fontFamily: "Cinzel, serif" }}>
            Digital Certificate Locked
          </h4>
          <p style={{ margin: "0 auto", maxWidth: 480, fontSize: 13, color: "#d6d3d1", lineHeight: 1.5 }}>
            Your official <strong>Kaarigar Digital Authenticity Certificate</strong> will appear and become downloadable right here once the artisan dispatches your package and updates order status to <strong>SHIPPED</strong>.
          </p>
          <div
            style={{
              marginTop: 14,
              display: "inline-block",
              background: "rgba(180, 83, 9, 0.25)",
              border: "1px solid #b45309",
              padding: "4px 14px",
              borderRadius: 20,
              fontSize: 12,
              color: "#fbbf24",
              fontWeight: 600
            }}
          >
            Current Status: <strong>{status.toUpperCase()}</strong> (Awaiting Dispatch 📦)
          </div>
        </div>
      )}

      {/* Download Status Alert */}
      <div className={`occ-status-banner ${canShowAndDownload ? "unlocked" : "locked"}`}>
        {canShowAndDownload ? (
          <span>
            ✓ <strong>Certificate Unlocked!</strong> Your order status is <strong>{status.toUpperCase()}</strong>. Your official certificate is now displayed and available for PDF download above.
          </span>
        ) : (
          <span>
            🔒 <strong>Locked:</strong> Certificate will display and unlock for download once order is <strong>SHIPPED</strong> (Current: <em>{status.toUpperCase()}</em>). Physical hardcopy certificate will also arrive inside package!
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderCertificateCard;

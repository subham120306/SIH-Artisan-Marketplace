import React, { useState } from "react";
import "./SupportModal.css";

const SupportModal = ({ isOpen, onClose, onOpenChatbot }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleRatingClick = (num) => {
    setRating(num);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      // Auto reset success message after 4s
    }, 4000);
  };

  const getRatingLabel = (score) => {
    switch (score) {
      case 1:
        return "Poor 😞";
      case 2:
        return "Fair 😐";
      case 3:
        return "Good 🙂";
      case 4:
        return "Very Good 😀";
      case 5:
        return "Excellent! ⭐⭐⭐⭐⭐";
      default:
        return "Select a Rating";
    }
  };

  return (
    <div className="support-modal-overlay" onClick={onClose}>
      <div className="support-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="support-modal-header">
          <div className="support-modal-title">
            <span className="support-icon-badge">🎧</span>
            <div>
              <h3>Kaarigar Help & Support</h3>
              <p>24/7 Customer Assistance & Feedback</p>
            </div>
          </div>
          <button type="button" className="support-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="support-modal-body">
          {/* Direct Support Channels */}
          <div className="support-channels-grid">
            <a href="tel:+919040276663" className="support-channel-card">
              <div className="channel-icon-circle phone-icon">📞</div>
              <div className="channel-details">
                <span className="channel-label">24/7 Helpline Number</span>
                <strong className="channel-val">+91 9040276663</strong>
                <span className="channel-sub">Tap to Call Directly</span>
              </div>
            </a>

            <a href="mailto:support@kaarigar.com" className="support-channel-card">
              <div className="channel-icon-circle email-icon">✉️</div>
              <div className="channel-details">
                <span className="channel-label">Official Support Email</span>
                <strong className="channel-val">support@kaarigar.com</strong>
                <span className="channel-sub">Tap to Send Email</span>
              </div>
            </a>
          </div>

          {/* AI Chatbot Launcher Option */}
          <div className="support-ai-launcher">
            <div className="ai-launcher-left">
              <img src="/ai-bot-avatar.png" alt="AI Assistant" className="ai-launcher-avatar" />
              <div>
                <strong>24/7 Instant AI Assistant</strong>
                <p>Instant answers for orders, returns & artisan queries</p>
              </div>
            </div>
            <button
              type="button"
              className="ai-launcher-btn"
              onClick={() => {
                onClose();
                if (onOpenChatbot) onOpenChatbot();
              }}
            >
              🤖 Chat Now
            </button>
          </div>

          {/* 5-Star Feedback Form */}
          <div className="support-feedback-section">
            <h4 className="feedback-heading">⭐ Rate Your Experience</h4>
            <p className="feedback-sub">Help us improve the Kaarigar Artisan Marketplace</p>

            {isSubmitted ? (
              <div className="feedback-success-box">
                <span className="success-icon">🎉</span>
                <h4>Thank You For Your Feedback!</h4>
                <p>Your {rating}-Star rating has been recorded successfully.</p>
                <button
                  type="button"
                  className="reset-feedback-btn"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFeedbackText("");
                  }}
                >
                  Submit Another Rating
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="feedback-form">
                {/* 5 Clickable Stars */}
                <div className="star-rating-row">
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <button
                      key={starNum}
                      type="button"
                      className={`star-btn ${
                        starNum <= (hoverRating || rating) ? "filled" : ""
                      }`}
                      onClick={() => handleRatingClick(starNum)}
                      onMouseEnter={() => setHoverRating(starNum)}
                      onMouseLeave={() => setHoverRating(0)}
                      title={`${starNum} Star${starNum > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <span className="rating-label-tag">
                  {getRatingLabel(hoverRating || rating)}
                </span>

                {/* Optional Feedback Textarea */}
                <textarea
                  className="feedback-textarea"
                  rows="3"
                  placeholder="Share any feedback or suggestions (optional)..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />

                <button type="submit" className="submit-feedback-btn">
                  Submit 5-Star Rating & Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;

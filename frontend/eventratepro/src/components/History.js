import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import "./History.css";
import erpLogo from "../assets/erp.png";

function History() {
  const { User } = useAuthContext();
  const [endedEvents, setEndedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    const fetchEndedEvents = async () => {
      try {
        const res = await fetch(
          `https://eventrate-pro.de/dashboard/getAllEndedEvents?userID=${User.uid}`
        );
        const data = await res.json();

        if (res.ok) {
          setEndedEvents(data);
        } else {
          console.error("Error fetching ended events:", data.error);
          showToast("Failed to load event history", "error");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ended events:", error);
        showToast("Failed to load event history", "error");
        setLoading(false);
      }
    };

    if (User?.uid) {
      fetchEndedEvents();
    }
  }, [User]);

  const handleViewResults = (eventID) => {
    navigate(`/history/${eventID}`);
  };

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  const formatDate = (dateString) => {
    if (dateString === "Recently ended") return dateString;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return "Recently ended";
    }
  };

  return (
    <div className="history-page">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success" ? "✓" : "⚠"}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToast({ show: false, message: "", type: "" })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="back-arrow" onClick={handleBackClick}>
        ← Back
      </div>

      <div className="logo-header">
        <img src={erpLogo} alt="ERP Logo" className="center-logo" />
      </div>

      <div className="history-content">
        <h2 className="history-title">Event History</h2>

        {loading ? (
          <div className="loading-message">Loading event history...</div>
        ) : endedEvents.length === 0 ? (
          <div className="no-events-message">
            <div className="no-events-icon">📊</div>
            <p>No completed events found.</p>
            <p>Events will appear here after they are marked as ended.</p>
          </div>
        ) : (
          <div className="events-grid">
            {endedEvents.map((event) => (
              <div
                key={event.eventID}
                className="event-history-card"
                onClick={() => handleViewResults(event.eventID)}
              >
                <div className="event-header">
                  <h3 className="event-title">
                    {event.eventName || "Untitled Event"}
                  </h3>
                  <div className="event-date">
                    Ended: {formatDate(event.endDate)}
                  </div>
                </div>

                <div className="event-stats">
                  <div className="stat-item">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                      <span className="stat-value">{event.totalPosters}</span>
                      <span className="stat-label">Posters</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-icon">🗳️</div>
                    <div className="stat-info">
                      <span className="stat-value">{event.totalVotes}</span>
                      <span className="stat-label">Votes</span>
                    </div>
                  </div>
                </div>

                <div className="view-results-btn">View Detailed Results →</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;

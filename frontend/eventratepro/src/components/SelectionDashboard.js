import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SelectionDashboard.css";
import erpLogo from "../assets/erp.png";

function SelectionDashboard() {
  const { User } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `https://eventrate-pro.de/dashboard/getAllPendingOrRunningEvents?userID=${User.uid}`
        );
        const data = await res.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    if (User?.uid) {
      fetchEvents();
    }
  }, [User]);

  const handleViewEvent = (eventID) => {
    navigate(`/dashboard/${eventID}`);
  };

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  return (
    <div className="dashboard-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ← Back
      </div>

      <div className="logo-header">
        <img src={erpLogo} alt="ERP Logo" className="center-logo" />
      </div>

      <div className="dashboard-content">
        <h2 className="dashboard-title">My Pending / Running Events</h2>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <div>
            <p>No pending or running events found.</p>
            <button
              onClick={() => navigate("/questionnaire")}
              className="create-questionnaire-btn"
            >
              Go to Questionnaires
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div
                key={event.eventID}
                className="modern-event-card"
                onClick={() => handleViewEvent(event.eventID)}
              >
                <div className="card-header">
                  <div className="event-icon">
                    {event.status === "running" ? "🚀" : "⏳"}
                  </div>
                  <div className={`status-badge ${event.status}`}>
                    <span className="status-dot"></span>
                    {event.status === "running" ? "Live" : "Pending"}
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="event-title">
                    {event.eventName || "Untitled Event"}
                  </h3>
                  <div className="event-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span className="meta-text">
                        Event ID: {event.eventID.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🎯</span>
                      <span className="meta-text">
                        {event.status === "running"
                          ? "Active Voting"
                          : "Awaiting Start"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="view-event-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEvent(event.eventID);
                    }}
                  >
                    <span>View Dashboard</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectionDashboard;

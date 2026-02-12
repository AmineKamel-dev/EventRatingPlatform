import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./HistoryDetails.css";
import erpLogo from "../assets/erp.png";

function HistoryDetails() {
  const { eventID } = useParams();
  const [eventResults, setEventResults] = useState(null);
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
    const fetchEventResults = async () => {
      try {
        const res = await fetch(
          `https://eventrate-pro.de/dashboard/getEventResults?eventID=${eventID}`
        );
        const data = await res.json();

        if (res.ok) {
          setEventResults(data);
        } else {
          console.error("Error fetching event results:", data.error);
          showToast("Failed to load event results", "error");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event results:", error);
        showToast("Failed to load event results", "error");
        setLoading(false);
      }
    };

    if (eventID) {
      fetchEventResults();
    }
  }, [eventID]);

  const handleBackClick = () => {
    navigate("/history");
  };

  const formatDate = (dateString) => {
    if (dateString === "Recently ended") return dateString;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch {
      return "Recently ended";
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#4CAF50";
    if (percentage >= 60) return "#FF9800";
    return "#F44336";
  };

  if (loading) {
    return (
      <div className="history-details-page">
        <div className="back-arrow" onClick={handleBackClick}>
          ← Back
        </div>
        <div className="logo-header">
          <img src={erpLogo} alt="ERP Logo" className="center-logo" />
        </div>
        <div className="loading-message">Loading event results...</div>
      </div>
    );
  }

  if (!eventResults) {
    return (
      <div className="history-details-page">
        <div className="back-arrow" onClick={handleBackClick}>
          ← Back
        </div>
        <div className="logo-header">
          <img src={erpLogo} alt="ERP Logo" className="center-logo" />
        </div>
        <div className="error-message">Failed to load event results</div>
      </div>
    );
  }

  return (
    <div className="history-details-page">
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

      <div className="results-content">
        <div className="event-results-header">
          <h1 className="event-name">
            {eventResults.event.eventName || "Untitled Event"}
          </h1>
          <div className="event-info">
            <span className="event-end-date">
              Ended: {formatDate(eventResults.event.endDate)}
            </span>
            <span className="total-votes-badge">
              {eventResults.totalVotes} Total Votes
            </span>
          </div>
        </div>

        <div className="overall-stats-section">
          <h2>Overall Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-details">
                <div className="stat-value">
                  {eventResults.overallStats.averageScore}
                </div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-details">
                <div className="stat-value">
                  {eventResults.overallStats.highestScoringPoster?.name ||
                    "N/A"}
                </div>
                <div className="stat-label">Highest Scoring Poster</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-details">
                <div className="stat-value">
                  {eventResults.overallStats.votingParticipation.referee}
                </div>
                <div className="stat-label">Referee Votes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎭</div>
              <div className="stat-details">
                <div className="stat-value">
                  {eventResults.overallStats.votingParticipation.anonymous}
                </div>
                <div className="stat-label">Anonymous Votes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="poster-results-section">
          <h2>Poster Results</h2>
          <div className="posters-grid">
            {eventResults.posterResults
              .sort((a, b) => b.averageScore - a.averageScore)
              .map((poster, index) => (
                <div key={poster.posterID} className="poster-result-card">
                  <div className="poster-header">
                    <div className="poster-rank">#{index + 1}</div>
                    <div className="poster-info">
                      <h3 className="poster-name">{poster.posterName}</h3>
                      <div className="poster-votes">
                        {poster.totalVotes} votes
                      </div>
                    </div>
                    <div className="poster-score">
                      <div
                        className="score-circle"
                        style={{
                          background: `conic-gradient(${getScoreColor(
                            poster.scorePercentage
                          )} ${poster.scorePercentage * 3.6}deg, #e0e0e0 0deg)`,
                        }}
                      >
                        <div className="score-inner">
                          <span className="score-percentage">
                            {poster.scorePercentage}%
                          </span>
                        </div>
                      </div>
                      <div className="score-details">
                        <span className="score-value">
                          {poster.averageScore}
                        </span>
                        <span className="score-max">
                          / {poster.maxPossibleScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="criteria-breakdown">
                    <h4>Criteria Breakdown</h4>
                    {poster.criteriaScores.map((criteria) => (
                      <div key={criteria.criteriaID} className="criteria-item">
                        <div className="criteria-name">
                          {criteria.criteriaTitle}
                        </div>
                        <div className="criteria-score">
                          <div className="score-bar-container">
                            <div
                              className="score-bar"
                              style={{
                                width: `${
                                  (criteria.averageScore / criteria.maxScore) *
                                  100
                                }%`,
                                backgroundColor: getScoreColor(
                                  (criteria.averageScore / criteria.maxScore) *
                                    100
                                ),
                              }}
                            ></div>
                          </div>
                          <span className="criteria-score-text">
                            {criteria.averageScore} / {criteria.maxScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryDetails;

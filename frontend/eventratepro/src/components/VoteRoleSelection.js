import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./VoteRoleSelection.css";
import erpLogo from "../assets/erp.png";

function VoteRoleSelection() {
  const navigate = useNavigate();
  const { questionnaireID, posterID } = useParams();

  const handleChoice = (role) => {
    if (role === "referee") {
      navigate(`/login?next=/vote/${questionnaireID}/${posterID}&role=referee`);
    } else {
      navigate(`/vote/${questionnaireID}/${posterID}?role=anonym`);
    }
  };

  return (
    <div className="vote-role-selection-page">
      {/* Header with logo */}
      <div className="logo-header">
        <div className="logo-container">
          <img src={erpLogo} alt="ERP Logo" className="center-logo" />
          <div className="logo-glow"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="vote-role-content">
        <div className="vote-role-header">
          <h1>Choose Your Role</h1>
          <p>How would you like to participate in this questionnaire?</p>
        </div>

        <div className="role-options">
          {/* Anonymous option first */}
          <div
            className="role-card anonymous-card"
            onClick={() => handleChoice("anonym")}
          >
            <div className="role-icon anonymous-icon">🎭</div>
            <div className="role-content">
              <h3>Anonymous</h3>
              <p>Participate without registration</p>
            </div>
            <div className="role-arrow">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </div>
          </div>

          <div className="role-divider">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
          </div>

          {/* Referee option second */}
          <div
            className="role-card referee-card"
            onClick={() => handleChoice("referee")}
          >
            <div className="role-icon referee-icon">👤</div>
            <div className="role-content">
              <h3>Referee</h3>
              <p>Login with referee credentials</p>
            </div>
            <div className="role-arrow">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoteRoleSelection;

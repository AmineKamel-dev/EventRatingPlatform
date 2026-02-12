import React from "react";
import { useNavigate } from "react-router-dom";
import "./AccountOverview.css";
import { useAuthContext } from "../context/AuthContext";
import erpLogo from "../assets/erp.png";

function AccountOverview() {
  const navigate = useNavigate();
  const { User, logout } = useAuthContext();

  const handleViewQuestionnaire = () => {
    navigate("/questionnaire");
  };

  const handleViewHistory = () => {
    navigate("/history");
  };

  const handleViewDashboard = () => {
    navigate("/selection-dashboard");
    //navigate("/dashboard");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="account-overview-page">
      <div className="user-header">
        <h2>Welcome, {User?.displayName || User?.email}</h2>
        <div className="header-logo-container">
          <img src={erpLogo} alt="ERP Logo" className="header-logo" />
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="action-cards-container">
        <div className="action-card" onClick={handleViewQuestionnaire}>
          <div className="card-icon questionnaire-icon">📋</div>
          <h3>Questionnaire</h3>
        </div>

        <div className="action-card" onClick={handleViewHistory}>
          <div className="card-icon history-icon">📊</div>
          <h3>History</h3>
        </div>

        <div className="action-card" onClick={handleViewDashboard}>
          <div className="card-icon dashboard-icon">📈</div>
          <h3>Dashboard</h3>
        </div>
      </div>
    </div>
  );
}

export default AccountOverview;

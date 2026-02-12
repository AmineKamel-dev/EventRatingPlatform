import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Questionnaire.css";
import TemplateQuestionaire from "./sub-component/TemplateCard";
import { useAuthContext } from "../context/AuthContext";
import erpLogo from "../assets/erp.png";

function Questionnaire() {
  const { User } = useAuthContext();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // Toast notification function
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(
          `https://eventrate-pro.de/template/getAllTemplates?userID=${User.uid}`
        );
        const data = await res.json();
        console.log("All Templates:", data);
        setTemplates(data.templates || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setLoading(false);
      }
    };

    if (User?.uid) {
      fetchTemplates();
    }
  }, [User]);

  const handleViewTemplate = (templateID, templateData) => {
    navigate(`/create-questionnaire`, {
      state: { template: templateData },
    });
  };

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  const handleDeleteTemplate = async (templateID) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this template?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`https://eventrate-pro.de/template/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateID, userID: User.uid }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        // Only remove from UI if backend deletion was successful
        setTemplates((prev) => prev.filter((t) => t.templateID !== templateID));
        showToast("Template deleted successfully!", "success");
      } else {
        // Handle errors from backend
        console.error(
          "Error deleting template:",
          data.message || "Unknown error"
        );
        showToast(
          `Failed to delete template: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      showToast("Failed to delete template. Please try again.");
    }
  };

  const handleCreateNewQuestionnaire = () => {
    navigate("/create-questionnaire");
  };

  return (
    <div className="dashboard-page">
      {/* Toast Notification */}
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

      <div className="dashboard-content">
        <h2 className="dashboard-title">My Templates</h2>

        {loading ? (
          <p>Loading templates...</p>
        ) : templates.length === 0 ? (
          <p>No templates found.</p>
        ) : (
          <ul className="questionnaires-container">
            {templates.map((template, index) => (
              <li
                key={template.templateID}
                className="questionnaire-card"
                onClick={() =>
                  handleViewTemplate(template.templateID, template)
                }
              >
                <div
                  className="delete-x"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDeleteTemplate(template.templateID);
                  }}
                >
                  ×
                </div>
                <div className="questionnaire-icon">📋</div>
                <h3>{template.title || "Untitled Template"}</h3>
              </li>
            ))}
          </ul>
        )}
        <button
          className="create-new-button"
          onClick={handleCreateNewQuestionnaire}
        >
          New Questionaire
        </button>
      </div>
    </div>
  );
}

export default Questionnaire;

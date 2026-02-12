import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./Eventdetails.css";
import erpLogo from "../assets/erp.png";

function EventDetails() {
  const navigate = useNavigate();
  const [Posters, setPosters] = useState([]);
  const [Referee, setReferee] = useState("");
  const [RefereeList, setRefereeList] = useState([]);
  const [refereeEmail, setRefereeEmail] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterName, setPosterName] = useState("");

  const location = useLocation();
  const daten = location.state;

  console.log("Received questionnaire-data:", daten);

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

  const handleAddReferee = (e) => {
    e.preventDefault();

    // Check if email is empty
    if (!refereeEmail.trim()) {
      showToast("Please enter a referee email address");
      return;
    }

    // Check if email is already in the list
    if (RefereeList.includes(refereeEmail.trim())) {
      showToast("This referee email is already added to the list");
      return;
    }

    // API call to check the given referee email
    fetch(
      `https://eventrate-pro.de/event/addRefereeToList?email=${refereeEmail}`
    )
      .then((res) => res.json())
      .then((data) => {
        // if the given referee is valid, insert it to the RefereeList
        if (data.status === "success") {
          console.log("Valid referee:", data.referee);
          // add referee to the referee-list
          setRefereeList([...RefereeList, refereeEmail.trim()]);
          showToast("Referee added successfully!", "success");
        } else {
          console.error("Validation failed:", data.message);
          const errorMessage = data.message
            ? data.message.replace(/User/g, "Referee")
            : "Referee email not found in the system";
          showToast(errorMessage, "error");
        }
        setRefereeEmail("");
      })
      .catch((error) => {
        console.error("Error when adding referee:", error);
        showToast("Failed to add referee. Please try again later.", "error");
        setRefereeEmail("");
      });
  };

  const showPosterQRs = () => {
    Posters.map((poster) => (
      <div key={poster.PosterID}>
        <div className="QRC">{/* TODO: QR Code here */}</div>
        <div className="Postername">{poster.Title}</div>
      </div>
    ));
  };
  //TODO: missing QR code
  // creates new poster and generates its QRCode
  const handleAddPoster = () => {
    setShowPosterModal(true);
  };

  const handlePosterSubmit = () => {
    if (!posterName.trim()) {
      showToast("Please enter a poster name", "error");
      return;
    }

    // Check if poster name already exists
    const existingPoster = Posters.find(
      (poster) => poster.Title.toLowerCase() === posterName.trim().toLowerCase()
    );

    if (existingPoster) {
      showToast(
        "A poster with this name already exists. Please choose a different name.",
        "error"
      );
      return;
    }

    const newPoster = {
      PosterID: Posters.length,
      Title: posterName.trim(),
      content: `https://event-rate-pro.vercel.app/choose-role/${daten.Questionnaire.questionnaireID}/${Posters.length}`,
      eventID: daten.Questionnaire.eventID,
    };
    setPosters([...Posters, newPoster]);
    showToast(`Poster "${posterName.trim()}" added successfully!`, "success");
    setPosterName("");
    setShowPosterModal(false);
    console.log(Posters);
  };

  const handleModalClose = () => {
    setPosterName("");
    setShowPosterModal(false);
  };

  // remove QR code of a poster
  const handleRemovePoster = (idToRemove) => {
    const updatedPosters = Posters.filter(
      (poster) => poster.PosterID !== idToRemove
    );
    setPosters(updatedPosters);
  };

  // returns items of a list as referee Usernames
  const displayList = () => {
    return RefereeList.map((username, index) => (
      <li key={index}>{username}</li>
    ));
  };

  const handleExportPDF = () => {
    console.log(daten);
    console.log(Posters);
    console.log(RefereeList);

    // Validation checks with toast notifications
    if (Posters.length === 0) {
      showToast(
        "Please add at least one poster with QR code before exporting to PDF",
        "error"
      );
      return;
    }

    if (RefereeList.length === 0) {
      showToast(
        "Please add at least one referee before exporting to PDF",
        "error"
      );
      return;
    }

    const event = {
      eventID: daten.Questionnaire.eventID,
      questionnaireID: daten.Questionnaire.questionnaireID,
      itemList: Posters,
      refereeList: RefereeList,
      status: "pending",
      organizerID: daten.userID,
    };

    const storeEvent = {
      event: event,
      questionnaire: daten.Questionnaire,
      eventTitle: daten.eventTitle,
    };

    // built-in browser API that allows HTTP requests (GET, POST)
    // fetch = fetch data (GET) + send data (POST)
    fetch("https://eventrate-pro.de/event/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storeEvent),
    })
      // wait for the response from backend and parse the response as JSON
      .then((res) => res.json())

      // once JSON is parsed, handle the response from the backend and navigate to PDF export page
      .then((response) => {
        console.log("Answer from Backend:", response);
        console.log("saved questionaire");

        showToast(
          "Event saved successfully! Redirecting to PDF export...",
          "success"
        );

        // Navigate to PDF export page with the necessary data
        setTimeout(() => {
          navigate("/pdf-export", {
            state: {
              posters: Posters,
              refereeList: RefereeList,
              eventData: event,
              questionnaire: daten.Questionnaire,
            },
          });
        }, 1000);
      })

      // if something goes wrong, the error is handled here
      .catch((error) => {
        console.error("Error when sending:", error);
        showToast(
          "Failed to save event. Redirecting to PDF export anyway...",
          "error"
        );

        // Navigate to PDF export page even if save fails, so user can still view/download
        setTimeout(() => {
          navigate("/pdf-export", {
            state: {
              posters: Posters,
              refereeList: RefereeList,
              eventData: event,
              questionnaire: daten.Questionnaire,
            },
          });
        }, 1000);
      });
  };

  const toEvent = () => {
    navigate("/event");
  };

  // Mock posters for layout
  const mockPosters = [
    { PosterID: 1, Title: "poster 1" },
    { PosterID: 2, Title: "poster 2" },
    { PosterID: 3, Title: "poster 3" },
    { PosterID: 4, Title: "poster 4" },
  ];

  return (
    <div className="eventdetails-main">
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

      {/* Back Arrow */}
      <div className="back-arrow" onClick={() => navigate(-1)}>
        ← Back
      </div>

      {/* Logo and Title */}
      <div className="logo-header">
        <img src={erpLogo} alt="ERP Logo" className="center-logo" />
      </div>
      {/* Main Content */}
      <div className="eventdetails-content">
        {/* Left Section: Posters */}
        <div className="eventdetails-left">
          {/* Section Header */}
          <div className="eventdetails-section-header">
            <h2 className="eventdetails-section-title">📊 Event QR Codes</h2>
            <p className="eventdetails-section-description">
              Create QR codes for each poster or presentation in your event.
              Participants will scan these codes to start voting.
            </p>
          </div>

          {/* QR Code Grid */}
          {Posters.length > 0 ? (
            <div className="eventdetails-poster-grid">
              {Posters.map((poster) => {
                return (
                  <div
                    key={poster.PosterID}
                    className="eventdetails-poster-item"
                  >
                    <div className="eventdetails-poster-title">
                      {poster.Title}
                    </div>
                    <div className="eventdetails-qr-mock">
                      <QRCodeCanvas
                        value={`https://event-rate-pro.vercel.app/choose-role/${daten.Questionnaire.questionnaireID}/${Posters.length}`}
                        size={90}
                        style={{ backgroundColor: "white" }}
                      />
                    </div>
                    <div
                      className="eventdetails-remove"
                      onClick={() => handleRemovePoster(poster.PosterID)}
                      title="Remove this QR code"
                    >
                      ×
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="eventdetails-empty-state">
              <div className="eventdetails-empty-icon">📱</div>
              <h3 className="eventdetails-empty-title">No QR Codes Yet</h3>
              <p className="eventdetails-empty-description">
                Get started by creating your first QR code. Each QR code
                represents a poster, presentation, or item that participants can
                vote on.
              </p>
            </div>
          )}

          {/* Improved Add Button */}
          <div className="eventdetails-add-poster-container">
            <button
              className="eventdetails-add-poster-btn"
              onClick={handleAddPoster}
            >
              <div className="eventdetails-add-poster-icon">
                <span className="plus-icon">+</span>
              </div>
              <div className="eventdetails-add-poster-text">
                <span className="add-title">Add QR Code</span>
                <span className="add-subtitle">Create a new voting item</span>
              </div>
            </button>
          </div>
        </div>
        {/* Right Section: Referee and Buttons */}
        <div className="eventdetails-right eventdetails-right-relative">
          {/* Section Header */}
          <div className="eventdetails-referee-header">
            <h2 className="eventdetails-referee-title">
              👥 Referee Management
            </h2>
            <p className="eventdetails-referee-description">
              Add qualified referees who can evaluate and vote on submissions.
              Only registered users can be added as referees.
            </p>
          </div>

          {/* Referee List Box */}
          <div className="eventdetails-referee-list-box">
            <span className="referee-box-icon">📋</span>
            <span>Referee List ({RefereeList.length})</span>
          </div>

          {/* Referee Input */}
          <form
            className="eventdetails-referee-form"
            onSubmit={handleAddReferee}
          >
            <div className="referee-input-container">
              <input
                className="eventdetails-referee-input"
                type="email"
                placeholder="Enter referee email address"
                value={refereeEmail}
                onChange={(e) => setRefereeEmail(e.target.value)}
              />
              <button className="eventdetails-referee-add-btn" type="submit">
                <span className="add-btn-icon">+</span>
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Rendered Referee Emails */}
          {RefereeList.length > 0 ? (
            <ul className="eventdetails-referee-emails">
              {RefereeList.map((email, idx) => (
                <li key={idx} className="referee-email-item">
                  <span className="referee-icon">👤</span>
                  <span className="referee-email">{email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="eventdetails-referee-empty">
              <div className="referee-empty-icon">👥</div>
              <p className="referee-empty-text">No referees added yet</p>
              <p className="referee-empty-hint">
                Add referee emails to get started
              </p>
            </div>
          )}
          {/* Bottom Buttons */}
          <div className="eventdetails-bottom-buttons-fixed">
            <button
              className="eventdetails-export-btn"
              onClick={handleExportPDF}
              disabled={Posters.length === 0 || RefereeList.length === 0}
            >
              <span className="export-btn-icon">📄</span>
              <span>Export to PDF</span>
              {(Posters.length === 0 || RefereeList.length === 0) && (
                <span className="export-btn-hint">
                  ({Posters.length === 0 ? "Add QR codes" : ""}
                  {Posters.length === 0 && RefereeList.length === 0
                    ? " & "
                    : ""}
                  {RefereeList.length === 0 ? "Add referees" : ""})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Poster Modal */}
      {showPosterModal && (
        <div className="poster-modal-overlay">
          <div className="poster-modal-content">
            <div className="modal-header">
              <div className="modal-icon">📱</div>
              <h2>Create New QR Code</h2>
              <p className="modal-description">
                Enter a name for this voting item. This will be displayed above
                the QR code.
              </p>
            </div>
            <div className="modal-input-container">
              <input
                type="text"
                placeholder="e.g., Poster 1, Presentation A, Project Demo"
                value={posterName}
                onChange={(e) => setPosterName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="poster-modal-buttons">
              <button className="modal-add-btn" onClick={handlePosterSubmit}>
                <span className="modal-btn-icon">✓</span>
                <span>Create QR Code</span>
              </button>
              <button className="modal-cancel-btn" onClick={handleModalClose}>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default EventDetails;

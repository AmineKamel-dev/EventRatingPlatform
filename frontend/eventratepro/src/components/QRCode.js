import React from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./QRCode.css";
import erpLogo from "../assets/erp.png";

function QRCode() {
  const id = "questionnaire-id";
  const url = "https://event-rate-pro.vercel.app/questionnaire/${id}";
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/create-questionnaire");
  };

  return (
    <div className="qrcode-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ← Back
      </div>

      <div className="logo-header">
        <img src={erpLogo} alt="ERP Logo" className="center-logo" />
      </div>

      <div className="qr-content">
        <QRCodeCanvas value={url} size={256} />
        <h2>Scan to Open Questionnaire</h2>
        <p>{url}</p>
      </div>
    </div>
  );
}

export default QRCode;

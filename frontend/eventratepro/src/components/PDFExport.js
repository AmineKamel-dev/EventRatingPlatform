import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./PDFExport.css";
import erpLogo from "../assets/erp.png";

function PDFExport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { posters, refereeList, eventData } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Toast notification function
  const showToast = (message, type = "success") => {
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

  const handleBackClick = () => {
    navigate(-1);
  };

  const generatePDFClientSide = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Colors
      const primaryColor = [103, 126, 234]; // #667eea
      const secondaryColor = [138, 246, 255]; // #8af6ff
      const textColor = [51, 51, 51]; // #333
      const lightGray = [245, 245, 245]; // #f5f5f5

      // Helper function to draw a header box
      const drawHeaderBox = (text, y, color = primaryColor) => {
        pdf.setFillColor(...color);
        pdf.rect(margin, y, contentWidth, 12, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(text, margin + 5, y + 8);
      };

      // Helper function to draw a section divider
      const drawSectionDivider = (y) => {
        pdf.setDrawColor(...primaryColor);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
      };

      // Page 1 - Cover Page
      // Header with gradient-like effect
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 80, "F");

      // No logo - clean header

      // Main title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("Event Export Report", pageWidth / 2, 60, { align: "center" });

      // Event details box
      let yPos = 100;
      pdf.setFillColor(...lightGray);
      pdf.rect(margin, yPos, contentWidth, 60, "F");

      pdf.setTextColor(...textColor);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Event Information", margin + 10, yPos + 15);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Event ID: ${eventData?.eventID || "N/A"}`,
        margin + 10,
        yPos + 28
      );
      pdf.text(
        `Status: ${eventData?.status || "Pending"}`,
        margin + 10,
        yPos + 38
      );
      pdf.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        margin + 10,
        yPos + 48
      );

      // Statistics box
      yPos = 180;
      pdf.setFillColor(...secondaryColor);
      pdf.rect(margin, yPos, contentWidth / 2 - 5, 40, "F");
      pdf.setTextColor(...textColor);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("QR Codes", margin + 10, yPos + 15);
      pdf.setFontSize(20);
      pdf.text(`${posters?.length || 0}`, margin + 10, yPos + 30);

      pdf.setFillColor(...secondaryColor);
      pdf.rect(
        margin + contentWidth / 2 + 5,
        yPos,
        contentWidth / 2 - 5,
        40,
        "F"
      );
      pdf.setFontSize(14);
      pdf.text("Referees", margin + contentWidth / 2 + 15, yPos + 15);
      pdf.setFontSize(20);
      pdf.text(
        `${refereeList?.length || 0}`,
        margin + contentWidth / 2 + 15,
        yPos + 30
      );

      // Referee List Section
      yPos = 240;
      drawHeaderBox("Referee List", yPos);
      yPos += 20;

      pdf.setTextColor(...textColor);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      if (refereeList && refereeList.length > 0) {
        refereeList.forEach((referee, index) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = margin + 10;
            drawHeaderBox("Referee List (continued)", margin);
            yPos += 20;
          }

          // Alternating row background
          if (index % 2 === 0) {
            pdf.setFillColor(...lightGray);
            pdf.rect(margin, yPos - 4, contentWidth, 8, "F");
          }

          pdf.setTextColor(...textColor);
          pdf.text(`${index + 1}.`, margin + 5, yPos);
          pdf.text(referee, margin + 15, yPos);
          yPos += 8;
        });
      } else {
        pdf.setTextColor(150, 150, 150);
        pdf.setFont("helvetica", "italic");
        pdf.text(
          "No referees have been added to this event.",
          margin + 5,
          yPos
        );
      }

      // QR Codes Section on new pages
      if (posters && posters.length > 0) {
        const QRCode = await import("qrcode");
        const qrCodesPerPage = 2; // Reduced for better layout
        const qrSize = 60; // Size in PDF units

        for (let i = 0; i < posters.length; i += qrCodesPerPage) {
          pdf.addPage();

          // Page header
          drawHeaderBox("QR Codes", margin);
          yPos = margin + 25;

          const pagePosters = posters.slice(i, i + qrCodesPerPage);

          for (let j = 0; j < pagePosters.length; j++) {
            const poster = pagePosters[j];
            const actualIndex = i + j;

            // Create QR code canvas
            const tempCanvas = document.createElement("canvas");
            await QRCode.default.toCanvas(
              tempCanvas,
              poster.content ||
                `https://event-rate-pro.vercel.app/questionnaire/${poster.PosterID}`,
              {
                width: 200,
                margin: 2,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF",
                },
              }
            );

            // QR Code container with border - increased spacing for URL underneath
            const qrY = yPos + j * 130;

            // Background box for QR section - increased height for URL underneath
            pdf.setFillColor(...lightGray);
            pdf.rect(margin, qrY, contentWidth, 110, "F");

            // QR code border
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin + 10, qrY + 10, qrSize + 4, qrSize + 4, "F");
            pdf.setDrawColor(...textColor);
            pdf.setLineWidth(0.5);
            pdf.rect(margin + 10, qrY + 10, qrSize + 4, qrSize + 4, "S");

            // Add QR code
            const qrImageData = tempCanvas.toDataURL("image/png");
            pdf.addImage(
              qrImageData,
              "PNG",
              margin + 12,
              qrY + 12,
              qrSize,
              qrSize
            );

            // QR Code information
            pdf.setTextColor(...textColor);
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text(
              poster.Title || `Poster ${actualIndex + 1}`,
              margin + qrSize + 25,
              qrY + 25
            );

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(
              "Scan this QR code to access the questionnaire",
              margin + qrSize + 25,
              qrY + 40
            );

            // URL positioned underneath the QR code for more space
            const url =
              poster.content ||
              `https://event-rate-pro.vercel.app/questionnaire/${poster.PosterID}`;

            // Position URL underneath QR code
            const urlBoxY = qrY + qrSize + 20;
            const urlBoxWidth = contentWidth - 20; // Full width minus margins for URL
            const boxHeight = 20;

            // URL container box
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin + 10, urlBoxY, urlBoxWidth, boxHeight, "F");
            pdf.setDrawColor(...primaryColor);
            pdf.rect(margin + 10, urlBoxY, urlBoxWidth, boxHeight, "S");

            // URL label
            pdf.setTextColor(...primaryColor);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.text("URL:", margin + 15, urlBoxY + 8);

            // Display URL as a clickable link underneath QR code
            pdf.setTextColor(0, 0, 255); // Blue color for clickable URL
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9); // Readable font size for longer URLs

            // Add URL as a clickable link
            const urlText = url;
            const urlX = margin + 15;
            const urlY = urlBoxY + 16;

            pdf.textWithLink(urlText, urlX, urlY, { url: url });

            // Add underline to show it's clickable
            pdf.setDrawColor(0, 0, 255);
            pdf.setLineWidth(0.3);
            const textWidth = pdf.getTextWidth(urlText);
            pdf.line(urlX, urlY + 1, urlX + textWidth, urlY + 1);
          }
        }
      }

      // Footer on all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(...primaryColor);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

        // Footer text
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text("EventRate Pro", margin, pageHeight - 10);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
      }

      // Download PDF
      pdf.save(`EventRate-Pro-Export-${eventData?.eventID || "report"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF. Please try again.", "error");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);

      // First, try the backend API
      const response = await fetch("https://eventrate-pro.de/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posters,
          refereeList,
          eventData,
        }),
      });

      if (response.ok) {
        // Create blob from response
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `referee-list-${eventData?.eventID || "export"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Automatically start the event after successful PDF download
        await startEventAutomatically();
      } else {
        throw new Error("Backend PDF generation failed");
      }
    } catch (error) {
      console.log(
        "Backend PDF generation failed, using client-side generation"
      );
      // Fallback to client-side PDF generation
      await generatePDFClientSide();

      // Automatically start the event after successful client-side PDF generation
      await startEventAutomatically();
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to automatically start the event
  const startEventAutomatically = async () => {
    if (!eventData?.eventID) {
      console.log("No event ID available for auto-start");
      return;
    }

    try {
      console.log(`Auto-starting event ${eventData.eventID}...`);
      const response = await fetch(
        `https://eventrate-pro.de/dashboard/startEvent?eventID=${eventData.eventID}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Event started automatically after PDF download");
        showToast(
          "PDF downloaded successfully! Event has been started automatically.",
          "success"
        );

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate(`/dashboard/${eventData.eventID}`);
        }, 2000);
      } else {
        console.error("Failed to auto-start event:", data.error);
        showToast(
          "PDF downloaded successfully, but failed to start event automatically. You can start it manually from the dashboard.",
          "error"
        );

        // Still redirect to dashboard
        setTimeout(() => {
          navigate(`/dashboard/${eventData.eventID}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Error auto-starting event:", error);
      showToast(
        "PDF downloaded successfully, but failed to start event automatically. You can start it manually from the dashboard.",
        "error"
      );

      // Still redirect to dashboard
      setTimeout(() => {
        navigate(`/dashboard/${eventData.eventID}`);
      }, 3000);
    }
  };

  return (
    <div className="pdf-export-page">
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
      <div className="back-arrow" onClick={handleBackClick}>
        ← Back
      </div>

      {/* Modern Header */}
      <div className="pdf-export-header">
        <div className="header-content">
          <div className="header-logo">
            <img src={erpLogo} alt="ERP Logo" className="logo-img" />
          </div>
          <div className="header-text">
            <h1 className="header-title">📄 Export Ready</h1>
            <p className="header-subtitle">
              Review your QR codes and referee list before downloading the PDF
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pdf-export-content">
        {/* Left Section: QR Codes */}
        <div className="pdf-export-left">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📱</span>
              QR Codes Preview
            </h2>
            <p className="section-description">
              These QR codes will be included in your PDF. Each code links to
              the voting questionnaire for that specific item.
            </p>
            <div className="section-stats">
              <div className="stat-badge">
                <span className="stat-number">{posters?.length || 0}</span>
                <span className="stat-label">QR Codes</span>
              </div>
            </div>
          </div>

          {/* QR Codes Grid */}
          <div className="qr-codes-grid">
            {posters && posters.length > 0 ? (
              posters.map((poster, index) => (
                <div key={poster.PosterID || index} className="qr-code-card">
                  <div className="qr-code-header">
                    <span className="qr-index">#{index + 1}</span>
                    <h3 className="qr-title">
                      {poster.Title || `Poster ${index + 1}`}
                    </h3>
                  </div>
                  <div className="qr-code-container">
                    <QRCodeCanvas
                      value={
                        poster.content ||
                        `https://event-rate-pro.vercel.app/questionnaire/${poster.PosterID}`
                      }
                      size={120}
                      style={{ backgroundColor: "white" }}
                    />
                  </div>
                  <div className="qr-code-footer">
                    <span className="qr-status">✓ Ready for PDF</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📱</div>
                <h3 className="empty-title">No QR Codes</h3>
                <p className="empty-description">
                  No QR codes have been created yet. Go back to add some QR
                  codes first.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Referee List & Actions */}
        <div className="pdf-export-right">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">👥</span>
              Referee Overview
            </h2>
            <p className="section-description">
              These referees will have access to evaluate submissions and will
              be listed in the PDF report.
            </p>
            <div className="section-stats">
              <div className="stat-badge">
                <span className="stat-number">{refereeList?.length || 0}</span>
                <span className="stat-label">Referees</span>
              </div>
            </div>
          </div>

          {/* Referee List Card */}
          <div className="referee-list-card">
            <div className="referee-list-header">
              <h3 className="referee-list-title">
                <span className="list-icon">📋</span>
                Referee List
              </h3>
            </div>

            <div className="referee-list-content">
              {refereeList && refereeList.length > 0 ? (
                <div className="referee-items">
                  {refereeList.map((referee, index) => (
                    <div key={index} className="referee-item">
                      <span className="referee-avatar">👤</span>
                      <span className="referee-email">{referee}</span>
                      <span className="referee-status">✓</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="referee-empty-state">
                  <div className="referee-empty-icon">👥</div>
                  <p className="referee-empty-text">No referees added</p>
                  <p className="referee-empty-hint">
                    Go back to add referees first
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Download Section */}
          <div className="download-section">
            <div className="download-info">
              <h3 className="download-title">📄 PDF Export</h3>
              <p className="download-description">
                Download a comprehensive PDF containing all QR codes and referee
                information. The event will start automatically after download.
              </p>
            </div>

            <button
              className={`download-btn ${isGenerating ? "generating" : ""} ${
                !posters ||
                posters.length === 0 ||
                !refereeList ||
                refereeList.length === 0
                  ? "disabled"
                  : ""
              }`}
              onClick={handleDownloadPDF}
              disabled={
                isGenerating ||
                !posters ||
                posters.length === 0 ||
                !refereeList ||
                refereeList.length === 0
              }
            >
              {isGenerating ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">📥</span>
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {(!posters ||
              posters.length === 0 ||
              !refereeList ||
              refereeList.length === 0) && (
              <div className="download-requirements">
                <p className="requirements-text">
                  <span className="requirements-icon">⚠️</span>
                  You need at least 1 QR code and 1 referee to generate the PDF
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFExport;

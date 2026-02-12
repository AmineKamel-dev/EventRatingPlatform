import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AccountOverview from "./components/AccountOverview";
import Questionnaire from "./components/Questionnaire";
import CreateQuestionnaire from "./components/CreateQuestionnaire";
import SelectionDashboard from "./components/SelectionDashboard";
import Dashboard from "./components/Dashboard";
import LoginGuard from "./context/AuthGuard";
import { AuthProvider } from "./context/AuthContext";
import QRCode from "./components/QRCode";
import EventDetails from "./components/Eventdetails";
import Voting from "./components/Voting";
import PDFExport from "./components/PDFExport";
import VoteRoleSelection from "./components/VoteRoleSelection";
import History from "./components/History";
import HistoryDetails from "./components/HistoryDetails";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/account-overview"
              element={
                <LoginGuard>
                  {" "}
                  <AccountOverview />{" "}
                </LoginGuard>
              }
            />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route
              path="/create-questionnaire"
              element={
                <LoginGuard>
                  {" "}
                  <CreateQuestionnaire />{" "}
                </LoginGuard>
              }
            />
            <Route path="/qr-code" element={<QRCode />} />
            <Route path="/event-details" element={<EventDetails />} />
            <Route path="/pdf-export" element={<PDFExport />} />
            <Route
              path="/selection-dashboard"
              element={<SelectionDashboard />}
            />
            <Route path="/dashboard/:eventID" element={<Dashboard />} />
            <Route
              path="/history"
              element={
                <LoginGuard>
                  <History />
                </LoginGuard>
              }
            />
            <Route
              path="/history/:eventID"
              element={
                <LoginGuard>
                  <HistoryDetails />
                </LoginGuard>
              }
            />
            <Route
              path="/vote/:questionnaireID/:posterID"
              element={<Voting />}
            />
            <Route
              path="/choose-role/:questionnaireID/:posterID"
              element={<VoteRoleSelection />}
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

//<Route path="/:questionnaireID/:posterID" element={<Voting />} />

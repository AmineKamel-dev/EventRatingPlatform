import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import "./Register.css";
import erpLogo from "../assets/erp.png";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [userUid, setUserUid] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const navigate = useNavigate();
  const isComplete =
    email &&
    username &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  const handleRegister = async () => {
    console.log("Registration started");
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Creating user account...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User created:", user.uid);

      console.log("Updating profile...");
      await updateProfile(userCredential.user, {
        displayName: username,
      });
      console.log("Profile updated");

      console.log("Saving to Firestore...");
      // write user-data in Firestore with temporary role
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        role: "pending", // temporary role until user selects
      });
      console.log("User data saved to Firestore");

      console.log("Setting role selection state...");
      setUserUid(user.uid);
      setShowRoleSelection(true);
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    setRoleLoading(true);
    try {
      // Update user role in Firestore
      await updateDoc(doc(db, "users", userUid), {
        role: selectedRole,
      });

      // Create sample templates for the new user (regardless of role)
      try {
        console.log("Creating sample templates for new user...");
        const templateResponse = await fetch(
          "https://eventrate-pro.de/template/createSampleTemplates",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: userUid,
            }),
          }
        );

        const templateResult = await templateResponse.json();
        if (templateResult.status === "success") {
          console.log(
            "Sample templates created successfully:",
            templateResult.templates
          );
        } else {
          console.warn(
            "Failed to create sample templates:",
            templateResult.message
          );
          // Don't block registration if template creation fails
        }
      } catch (templateError) {
        console.error("Error creating sample templates:", templateError);
        // Don't block registration if template creation fails
      }

      // Navigate to login after role is set and templates are created
      navigate("/login");
    } catch (error) {
      setError("Failed to set role. Please try again.");
    } finally {
      setRoleLoading(false);
    }
  };

  // If role selection is needed, show role selection UI
  if (showRoleSelection) {
    console.log("Rendering role selection UI");
    return (
      <div className="register-page">
        <div className="logo-header">
          <img src={erpLogo} alt="ERP Logo" className="center-logo" />
        </div>
        <div className="role-selection">
          <h2>Choose Your Role</h2>
          <p>Please select your role to complete the registration:</p>
          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
          )}
          <div className="role-buttons">
            <button
              className="role-button organizer"
              onClick={() => handleRoleSelection("organizer")}
              disabled={roleLoading}
            >
              <h3>Organizer</h3>
              <p>Create and manage events</p>
            </button>
            <button
              className="role-button referee"
              onClick={() => handleRoleSelection("referee")}
              disabled={roleLoading}
            >
              <h3>Referee</h3>
              <p>Participate in events and provide feedback</p>
            </button>
          </div>
          {roleLoading && (
            <div className="loading-message">
              Setting up your account and creating sample templates...
            </div>
          )}
        </div>
      </div>
    );
  }

  console.log(
    "Rendering registration form, showRoleSelection:",
    showRoleSelection
  );

  return (
    <div className="register-page">
      <div className="logo-header">
        <img src={erpLogo} alt="ERP Logo" className="center-logo" />
      </div>

      <form
        className="reginfor"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          className="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="username">Username</label>
        <input
          id="username"
          className="n-text"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="pass">Password</label>
        <input
          id="pass"
          className="p-text"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="pass2">Confirm your password</label>
        <input
          id="pass2"
          className="c-text"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}
        <button
          className="register"
          type="submit"
          disabled={!isComplete || loading}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;

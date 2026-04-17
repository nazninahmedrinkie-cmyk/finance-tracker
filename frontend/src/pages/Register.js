import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import "./Auth.css";

function Register() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setMessage("All fields are required");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await registerUser({ name, email, password });

      if (response.data.status === "success") {
        setMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Server error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;

  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthClass = ["", "weak", "good", "strong"];

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-overlay"></div>
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>

      {/* Left Panel */}
      <div className="auth-left">
        <Link to="/" className="auth-brand">
          <i className="fas fa-chart-line"></i>
          <span>FinTrack</span>
        </Link>
        <div className="auth-left-content">
          <h2>Start your journey.</h2>
          <p>Join thousands of users who've taken control of their finances. Set up your free account in under a minute.</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <i className="fas fa-infinity"></i>
              <span>Unlimited transactions</span>
            </div>
            <div className="auth-feature-item">
              <i className="fas fa-tags"></i>
              <span>Smart categorization</span>
            </div>
            <div className="auth-feature-item">
              <i className="fas fa-wallet"></i>
              <span>Budget tracking</span>
            </div>
          </div>
        </div>
        <div className="auth-left-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-switch-link">Sign in <i className="fas fa-arrow-right"></i></Link>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-icon-wrap register-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h1>Create Account</h1>
            <p>Fill in your details to get started for free</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <label><i className="fas fa-user"></i> Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label><i className="fas fa-envelope"></i> Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label><i className="fas fa-key"></i> Password</label>
              <div className="pass-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {password.length > 0 && (
                <div className="strength-bar-wrap">
                  <div className={`strength-bar ${strengthClass[strength]}`}>
                    <span style={{ width: `${(strength / 3) * 100}%` }}></span>
                  </div>
                  <span className={`strength-label ${strengthClass[strength]}`}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            {message && (
              <div className={`auth-message ${message.includes("successful") ? "success" : "error"}`}>
                <i className={`fas ${message.includes("successful") ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
                {message}
              </div>
            )}

            <button type="submit" className="auth-submit-btn register-btn" disabled={isLoading}>
              {isLoading
                ? <><i className="fas fa-spinner fa-spin"></i> Creating account...</>
                : <><i className="fas fa-rocket"></i> Create Account</>
              }
            </button>
          </form>

          <p className="auth-bottom-link">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
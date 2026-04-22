import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import "./Auth.css";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await loginUser({ email, password });

      if (response.data.status === "success") {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        setMessage("Login successful!");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Server error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2>Welcome back.</h2>
          <p>Your financial journey continues here. Log in to view your dashboard, track expenses, and stay on top of your goals.</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <i className="fas fa-shield-halved"></i>
              <span>Bank-level security</span>
            </div>
            <div className="auth-feature-item">
              <i className="fas fa-bolt"></i>
              <span>Real-time sync</span>
            </div>
            <div className="auth-feature-item">
              <i className="fas fa-chart-pie"></i>
              <span>Smart analytics</span>
            </div>
          </div>
        </div>
        <div className="auth-left-footer">
          <span>Don't have an account?</span>
          <Link to="/register" className="auth-switch-link">Create one free <i className="fas fa-arrow-right"></i></Link>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-icon-wrap">
              <i className="fas fa-lock-open"></i>
            </div>
            <h1>Sign In</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
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
                  placeholder="Enter your password"
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
            </div>

            {message && (
              <div className={`auth-message ${message.includes("successful") ? "success" : "error"}`}>
                <i className={`fas ${message.includes("successful") ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
                {message}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading
                ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                : <><i className="fas fa-right-to-bracket"></i> Sign In</>
              }
            </button>
          </form>

          <p className="auth-bottom-link">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
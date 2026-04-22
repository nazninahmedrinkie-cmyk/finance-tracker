import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import logo from "./images/logo.png";

function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-wrapper">
      {/* Background Image Overlay */}
      <div className="bg-overlay"></div>

      {/* Floating Decorative Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <img src={logo} alt="FinTrack Logo" className="nav-logo-icon" />
          <span className="nav-logo-text">FinTrack</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-btn-outline">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
          <Link to="/register" className="nav-btn-filled">
            <i className="fas fa-user-plus"></i> Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-content animate-on-scroll">
          <div className="hero-badge">
            <i className="fas fa-shield-alt"></i>
            <span>Secure &amp; Smart Finance Management</span>
          </div>

          <h1 className="hero-title">
            Take Control of <br />
            <span className="gradient-text">Your Finances</span>
          </h1>

          <p className="hero-subtitle">
            Track every rupee, visualize your spending patterns, and build
            lasting financial habits — all in one beautifully designed dashboard.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="cta-primary">
              <i className="fas fa-rocket"></i>
              Start for Free
            </Link>
            <Link to="/login" className="cta-secondary">
              <i className="fas fa-play-circle"></i>
              Already a member?
            </Link>
          </div>

          {/* Stats Row */}
          <div className="stats-row animate-on-scroll">
            <div className="stat-pill">
              <i className="fas fa-users"></i>
              <span><strong>10K+</strong> Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-pill">
              <i className="fas fa-rupee-sign"></i>
              <span><strong>₹50Cr+</strong> Tracked</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-pill">
              <i className="fas fa-star"></i>
              <span><strong>4.9</strong> Rating</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards animate-on-scroll">
          <div className="feature-card card-income">
            <div className="card-icon-wrap">
              <i className="fas fa-arrow-trend-up"></i>
            </div>
            <h3>Income Tracking</h3>
            <p>Log all income sources and watch your earnings grow over time.</p>
            <div className="card-tag">
              <i className="fas fa-circle-check"></i> Real-time Updates
            </div>
          </div>

          <div className="feature-card card-expense">
            <div className="card-icon-wrap">
              <i className="fas fa-wallet"></i>
            </div>
            <h3>Expense Control</h3>
            <p>Categorize and monitor every expense to stay within budget.</p>
            <div className="card-tag">
              <i className="fas fa-circle-check"></i> Smart Categories
            </div>
          </div>

          <div className="feature-card card-analytics">
            <div className="card-icon-wrap">
              <i className="fas fa-chart-pie"></i>
            </div>
            <h3>Visual Analytics</h3>
            <p>Insightful charts and graphs for deep financial understanding.</p>
            <div className="card-tag">
              <i className="fas fa-circle-check"></i> Rich Visualizations
            </div>
          </div>

          <div className="feature-card card-balance">
            <div className="card-icon-wrap">
              <i className="fas fa-scale-balanced"></i>
            </div>
            <h3>Net Balance</h3>
            <p>Instantly see your net worth and overall financial health.</p>
            <div className="card-tag">
              <i className="fas fa-circle-check"></i> Live Dashboard
            </div>
          </div>
        </div>
      </section>

      {/* Footer Strip */}
      <footer className="home-footer">
        <p>
          <i className="fas fa-lock"></i> Your data is encrypted &amp; private &nbsp;|&nbsp;
          <i className="fas fa-bolt"></i> Built with React &amp; PHP
        </p>
      </footer>
    </div>
  );
}

export default Home;
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const NAV = [
  { to: "/dashboard",       icon: "fa-gauge-high",          label: "Dashboard"       },
  { to: "/transactions",    icon: "fa-arrows-left-right",   label: "Transactions"    },
  { to: "/add-transaction", icon: "fa-plus-circle",         label: "Add Transaction" },
  { to: "/categories",      icon: "fa-tags",                label: "Categories"      },
  { to: "/profile",         icon: "fa-circle-user",         label: "Profile"         },
];

export default function Sidebar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Preventing body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", open);
    return () => document.body.classList.remove("sidebar-open");
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/*  Hamburger button */}
      <button
        className={`sidebar-hamburger ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${open ? "sidebar--mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <i className="fas fa-chart-line"></i>
          <span>FinTrack</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-item ${location.pathname === to ? "active" : ""}`}
            >
              <i className={`fas ${icon}`}></i>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="fas fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
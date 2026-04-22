import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getSummary } from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Profile.css";

const API_URL = "http://localhost/finance-tracker/backend/api/";

const fmt = (n) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency", currency: "GBP", maximumFractionDigits: 0,
  }).format(n || 0);

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function Profile() {
  const navigate = useNavigate();
  const [user,       setUser]       = useState(null);
  const [summary,    setSummary]    = useState(null);
  const [toast,      setToast]      = useState(null);
  const [pwForm,     setPwForm]     = useState({ current: "", newPw: "", confirm: "" });
  const [pwErrors,   setPwErrors]   = useState({});
  const [pwMsg,      setPwMsg]      = useState(null);
  const [pwSaving,   setPwSaving]   = useState(false);
  const [showPw,     setShowPw]     = useState({ current: false, newPw: false, confirm: false });
  const [editName,   setEditName]   = useState(false);
  const [nameVal,    setNameVal]    = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/login"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    setNameVal(parsed.name);
  }, [navigate]);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    try {
      const r = await getSummary(user.id);
      if (r.data.status === "success") setSummary(r.data.data);
    } catch {}
  }, [user]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleNameSave = async () => {
    if (!nameVal.trim()) return;
    setNameSaving(true);
    try {
      const r = await axios.post(API_URL + "auth/update_profile.php", {
        user_id: user.id, name: nameVal.trim(),
      });
      if (r.data.status === "success") {
        const upd = { ...user, name: nameVal.trim() };
        localStorage.setItem("user", JSON.stringify(upd));
        setUser(upd);
        setEditName(false);
        showToast("Name updated!", "success");
      } else {
        showToast(r.data.message || "Update failed.", "error");
      }
    } catch {
      showToast("Server error.", "error");
    } finally {
      setNameSaving(false);
    }
  };

  const validatePw = () => {
    const e = {};
    if (!pwForm.current)              e.current = "Enter current password";
    if (!pwForm.newPw)                e.newPw   = "Enter new password";
    if (pwForm.newPw.length < 6)      e.newPw   = "Minimum 6 characters";
    if (pwForm.newPw !== pwForm.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const handlePasswordChange = async (ev) => {
    ev.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      const r = await axios.post(API_URL + "auth/change_password.php", {
        user_id: user.id,
        current_password: pwForm.current,
        new_password: pwForm.newPw,
      });
      if (r.data.status === "success") {
        setPwMsg({ type: "success", text: "Password changed!" });
        setPwForm({ current: "", newPw: "", confirm: "" });
      } else {
        setPwMsg({ type: "error", text: r.data.message || "Failed to change password." });
      }
    } catch {
      setPwMsg({ type: "error", text: "Server error." });
    } finally {
      setPwSaving(false);
    }
  };

  if (!user) return null;

  const balance    = (summary?.total_income || 0) - (summary?.total_expense || 0);
  const memberDays = user.created_at
    ? Math.floor((Date.now() - new Date(user.created_at)) / 86400000)
    : 0;

  const pwFields = [
    { field: "current", label: "Current Password",  ph: "Your current password"  },
    { field: "newPw",   label: "New Password",       ph: "Minimum 6 characters"   },
    { field: "confirm", label: "Confirm Password",   ph: "Repeat new password"    },
  ];

  const stats = [
    { label: "Total Income",    val: fmt(summary?.total_income),  cls: "income"  },
    { label: "Total Expenses",  val: fmt(summary?.total_expense), cls: "expense" },
    { label: "Net Balance",     val: fmt(balance), cls: balance >= 0 ? "income" : "expense" },
    { label: "Savings Rate",    val: `${summary?.savings_rate ?? 0}%`, cls: "purple" },
    { label: "Transactions",    val: summary?.total_transactions ?? 0, cls: "" },
  ];

  return (
    <div className="page-root">
      <Sidebar />
      <main className="page-main">
        <div className="page-scrollable" style={{ paddingTop: "32px" }}>

          {/*  Page header  */}
          <div className="page-header" style={{ marginBottom: "6px" }}>
            <div>
              <h1 style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: "2rem", color: "#fff", margin: 0 }}>
                Profile
              </h1>
              <p className="page-sub-dark">Manage your account</p>
            </div>
          </div>

          <div className="profile-layout">

            {/*  LEFT COLUMN  */}
            <div className="profile-col">

              <div className="profile-hero">
                <div className="profile-avatar">{getInitials(user.name)}</div>

                {editName ? (
                  <div className="profile-name-edit">
                    <input
                      autoFocus
                      value={nameVal}
                      onChange={(e) => setNameVal(e.target.value)}
                      className="inp"
                      style={{ textAlign: "center" }}
                    />
                    <div className="profile-name-actions">
                      <button
                        className="btn-ghost"
                        style={{ padding: "7px 16px", fontSize: "0.80rem" }}
                        onClick={() => { setEditName(false); setNameVal(user.name); }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-primary sm"
                        onClick={handleNameSave}
                        disabled={nameSaving}
                      >
                        {nameSaving
                          ? <i className="fas fa-spinner fa-spin"></i>
                          : <><i className="fas fa-check"></i> Save</>
                        }
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-name-row">
                    <span className="profile-name">{user.name}</span>
                    <button className="icon-btn" title="Edit name" onClick={() => setEditName(true)}>
                      <i className="fas fa-pen"></i>
                    </button>
                  </div>
                )}

                <p className="profile-email">
                  <i className="fas fa-envelope"></i>{user.email}
                </p>
                {memberDays > 0 && (
                  <p className="profile-since">
                    <i className="fas fa-calendar-check"></i>
                    Member for {memberDays} day{memberDays !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Financial snapshot */}
              {summary && (
                <div className="card">
                  <p className="section-title">
                    <i className="fas fa-chart-simple"></i> Financial Snapshot
                  </p>
                  <div className="profile-stat-list">
                    {stats.map(({ label, val, cls }) => (
                      <div key={label} className="profile-stat">
                        <span className="profile-stat-label">{label}</span>
                        <span className={`profile-stat-val ${cls}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/*  RIGHT COLUMN  */}
            <div className="profile-col">

              {/* Change password */}
              <div className="card">
                <p className="section-title">
                  <i className="fas fa-lock"></i> Change Password
                </p>
                <form onSubmit={handlePasswordChange} noValidate className="pw-form">
                  {pwFields.map(({ field, label, ph }) => (
                    <div key={field} className="field">
                      <label>{label}</label>
                      <div className={`pw-field-wrap ${pwErrors[field] ? "invalid" : ""}`}>
                        <input
                          type={showPw[field] ? "text" : "password"}
                          placeholder={ph}
                          value={pwForm[field]}
                          onChange={(e) => {
                            setPwForm((p) => ({ ...p, [field]: e.target.value }));
                            setPwErrors((p) => ({ ...p, [field]: "" }));
                          }}
                        />
                        <button
                          type="button"
                          className="pw-toggle"
                          onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                          title={showPw[field] ? "Hide" : "Show"}
                        >
                          <i className={`fas ${showPw[field] ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>
                      {pwErrors[field] && <span className="field-err">{pwErrors[field]}</span>}
                    </div>
                  ))}

                  {pwMsg && (
                    <div className={`msg ${pwMsg.type}`}>
                      <i className={`fas ${pwMsg.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
                      {pwMsg.text}
                    </div>
                  )}

                  <button type="submit" className="btn-primary full" disabled={pwSaving}>
                    {pwSaving
                      ? <><i className="fas fa-spinner fa-spin"></i> Updating…</>
                      : <><i className="fas fa-key"></i> Update Password</>
                    }
                  </button>
                </form>
              </div>

              {/* Account info */}
              <div className="card">
                <p className="section-title">
                  <i className="fas fa-circle-info"></i> Account Info
                </p>
                <div className="info-rows">
                  {[
                    { label: "User ID", val: `#${user.id}` },
                    { label: "Email",   val: user.email    },
                    {
                      label: "Joined",
                      val: user.created_at
                        ? new Date(user.created_at).toLocaleDateString("en-GB", { dateStyle: "long" })
                        : "—",
                    },
                  ].map(({ label, val }) => (
                    <div key={label} className="info-row">
                      <span className="info-label">{label}</span>
                      <span className="info-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            <i className={`fas ${toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
            {toast.msg}
          </div>
        )}
      </main>
    </div>
  );
}
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getTransactions, deleteTransaction } from "../services/api";
import Sidebar from "../components/Sidebar";

import bgImage from "./images/add.png";

import "./Transactions.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const CAT_ICONS = {
  Salary: "fa-briefcase", Freelance: "fa-laptop-code", Food: "fa-utensils",
  Transport: "fa-bus", Shopping: "fa-bag-shopping", Rent: "fa-house",
  Health: "fa-heart-pulse", Entertainment: "fa-film", Travel: "fa-plane",
  Education: "fa-graduation-cap", Gifts: "fa-gift", default: "fa-circle-dot",
};

export default function Transactions() {
  const navigate = useNavigate();
  const [user, setUser]                 = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [deleteId, setDeleteId]         = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [toast, setToast]               = useState(null);
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [sortBy, setSortBy]             = useState("date_desc");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/login"); return; }
    setUser(JSON.parse(u));
  }, [navigate]);

  const fetchTx = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getTransactions(user.id);
      if (res.data.status === "success") setTransactions(res.data.data || []);
    } catch {
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  useEffect(() => {
    let list = [...transactions];
    if (typeFilter !== "all") list = list.filter(t => t.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.description || "").toLowerCase().includes(q) ||
        (t.category_name || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date_asc")  return new Date(a.date) - new Date(b.date);
      if (sortBy === "amt_desc")  return b.amount - a.amount;
      if (sortBy === "amt_asc")   return a.amount - b.amount;
      return 0;
    });
    setFiltered(list);
  }, [transactions, typeFilter, search, sortBy]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await deleteTransaction(deleteId);
      if (res.data.status === "success") {
        setTransactions(p => p.filter(t => t.id !== deleteId));
        showToast("Transaction deleted.", "success");
      } else {
        showToast("Delete failed.", "error");
      }
    } catch {
      showToast("Server error.", "error");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totalIncome  = filtered.filter(t => t.type === "income").reduce((s, t) => s + +t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + +t.amount, 0);

  return (
    <div
      className="page-root"
      style={{ "--page-bg-img": `url(${bgImage})` }}
    >
      <Sidebar />
      <main className="page-main">
        <div className="page-banner">
          <div className="page-banner-text">
            <div>
              <h1 className="page-title">Transactions</h1>
              <p className="page-sub">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <Link to="/add-transaction" className="btn-primary">
              <i className="fas fa-plus"></i> Add Transaction
            </Link>
          </div>
        </div>

        <div className="page-scrollable">
          <div className="tx-filterbar">
            <div className="tx-search-box">
              <i className="fas fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search description or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="tx-clear-btn" onClick={() => setSearch("")}>
                  <i className="fas fa-xmark"></i>
                </button>
              )}
            </div>
            <div className="tx-filter-group">
              <div className="tx-type-tabs">
                {["all", "income", "expense"].map(t => (
                  <button
                    key={t}
                    className={`tx-type-tab ${typeFilter === t ? "active " + t : ""}`}
                    onClick={() => setTypeFilter(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <select
                className="tx-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="amt_desc">Highest amount</option>
                <option value="amt_asc">Lowest amount</option>
              </select>
            </div>
          </div>

          <div className="tx-pills">
            <span className="pill income">
              <i className="fas fa-arrow-trend-up"></i> {fmt(totalIncome)}
            </span>
            <span className="pill expense">
              <i className="fas fa-arrow-trend-down"></i> {fmt(totalExpense)}
            </span>
            <span className="pill balance">
              <i className="fas fa-scale-balanced"></i> {fmt(totalIncome - totalExpense)}
            </span>
          </div>

          {loading ? (
            <div className="state-box">
              <div className="spinner"></div>
              <p>Loading…</p>
            </div>
          ) : error ? (
            <div className="state-box">
              <i className="fas fa-triangle-exclamation"></i>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="state-box">
              <i className="fas fa-inbox"></i>
              <p>No transactions found.</p>
              <Link to="/add-transaction" className="btn-primary sm">Add your first</Link>
            </div>
          ) : (
            <div className="tx-table-wrap">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, idx) => (
                    <tr key={tx.id} style={{ animationDelay: `${idx * 0.03}s` }}>
                      <td className="tx-num">{idx + 1}</td>
                      <td>
                        <div className="tx-cat">
                          <span className={`tx-cat-icon ${tx.type}`}>
                            <i className={`fas ${CAT_ICONS[tx.category_name] || CAT_ICONS.default}`}></i>
                          </span>
                          {tx.category_name}
                        </div>
                      </td>
                      <td className="tx-desc-cell">
                        {tx.description || <span className="no-desc">—</span>}
                      </td>
                      <td className="tx-date-cell">{fmtDate(tx.date)}</td>
                      <td>
                        <span className={`type-badge ${tx.type}`}>{tx.type}</span>
                      </td>
                      <td className={`tx-amount-cell ${tx.type}`}>
                        {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                      </td>
                      <td>
                        <div className="tx-actions">
                          <button
                            className="action-btn edit"
                            onClick={() => navigate(`/add-transaction?edit=${tx.id}`)}
                            title="Edit"
                          >
                            <i className="fas fa-pen"></i>
                          </button>
                          <button
                            className="action-btn del"
                            onClick={() => setDeleteId(tx.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-icon danger">
                <i className="fas fa-trash-can"></i>
              </div>
              <h3>Delete Transaction?</h3>
              <p>This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="modal-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="modal-confirm" onClick={confirmDelete} disabled={deleting}>
                  {deleting
                    ? <><i className="fas fa-spinner fa-spin"></i> Deleting…</>
                    : "Yes, Delete"
                  }
                </button>
              </div>
            </div>
          </div>
        )}

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
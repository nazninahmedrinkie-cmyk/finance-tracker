import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCategories, addTransaction, updateTransaction, getTransactions } from "../services/api";
import Sidebar from "../components/Sidebar";
import addImg from "./images/add.png";
import "./AddTransaction.css";

const today = () => new Date().toISOString().split("T")[0];
const EMPTY = { type: "expense", amount: "", category_id: "", description: "", date: today() };

export default function AddTransaction() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const isEdit = !!editId;

  const [user,       setUser]       = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [message,    setMessage]    = useState(null);
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/login"); return; }
    setUser(JSON.parse(u));
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getCategories();
        if (r.data.status === "success") setCategories(r.data.data || []);
      } catch {}
      finally { setCatLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isEdit || !user) return;
    const load = async () => {
      try {
        const r = await getTransactions(user.id);
        if (r.data.status === "success") {
          const tx = (r.data.data || []).find(t => String(t.id) === editId);
          if (tx) setForm({
            type: tx.type,
            amount: tx.amount,
            category_id: tx.category_id,
            description: tx.description || "",
            date: tx.date,
          });
        }
      } catch {}
    };
    load();
  }, [isEdit, editId, user]);

  const filteredCats = categories.filter(c => c.type === form.type);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value, ...(name === "type" ? { category_id: "" } : {}) }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = "Enter a valid positive amount";
    if (!form.category_id) e.category_id = "Select a category";
    if (!form.date) e.date = "Select a date";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setMessage(null);
    try {
      const payload = { ...form, user_id: user.id };
      if (isEdit) payload.id = editId;
      const res = isEdit ? await updateTransaction(payload) : await addTransaction(payload);
      if (res.data.status === "success") {
        setMessage({ type: "success", text: isEdit ? "Transaction updated!" : "Transaction added!" });
        if (!isEdit) setForm(EMPTY);
        setTimeout(() => navigate("/transactions"), 1400);
      } else {
        setMessage({ type: "error", text: res.data.message || "Operation failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <Sidebar />
      <main className="page-main">

        {/* ── Hero banner ── */}
        <div className="page-banner">
          <img src={addImg} alt="Add Transaction" />
          <div className="page-banner-overlay" />
          <div className="page-banner-text">
            <div>
              <h1 className="page-title">{isEdit ? "Edit Transaction" : "Add Transaction"}</h1>
              <p className="page-sub">{isEdit ? "Update the transaction details below" : "Record a new income or expense"}</p>
            </div>
          </div>
        </div>

        <div className="page-scrollable">
          <div className="at-layout">

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

              <div className="at-type-toggle">
                <button
                  type="button"
                  className={`at-type-btn expense ${form.type === "expense" ? "active" : ""}`}
                  onClick={() => handleChange({ target: { name: "type", value: "expense" } })}
                >
                  <i className="fas fa-arrow-up-right-from-square"></i> Expense
                </button>
                <button
                  type="button"
                  className={`at-type-btn income ${form.type === "income" ? "active" : ""}`}
                  onClick={() => handleChange({ target: { name: "type", value: "income" } })}
                >
                  <i className="fas fa-arrow-down-left"></i> Income
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                <div className="field">
                  <label>Amount (£)</label>
                  <div className={`amount-wrap ${errors.amount ? "invalid" : ""}`}>
                    <span className="amount-currency">£</span>
                    <input
                      type="number"
                      name="amount"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="amount-input"
                    />
                  </div>
                  {errors.amount && <span className="field-err">{errors.amount}</span>}
                </div>

                <div className="field">
                  <label>Category</label>
                  {catLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.45)", fontSize: "0.84rem" }}>
                      <div className="spinner sm"></div>Loading categories…
                    </div>
                  ) : (
                    <div className="at-cat-grid">
                      {filteredCats.length === 0
                        ? <p style={{ color: "rgba(255,255,255,0.40)", fontSize: "0.84rem" }}>
                            No categories for {form.type}.{" "}
                            <a href="/categories" style={{ color: "var(--teal)" }}>Add one</a>
                          </p>
                        : filteredCats.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              className={`at-cat-chip ${String(form.category_id) === String(c.id) ? "selected " + form.type : ""}`}
                              onClick={() => handleChange({ target: { name: "category_id", value: c.id } })}
                            >
                              {c.name}
                            </button>
                          ))
                      }
                    </div>
                  )}
                  {errors.category_id && <span className="field-err">{errors.category_id}</span>}
                </div>

                <div className="field">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className={`inp ${errors.date ? "invalid" : ""}`}
                    max={today()}
                  />
                  {errors.date && <span className="field-err">{errors.date}</span>}
                </div>

                <div className="field">
                  <label>Description <span className="optional">(optional)</span></label>
                  <textarea
                    name="description"
                    placeholder="What was this for?"
                    value={form.description}
                    onChange={handleChange}
                    className="inp"
                    rows={3}
                  />
                </div>

                {message && (
                  <div className={`msg ${message.type}`}>
                    <i className={`fas ${message.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
                    {message.text}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="btn-ghost" onClick={() => navigate("/transactions")}>
                    Cancel
                  </button>
                  <button type="submit" className={`at-submit-btn ${form.type}`} disabled={loading}>
                    {loading
                      ? <><i className="fas fa-spinner fa-spin"></i>{isEdit ? "Updating…" : "Saving…"}</>
                      : <><i className={`fas ${isEdit ? "fa-floppy-disk" : "fa-plus"}`}></i>{isEdit ? "Update Transaction" : "Add Transaction"}</>
                    }
                  </button>
                </div>

              </form>
            </div>

            <div className="at-tips-card">
              <h3><i className="fas fa-lightbulb"></i> Quick Tips</h3>
              <ul>
                <li>Use <strong>Expense</strong> for money going out — food, bills, shopping.</li>
                <li>Use <strong>Income</strong> for money coming in — salary, freelance, gifts.</li>
                <li>Add a description to remember each transaction later.</li>
                <li>Manage categories from the <a href="/categories">Categories</a> page.</li>
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
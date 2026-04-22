import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { getSummary, getTransactions } from "../services/api";
import Sidebar from "../components/Sidebar";
import dashboardImg from "./images/dashboard.jpg";
import "./Dashboard.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency", currency: "GBP", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtAxis = (v) => `£${(v / 1000).toFixed(0)}k`;

const PIE_INCOME  = ["#00d4aa","#00a882","#4adecc","#a7f3e0","#6ee7d4"];
const PIE_EXPENSE = ["#ff4d6d","#e0365a","#ff7a93","#ffa3b5","#ffc8d3"];

const TICK = { fill: "rgba(255,255,255,0.60)", fontSize: 11, fontFamily: "Outfit, sans-serif" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      {label && <p className="db-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
};

const CAT_ICONS = {
  Salary: "fa-briefcase", Freelance: "fa-laptop-code", Food: "fa-utensils",
  Transport: "fa-bus", Shopping: "fa-bag-shopping", Rent: "fa-house",
  Health: "fa-heart-pulse", Entertainment: "fa-film", Travel: "fa-plane",
  Education: "fa-graduation-cap", Gifts: "fa-gift", default: "fa-circle-dot",
};

const StatCard = ({ icon, label, value, sub, accent, delay }) => (
  <div className="db-stat-card" style={{ "--accent": accent, animationDelay: delay }}>
    <div className="db-stat-icon">{icon}</div>
    <div className="db-stat-body">
      <span className="db-stat-label">{label}</span>
      <span className="db-stat-value">{value}</span>
      {sub && <span className="db-stat-sub">{sub}</span>}
    </div>
    <div className="db-stat-glow"></div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [user,         setUser]         = useState(null);
  const [summary,      setSummary]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [activeChart,  setActiveChart]  = useState("bar");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/login"); return; }
    setUser(JSON.parse(u));
  }, [navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const [sumRes, txRes] = await Promise.all([
        getSummary(user.id), getTransactions(user.id),
      ]);
      if (sumRes.data.status === "success") setSummary(sumRes.data.data);
      if (txRes.data.status  === "success") setTransactions(txRes.data.data || []);
    } catch { setError("Failed to load data. Check your connection."); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /*  Monthly chart data  */
  const monthlyMap = {};
  transactions.forEach(({ date, amount, type }) => {
    const m = new Date(date).toLocaleString("default", { month: "short", year: "2-digit" });
    if (!monthlyMap[m]) monthlyMap[m] = { month: m, income: 0, expense: 0 };
    monthlyMap[m][type === "income" ? "income" : "expense"] += parseFloat(amount);
  });
  const monthlyData = Object.values(monthlyMap).slice(-6);

  /*  Pie data  */
  const catInc = {}, catExp = {};
  transactions.forEach(({ category_name, amount, type }) => {
    const n = category_name || "Other";
    if (type === "income") catInc[n] = (catInc[n] || 0) + parseFloat(amount);
    else                   catExp[n] = (catExp[n] || 0) + parseFloat(amount);
  });
  const pieIncome  = Object.entries(catInc).map(([name, value]) => ({ name, value }));
  const pieExpense = Object.entries(catExp).map(([name, value]) => ({ name, value }));

  const recent      = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const balance     = (summary?.total_income || 0) - (summary?.total_expense || 0);
  const savingsRate = summary?.total_income ? Math.round((balance / summary.total_income) * 100) : 0;

  if (loading) return (
    <div className="db-loading">
      <div className="db-spinner"></div>
      <p>Loading your finances…</p>
    </div>
  );

  if (error) return (
    <div className="db-error-screen">
      <i className="fas fa-triangle-exclamation"></i>
      <p>{error}</p>
      <button onClick={fetchData}>Retry</button>
    </div>
  );

  return (
    <div className="db-root">
      <Sidebar />
      <main className="db-main">
        {/*  Hero banner  */}
        <div className="db-hero-banner">
          <img src={dashboardImg} alt="" />
          <div className="db-hero-overlay" />
          <div className="db-hero-content">
            <div>
              <h1 className="db-title">Dashboard</h1>
              <p className="db-subtitle">Welcome back, <strong>{user?.name}</strong></p>
            </div>
          </div>
        </div>

        <div className="db-content">
          {/*  Stat cards  */}
          <div className="db-stats">
            <StatCard
              icon={<i className="fas fa-arrow-trend-up"/>}
              label="Total Income"
              value={fmt(summary?.total_income)}
              sub={`${summary?.income_count || 0} entries`}
              accent="#00d4aa" delay="0s"
            />
            <StatCard
              icon={<i className="fas fa-arrow-trend-down"/>}
              label="Total Expenses"
              value={fmt(summary?.total_expense)}
              sub={`${summary?.expense_count || 0} entries`}
              accent="#ff4d6d" delay="0.07s"
            />
            <StatCard
              icon={<i className="fas fa-scale-balanced"/>}
              label="Net Balance"
              value={fmt(balance)}
              sub={balance >= 0 ? "Surplus 🎉" : "Over budget"}
              accent={balance >= 0 ? "#4d9fff" : "#fb923c"} delay="0.14s"
            />
            <StatCard
              icon={<i className="fas fa-piggy-bank"/>}
              label="Savings Rate"
              value={`${savingsRate}%`}
              sub="of income saved"
              accent="#a78bfa" delay="0.21s"
            />
          </div>

          {/*  Analytics  */}
          <div>
            <div className="db-section-header">
              <h2>Analytics</h2>
              <div className="db-chart-tabs">
                {["bar","area","pie"].map(t => (
                  <button
                    key={t}
                    className={`db-tab ${activeChart === t ? "active" : ""}`}
                    onClick={() => setActiveChart(t)}
                  >
                    {t === "bar" ? "Monthly" : t === "area" ? "Trend" : "By Category"}
                  </button>
                ))}
              </div>
            </div>

            <div className="db-chart-box">
              {/* Bar chart */}
              {activeChart === "bar" && (
                monthlyData.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyData} barCategoryGap="35%" barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                      <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false}/>
                      <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={52}/>
                      <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(255,255,255,0.04)" }}/>
                      <Legend wrapperStyle={{ color: "rgba(255,255,255,0.65)", fontSize: 12, paddingTop: 12 }}/>
                      <Bar dataKey="income"  name="Income"  fill="#00d4aa" radius={[5,5,0,0]} maxBarSize={48}/>
                      <Bar dataKey="expense" name="Expense" fill="#ff4d6d" radius={[5,5,0,0]} maxBarSize={48}/>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />
              )}

              {/* Area chart */}
              {activeChart === "area" && (
                monthlyData.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#00d4aa" stopOpacity={0.30}/>
                          <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ff4d6d" stopOpacity={0.30}/>
                          <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                      <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false}/>
                      <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={52}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{ color: "rgba(255,255,255,0.65)", fontSize: 12, paddingTop: 12 }}/>
                      <Area type="monotone" dataKey="income"  name="Income"  stroke="#00d4aa" fill="url(#gI)" strokeWidth={2}/>
                      <Area type="monotone" dataKey="expense" name="Expense" stroke="#ff4d6d" fill="url(#gE)" strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />
              )}

              {/* Pie charts */}
              {activeChart === "pie" && (
                <div className="db-pie-row">
                  <div className="db-pie-wrap">
                    <h3>Income Categories</h3>
                    {pieIncome.length ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={pieIncome} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                            {pieIncome.map((_, i) => <Cell key={i} fill={PIE_INCOME[i % PIE_INCOME.length]}/>)}
                          </Pie>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Legend wrapperStyle={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart small />}
                  </div>
                  <div className="db-pie-wrap">
                    <h3>Expense Categories</h3>
                    {pieExpense.length ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={pieExpense} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                            {pieExpense.map((_, i) => <Cell key={i} fill={PIE_EXPENSE[i % PIE_EXPENSE.length]}/>)}
                          </Pie>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Legend wrapperStyle={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart small />}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/*  Recent Transactions  */}
          <div>
            <div className="db-section-header">
              <h2>Recent Transactions</h2>
              <Link to="/transactions" className="db-view-all">
                View all <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="db-empty">
                <i className="fas fa-inbox"></i>
                <p>No transactions yet. <Link to="/add-transaction">Add one.</Link></p>
              </div>
            ) : (
              <div className="db-tx-list">
                {recent.map((tx, i) => (
                  <div key={tx.id} className="db-tx-row" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className={`db-tx-icon ${tx.type}`}>
                      <i className={`fas ${CAT_ICONS[tx.category_name] || CAT_ICONS.default}`}></i>
                    </div>
                    <div className="db-tx-info">
                      <span className="db-tx-desc">{tx.description || tx.category_name}</span>
                      <span className="db-tx-meta">{tx.category_name} · {new Date(tx.date).toLocaleDateString("en-GB")}</span>
                    </div>
                    <span className={`db-tx-amount ${tx.type}`}>
                      {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyChart({ small }) {
  return (
    <div className={`db-empty-chart ${small ? "small" : ""}`}>
      <i className="fas fa-chart-simple"></i>
      <p>No data yet</p>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, addCategory } from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Categories.css";

const ICONS={Salary:"fa-briefcase",Freelance:"fa-laptop-code",Food:"fa-utensils",Transport:"fa-bus",Shopping:"fa-bag-shopping",Rent:"fa-house",Health:"fa-heart-pulse",Entertainment:"fa-film",Travel:"fa-plane",Education:"fa-graduation-cap",Gifts:"fa-gift",Investment:"fa-chart-line",default:"fa-circle-dot"};

export default function Categories() {
  const navigate=useNavigate();
  const [categories,setCategories]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",type:"expense"});
  const [errors,setErrors]=useState({});

  useEffect(()=>{if(!localStorage.getItem("user"))navigate("/login");},[navigate]);

  const loadCats=async()=>{setLoading(true);try{const r=await getCategories();if(r.data.status==="success")setCategories(r.data.data||[]);}catch{}finally{setLoading(false);}};
  useEffect(()=>{loadCats();},[]);

  const income=categories.filter(c=>c.type==="income");
  const expense=categories.filter(c=>c.type==="expense");

  const handleChange=(e)=>{setForm(p=>({...p,[e.target.name]:e.target.value}));setErrors(p=>({...p,[e.target.name]:""}));};

  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name="Category name is required";
    if(form.name.trim().length>50)e.name="Name too long (max 50)";
    if(categories.find(c=>c.name.toLowerCase()===form.name.trim().toLowerCase()&&c.type===form.type))e.name="Category already exists";
    return e;
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();const errs=validate();if(Object.keys(errs).length){setErrors(errs);return;}
    setSaving(true);
    try{const r=await addCategory({name:form.name.trim(),type:form.type});if(r.data.status==="success"){showToast("Category added!","success");setForm({name:"",type:"expense"});setShowForm(false);loadCats();}else showToast(r.data.message||"Failed.","error");}
    catch{showToast("Server error.","error");}
    finally{setSaving(false);}
  };

  const showToast=(msg,type)=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};

  return (
    <div className="page-root">
      <Sidebar/>
      <main className="page-main">
        <div className="page-scrollable" style={{paddingTop:"32px"}}>
          <div className="page-header">
            <div>
              <h1 style={{fontFamily:"var(--display)",fontStyle:"italic",fontSize:"2rem",color:"var(--text)"}}>Categories</h1>
              <p className="page-sub-dark">{categories.length} total · {income.length} income · {expense.length} expense</p>
            </div>
            <button className="btn-primary" onClick={()=>setShowForm(!showForm)}>
              <i className={`fas ${showForm?"fa-xmark":"fa-plus"}`}></i>
              {showForm?"Cancel":"New Category"}
            </button>
          </div>

          {showForm&&(
            <div className="cat-form-card">
              <h3><i className="fas fa-folder-plus"></i> Add New Category</h3>
              <form onSubmit={handleSubmit} className="cat-form">
                <div className="cat-form-row">
                  <div className="field" style={{flex:2}}>
                    <label>Category Name</label>
                    <input type="text" name="name" placeholder="e.g. Groceries" value={form.name} onChange={handleChange} className={`inp ${errors.name?"invalid":""}`} maxLength={50} autoFocus/>
                    {errors.name&&<span className="field-err">{errors.name}</span>}
                  </div>
                  <div className="field" style={{flex:1}}>
                    <label>Type</label>
                    <div className="cat-type-toggle">
                      <button type="button" className={`cat-type-btn expense ${form.type==="expense"?"active":""}`} onClick={()=>setForm(p=>({...p,type:"expense"}))}><i className="fas fa-arrow-up"></i> Expense</button>
                      <button type="button" className={`cat-type-btn income ${form.type==="income"?"active":""}`} onClick={()=>setForm(p=>({...p,type:"income"}))}><i className="fas fa-arrow-down"></i> Income</button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving?<><i className="fas fa-spinner fa-spin"></i> Saving…</>:<><i className="fas fa-plus"></i> Add Category</>}
                </button>
              </form>
            </div>
          )}

          {loading?<div className="state-box"><div className="spinner"></div><p>Loading categories…</p></div>:(
            <div className="cat-columns">
              <div className="cat-group">
                <div className="cat-group-hdr income"><i className="fas fa-arrow-trend-up"></i><span>Income Categories</span><span className="cat-count">{income.length}</span></div>
                {income.length===0?<div className="cat-empty">No income categories yet.</div>:
                  <div className="cat-list">{income.map((c,i)=>(
                    <div key={c.id} className="cat-item" style={{animationDelay:`${i*0.04}s`}}>
                      <div className="cat-item-icon income"><i className={`fas ${ICONS[c.name]||ICONS.default}`}></i></div>
                      <div className="cat-item-info"><span className="cat-item-name">{c.name}</span><span className="cat-item-type income">Income</span></div>
                      <span className="cat-id">#{c.id}</span>
                    </div>
                  ))}</div>
                }
              </div>
              <div className="cat-group">
                <div className="cat-group-hdr expense"><i className="fas fa-arrow-trend-down"></i><span>Expense Categories</span><span className="cat-count">{expense.length}</span></div>
                {expense.length===0?<div className="cat-empty">No expense categories yet.</div>:
                  <div className="cat-list">{expense.map((c,i)=>(
                    <div key={c.id} className="cat-item" style={{animationDelay:`${i*0.04}s`}}>
                      <div className="cat-item-icon expense"><i className={`fas ${ICONS[c.name]||ICONS.default}`}></i></div>
                      <div className="cat-item-info"><span className="cat-item-name">{c.name}</span><span className="cat-item-type expense">Expense</span></div>
                      <span className="cat-id">#{c.id}</span>
                    </div>
                  ))}</div>
                }
              </div>
            </div>
          )}
        </div>
        {toast&&<div className={`toast ${toast.type}`}><i className={`fas ${toast.type==="success"?"fa-circle-check":"fa-circle-exclamation"}`}></i>{toast.msg}</div>}
      </main>
    </div>
  );
}
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import Transactions   from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import Categories     from "./pages/Categories";
import Profile        from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"               element={<Home />}           />
        <Route path="/login"          element={<Login />}          />
        <Route path="/register"       element={<Register />}       />
        <Route path="/dashboard"      element={<Dashboard />}      />
        <Route path="/transactions"   element={<Transactions />}   />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/categories"     element={<Categories />}     />
        <Route path="/profile"        element={<Profile />}        />
      </Routes>
    </Router>
  );
}

export default App;
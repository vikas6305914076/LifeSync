import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/expenses", label: "Expenses" },
  { to: "/tasks", label: "Tasks" },
  { to: "/groceries", label: "Groceries" },
  { to: "/medicines", label: "Medicines" }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2 className="logo">LifeSync</h2>
        <p className="user-name">{user?.name || "User"}</p>
        <p className="user-email">{user?.email || ""}</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={location.pathname === item.to ? "nav-link active" : "nav-link"}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

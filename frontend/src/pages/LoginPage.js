import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      const response = await api.post("/auth/login", {
        email: form.get("email"),
        password: form.get("password")
      });
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>
        <div className="auth-link">
          No account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

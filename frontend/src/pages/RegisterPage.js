import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      const response = await api.post("/auth/register", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password")
      });
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="primary-btn" type="submit">
            Create Account
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

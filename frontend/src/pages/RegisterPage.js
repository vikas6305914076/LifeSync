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
    const inviteToken = (form.get("inviteToken") || "").trim();

    try {
      const payload = {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        familyName: form.get("familyName")
      };

      if (inviteToken) {
        payload.inviteToken = inviteToken;
      }

      const response = await api.post("/auth/register", payload);
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.error ||
        (error.request ? "Cannot reach backend server. Start backend on port 8080." : "Registration failed");
      alert(message);
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
          <input name="familyName" type="text" placeholder="Family name (for new workspace)" />
          <input name="inviteToken" type="text" placeholder="Invite token (if joining an existing family)" />
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

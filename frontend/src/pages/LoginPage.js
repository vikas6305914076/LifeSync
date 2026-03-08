import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import extractApiError from "../utils/apiError";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [lastPayload, setLastPayload] = useState(null);

  const submitLogin = async (payload) => {
    try {
      setError("");
      const response = await api.post("/auth/login", payload);
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      setError(extractApiError(error, "Unable to login."));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = {
      email: form.get("email"),
      password: form.get("password")
    };
    setLastPayload(payload);
    await submitLogin(payload);
  };

  const handleRetry = async () => {
    if (!lastPayload) {
      return;
    }
    await submitLogin(lastPayload);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        {error && (
          <div className="alert error auth-error-row">
            <span>{error}</span>
            <button type="button" className="secondary-btn" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}
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

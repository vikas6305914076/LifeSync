import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import extractApiError from "../utils/apiError";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [lastPayload, setLastPayload] = useState(null);

  const submitRegistration = async (payload) => {
    try {
      setError("");
      setInfo("");
      const response = await api.post("/auth/register", payload);

      if (response.data?.token) {
        login(response.data);
        navigate("/dashboard");
        return;
      }

      setPendingEmail(payload.email);
      setPendingPassword(payload.password);
      setInfo(response.data?.message || "Registration successful. Enter OTP to verify your account.");
    } catch (error) {
      setError(extractApiError(error, "Unable to register."));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const inviteToken = (form.get("inviteToken") || "").trim();

    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      familyName: form.get("familyName")
    };

    if (inviteToken) {
      payload.inviteToken = inviteToken;
    }

    setLastPayload(payload);
    await submitRegistration(payload);
  };

  const handleRetry = async () => {
    if (!lastPayload) {
      return;
    }
    await submitRegistration(lastPayload);
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    try {
      setError("");
      setInfo("");
      const verifyResponse = await api.post("/auth/verify-otp", {
        email: pendingEmail,
        otp
      });

      if (verifyResponse.data?.token) {
        login(verifyResponse.data);
        navigate("/dashboard");
        return;
      }

      if (pendingPassword) {
        const loginResponse = await api.post("/auth/login", {
          email: pendingEmail,
          password: pendingPassword
        });
        login(loginResponse.data);
        navigate("/dashboard");
      }
    } catch (verifyError) {
      setError(extractApiError(verifyError, "Unable to verify OTP."));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        {info && <div className="alert info">{info}</div>}
        {error && (
          <div className="alert error auth-error-row">
            <span>{error}</span>
            <button type="button" className="secondary-btn" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}
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
        {pendingEmail && (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP from email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button className="secondary-btn" type="submit">
              Verify OTP
            </button>
          </form>
        )}
        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

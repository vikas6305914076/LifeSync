import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">LifeSync</div>
        <nav className="landing-nav">
          <Link to="/login" className="landing-link">
            Login
          </Link>
          <Link to="/register" className="landing-button secondary">
            Sign Up
          </Link>
          <Link to="/dashboard" className="landing-button">
            Get Started
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>Plan Better. Track Faster. Live Smoother.</h1>
        <p>
          LifeSync brings your tasks, expenses, groceries, and medicine reminders into one
          clean workspace with secure authentication and real-time API-backed data.
        </p>
        <div className="landing-actions">
          <Link to="/register" className="landing-button">
            Create Account
          </Link>
          <Link to="/login" className="landing-button secondary">
            I already have an account
          </Link>
        </div>
      </section>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    expenses: 0,
    tasks: 0,
    completedTasks: 0,
    groceries: 0,
    purchasedGroceries: 0,
    medicines: 0,
    expenseTotal: 0
  });
  const [family, setFamily] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const requests = [
        api.get("/expenses"),
        api.get("/tasks"),
        api.get("/groceries"),
        api.get("/medicines"),
        api.get("/family/me")
      ];

      if (user?.familyRole === "ADMIN") {
        requests.push(api.get("/family/invites"));
      }

      const [expenseRes, taskRes, groceryRes, medicineRes, familyRes, invitesRes] = await Promise.all(requests);

      const expenses = expenseRes.data || [];
      const tasks = taskRes.data || [];
      const groceries = groceryRes.data || [];
      const medicines = medicineRes.data || [];

      setStats({
        expenses: expenses.length,
        tasks: tasks.length,
        completedTasks: tasks.filter((task) => task.completed).length,
        groceries: groceries.length,
        purchasedGroceries: groceries.filter((item) => item.purchased).length,
        medicines: medicines.length,
        expenseTotal: expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      });

      setFamily(familyRes.data);
      setInvites(invitesRes?.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user?.familyRole]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleInviteSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      await api.post("/family/invites", { email: form.get("email") });
      event.target.reset();
      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || "Could not send invite.");
    }
  };

  return (
    <div className="page-wrap">
      <section className="hero-card">
        <h1 className="page-title">Welcome, {user?.name || "User"}</h1>
        <p className="muted-text">Family workspace: {family?.familyName || user?.familyName || "Loading..."}</p>
      </section>

      {error && <div className="alert error">{error}</div>}

      <section className="metric-grid">
        <article className="metric-card">
          <h3>Expenses</h3>
          <p className="metric-value">{loading ? "..." : stats.expenses}</p>
          <span className="metric-note">Total: ${stats.expenseTotal.toFixed(2)}</span>
        </article>
        <article className="metric-card">
          <h3>Tasks</h3>
          <p className="metric-value">{loading ? "..." : stats.tasks}</p>
          <span className="metric-note">Completed: {stats.completedTasks}</span>
        </article>
        <article className="metric-card">
          <h3>Groceries</h3>
          <p className="metric-value">{loading ? "..." : stats.groceries}</p>
          <span className="metric-note">Purchased: {stats.purchasedGroceries}</span>
        </article>
        <article className="metric-card">
          <h3>Medicines</h3>
          <p className="metric-value">{loading ? "..." : stats.medicines}</p>
          <span className="metric-note">Reminders active</span>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel-card">
          <h2>Family Members</h2>
          <div className="stack-list compact">
            {(family?.members || []).map((member) => (
              <div className="member-row" key={member.userId}>
                <div>
                  <strong>{member.name}</strong>
                  <p>{member.email}</p>
                </div>
                <span className="badge">{member.familyRole}</span>
              </div>
            ))}
            {!loading && (!family?.members || family.members.length === 0) && (
              <div className="empty-card">No members found.</div>
            )}
          </div>
        </article>

        {user?.familyRole === "ADMIN" && (
          <article className="panel-card">
            <h2>Invite Family Member</h2>
            <form className="form-grid" onSubmit={handleInviteSubmit}>
              <input name="email" type="email" placeholder="member@example.com" required />
              <button className="primary-btn" type="submit">
                Create Invite
              </button>
            </form>

            <div className="stack-list compact">
              {invites.map((invite) => (
                <div className="invite-row" key={invite.id}>
                  <p>
                    <strong>{invite.invitedEmail}</strong>
                  </p>
                  <p className="token-text">Token: {invite.inviteToken}</p>
                  <span className="badge">{invite.status}</span>
                </div>
              ))}
              {!loading && invites.length === 0 && <div className="empty-card">No pending invites.</div>}
            </div>
          </article>
        )}
      </section>
    </div>
  );
}

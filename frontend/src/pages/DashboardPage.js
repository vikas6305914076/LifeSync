import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [expenseRes, taskRes, groceryRes, medicineRes] = await Promise.all([
          api.get("/expenses"),
          api.get("/tasks"),
          api.get("/groceries"),
          api.get("/medicines")
        ]);

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
      } catch (err) {
        setError(err.response?.data?.error || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="page-wrap">
      <section className="hero-card">
        <h1 className="page-title">Welcome, {user?.name || "User"}</h1>
        <p className="muted-text">Your complete productivity snapshot from live backend data.</p>
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
    </div>
  );
}

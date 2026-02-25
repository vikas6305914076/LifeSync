import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/expenses");
      setExpenses(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await api.post("/expenses", {
        title: form.get("title"),
        amount: Number(form.get("amount")),
        expenseDate: form.get("expenseDate")
      });
      e.target.reset();
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.error || "Could not add expense.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete expense.");
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header-row">
        <h1 className="page-title">Expenses</h1>
        <span className="badge">{expenses.length} records</span>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="form-grid three" onSubmit={handleAdd}>
        <input name="title" placeholder="Expense title" required />
        <input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required />
        <input name="expenseDate" type="date" required />
        <button className="primary-btn" type="submit">
          Add Expense
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && expenses.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-cell">
                  No expenses yet.
                </td>
              </tr>
            )}
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.title}</td>
                <td>${Number(expense.amount).toFixed(2)}</td>
                <td>{expense.expenseDate}</td>
                <td>
                  <button className="danger-btn" onClick={() => handleDelete(expense.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

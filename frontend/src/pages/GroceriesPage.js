import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function GroceriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/groceries");
      setItems(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load groceries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await api.post("/groceries", { name: form.get("name") });
      e.target.reset();
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || "Could not add item.");
    }
  };

  const handlePurchase = async (id) => {
    try {
      await api.patch(`/groceries/${id}/purchase`);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update item.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/groceries/${id}`);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete item.");
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header-row">
        <h1 className="page-title">Groceries</h1>
        <span className="badge">{items.filter((item) => item.purchased).length} purchased</span>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="form-grid" onSubmit={handleAdd}>
        <input name="name" placeholder="Item name" required />
        <button className="primary-btn" type="submit">
          Add Item
        </button>
      </form>

      <div className="stack-list">
        {!loading && items.length === 0 && <div className="empty-card">No grocery items yet.</div>}
        {items.map((item) => (
          <article className={`item-card ${item.purchased ? "done" : ""}`} key={item.id}>
            <div>
              <h3>{item.name}</h3>
              <p>{item.purchased ? "Purchased" : "Not purchased"}</p>
            </div>
            <div className="item-actions">
              {!item.purchased && (
                <button className="secondary-btn" onClick={() => handlePurchase(item.id)}>
                  Mark Purchased
                </button>
              )}
              <button className="danger-btn" onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

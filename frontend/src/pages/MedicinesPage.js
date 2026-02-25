import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/medicines");
      setMedicines(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await api.post("/medicines", {
        name: form.get("name"),
        dosage: form.get("dosage"),
        reminderTime: form.get("reminderTime")
      });
      e.target.reset();
      loadMedicines();
    } catch (err) {
      setError(err.response?.data?.error || "Could not add medicine.");
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header-row">
        <h1 className="page-title">Medicines</h1>
        <span className="badge">{medicines.length} reminders</span>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="form-grid three" onSubmit={handleAdd}>
        <input name="name" placeholder="Medicine name" required />
        <input name="dosage" placeholder="Dosage (e.g. 1 tablet)" required />
        <input name="reminderTime" placeholder="Reminder time (e.g. 08:00 AM)" required />
        <button className="primary-btn" type="submit">
          Add Reminder
        </button>
      </form>

      <div className="stack-list">
        {!loading && medicines.length === 0 && <div className="empty-card">No medicine reminders yet.</div>}
        {medicines.map((medicine) => (
          <article className="item-card" key={medicine.id}>
            <div>
              <h3>{medicine.name}</h3>
              <p>
                {medicine.dosage} | {medicine.reminderTime}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

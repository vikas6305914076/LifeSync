import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/tasks");
      setTasks(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await api.post("/tasks", { title: form.get("title") });
      e.target.reset();
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || "Could not add task.");
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`/tasks/${id}/complete`);
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update task.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete task.");
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header-row">
        <h1 className="page-title">Tasks</h1>
        <span className="badge">{tasks.filter((task) => task.completed).length} completed</span>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="form-grid" onSubmit={handleAdd}>
        <input name="title" placeholder="Task title" required />
        <button className="primary-btn" type="submit">
          Add Task
        </button>
      </form>

      <div className="stack-list">
        {!loading && tasks.length === 0 && <div className="empty-card">No tasks yet.</div>}
        {tasks.map((task) => (
          <article className={`item-card ${task.completed ? "done" : ""}`} key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.completed ? "Completed" : "Pending"}</p>
            </div>
            <div className="item-actions">
              {!task.completed && (
                <button className="secondary-btn" onClick={() => handleComplete(task.id)}>
                  Mark Complete
                </button>
              )}
              <button className="danger-btn" onClick={() => handleDelete(task.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

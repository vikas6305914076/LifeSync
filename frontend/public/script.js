const API_BASE = "https://lifesync-production-1cdc.up.railway.app/api";

const STORAGE_KEYS = {
  auth: "lifesync_auth",
  token: "token",
};

const state = {
  expenses: [],
  tasks: [],
  grocery: [],
  medicines: [],
};

const loginPage = document.getElementById("loginPage");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const pageTitle = document.getElementById("pageTitle");
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

function getAuthToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function showApiError(action, error) {
  console.error(`[LifeSync API] ${action}`, error);
  const message = error instanceof Error ? error.message : String(error);
  alert(`Unable to ${action}. ${message}`);
}

function normalizeExpense(expense) {
  return {
    id: expense.id,
    title: expense.title,
    category: expense.category || "General",
    amount: expense.amount,
    date: expense.expenseDate || expense.date || "",
  };
}

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title,
    completed: Boolean(task.completed),
  };
}

function normalizeGrocery(item) {
  return {
    id: item.id,
    title: item.name || item.title,
    purchased: Boolean(item.purchased),
  };
}

function normalizeMedicine(item) {
  return {
    id: item.id,
    title: item.name || item.title,
    time: item.reminderTime || item.time || "",
    dosage: item.dosage || "",
  };
}

async function loadExpenses() {
  const data = await apiRequest("/expenses");
  state.expenses = Array.isArray(data) ? data.map(normalizeExpense) : [];
}

async function loadTasks() {
  const data = await apiRequest("/tasks");
  state.tasks = Array.isArray(data) ? data.map(normalizeTask) : [];
}

async function loadGrocery() {
  const data = await apiRequest("/groceries");
  state.grocery = Array.isArray(data) ? data.map(normalizeGrocery) : [];
}

async function loadMedicines() {
  const data = await apiRequest("/medicines");
  state.medicines = Array.isArray(data) ? data.map(normalizeMedicine) : [];
}

async function loadAllData() {
  const results = await Promise.allSettled([
    loadExpenses(),
    loadTasks(),
    loadGrocery(),
    loadMedicines(),
  ]);

  const failed = results.filter((result) => result.status === "rejected");
  renderAll();

  if (failed.length > 0) {
    showApiError("load dashboard data", failed[0].reason);
  }
}

function setAuth(isLoggedIn) {
  localStorage.setItem(STORAGE_KEYS.auth, isLoggedIn ? "true" : "false");
  loginPage.classList.toggle("active", !isLoggedIn);
  appShell.classList.toggle("active", isLoggedIn);
}

function showPage(pageId) {
  pages.forEach((page) => page.classList.toggle("active", page.id === pageId));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.page === pageId));
  pageTitle.textContent = pageId.replace("Page", "");
  sidebar.classList.remove("mobile-open");
  overlay.classList.remove("active");
}

function setupNavigation() {
  navLinks.forEach((link) => {
    link.addEventListener("click", () => showPage(link.dataset.page));
  });

  document.querySelectorAll("[data-page-link]").forEach((card) => {
    card.addEventListener("click", () => showPage(card.dataset.pageLink));
  });
}

function setupSidebar() {
  document.getElementById("collapseSidebarBtn").addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  document.getElementById("mobileMenuBtn").addEventListener("click", () => {
    sidebar.classList.add("mobile-open");
    overlay.classList.add("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("active");
  });
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

function setupModals() {
  document.getElementById("openExpenseModalBtn").addEventListener("click", () => openModal("expenseModal"));
  document.getElementById("openTaskModalBtn").addEventListener("click", () => openModal("taskModal"));
  document.getElementById("openGroceryModalBtn").addEventListener("click", () => openModal("groceryModal"));
  document.getElementById("openMedicineModalBtn").addEventListener("click", () => openModal("medicineModal"));

  document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("active");
      }
    });
  });
}

function renderExpenses() {
  const body = document.getElementById("expenseTableBody");
  body.innerHTML = "";
  state.expenses.forEach((expense, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.title}</td>
      <td>${expense.category}</td>
      <td>$${Number(expense.amount).toFixed(2)}</td>
      <td>${expense.date}</td>
      <td><button class="btn btn-danger" data-delete-expense="${index}">Delete</button></td>
    `;
    body.appendChild(row);
  });

  body.querySelectorAll("[data-delete-expense]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.deleteExpense);
      const expense = state.expenses[index];
      if (!expense) {
        return;
      }

      try {
        await apiRequest(`/expenses/${expense.id}`, { method: "DELETE" });
        state.expenses.splice(index, 1);
        renderAll();
      } catch (error) {
        showApiError("delete expense", error);
      }
    });
  });
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  state.tasks.forEach((task, index) => {
    const card = document.createElement("article");
    card.className = `task-card ${task.completed ? "completed" : ""}`;
    card.innerHTML = `
      <div class="task-left">
        <label class="checkbox-wrap">
          <input type="checkbox" data-task-toggle="${index}" ${task.completed ? "checked" : ""} />
        </label>
        <span>${task.title}</span>
      </div>
      <button class="btn btn-danger" data-task-delete="${index}">Delete</button>
    `;
    taskList.appendChild(card);
  });

  taskList.querySelectorAll("[data-task-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", async () => {
      const index = Number(checkbox.dataset.taskToggle);
      const task = state.tasks[index];
      if (!task) {
        return;
      }

      try {
        const updated = await apiRequest(`/tasks/${task.id}/complete`, { method: "PATCH" });
        state.tasks[index] = normalizeTask(updated);
        renderAll();
      } catch (error) {
        checkbox.checked = !checkbox.checked;
        showApiError("update task", error);
      }
    });
  });

  taskList.querySelectorAll("[data-task-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.taskDelete);
      const task = state.tasks[index];
      if (!task) {
        return;
      }

      try {
        await apiRequest(`/tasks/${task.id}`, { method: "DELETE" });
        state.tasks.splice(index, 1);
        renderAll();
      } catch (error) {
        showApiError("delete task", error);
      }
    });
  });
}

function renderGrocery() {
  const groceryList = document.getElementById("groceryList");
  groceryList.innerHTML = "";
  state.grocery.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = `list-item ${item.purchased ? "completed" : ""}`;
    row.innerHTML = `
      <div>
        <strong>${item.title}</strong>
      </div>
      <div>
        <button class="btn" data-grocery-toggle="${index}">${item.purchased ? "Purchased" : "Mark Purchased"}</button>
        <button class="btn btn-danger" data-grocery-delete="${index}">Delete</button>
      </div>
    `;
    groceryList.appendChild(row);
  });

  groceryList.querySelectorAll("[data-grocery-toggle]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.groceryToggle);
      const item = state.grocery[index];
      if (!item) {
        return;
      }

      try {
        const updated = await apiRequest(`/groceries/${item.id}/purchase`, { method: "PATCH" });
        state.grocery[index] = normalizeGrocery(updated);
        renderAll();
      } catch (error) {
        showApiError("update grocery item", error);
      }
    });
  });

  groceryList.querySelectorAll("[data-grocery-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.groceryDelete);
      const item = state.grocery[index];
      if (!item) {
        return;
      }

      try {
        await apiRequest(`/groceries/${item.id}`, { method: "DELETE" });
        state.grocery.splice(index, 1);
        renderAll();
      } catch (error) {
        showApiError("delete grocery item", error);
      }
    });
  });
}

function renderMedicines() {
  const medicineList = document.getElementById("medicineList");
  medicineList.innerHTML = "";
  state.medicines.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <strong>${item.title}</strong>
      </div>
      <div>
        <span class="time-badge">&#9200; ${item.time}</span>
        <button class="btn btn-danger" data-medicine-delete="${index}">Delete</button>
      </div>
    `;
    medicineList.appendChild(row);
  });

  medicineList.querySelectorAll("[data-medicine-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.medicineDelete);
      const item = state.medicines[index];
      if (!item) {
        return;
      }

      try {
        await apiRequest(`/medicines/${item.id}`, { method: "DELETE" });
        state.medicines.splice(index, 1);
        renderAll();
      } catch (error) {
        showApiError("delete medicine", error);
      }
    });
  });
}

function updateDashboardCounts() {
  document.getElementById("dashboardExpenseCount").textContent = `${state.expenses.length} entries`;
  document.getElementById("dashboardTaskCount").textContent = `${state.tasks.length} tasks`;
  document.getElementById("dashboardGroceryCount").textContent = `${state.grocery.length} items`;
  document.getElementById("dashboardMedicineCount").textContent = `${state.medicines.length} reminders`;
}

function renderAll() {
  renderExpenses();
  renderTasks();
  renderGrocery();
  renderMedicines();
  updateDashboardCounts();
}

function setupForms() {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      loginError.textContent = "Please enter email and password.";
      return;
    }

    try {
      const auth = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem(STORAGE_KEYS.token, auth.token);
      loginError.textContent = "";
      setAuth(true);
      await loadAllData();
    } catch (error) {
      loginError.textContent = error instanceof Error ? error.message : "Login failed.";
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    setAuth(false);
    state.expenses = [];
    state.tasks = [];
    state.grocery = [];
    state.medicines = [];
    renderAll();
  });

  document.getElementById("expenseForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      title: document.getElementById("expenseTitle").value.trim(),
      amount: document.getElementById("expenseAmount").value,
      expenseDate: document.getElementById("expenseDate").value,
    };

    try {
      const created = await apiRequest("/expenses", {
        method: "POST",
        body: payload,
      });
      const normalized = normalizeExpense(created);
      normalized.category = document.getElementById("expenseCategory").value.trim() || normalized.category;
      state.expenses.unshift(normalized);
      renderAll();
      event.target.reset();
      closeModal("expenseModal");
    } catch (error) {
      showApiError("create expense", error);
    }
  });

  document.getElementById("taskForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      title: document.getElementById("taskTitle").value.trim(),
    };

    try {
      const created = await apiRequest("/tasks", {
        method: "POST",
        body: payload,
      });
      state.tasks.unshift(normalizeTask(created));
      renderAll();
      event.target.reset();
      closeModal("taskModal");
    } catch (error) {
      showApiError("create task", error);
    }
  });

  document.getElementById("groceryForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: document.getElementById("groceryTitle").value.trim(),
    };

    try {
      const created = await apiRequest("/groceries", {
        method: "POST",
        body: payload,
      });
      state.grocery.unshift(normalizeGrocery(created));
      renderAll();
      event.target.reset();
      closeModal("groceryModal");
    } catch (error) {
      showApiError("create grocery item", error);
    }
  });

  document.getElementById("medicineForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = document.getElementById("medicineTitle").value.trim();
    const time = document.getElementById("medicineTime").value;
    const payload = {
      name: title,
      dosage: "As directed",
      reminderTime: time,
    };

    try {
      const created = await apiRequest("/medicines", {
        method: "POST",
        body: payload,
      });
      state.medicines.unshift(normalizeMedicine(created));
      renderAll();
      event.target.reset();
      closeModal("medicineModal");
    } catch (error) {
      showApiError("create medicine", error);
    }
  });
}

async function init() {
  if (!document.getElementById("loginPage")) {
    console.log("Landing page detected. Skipping dashboard init.");
    return;
  }

  const isLoggedIn = localStorage.getItem(STORAGE_KEYS.auth) === "true";
  setAuth(isLoggedIn);
  setupNavigation();
  setupSidebar();
  setupModals();
  setupForms();
  showPage("dashboardPage");

  if (isLoggedIn) {
    await loadAllData();
  } else {
    renderAll();
  }
}

init().catch((error) => {
  console.error(error);
});

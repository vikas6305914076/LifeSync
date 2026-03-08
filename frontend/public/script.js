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
  tempEmail: null,
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
const registerPage = document.getElementById("registerPage");
const otpPage = document.getElementById("otpPage");
const registerForm = document.getElementById("registerForm");
const otpForm = document.getElementById("otpForm");
const registerError = document.getElementById("registerError");
const otpError = document.getElementById("otpError");

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  get token() {
    return localStorage.getItem(STORAGE_KEYS.token);
  }

  async request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
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

  login(credentials) {
    return this.request("/auth/login", { method: "POST", body: credentials });
  }
  register(data) {
    return this.request("/auth/register", { method: "POST", body: data });
  }
  verifyOtp(data) {
    return this.request("/auth/verify-otp", { method: "POST", body: data });
  }

  getExpenses() {
    return this.request("/expenses");
  }
  createExpense(data) {
    return this.request("/expenses", { method: "POST", body: data });
  }
  deleteExpense(id) {
    return this.request(`/expenses/${id}`, { method: "DELETE" });
  }

  getTasks() {
    return this.request("/tasks");
  }
  createTask(data) {
    return this.request("/tasks", { method: "POST", body: data });
  }
  completeTask(id) {
    return this.request(`/tasks/${id}/complete`, { method: "PATCH" });
  }
  deleteTask(id) {
    return this.request(`/tasks/${id}`, { method: "DELETE" });
  }

  getGroceries() {
    return this.request("/groceries");
  }
  createGrocery(data) {
    return this.request("/groceries", { method: "POST", body: data });
  }
  purchaseGrocery(id) {
    return this.request(`/groceries/${id}/purchase`, { method: "PATCH" });
  }
  deleteGrocery(id) {
    return this.request(`/groceries/${id}`, { method: "DELETE" });
  }

  getMedicines() {
    return this.request("/medicines");
  }
  createMedicine(data) {
    return this.request("/medicines", { method: "POST", body: data });
  }
  deleteMedicine(id) {
    return this.request(`/medicines/${id}`, { method: "DELETE" });
  }
}

const apiService = new ApiService(API_BASE);

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
  const data = await apiService.getExpenses();
  state.expenses = Array.isArray(data) ? data.map(normalizeExpense) : [];
}

async function loadTasks() {
  const data = await apiService.getTasks();
  state.tasks = Array.isArray(data) ? data.map(normalizeTask) : [];
}

async function loadGrocery() {
  const data = await apiService.getGroceries();
  state.grocery = Array.isArray(data) ? data.map(normalizeGrocery) : [];
}

async function loadMedicines() {
  const data = await apiService.getMedicines();
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
  loginPage?.classList.toggle("active", !isLoggedIn);
  appShell?.classList.toggle("active", isLoggedIn);
  if (isLoggedIn) {
    registerPage?.classList.remove("active");
    otpPage?.classList.remove("active");
  }
}

function showPage(pageId) {
  pages.forEach((page) => page.classList.toggle("active", page.id === pageId));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.page === pageId));
  if (pageTitle) pageTitle.textContent = pageId.replace("Page", "");
  sidebar?.classList.remove("mobile-open");
  overlay?.classList.remove("active");
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
  document.getElementById("collapseSidebarBtn")?.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  document.getElementById("mobileMenuBtn")?.addEventListener("click", () => {
    sidebar.classList.add("mobile-open");
    overlay.classList.add("active");
  });

  overlay?.addEventListener("click", () => {
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
  document.getElementById("openExpenseModalBtn")?.addEventListener("click", () => openModal("expenseModal"));
  document.getElementById("openTaskModalBtn")?.addEventListener("click", () => openModal("taskModal"));
  document.getElementById("openGroceryModalBtn")?.addEventListener("click", () => openModal("groceryModal"));
  document.getElementById("openMedicineModalBtn")?.addEventListener("click", () => openModal("medicineModal"));

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

function setupAuthUI() {
  document.getElementById("showRegisterBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    loginPage.classList.remove("active");
    registerPage.classList.add("active");
  });

  document.getElementById("showLoginBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    registerPage.classList.remove("active");
    loginPage.classList.add("active");
  });
}

function renderExpenses() {
  const body = document.getElementById("expenseTableBody");
  if (!body) return;
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
        await apiService.deleteExpense(expense.id);
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
  if (!taskList) return;
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
        const updated = await apiService.completeTask(task.id);
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
        await apiService.deleteTask(task.id);
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
  if (!groceryList) return;
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
        const updated = await apiService.purchaseGrocery(item.id);
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
        await apiService.deleteGrocery(item.id);
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
  if (!medicineList) return;
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
        await apiService.deleteMedicine(item.id);
        state.medicines.splice(index, 1);
        renderAll();
      } catch (error) {
        showApiError("delete medicine", error);
      }
    });
  });
}

function updateDashboardCounts() {
  const expenseCount = document.getElementById("dashboardExpenseCount");
  if (expenseCount) expenseCount.textContent = `${state.expenses.length} entries`;
  const taskCount = document.getElementById("dashboardTaskCount");
  if (taskCount) taskCount.textContent = `${state.tasks.length} tasks`;
  const groceryCount = document.getElementById("dashboardGroceryCount");
  if (groceryCount) groceryCount.textContent = `${state.grocery.length} items`;
  const medicineCount = document.getElementById("dashboardMedicineCount");
  if (medicineCount) medicineCount.textContent = `${state.medicines.length} reminders`;
}

function renderAll() {
  renderExpenses();
  renderTasks();
  renderGrocery();
  renderMedicines();
  updateDashboardCounts();
}

function setupForms() {
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      loginError.textContent = "Please enter email and password.";
      return;
    }

    try {
      const auth = await apiService.login({ email, password });
      localStorage.setItem(STORAGE_KEYS.token, auth.token);
      loginError.textContent = "";
      setAuth(true);
      await loadAllData();
    } catch (error) {
      loginError.textContent = error instanceof Error ? error.message : "Login failed.";
    }
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!name || !email || !password) {
      if (registerError) registerError.textContent = "All fields are required.";
      return;
    }

    try {
      await apiService.register({ name, email, password });
      state.tempEmail = email;
      if (registerError) registerError.textContent = "";
      registerPage.classList.remove("active");
      otpPage.classList.add("active");
    } catch (error) {
      if (registerError) registerError.textContent = error.message;
    }
  });

  otpForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const otp = document.getElementById("otpInput").value.trim();

    if (!otp) {
      if (otpError) otpError.textContent = "Please enter OTP.";
      return;
    }

    try {
      const auth = await apiService.verifyOtp({ email: state.tempEmail, otp });
      localStorage.setItem(STORAGE_KEYS.token, auth.token);
      if (otpError) otpError.textContent = "";
      setAuth(true);
      await loadAllData();
    } catch (error) {
      if (otpError) otpError.textContent = error.message;
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    setAuth(false);
    state.expenses = [];
    state.tasks = [];
    state.grocery = [];
    state.medicines = [];
    renderAll();
  });

  document.getElementById("expenseForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      title: document.getElementById("expenseTitle").value.trim(),
      amount: document.getElementById("expenseAmount").value,
      expenseDate: document.getElementById("expenseDate").value,
    };

    try {
      const created = await apiService.createExpense(payload);
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

  document.getElementById("taskForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      title: document.getElementById("taskTitle").value.trim(),
    };

    try {
      const created = await apiService.createTask(payload);
      state.tasks.unshift(normalizeTask(created));
      renderAll();
      event.target.reset();
      closeModal("taskModal");
    } catch (error) {
      showApiError("create task", error);
    }
  });

  document.getElementById("groceryForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: document.getElementById("groceryTitle").value.trim(),
    };

    try {
      const created = await apiService.createGrocery(payload);
      state.grocery.unshift(normalizeGrocery(created));
      renderAll();
      event.target.reset();
      closeModal("groceryModal");
    } catch (error) {
      showApiError("create grocery item", error);
    }
  });

  document.getElementById("medicineForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = document.getElementById("medicineTitle").value.trim();
    const time = document.getElementById("medicineTime").value;
    const payload = {
      name: title,
      dosage: "As directed",
      reminderTime: time,
    };

    try {
      const created = await apiService.createMedicine(payload);
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
  if (!loginPage) {
    console.log("Landing page detected. Skipping dashboard init.");
    return;
  }

  const isLoggedIn = localStorage.getItem(STORAGE_KEYS.auth) === "true";
  setAuth(isLoggedIn);
  setupNavigation();
  setupSidebar();
  setupModals();
  setupForms();
  setupAuthUI();
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

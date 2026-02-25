const STORAGE_KEYS = {
  auth: "lifesync_auth",
  expenses: "lifesync_expenses",
  tasks: "lifesync_tasks",
  grocery: "lifesync_grocery",
  medicines: "lifesync_medicines",
};

const state = {
  expenses: JSON.parse(localStorage.getItem(STORAGE_KEYS.expenses) || "[]"),
  tasks: JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || "[]"),
  grocery: JSON.parse(localStorage.getItem(STORAGE_KEYS.grocery) || "[]"),
  medicines: JSON.parse(localStorage.getItem(STORAGE_KEYS.medicines) || "[]"),
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

function saveState() {
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(state.expenses));
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(state.tasks));
  localStorage.setItem(STORAGE_KEYS.grocery, JSON.stringify(state.grocery));
  localStorage.setItem(STORAGE_KEYS.medicines, JSON.stringify(state.medicines));
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
    button.addEventListener("click", () => {
      const index = Number(button.dataset.deleteExpense);
      state.expenses.splice(index, 1);
      saveState();
      renderAll();
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
    checkbox.addEventListener("change", () => {
      const index = Number(checkbox.dataset.taskToggle);
      state.tasks[index].completed = checkbox.checked;
      saveState();
      renderAll();
    });
  });

  taskList.querySelectorAll("[data-task-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.taskDelete);
      state.tasks.splice(index, 1);
      saveState();
      renderAll();
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
    button.addEventListener("click", () => {
      const index = Number(button.dataset.groceryToggle);
      state.grocery[index].purchased = !state.grocery[index].purchased;
      saveState();
      renderAll();
    });
  });

  groceryList.querySelectorAll("[data-grocery-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.groceryDelete);
      state.grocery.splice(index, 1);
      saveState();
      renderAll();
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
    button.addEventListener("click", () => {
      const index = Number(button.dataset.medicineDelete);
      state.medicines.splice(index, 1);
      saveState();
      renderAll();
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
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) {
      loginError.textContent = "Please enter email and password.";
      return;
    }
    loginError.textContent = "";
    setAuth(true);
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    setAuth(false);
  });

  document.getElementById("expenseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.expenses.unshift({
      title: document.getElementById("expenseTitle").value.trim(),
      category: document.getElementById("expenseCategory").value.trim(),
      amount: document.getElementById("expenseAmount").value,
      date: document.getElementById("expenseDate").value,
    });
    saveState();
    renderAll();
    event.target.reset();
    closeModal("expenseModal");
  });

  document.getElementById("taskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.tasks.unshift({
      title: document.getElementById("taskTitle").value.trim(),
      completed: false,
    });
    saveState();
    renderAll();
    event.target.reset();
    closeModal("taskModal");
  });

  document.getElementById("groceryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.grocery.unshift({
      title: document.getElementById("groceryTitle").value.trim(),
      purchased: false,
    });
    saveState();
    renderAll();
    event.target.reset();
    closeModal("groceryModal");
  });

  document.getElementById("medicineForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.medicines.unshift({
      title: document.getElementById("medicineTitle").value.trim(),
      time: document.getElementById("medicineTime").value,
    });
    saveState();
    renderAll();
    event.target.reset();
    closeModal("medicineModal");
  });
}

function init() {
  const isLoggedIn = localStorage.getItem(STORAGE_KEYS.auth) === "true";
  setAuth(isLoggedIn);
  setupNavigation();
  setupSidebar();
  setupModals();
  setupForms();
  showPage("dashboardPage");
  renderAll();
}

init();

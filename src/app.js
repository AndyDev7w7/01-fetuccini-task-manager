import { createTask, loadGuardianTasks, saveTaskToLocalRealm } from "./storage.js";

const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");
const message = document.querySelector("#message");
const totalCount = document.querySelector("#totalCount");
const doneCount = document.querySelector("#doneCount");
const pendingCount = document.querySelector("#pendingCount");
const filterButtons = document.querySelectorAll(".filter");

let guardianTasks = loadGuardianTasks();
let currentFilter = "all";

function announce(text) {
  message.textContent = text;
  window.clearTimeout(announce.timer);
  announce.timer = window.setTimeout(() => (message.textContent = ""), 2800);
}

function persist() {
  if (!saveTaskToLocalRealm(guardianTasks)) {
    announce("I could not save that. Local storage may be full.");
  }
}

function visibleTasks() {
  if (currentFilter === "completed") return guardianTasks.filter((task) => task.completed);
  if (currentFilter === "pending") return guardianTasks.filter((task) => !task.completed);
  return guardianTasks;
}

function renderStats() {
  const done = guardianTasks.filter((task) => task.completed).length;
  totalCount.textContent = guardianTasks.length;
  doneCount.textContent = done;
  pendingCount.textContent = guardianTasks.length - done;
}

function renderEmptyState() {
  const copy = {
    all: "Nothing here yet, commander. Add a task to begin.",
    pending: "No pending tasks. Fetuccini would be proud.",
    completed: "No completed tasks yet. The first win is waiting.",
  };
  taskList.innerHTML = `<article class="empty"><h2>${copy[currentFilter]}</h2><p>Small steps count. Especially the ones you actually finish.</p></article>`;
}

function renderTasks() {
  renderStats();
  const tasks = visibleTasks();
  taskList.innerHTML = "";
  if (!tasks.length) {
    renderEmptyState();
    return;
  }
  tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = `task-card ${task.completed ? "completed" : ""}`;
    const due = task.dueDate ? `<span>Due ${task.dueDate}</span>` : "<span>No due date</span>";
    card.innerHTML = `
      <div class="task-main">
        <button class="check" aria-label="Toggle ${task.title}">${task.completed ? "✓" : ""}</button>
        <div>
          <h2></h2>
          <div class="meta">${due}<span>${task.priority}</span></div>
        </div>
      </div>
      <div class="actions">
        <button data-action="edit">Edit</button>
        <button data-action="delete">Delete</button>
      </div>
    `;
    card.querySelector("h2").textContent = task.title;
    card.querySelector(".check").addEventListener("click", () => toggleTask(task.id));
    card.querySelector('[data-action="edit"]').addEventListener("click", () => editTask(task.id));
    card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTask(task.id));
    taskList.append(card);
  });
}

function toggleTask(id) {
  guardianTasks = guardianTasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  persist();
  renderTasks();
  announce("Task updated. Calm dashboard restored.");
}

function editTask(id) {
  const task = guardianTasks.find((item) => item.id === id);
  const nextTitle = window.prompt("Rename this task", task.title);
  if (nextTitle === null) return;
  if (!nextTitle.trim()) {
    announce("A task needs a name. Empty quests are suspicious.");
    return;
  }
  guardianTasks = guardianTasks.map((item) =>
    item.id === id ? { ...item, title: nextTitle.trim() } : item
  );
  persist();
  renderTasks();
  announce("Task renamed without drama.");
}

function deleteTask(id) {
  guardianTasks = guardianTasks.filter((task) => task.id !== id);
  persist();
  renderTasks();
  announce("Task deleted. The timeline moved on.");
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const title = String(formData.get("title") || "");
  if (!title.trim()) {
    announce("Write a task first. I believe in structure.");
    return;
  }
  guardianTasks = [
    createTask({
      title,
      dueDate: String(formData.get("dueDate") || ""),
      priority: String(formData.get("priority") || "normal"),
    }),
    ...guardianTasks,
  ];
  taskForm.reset();
  persist();
  renderTasks();
  announce("Task saved. Fetuccini would be proud.");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

renderTasks();

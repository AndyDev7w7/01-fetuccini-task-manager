const STORAGE_KEY = "fetuccini.tasks.v1";

export function createTask({ title, dueDate, priority }) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: title.trim(),
    dueDate,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function loadGuardianTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not read tasks", error);
    return [];
  }
}

export function saveTaskToLocalRealm(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.warn("Could not save tasks", error);
    return false;
  }
}

// store.js
// Handles persistence: load and save tasks to localStorage.
// This module abstracts browser storage so other files don’t deal with it directly.

const LIST_ITEMS_LOCAL_STORAGE = "listItems";

/**
 * Read tasks from localStorage.
 *
 * @returns {import("./model.js").Task[]} Parsed list of tasks, or an empty array when nothing is stored.
 */
export const loadTasks = () => {
  try {
    const savedTasks = localStorage.getItem(LIST_ITEMS_LOCAL_STORAGE);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (e) {
    console.error("Failed to load tasks from localStorage", e);
    return [];
  }
};

/**
 * Persist tasks into localStorage.
 *
 * @param {import("./model.js").Task[]} tasks List of tasks to store.
 * @returns {void}
 */
export const saveTasks = (tasks) => {
  localStorage.setItem(LIST_ITEMS_LOCAL_STORAGE, JSON.stringify(tasks));
};

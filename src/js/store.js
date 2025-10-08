// store.js
// Handles persistence: load and save tasks to localStorage.
// This module abstracts browser storage so other files don’t deal with it directly.

const LIST_ITEMS_LOCAL_STORAGE = "listItems";

export const loadTasks = () => {
  try {
    const savedTasks = localStorage.getItem(LIST_ITEMS_LOCAL_STORAGE);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (e) {
    console.error("Failed to load tasks from localStorage", e);
    return [];
  }
};

export const saveTasks = (tasks) => {
  localStorage.setItem(LIST_ITEMS_LOCAL_STORAGE, JSON.stringify(tasks));
};

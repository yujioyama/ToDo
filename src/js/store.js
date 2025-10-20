/**
 * @fileoverview LocalStorage persistence layer for the todo application.
 *
 * Handles all browser storage operations including tasks, UI preferences,
 * and user settings. Provides a clean API that abstracts localStorage details
 * and includes robust error handling for corrupted data.
 *
 * @module store
 */

// store.js
// Handles persistence: load and save tasks to localStorage.
// This module abstracts browser storage so other files don't deal with it directly.

/** @constant {string} localStorage key for task list */
const LIST_ITEMS_LOCAL_STORAGE = "listItems";
/** @constant {string} localStorage key for active filter */
const FILTER_LOCAL_STORAGE = "listFilter";
/** @constant {string} localStorage key for sort preference */
const SORT_LOCAL_STORAGE = "listSort";
/** @constant {string} localStorage key for tag filter */
const TAG_FILTER_LOCAL_STORAGE = "tagFilter";
/** @constant {string} localStorage key for theme preference */
const THEME_LOCAL_STORAGE = "uiTheme";

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

/**
 * Read the saved filter value from localStorage.
 *
 * @returns {"all" | "active" | "done" | null} Stored filter identifier or null when absent.
 */
export const loadFilter = () => {
  try {
    const savedFilter = localStorage.getItem(FILTER_LOCAL_STORAGE);
    return savedFilter ? savedFilter : null;
  } catch (e) {
    console.error("Failed to load filter from localStorage", e);
    return null;
  }
};

/**
 * Persist filter into localStorage.
 *
 * @param {"all" | "active" | "done"} filter
 * @returns {void}
 */
export const saveFilter = (filter) => {
  localStorage.setItem(FILTER_LOCAL_STORAGE, filter);
};

/**
 * Read the saved sort value from localStorage.
 *
 * @returns {"none" | "dueDate" | "priority" | null} Stored sort identifier or null when absent.
 */
export const loadSort = () => {
  try {
    const savedSort = localStorage.getItem(SORT_LOCAL_STORAGE);
    return savedSort ? savedSort : null;
  } catch (e) {
    console.error("Failed to load sort from localStorage", e);
    return null;
  }
};

/**
 * Persist sort into localStorage.
 *
 * @param {"none" | "dueDate" | "priority"} sort
 * @returns {void}
 */
export const saveSort = (sort) => {
  localStorage.setItem(SORT_LOCAL_STORAGE, sort);
};

/**
 * Read the saved tag filter from localStorage.
 *
 * @returns {string[] | null} Array of tag filters, or null when unset.
 */
export const loadTagFilter = () => {
  try {
    const saved = localStorage.getItem(TAG_FILTER_LOCAL_STORAGE);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.error("Failed to load tag filter from localStorage", e);
    return null;
  }
};

/**
 * Persist tag filter into localStorage.
 *
 * @param {string[]} tags
 * @returns {void}
 */
export const saveTagFilter = (tags) => {
  localStorage.setItem(TAG_FILTER_LOCAL_STORAGE, JSON.stringify(tags));
};

/**
 * Load the stored UI theme preference.
 *
 * @returns {"theme-light" | "theme-dark" | null}
 */
export const loadTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_LOCAL_STORAGE);
    if (saved === "theme-light" || saved === "theme-dark") return saved;
    return null;
  } catch (e) {
    console.error("Failed to load theme from localStorage", e);
    return null;
  }
};

/**
 * Persist the UI theme preference.
 *
 * @param {"theme-light" | "theme-dark"} theme
 * @returns {void}
 */
export const saveTheme = (theme) => {
  localStorage.setItem(THEME_LOCAL_STORAGE, theme);
};

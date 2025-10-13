// model.js
// Defines pure functions for managing task data (add, delete, toggle).
// This module is independent of DOM and storage, so it’s easy to test.

/**
 * @typedef {Object} Task
 * @property {string} id Unique identifier for the task.
 * @property {string} text Task description.
 * @property {boolean} done Completion state.
 * @property {number} createdAt C timestamp when the task was created.
 * @property {string | null} [dueDate] ISO-8601 date string representing the due date.
 * @property {"low", "medium", "high"} priority
 * @property {number} [updatedAt] Epoch timestamp of the last update.
 */

/**
 * Create a new task and append it to the provided list.
 *
 * @param {Task[]} tasks Current list of tasks.
 * @param {string} text Raw text for the new task.
 * @param {string | null | undefined} [dueDate] Optional ISO date string (YYYY-MM-DD).
 * @param {"low" | "medium" | "high" | null | undefined} priority
 * @returns {Task[]} New list with the appended task.
 */
export const addTask = (tasks, text, dueDate, priority) => {
  return [
    ...tasks,
    {
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      createdAt: Date.now(),
      dueDate: dueDate ?? null,
      priority: priority ?? null,
    },
  ];
};

/**
 * Remove a task from the list.
 *
 * @param {Task[]} tasks Current list of tasks.
 * @param {string} id Identifier of the task to delete.
 * @returns {Task[]} New list without the deleted task.
 */
export const deleteTask = (tasks, id) => {
  return tasks.filter((task) => task.id !== id);
};

/**
 * Toggle the completion status for a given task.
 *
 * @param {Task[]} tasks Current list of tasks.
 * @param {string} id Identifier of the task to toggle.
 * @returns {Task[]} New list with the toggled task.
 */
export const toggleTaskStatus = (tasks, id) => {
  return tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done, updatedAt: Date.now() } : task
  );
};

/**
 * Merge the provided fields into the matching task.
 *
 * @param {Task[]} tasks Current list of tasks.
 * @param {string} id Identifier of the task to update.
 * @param {Partial<Task>} fields Properties to update on the task.
 * @returns {Task[]} New list reflecting the update.
 */
export const updateTask = (tasks, id, fields) => {
  return tasks.map((task) => (task.id === id ? { ...task, ...fields } : task));
};

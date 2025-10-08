// model.js
// Defines pure functions for managing task data (add, delete, toggle).
// This module is independent of DOM and storage, so it’s easy to test.

export const addTask = (tasks, text) => {
  return [
    ...tasks,
    {
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      createdAt: Date.now(),
    },
  ];
};

export const deleteTask = (tasks, id) => {
  return tasks.filter((task) => task.id !== id);
};

export const toggleTaskStatus = (tasks, id) => {
  return tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done, updatedAt: Date.now() } : task
  );
};

export const findTask = (tasks, id) => {
  return tasks.find((task) => task.id === id);
};

// app.js
// Connects UI (DOM) with the task model and storage.
// Handles user events, updates the DOM, and delegates data logic to model/store.

import { loadTasks, saveTasks } from "./store.js";
import { addTask, deleteTask, toggleTaskStatus, findTask } from "./model.js";

const applyStatus = (changeStatusButtonElm, isDone) => {
  changeStatusButtonElm.classList.toggle("is-complete", isDone);
  changeStatusButtonElm.setAttribute(
    "aria-label",
    isDone ? "Mark as incomplete" : "Mark as complete"
  );
  changeStatusButtonElm.setAttribute("aria-pressed", String(isDone));
};

const insertTask = (taskTemplate, task, taskListElm) => {
  const node = taskTemplate.content.cloneNode(true);
  const listItemElm = node.querySelector(".js-todo-list-item");
  const taskTextElm = node.querySelector(".js-task-text");
  const taskStatusTrigger = node.querySelector(".js-task-status-trigger");

  listItemElm.dataset.id = task.id;
  taskTextElm.textContent = task.text;
  applyStatus(taskStatusTrigger, task.done);

  taskListElm.appendChild(node);
};

const onAddNewTask = (newTaskInputElm, taskTemplate, taskListElm) => {
  const newTaskText = newTaskInputElm.value.trim();
  if (!newTaskText) return;

  const tasks = loadTasks();
  const updatedTasks = addTask(tasks, newTaskText);
  saveTasks(updatedTasks);

  const newTask = updatedTasks[updatedTasks.length - 1];
  insertTask(taskTemplate, newTask, taskListElm);

  newTaskInputElm.value = "";
  newTaskInputElm.focus();
};

document.addEventListener("DOMContentLoaded", () => {
  const addNewTaskButtonElm = document.querySelector(
    ".js-add-new-task-trigger"
  );
  const newTaskInputElm = document.querySelector(".js-new-task-input");
  const taskTemplate = document.getElementById("list-item-template");
  const taskListElm = document.querySelector(".js-todo-list");

  if (!addNewTaskButtonElm || !newTaskInputElm || !taskListElm || !taskTemplate)
    return;

  const tasks = loadTasks();
  for (const task of tasks) insertTask(taskTemplate, task, taskListElm);

  addNewTaskButtonElm.addEventListener("click", () => {
    if (newTaskInputElm.value.trim() === "") {
      alert("Please enter a task.");
      return;
    }
    onAddNewTask(newTaskInputElm, taskTemplate, taskListElm);
  });

  newTaskInputElm.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (newTaskInputElm.value.trim() === "") {
        alert("Please enter a task.");
        return;
      }
      onAddNewTask(newTaskInputElm, taskTemplate, taskListElm);
    }
  });

  taskListElm.addEventListener("click", (e) => {
    const deleteButton = e.target.closest?.(".js-delete-task-trigger");

    if (deleteButton) {
      const listItemElm = deleteButton.closest(".js-todo-list-item");
      if (!listItemElm) return;

      const tasks = loadTasks();
      const tasksAfterDeletion = deleteTask(tasks, istItemElm.dataset.id);

      saveTasks(tasksAfterDeletion);

      listItemElm.remove();
    }

    const changeStatusButton = e.target.closest?.(".js-task-status-trigger");
    if (changeStatusButton) {
      const listItemElm = changeStatusButton.closest(".js-todo-list-item");
      if (!listItemElm) return;

      let tasks = loadTasks();
      const selectedTaskId = listItemElm.dataset.id;

      const updatedTasks = toggleTaskStatus(tasks, selectedTaskId);

      saveTasks(updatedTasks);

      const selectedTask = findTask(tasks, selectedTaskId);

      applyStatus(changeStatusButton, selectedTask.done);
    }
  });
});

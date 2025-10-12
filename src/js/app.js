// app.js
// Connects UI (DOM) with the task model and storage.
// Handles user events, updates the DOM, and delegates data logic to model/store.

import { loadTasks, saveTasks } from "./store.js";
import {
  addTask,
  deleteTask,
  toggleTaskStatus,
  findTask,
  updateTask,
} from "./model.js";

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

const onChangeStatus = (changeStatusButton) => {
  const listItemElm = changeStatusButton.closest(".js-todo-list-item");
  if (!listItemElm) return;

  let tasks = loadTasks();
  const selectedTaskId = listItemElm.dataset.id;

  const updatedTasks = toggleTaskStatus(tasks, selectedTaskId);

  saveTasks(updatedTasks);

  const selectedTask = findTask(tasks, selectedTaskId);

  applyStatus(changeStatusButton, selectedTask.done);
};

const onDeleteTask = (deleteButton) => {
  const listItemElm = deleteButton.closest(".js-todo-list-item");
  if (!listItemElm) return;

  const tasks = loadTasks();
  const tasksAfterDeletion = deleteTask(tasks, listItemElm.dataset.id);

  saveTasks(tasksAfterDeletion);

  listItemElm.remove();
};

const isInputValid = (input) => input.value.trim().length > 0;

const replaceWithTaskText = (wrapperElm, text) => {
  const spanElm = document.createElement("span");
  spanElm.className = "todo-list__text js-task-text";
  spanElm.textContent = text;
  wrapperElm.replaceWith(spanElm);
};

const updateTaskText = (taskId, oldText, newText) => {
  if (newText === oldText) return;
  const tasks = loadTasks();
  const updatedTasks = updateTask(tasks, taskId, {
    text: newText,
    updatedAt: Date.now(),
  });
  saveTasks(updatedTasks);
};

const startEditingTask = (taskTextElm) => {
  const listItemElm = taskTextElm.closest(".js-todo-list-item");
  if (!listItemElm || listItemElm.querySelector(".todo-list__edit")) return;

  const taskId = listItemElm.dataset.id;
  const originalText = taskTextElm.textContent ?? "";

  const inputElm = document.createElement("input");
  inputElm.type = "text";
  inputElm.value = originalText;
  inputElm.className = "todo-list__edit";
  inputElm.size = Math.max(1, originalText.length);

  const wrapperElm = document.createElement("div");
  wrapperElm.className = "todo-list__editWrap";
  wrapperElm.appendChild(inputElm);

  const commitEdit = () => {
    const nextText = inputElm.value.trim();
    if (!nextText) {
      alert("Task cannot be empty.");
      inputElm.focus();
      return;
    }

    updateTaskText(taskId, originalText, nextText);
    replaceWithTaskText(wrapperElm, nextText);
  };

  inputElm.addEventListener("blur", commitEdit);
  inputElm.addEventListener("keydown", (event) => {
    if (event.key === "Enter") inputElm.blur();
    if (event.key === "Escape") {
      inputElm.value = originalText;
      inputElm.blur();
    }
  });
  inputElm.addEventListener("input", () => {
    inputElm.size = Math.max(1, inputElm.value.length);
  });

  taskTextElm.replaceWith(wrapperElm);
  inputElm.focus();
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
    if (!isInputValid(newTaskInputElm)) {
      alert("Please enter a task.");
      return;
    }
    onAddNewTask(newTaskInputElm, taskTemplate, taskListElm);
  });

  newTaskInputElm.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (!isInputValid(newTaskInputElm)) {
        alert("Please enter a task.");
        return;
      }
      onAddNewTask(newTaskInputElm, taskTemplate, taskListElm);
    }
  });

  taskListElm.addEventListener("click", (e) => {
    const deleteButtonElm = e.target.closest?.(".js-delete-task-trigger");
    if (deleteButtonElm) onDeleteTask(deleteButtonElm);

    const changeStatusButtonElm = e.target.closest?.(".js-task-status-trigger");
    if (changeStatusButtonElm) onChangeStatus(changeStatusButtonElm);

    const taskTextElm = e.target.closest?.(".js-task-text");
    if (taskTextElm) startEditingTask(taskTextElm);
  });
});

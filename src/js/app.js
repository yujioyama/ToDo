// app.js
// Connects UI (DOM) with the task model and storage.
// Handles user events, updates the DOM, and delegates data logic to model/store.

import { loadTasks, saveTasks, loadFilter, saveFilter } from "./store.js";
import { addTask, deleteTask, toggleTaskStatus, updateTask } from "./model.js";

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

const isInputValid = (input) => input.value.trim().length > 0;

const replaceWithTaskText = (wrapperElm, text) => {
  const spanElm = document.createElement("span");
  spanElm.className = "todo-list__text js-task-text";
  spanElm.textContent = text;
  wrapperElm.replaceWith(spanElm);
};

const getFilteredTasks = (tasks, filter) => {
  saveFilter(filter);
  switch (filter) {
    case "active":
      return tasks.filter((task) => !task.done);
    case "done":
      return tasks.filter((task) => task.done);
    default:
      return tasks;
  }
};

const renderTaskList = (taskTemplate, taskListElm, tasks, filter) => {
  taskListElm.innerHTML = "";
  const visibleTasks = getFilteredTasks(tasks, filter);
  for (const task of visibleTasks) insertTask(taskTemplate, task, taskListElm);
};

document.addEventListener("DOMContentLoaded", () => {
  const addNewTaskButtonElm = document.querySelector(
    ".js-add-new-task-trigger"
  );
  const newTaskInputElm = document.querySelector(".js-new-task-input");
  const taskTemplate = document.getElementById("list-item-template");
  const taskListElm = document.querySelector(".js-todo-list");
  const filterListElm = document.querySelector(".js-filter");

  if (
    !addNewTaskButtonElm ||
    !newTaskInputElm ||
    !taskListElm ||
    !taskTemplate ||
    !filterListElm
  )
    return;

  let tasks = loadTasks();
  const initialFilterInput = filterListElm.querySelector(
    'input[name="filter"]:checked'
  );
  const availableFilterInputs = Array.from(
    filterListElm.querySelectorAll(".js-filter-trigger")
  );
  const savedFilter = loadFilter();
  const availableValues = new Set(
    availableFilterInputs.map((input) => input.value)
  );
  let currentFilter = availableValues.has(savedFilter)
    ? savedFilter
    : initialFilterInput?.value ?? "all";

  const syncFilterControls = () => {
    const targetInput = filterListElm.querySelector(
      `.js-filter-trigger[value="${currentFilter}"]`
    );
    if (targetInput) targetInput.checked = true;
  };

  const render = () => {
    renderTaskList(taskTemplate, taskListElm, tasks, currentFilter);
  };

  syncFilterControls();
  render();

  const clearAndFocusInput = () => {
    newTaskInputElm.value = "";
    newTaskInputElm.focus();
  };

  const addTaskFromInput = () => {
    const newTaskText = newTaskInputElm.value.trim();
    if (!newTaskText) return;

    tasks = addTask(tasks, newTaskText);
    saveTasks(tasks);
    clearAndFocusInput();
    render();
  };

  addNewTaskButtonElm.addEventListener("click", () => {
    if (!isInputValid(newTaskInputElm)) {
      alert("Please enter a task.");
      return;
    }
    addTaskFromInput();
  });

  newTaskInputElm.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (!isInputValid(newTaskInputElm)) {
        alert("Please enter a task.");
        return;
      }
      addTaskFromInput();
    }
  });

  const toggleTaskStatusHandler = (changeStatusButtonElm) => {
    const listItemElm = changeStatusButtonElm.closest(".js-todo-list-item");
    if (!listItemElm) return;

    const selectedTaskId = listItemElm.dataset.id;
    tasks = toggleTaskStatus(tasks, selectedTaskId);
    saveTasks(tasks);
    render();
  };

  const deleteTaskHandler = (deleteButtonElm) => {
    const listItemElm = deleteButtonElm.closest(".js-todo-list-item");
    if (!listItemElm) return;

    const selectedTaskId = listItemElm.dataset.id;
    tasks = deleteTask(tasks, selectedTaskId);
    saveTasks(tasks);
    render();
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

      if (nextText !== originalText) {
        tasks = updateTask(tasks, taskId, {
          text: nextText,
          updatedAt: Date.now(),
        });
        saveTasks(tasks);
      }

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

  taskListElm.addEventListener("click", (e) => {
    const deleteButtonElm = e.target.closest?.(".js-delete-task-trigger");
    if (deleteButtonElm) {
      deleteTaskHandler(deleteButtonElm);
      return;
    }

    const changeStatusButtonElm = e.target.closest?.(".js-task-status-trigger");
    if (changeStatusButtonElm) {
      toggleTaskStatusHandler(changeStatusButtonElm);
      return;
    }

    const taskTextElm = e.target.closest?.(".js-task-text");
    if (taskTextElm) startEditingTask(taskTextElm);
  });

  filterListElm.addEventListener("change", (e) => {
    const filterInputElm = e.target.closest?.(".js-filter-trigger");
    if (!filterInputElm) return;

    currentFilter = filterInputElm.value;
    saveFilter(currentFilter);
    syncFilterControls();
    render();
  });
});

// app.js
// Connects UI (DOM) with the task model and storage.
// Handles user events, updates the DOM, and delegates data logic to model/store.

import {
  loadTasks,
  saveTasks,
  loadFilter,
  saveFilter,
  loadSort,
  saveSort,
  loadTagFilter,
  saveTagFilter,
  loadTheme,
  saveTheme,
} from "./store.js";
import { addTask, deleteTask, toggleTaskStatus, updateTask } from "./model.js";

/**
 * Toggle button state to reflect completion status.
 *
 * @param {HTMLElement} changeStatusButtonElm Button element controlling task status.
 * @param {boolean} isDone Whether the task is complete.
 * @returns {void}
 */
const applyStatus = (changeStatusButtonElm, isDone) => {
  changeStatusButtonElm.classList.toggle("is-complete", isDone);
  changeStatusButtonElm.setAttribute(
    "aria-label",
    isDone ? "Mark as incomplete" : "Mark as complete"
  );
  changeStatusButtonElm.setAttribute("aria-pressed", String(isDone));
};

/**
 * Sanitize a list of tags by trimming whitespace and removing duplicates.
 *
 * @param {unknown} tags Incoming tags collection.
 * @returns {string[]} Deduplicated list of trimmed tags.
 */
const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  const result = [];

  for (const candidate of tags) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
};

/**
 * Convert a comma-separated string into a normalized tag list.
 *
 * @param {string} inputValue Raw value from the tag input field.
 * @returns {string[]} Normalized tag list.
 */
const parseTagsInput = (inputValue) => {
  if (!inputValue) return [];
  const rawTags = inputValue.split(",").map((tag) => tag.trim());
  return normalizeTags(rawTags);
};

/**
 * Update the tag display element for a task.
 *
 * @param {HTMLElement} tagsElm Element that renders the tags.
 * @param {unknown} tags Task tags to render.
 * @returns {void}
 */
const applyTags = (tagsElm, tags) => {
  const normalized = normalizeTags(tags);
  if (normalized.length === 0) {
    tagsElm.textContent = "";
    tagsElm.hidden = true;
    return;
  }

  tagsElm.textContent = `Tags: ${normalized.join(", ")}`;
  tagsElm.hidden = false;
};

/**
 * Clone template contents and populate them with task data.
 *
 * @param {HTMLTemplateElement} taskTemplate Task list item template.
 * @param {import("./model.js").Task} task Task record to render.
 * @param {HTMLElement} taskListElm List container element.
 * @returns {void}
 */
const insertTask = (taskTemplate, task, taskListElm) => {
  const node = taskTemplate.content.cloneNode(true);
  const listItemElm = node.querySelector(".js-todo-list-item");
  const taskTextElm = node.querySelector(".js-task-text");
  const taskStatusTrigger = node.querySelector(".js-task-status-trigger");
  const taskDueElm = node.querySelector(".js-task-due");
  const taskPriorityElm = node.querySelector(".js-task-priority");
  const taskTagsElm = node.querySelector(".js-task-tags");

  listItemElm.dataset.id = task.id;
  taskTextElm.textContent = task.text;
  applyStatus(taskStatusTrigger, task.done);
  if (taskDueElm) applyDueDate(taskDueElm, task.dueDate);
  if (taskPriorityElm) applyPriority(taskPriorityElm, task.priority);
  if (taskTagsElm) applyTags(taskTagsElm, task.tags);

  taskListElm.appendChild(node);
};

/**
 * Determine whether a text input has usable content.
 *
 * @param {HTMLInputElement} input Input element to validate.
 * @returns {boolean} True when the input has trimmed content.
 */
const isInputValid = (input) => input.value.trim().length > 0;

/**
 * Replace the edit wrapper with a static span containing the task text.
 *
 * @param {HTMLElement} wrapperElm Edit wrapper element.
 * @param {string} text Final text to display.
 * @returns {void}
 */
const replaceWithTaskText = (wrapperElm, text) => {
  const spanElm = document.createElement("span");
  spanElm.className = "todo-list__text js-task-text";
  spanElm.textContent = text;
  wrapperElm.replaceWith(spanElm);
};

/**
 * Filter tasks by completion status and persist the active filter.
 *
 * @param {import("./model.js").Task[]} tasks All tasks.
 * @param {"all" | "active" | "done"} filter Current status filter key.
 * @returns {import("./model.js").Task[]} Tasks matching the filter.
 */
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

/**
 * Check whether a task matches the search term.
 *
 * @param {import("./model.js").Task} task Task under evaluation.
 * @param {string} searchTerm Text the user is searching for.
 * @returns {boolean} True when the task text includes the search term.
 */
const matchesSearch = (task, searchTerm) => {
  if (!searchTerm) return true;
  return (task.text ?? "").toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Check whether a task satisfies the active tag filters.
 *
 * @param {import("./model.js").Task} task Task under evaluation.
 * @param {string[]} filterTags Tags the user wants to match.
 * @returns {boolean} True when the task contains every filter tag.
 */
const matchesTagFilter = (task, filterTags) => {
  if (!Array.isArray(filterTags) || filterTags.length === 0) return true;

  const taskTags = normalizeTags(task?.tags).map((tag) => tag.toLowerCase());
  if (taskTags.length === 0) return false;

  const taskTagSet = new Set(taskTags);
  return filterTags.every((filterTag) => taskTagSet.has(filterTag.toLowerCase()));
};

/**
 * Sort tasks according to the chosen strategy.
 *
 * @param {import("./model.js").Task[]} tasks Tasks to sort.
 * @param {"none" | "dueDate" | "priority"} sort Active sort key.
 * @returns {import("./model.js").Task[]} Sorted tasks (new array when sorted).
 */
const getSortedTasks = (tasks, sort) => {
  if (!sort || sort === "none") return tasks;

  const sortedTasks = [...tasks];

  if (sort === "dueDate") {
    const toTimestamp = (task) => {
      if (!task?.dueDate) return Number.POSITIVE_INFINITY;
      const value = new Date(task.dueDate).getTime();
      return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value;
    };
    sortedTasks.sort((a, b) => {
      const diff = toTimestamp(a) - toTimestamp(b);
      if (diff !== 0) return diff;
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    });
    return sortedTasks;
  }

  if (sort === "priority") {
    const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
    const toRank = (task) => {
      const key =
        typeof task?.priority === "string"
          ? task.priority.toLowerCase()
          : null;
      return PRIORITY_ORDER[key] ?? 3;
    };
    sortedTasks.sort((a, b) => {
      const diff = toRank(a) - toRank(b);
      if (diff !== 0) return diff;
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    });
    return sortedTasks;
  }

  return tasks;
};

/**
 * Format a raw due date into a display-friendly representation.
 *
 * @param {string | null | undefined} dueDate ISO date string.
 * @returns {{display: string, datetime: string} | null} Formatted date data.
 */
const formatDueDate = (dueDate) => {
  if (!dueDate) return null;
  const parsedDate = new Date(dueDate);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return {
    display: parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    datetime: dueDate,
  };
};

/**
 * Apply due-date formatting to the DOM element.
 *
 * @param {HTMLTimeElement} dueElm Target time element.
 * @param {string | null | undefined} dueDate Raw due date.
 * @returns {void}
 */
const applyDueDate = (dueElm, dueDate) => {
  const formatted = formatDueDate(dueDate);
  if (!formatted) {
    dueElm.textContent = "";
    dueElm.removeAttribute("datetime");
    dueElm.hidden = true;
    return;
  }

  dueElm.textContent = `Due ${formatted.display}`;
  dueElm.setAttribute("datetime", formatted.datetime);
  dueElm.hidden = false;
};

/**
 * Produce a human-friendly priority label.
 *
 * @param {string | null | undefined} priority Raw priority key.
 * @returns {string | null} Capitalized label or null when absent.
 */
const formatPriorityLabel = (priority) => {
  if (!priority) return null;
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

/**
 * Update the priority badge text and visibility.
 *
 * @param {HTMLElement} priorityElm Target element for the priority label.
 * @param {string | null | undefined} priority Raw priority key.
 * @returns {void}
 */
const applyPriority = (priorityElm, priority) => {
  const formatted = formatPriorityLabel(priority);
  if (!formatted) {
    priorityElm.textContent = "";
    priorityElm.hidden = true;
    return;
  }

  priorityElm.textContent = `Priority: ${formatted}`;
  priorityElm.hidden = false;
};

/**
 * Render the task list with all active filters and sort applied.
 *
 * @param {HTMLTemplateElement} taskTemplate Template for new list items.
 * @param {HTMLElement} taskListElm Container element for tasks.
 * @param {import("./model.js").Task[]} tasks Source task list.
 * @param {"all" | "active" | "done"} filter Status filter key.
 * @param {string} searchTerm Current search term.
 * @param {"none" | "dueDate" | "priority"} sort Active sort key.
 * @param {string[]} tagFilter Tags that must appear on each task.
 * @returns {void}
 */
const renderTaskList = (
  taskTemplate,
  taskListElm,
  tasks,
  filter,
  searchTerm,
  sort,
  tagFilter
) => {
  taskListElm.innerHTML = "";
  const filteredTasks = getFilteredTasks(tasks, filter);
  const searchedTasks = filteredTasks.filter((task) =>
    matchesSearch(task, searchTerm)
  );
  const tagFilteredTasks = searchedTasks.filter((task) =>
    matchesTagFilter(task, tagFilter)
  );
  const visibleTasks = getSortedTasks(tagFilteredTasks, sort);
  for (const task of visibleTasks) insertTask(taskTemplate, task, taskListElm);
};

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Guard that all required DOM elements exist before continuing.
   */
  const addNewTaskButtonElm = document.querySelector(
    ".js-add-new-task-trigger"
  );
  const newTaskInputElm = document.querySelector(".js-new-task-input");
  const newTaskDateElm = document.querySelector(".js-new-task-date");
  const newTaskPriorityElm = document.querySelector(".js-new-task-priority");
  const newTaskTagsElm = document.querySelector(".js-new-task-tags");
  const tagFilterInputElm = document.querySelector(".js-tag-filter");
  const taskTemplate = document.getElementById("list-item-template");
  const taskListElm = document.querySelector(".js-todo-list");
  const filterListElm = document.querySelector(".js-filter");
  const sortSelectElm = document.querySelector(".js-sort");
  const metricTotalElm = document.querySelector(".js-metric-total");
  const metricCompleteElm = document.querySelector(".js-metric-complete");
  const metricActiveElm = document.querySelector(".js-metric-active");
  const metricRateElm = document.querySelector(".js-metric-rate");
  const themeToggleButtonElm = document.querySelector(".js-theme-toggle");

  if (
    !addNewTaskButtonElm ||
    !newTaskInputElm ||
    !newTaskDateElm ||
    !newTaskPriorityElm ||
    !newTaskTagsElm ||
    !taskListElm ||
    !taskTemplate ||
    !filterListElm ||
    !sortSelectElm ||
    !tagFilterInputElm ||
    !themeToggleButtonElm
  )
    return;

  let tasks = loadTasks();
  tasks = tasks.map((task) => ({
    ...task,
    tags: normalizeTags(task.tags),
  }));
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
  const savedSort = loadSort();
  const availableSortValues = new Set(["none", "dueDate", "priority"]);
  let currentSort = availableSortValues.has(savedSort) ? savedSort : "none";
  const savedTagFilter = loadTagFilter();
  let currentTagFilter = normalizeTags(savedTagFilter ?? []);

  const syncFilterControls = () => {
    const targetInput = filterListElm.querySelector(
      `.js-filter-trigger[value="${currentFilter}"]`
    );
    if (targetInput) targetInput.checked = true;
  };
  const syncSortControl = () => {
    sortSelectElm.value = currentSort;
  };
  /**
   * Reflect the active tag filter array within the input field.
   *
   * @returns {void}
   */
  const syncTagFilterControl = () => {
    tagFilterInputElm.value = currentTagFilter.join(", ");
  };

  let currentSearchTerm = "";
  let currentTheme =
    loadTheme() ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "theme-dark"
      : "theme-light");

  /**
   * Update the dashboard metrics to match the current task collection.
   *
   * @param {import("./model.js").Task[]} allTasks All tracked tasks.
   * @returns {void}
   */
  const updateMetrics = (allTasks) => {
    if (
      !metricTotalElm ||
      !metricCompleteElm ||
      !metricActiveElm ||
      !metricRateElm
    )
      return;

    const total = allTasks.length;
    const completed = allTasks.filter((task) => task.done).length;
    const active = total - completed;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    metricTotalElm.textContent = String(total);
    metricCompleteElm.textContent = String(completed);
    metricActiveElm.textContent = String(active);
    metricRateElm.textContent = `${completionRate}%`;
  };

  /**
   * Apply the theme class to `<body>` and persist the preference.
   *
   * @param {"theme-light" | "theme-dark"} theme Next theme identifier.
   * @returns {void}
   */
  const applyTheme = (theme) => {
    currentTheme = theme;
    saveTheme(currentTheme);
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(currentTheme, "theme-transition");
    themeToggleButtonElm.textContent =
      currentTheme === "theme-dark" ? "Switch to light mode" : "Switch to dark mode";
  };

  const render = () => {
    /**
     * Render pipeline orchestrates filtering/tag matching/sorting and metrics refresh.
     */
    renderTaskList(
      taskTemplate,
      taskListElm,
      tasks,
      currentFilter,
      currentSearchTerm,
      currentSort,
      currentTagFilter
    );
    updateMetrics(tasks);
  };

  syncFilterControls();
  syncSortControl();
  syncTagFilterControl();
  applyTheme(currentTheme);
  render();

  const clearAndFocusInput = () => {
    newTaskInputElm.value = "";
    newTaskDateElm.value = "";
    newTaskPriorityElm.value = "";
    newTaskTagsElm.value = "";
    newTaskInputElm.focus();
  };

  const addTaskFromInput = () => {
    const newTaskText = newTaskInputElm.value.trim();
    if (!newTaskText) return;

    const newTaskDueDate = newTaskDateElm.value || null;
    const newTaskPriority = newTaskPriorityElm.value || null;
    const newTaskTags = parseTagsInput(newTaskTagsElm.value);

    tasks = addTask(
      tasks,
      newTaskText,
      newTaskDueDate,
      newTaskPriority,
      newTaskTags
    );
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

  sortSelectElm.addEventListener("change", (e) => {
    const nextSort = e.target.value;
    if (!availableSortValues.has(nextSort)) return;

    currentSort = nextSort;
    saveSort(currentSort);
    syncSortControl();
    render();
  });

  const searchInputElm = document.querySelector(".js-search");
  if (!searchInputElm) return;

  searchInputElm.addEventListener("input", () => {
    currentSearchTerm = searchInputElm.value.trim();
    render();
  });

  tagFilterInputElm.addEventListener("input", () => {
    currentTagFilter = parseTagsInput(tagFilterInputElm.value);
    saveTagFilter(currentTagFilter);
    syncTagFilterControl();
    render();
  });

  themeToggleButtonElm.addEventListener("click", () => {
    const nextTheme = currentTheme === "theme-dark" ? "theme-light" : "theme-dark";
    applyTheme(nextTheme);
  });
});

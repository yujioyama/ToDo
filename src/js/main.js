import "../css/style.scss";
import "./app.js";
import { setLanguage, loadLocale, getTranslation } from "./i18n.js";

// 言語初期化
const langSwitch = document.getElementById("lang-switch");
const langLabel = document.getElementById("lang-label");
const userLang =
  navigator.language && navigator.language.startsWith("ja") ? "ja" : "en";

function updateStaticTexts() {
  const setText = (id, key) => {
    const elm = document.getElementById(id);
    if (!elm) return;
    elm.textContent = getTranslation(key);
  };

  const setPlaceholder = (id, key) => {
    const elm = document.getElementById(id);
    if (!(elm instanceof HTMLInputElement)) return;
    elm.placeholder = getTranslation(key);
  };

  if (langLabel) langLabel.textContent = getTranslation("language");

  setText("app-title", "title");
  setText("app-tagline", "tagline");

  setText("panel-add-title", "panelAddTitle");
  setText("panel-add-tagline", "panelAddTagline");
  setPlaceholder("new-task-input", "newTaskPlaceholder");
  setPlaceholder("new-task-tags", "tagsPlaceholder");
  setText("add-task-button", "addTaskButton");

  setText("panel-refine-title", "panelRefineTitle");
  setText("panel-refine-tagline", "panelRefineTagline");
  setText("action-title-search", "search");
  setText("action-title-status", "status");
  setText("action-title-sort", "sort");
  setText("action-title-tags", "tags");
  setPlaceholder("tag-filter-input", "filterTagsPlaceholder");

  setText("filter-label-all", "all");
  setText("filter-label-active", "active");
  setText("filter-label-done", "done");

  setText("metric-label-total", "totalTasks");
  setText("metric-helper-total", "totalTasksHelper");
  setText("metric-label-completed", "completed");
  setText("metric-helper-completed", "completedHelper");
  setText("metric-label-inprogress", "inProgress");
  setText("metric-helper-inprogress", "inProgressHelper");
  setText("metric-label-completion", "completion");
  setText("metric-helper-completion", "completionHelper");

  setText("panel-list-title", "taskListTitle");
  setText("panel-list-tagline", "taskListTagline");

  setText("select-all-label", "selectAll");
  setText("bulk-complete-button", "markSelectedComplete");
  setText("bulk-delete-button", "deleteSelected");

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect instanceof HTMLSelectElement) {
    const [noneOpt, dueOpt, priOpt] = Array.from(sortSelect.options);
    if (noneOpt) noneOpt.textContent = getTranslation("sortNone");
    if (dueOpt) dueOpt.textContent = getTranslation("sortDueDate");
    if (priOpt) priOpt.textContent = getTranslation("sortPriority");
  }

  const newTaskPriority = document.getElementById("new-task-priority");
  if (newTaskPriority instanceof HTMLSelectElement) {
    const [priorityOpt, highOpt, mediumOpt, lowOpt] = Array.from(
      newTaskPriority.options
    );
    if (priorityOpt) priorityOpt.textContent = getTranslation("priority");
    if (highOpt) highOpt.textContent = getTranslation("high");
    if (mediumOpt) mediumOpt.textContent = getTranslation("medium");
    if (lowOpt) lowOpt.textContent = getTranslation("low");
  }

  const searchInput = document.querySelector(".js-search");
  if (searchInput instanceof HTMLInputElement) {
    searchInput.placeholder = getTranslation("searchPlaceholder");
  }
}

loadLocale(userLang).then(updateStaticTexts);

if (langSwitch) {
  langSwitch.value = userLang;
  langSwitch.addEventListener("change", (e) => {
    setLanguage(e.target.value).then(updateStaticTexts);
  });
}

document.addEventListener("languageChanged", () => {
  updateStaticTexts();
});

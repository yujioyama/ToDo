class TodoItem extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <li class="todo-list__item">
        <div class="todo-list__left">
          <input class="todo-list__select js-task-select" type="checkbox" aria-label="Select task" />
          <button class="todo-list__status js-task-status-trigger" aria-label="Mark as complete"></button>
          <div class="todo-list__content">
            <span class="todo-list__text js-task-text"></span>
            <div class="todo-list__meta">
              <time class="todo-list__due js-task-due" hidden></time>
              <span class="todo-list__priority js-task-priority" hidden></span>
              <span class="todo-list__tags js-task-tags" hidden></span>
            </div>
          </div>
        </div>
        <button class="todo-list__delete js-delete-task-trigger" aria-label="Delete">Delete</button>
      </li>
      <style>
        @import url('../css/_todo-list.scss');
      </style>
    `;
  }

  set data(task) {
    const shadow = this.shadowRoot;
    shadow.querySelector(".todo-list__item").setAttribute("data-id", task.id);
    shadow.querySelector(".todo-list__text").textContent = task.text;
    shadow.querySelector(".todo-list__due").textContent = task.due || "";
    shadow.querySelector(".todo-list__priority").textContent =
      task.priority || "";
    shadow.querySelector(".todo-list__tags").textContent = task.tags || "";
    // show/hide meta
    shadow.querySelector(".todo-list__due").hidden = !task.due;
    shadow.querySelector(".todo-list__priority").hidden = !task.priority;
    shadow.querySelector(".todo-list__tags").hidden = !task.tags;
  }
}

customElements.define("todo-item", TodoItem);

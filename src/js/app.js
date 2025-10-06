const LIST_ITEMS_LOCAL_STORAGE = "listItems";

const insertTask = (taskTemplate, task, taskListElm, newTaskInputElm) => {
  const node = taskTemplate.content.cloneNode(true);
  node.querySelector(".js-task-text").textContent = task.text;
  node.querySelector(".js-todo-list-item").dataset.id = task.id;

  const taskStatusTrigger = node.querySelector(".js-task-status-trigger");

  if (task.done === true) {
    taskStatusTrigger.classList.add("is-complete");
    taskStatusTrigger.setAttribute("aria-label", "Mark as complete");
  } else {
    taskStatusTrigger.classList.remove("is-complete");
    taskStatusTrigger.setAttribute("aria-label", "Mark as incomplete");
  }

  taskListElm.appendChild(node);

  newTaskInputElm.value = "";
};

const getSaveTasks = () => {
  const savedTasks = localStorage.getItem(LIST_ITEMS_LOCAL_STORAGE);
  return savedTasks ? JSON.parse(savedTasks) : [];
};

const addNewTask = (newTaskInputElm, taskTemplate, taskListElm) => {
  const tasks = getSaveTasks();

  const newTaskText = newTaskInputElm.value;

  const newTask = {
    id: crypto.randomUUID(),
    text: newTaskText,
    done: false,
    createAt: Date.now(),
  };

  tasks.push(newTask);

  localStorage.setItem(LIST_ITEMS_LOCAL_STORAGE, JSON.stringify(tasks));

  insertTask(taskTemplate, newTask, taskListElm, newTaskInputElm);
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

  const tasks = getSaveTasks();

  if (tasks.length > 0) {
    tasks.forEach((task, index) => {
      insertTask(taskTemplate, task, taskListElm, newTaskInputElm);
    });
  }

  addNewTaskButtonElm.addEventListener("click", () => {
    if (newTaskInputElm.value.trim() === "") {
      alert("Please enter a task.");
    } else {
      addNewTask(newTaskInputElm, taskTemplate, taskListElm);
    }
  });

  taskListElm.addEventListener("click", (e) => {
    const clickedButton = e.target;

    if (clickedButton && clickedButton.matches(".js-delete-task-trigger")) {
      const listItemElm = clickedButton.closest(".js-todo-list-item");
      const taskTextElm = listItemElm.querySelector(".js-task-text");

      const taskToDelete = taskTextElm.textContent;
      const tasks = getSaveTasks();

      const tasksAfterDeletion = tasks.filter(
        (task) => task.textContent !== taskToDelete
      );

      localStorage.setItem(
        LIST_ITEMS_LOCAL_STORAGE,
        JSON.stringify(tasksAfterDeletion)
      );

      listItemElm.remove();
    }

    if (clickedButton && clickedButton.matches(".js-task-status-trigger")) {
      const listItemElm = clickedButton.closest(".js-todo-list-item");

      let tasks = getSaveTasks();

      tasks.forEach((task, index) => {
        if (task.id === listItemElm.dataset.id) {
          tasks[index].done = !tasks[index].done;

          if (tasks[index].done === true) {
            clickedButton.classList.add("is-complete");
            clickedButton.setAttribute("aria-label", "Mark as complete");
          } else {
            clickedButton.classList.remove("is-complete");
            clickedButton.setAttribute("aria-label", "Mark as incomplete");
          }
        }
      });

      localStorage.setItem(LIST_ITEMS_LOCAL_STORAGE, JSON.stringify(tasks));
    }
  });
});

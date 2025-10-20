import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addTask,
  deleteTask,
  toggleTaskStatus,
  updateTask,
} from "../src/js/model.js";

describe("model.js - Task Management", () => {
  let sampleTasks;

  beforeEach(() => {
    // Create fresh sample data for each test
    sampleTasks = [
      {
        id: "task-1",
        text: "Buy groceries",
        done: false,
        createdAt: 1700000000000,
        dueDate: "2025-10-25",
        priority: "high",
        tags: ["shopping"],
      },
      {
        id: "task-2",
        text: "Finish project",
        done: true,
        createdAt: 1700000001000,
        dueDate: null,
        priority: "medium",
        tags: ["work"],
      },
    ];
  });

  describe("addTask", () => {
    it("adds a new task to an empty list", () => {
      // ARRANGE: Start with empty list
      const emptyList = [];

      // ACT: Add a task
      const result = addTask(emptyList, "New task");

      // ASSERT: List should have one task
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("New task");
      expect(result[0].done).toBe(false);
      expect(result[0].id).toBeTruthy(); // Should have an ID
      expect(result[0].createdAt).toBeGreaterThan(0); // Should have timestamp
    });

    it("adds a new task to an existing list without mutating original", () => {
      const originalLength = sampleTasks.length;

      // ACT: Add task
      const result = addTask(sampleTasks, "Learn testing");

      // ASSERT: New list has the task
      expect(result).toHaveLength(3);
      expect(result[2].text).toBe("Learn testing");

      // ASSERT: Original list is unchanged (immutability)
      expect(sampleTasks).toHaveLength(originalLength);
    });

    it("adds task with due date, priority, and tags", () => {
      const result = addTask([], "Important meeting", "2025-11-15", "high", [
        "work",
        "urgent",
      ]);

      expect(result[0].dueDate).toBe("2025-11-15");
      expect(result[0].priority).toBe("high");
      expect(result[0].tags).toEqual(["work", "urgent"]);
    });

    it("trims whitespace from task text", () => {
      const result = addTask([], "  Spaced out task  ");
      expect(result[0].text).toBe("Spaced out task");
    });

    it("filters out invalid tags (empty or non-string)", () => {
      const result = addTask([], "Task", null, null, [
        "valid",
        "",
        "  ",
        123,
        null,
        "another-valid",
      ]);

      // Only valid strings with content should remain
      expect(result[0].tags).toEqual(["valid", "another-valid"]);
    });

    it("handles null/undefined optional parameters", () => {
      const result = addTask([], "Simple task", null, undefined, null);

      expect(result[0].dueDate).toBeNull();
      expect(result[0].priority).toBeNull();
      expect(result[0].tags).toEqual([]);
    });
  });

  describe("deleteTask", () => {
    it("removes a task by ID", () => {
      // ACT: Delete task-1
      const result = deleteTask(sampleTasks, "task-1");

      // ASSERT: Should have one less task
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("task-2");
    });

    it("returns unchanged list if ID does not exist", () => {
      const result = deleteTask(sampleTasks, "non-existent-id");

      // Should still have both tasks
      expect(result).toHaveLength(2);
    });

    it("does not mutate the original list", () => {
      const originalLength = sampleTasks.length;

      deleteTask(sampleTasks, "task-1");

      // Original list should be unchanged
      expect(sampleTasks).toHaveLength(originalLength);
    });
  });

  describe("toggleTaskStatus", () => {
    it("marks an incomplete task as done", () => {
      // task-1 is currently not done
      const result = toggleTaskStatus(sampleTasks, "task-1");

      const toggledTask = result.find((t) => t.id === "task-1");
      expect(toggledTask.done).toBe(true);
      expect(toggledTask.updatedAt).toBeGreaterThan(0); // Should update timestamp
    });

    it("marks a completed task as not done", () => {
      // task-2 is currently done
      const result = toggleTaskStatus(sampleTasks, "task-2");

      const toggledTask = result.find((t) => t.id === "task-2");
      expect(toggledTask.done).toBe(false);
      expect(toggledTask.updatedAt).toBeGreaterThan(0);
    });

    it("does not affect other tasks in the list", () => {
      const result = toggleTaskStatus(sampleTasks, "task-1");

      // task-2 should remain unchanged
      const otherTask = result.find((t) => t.id === "task-2");
      expect(otherTask.done).toBe(true); // Still done
    });

    it("returns unchanged list if ID does not exist", () => {
      const result = toggleTaskStatus(sampleTasks, "non-existent");

      // Tasks should remain as they were
      expect(result[0].done).toBe(false);
      expect(result[1].done).toBe(true);
    });

    it("does not mutate the original list", () => {
      toggleTaskStatus(sampleTasks, "task-1");

      // Original task-1 should still be not done
      expect(sampleTasks[0].done).toBe(false);
    });
  });

  describe("updateTask", () => {
    it("updates task text", () => {
      const result = updateTask(sampleTasks, "task-1", {
        text: "Buy organic groceries",
      });

      const updated = result.find((t) => t.id === "task-1");
      expect(updated.text).toBe("Buy organic groceries");
    });

    it("updates multiple fields at once", () => {
      const result = updateTask(sampleTasks, "task-1", {
        text: "Updated task",
        priority: "low",
        dueDate: "2025-12-01",
        tags: ["updated"],
      });

      const updated = result.find((t) => t.id === "task-1");
      expect(updated.text).toBe("Updated task");
      expect(updated.priority).toBe("low");
      expect(updated.dueDate).toBe("2025-12-01");
      expect(updated.tags).toEqual(["updated"]);
    });

    it("preserves other task properties when updating", () => {
      const result = updateTask(sampleTasks, "task-1", { priority: "low" });

      const updated = result.find((t) => t.id === "task-1");
      // These should remain unchanged
      expect(updated.text).toBe("Buy groceries");
      expect(updated.done).toBe(false);
      expect(updated.createdAt).toBe(1700000000000);
    });

    it("does not affect other tasks", () => {
      const result = updateTask(sampleTasks, "task-1", { text: "Changed" });

      // task-2 should be unchanged
      const otherTask = result.find((t) => t.id === "task-2");
      expect(otherTask.text).toBe("Finish project");
    });

    it("returns unchanged list if ID does not exist", () => {
      const result = updateTask(sampleTasks, "non-existent", { text: "Nope" });

      expect(result).toEqual(sampleTasks);
    });

    it("does not mutate the original list", () => {
      updateTask(sampleTasks, "task-1", { text: "Modified" });

      // Original should be unchanged
      expect(sampleTasks[0].text).toBe("Buy groceries");
    });
  });
});

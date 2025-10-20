/**
 * @fileoverview Test suite for task management business logic.
 * 
 * Tests pure functions that handle task CRUD operations (Create, Read, Update, Delete).
 * These functions are immutable - they return new arrays rather than modifying originals.
 * 
 * @requires vitest
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addTask,
  deleteTask,
  toggleTaskStatus,
  updateTask,
} from "../src/js/model.js";

/**
 * Test suite for task management operations.
 * 
 * Covers all CRUD operations and ensures immutability (functional programming).
 * Each test uses fresh sample data to maintain test isolation.
 */
describe("model.js - Task Management", () => {
  /** @type {Array<import("../src/js/model.js").Task>} Sample task data for testing */
  let sampleTasks;

  /**
   * Setup before each test: Create fresh sample tasks.
   * This ensures tests don't interfere with each other.
   */
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

  /**
   * Test suite for addTask function.
   * 
   * Verifies task creation with various parameter combinations,
   * data validation, and immutability.
   */
  describe("addTask", () => {
    /**
     * Test: Adding first task to empty list.
     * 
     * Ensures:
     * - Task object is properly created
     * - Required fields (id, text, done, createdAt) are populated
     * - done defaults to false for new tasks
     */
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

    /**
     * Test: Immutability - original array is not modified.
     * 
     * Critical for functional programming: Functions should return new arrays
     * rather than mutating the input. This prevents bugs from shared state.
     */
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

    /**
     * Test: Task creation with all optional parameters.
     * 
     * Verifies dueDate, priority, and tags are properly stored
     * when provided during task creation.
     */
    it("adds task with due date, priority, and tags", () => {
      const result = addTask([], "Important meeting", "2025-11-15", "high", [
        "work",
        "urgent",
      ]);

      expect(result[0].dueDate).toBe("2025-11-15");
      expect(result[0].priority).toBe("high");
      expect(result[0].tags).toEqual(["work", "urgent"]);
    });

    /**
     * Test: Input sanitization - whitespace trimming.
     * 
     * Ensures user input is cleaned up to prevent accidental
     * leading/trailing spaces in task text.
     */
    it("trims whitespace from task text", () => {
      const result = addTask([], "  Spaced out task  ");
      expect(result[0].text).toBe("Spaced out task");
    });

    /**
     * Test: Tag validation - filters invalid tags.
     * 
     * Defensive programming: Handles array with mixed invalid values
     * (empty strings, whitespace, non-strings, null). Only valid
     * string tags with content should be kept.
     */
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

    /**
     * Test: Optional parameters default handling.
     * 
     * When optional params are null/undefined, they should be
     * stored as null (dueDate, priority) or empty array (tags).
     */
    it("handles null/undefined optional parameters", () => {
      const result = addTask([], "Simple task", null, undefined, null);

      expect(result[0].dueDate).toBeNull();
      expect(result[0].priority).toBeNull();
      expect(result[0].tags).toEqual([]);
    });
  });

  /**
   * Test suite for deleteTask function.
   * 
   * Tests task removal by ID, including edge cases like
   * non-existent IDs and immutability verification.
   */
  describe("deleteTask", () => {
    /**
     * Test: Successful task deletion by ID.
     * 
     * Verifies the task is removed and other tasks remain.
     */
    it("removes a task by ID", () => {
      // ACT: Delete task-1
      const result = deleteTask(sampleTasks, "task-1");

      // ASSERT: Should have one less task
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("task-2");
    });

    /**
     * Test: Graceful handling of non-existent IDs.
     * 
     * Edge case: Attempting to delete a task that doesn't exist
     * should return the list unchanged rather than throwing error.
     */
    it("returns unchanged list if ID does not exist", () => {
      const result = deleteTask(sampleTasks, "non-existent-id");

      // Should still have both tasks
      expect(result).toHaveLength(2);
    });

    /**
     * Test: Immutability check for deleteTask.
     * 
     * Original array must remain unchanged after deletion operation.
     */
    it("does not mutate the original list", () => {
      const originalLength = sampleTasks.length;

      deleteTask(sampleTasks, "task-1");

      // Original list should be unchanged
      expect(sampleTasks).toHaveLength(originalLength);
    });
  });

  /**
   * Test suite for toggleTaskStatus function.
   * 
   * Tests the done/not done toggle functionality,
   * including timestamp updates and immutability.
   */
  describe("toggleTaskStatus", () => {
    /**
     * Test: Completing an incomplete task.
     * 
     * Verifies done flag changes to true and updatedAt timestamp is set.
     */
    it("marks an incomplete task as done", () => {
      // task-1 is currently not done
      const result = toggleTaskStatus(sampleTasks, "task-1");

      const toggledTask = result.find((t) => t.id === "task-1");
      expect(toggledTask.done).toBe(true);
      expect(toggledTask.updatedAt).toBeGreaterThan(0); // Should update timestamp
    });

    /**
     * Test: Uncompleting a completed task.
     * 
     * Toggle works both ways: done → not done, and also updates timestamp.
     */
    it("marks a completed task as not done", () => {
      // task-2 is currently done
      const result = toggleTaskStatus(sampleTasks, "task-2");

      const toggledTask = result.find((t) => t.id === "task-2");
      expect(toggledTask.done).toBe(false);
      expect(toggledTask.updatedAt).toBeGreaterThan(0);
    });

    /**
     * Test: Toggle operation is isolated to target task.
     * 
     * Other tasks in the list should remain completely unchanged.
     */
    it("does not affect other tasks in the list", () => {
      const result = toggleTaskStatus(sampleTasks, "task-1");

      // task-2 should remain unchanged
      const otherTask = result.find((t) => t.id === "task-2");
      expect(otherTask.done).toBe(true); // Still done
    });

    /**
     * Test: Toggle with non-existent ID is a no-op.
     * 
     * Edge case: Returns unchanged list when ID not found.
     */
    it("returns unchanged list if ID does not exist", () => {
      const result = toggleTaskStatus(sampleTasks, "non-existent");

      // Tasks should remain as they were
      expect(result[0].done).toBe(false);
      expect(result[1].done).toBe(true);
    });

    /**
     * Test: Immutability check for toggleTaskStatus.
     */
    it("does not mutate the original list", () => {
      toggleTaskStatus(sampleTasks, "task-1");

      // Original task-1 should still be not done
      expect(sampleTasks[0].done).toBe(false);
    });
  });

  /**
   * Test suite for updateTask function.
   * 
   * Tests partial updates to task properties. Unlike toggle which
   * only affects 'done', this allows updating any field(s).
   */
  describe("updateTask", () => {
    /**
     * Test: Update a single field (text).
     * 
     * Demonstrates partial update - only specified fields change.
     */
    it("updates task text", () => {
      const result = updateTask(sampleTasks, "task-1", {
        text: "Buy organic groceries",
      });

      const updated = result.find((t) => t.id === "task-1");
      expect(updated.text).toBe("Buy organic groceries");
    });

    /**
     * Test: Update multiple fields in one operation.
     * 
     * Verifies that the fields object can contain multiple properties
     * and all are applied to the target task.
     */
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

    /**
     * Test: Non-updated fields are preserved.
     * 
     * Important: When updating one field, all other fields
     * must remain exactly as they were.
     */
    it("preserves other task properties when updating", () => {
      const result = updateTask(sampleTasks, "task-1", { priority: "low" });

      const updated = result.find((t) => t.id === "task-1");
      // These should remain unchanged
      expect(updated.text).toBe("Buy groceries");
      expect(updated.done).toBe(false);
      expect(updated.createdAt).toBe(1700000000000);
    });

    /**
     * Test: Update is isolated to target task.
     * 
     * Other tasks must not be affected by the update operation.
     */
    it("does not affect other tasks", () => {
      const result = updateTask(sampleTasks, "task-1", { text: "Changed" });

      // task-2 should be unchanged
      const otherTask = result.find((t) => t.id === "task-2");
      expect(otherTask.text).toBe("Finish project");
    });

    /**
     * Test: Update with non-existent ID returns unchanged list.
     * 
     * Edge case: Graceful handling when task ID not found.
     */
    it("returns unchanged list if ID does not exist", () => {
      const result = updateTask(sampleTasks, "non-existent", { text: "Nope" });

      expect(result).toEqual(sampleTasks);
    });

    /**
     * Test: Immutability check for updateTask.
     */
    it("does not mutate the original list", () => {
      updateTask(sampleTasks, "task-1", { text: "Modified" });

      // Original should be unchanged
      expect(sampleTasks[0].text).toBe("Buy groceries");
    });
  });
});

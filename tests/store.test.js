/**
 * @fileoverview Test suite for localStorage persistence layer.
 * 
 * Tests all storage operations: tasks, filters, sort preferences, tags, and themes.
 * Includes error handling for corrupted data and quota exceeded scenarios.
 * 
 * @requires vitest
 * @requires jsdom - Provides localStorage mock
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
} from "../src/js/store.js";

/**
 * Test suite for localStorage operations.
 * 
 * Tests data persistence for tasks, UI state (filters, sorting),
 * and user preferences (theme). Ensures robust error handling.
 */
describe("store.js - LocalStorage Management", () => {
  /**
   * Setup: Clear localStorage before each test.
   * Essential for test isolation - prevents tests from affecting each other.
   */
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Cleanup: Clear localStorage after each test.
   * Double insurance for test isolation.
   */
  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Test suite for task persistence operations.
   * 
   * Tests serialization/deserialization of task objects to/from localStorage,
   * including complex nested data and error recovery.
   */
  describe("Tasks Storage", () => {
    /**
     * Test: Round-trip save and load tasks.
     * 
     * Verifies tasks can be saved to localStorage and loaded back
     * with all properties intact (JSON serialization round-trip).
     */
    it("saves and loads tasks from localStorage", () => {
      // ARRANGE: Create sample tasks
      const tasks = [
        {
          id: "1",
          text: "Test task",
          done: false,
          createdAt: Date.now(),
          dueDate: null,
          priority: null,
          tags: [],
        },
      ];

      // ACT: Save tasks
      saveTasks(tasks);

      // ASSERT: Can load them back
      const loaded = loadTasks();
      expect(loaded).toEqual(tasks);
    });

    /**
     * Test: Loading when no data exists returns empty array.
     * 
     * Default state: First-time users should get an empty array,
     * not null or undefined, to avoid type checking everywhere.
     */
    it("returns empty array when no tasks are stored", () => {
      const tasks = loadTasks();
      expect(tasks).toEqual([]);
      expect(Array.isArray(tasks)).toBe(true);
    });

    /**
     * Test: Graceful degradation with corrupted localStorage data.
     * 
     * If localStorage contains invalid JSON (corruption, manual edit),
     * the app should recover gracefully instead of crashing.
     * Returns empty array as fallback.
     */
    it("handles corrupted localStorage data gracefully", () => {
      // ARRANGE: Put invalid JSON in localStorage
      localStorage.setItem("listItems", "not-valid-json{");

      // ACT & ASSERT: Should return empty array instead of throwing
      const tasks = loadTasks();
      expect(tasks).toEqual([]);
    });

    /**
     * Test: Complex task objects with all optional fields.
     * 
     * Ensures serialization handles tasks with dueDate, priority,
     * tags array, and updatedAt timestamp - no data loss.
     */
    it("preserves all task properties when saving/loading", () => {
      const complexTask = [
        {
          id: "abc123",
          text: "Complex task",
          done: true,
          createdAt: 1700000000000,
          dueDate: "2025-12-31",
          priority: "high",
          tags: ["important", "work"],
          updatedAt: 1700000001000,
        },
      ];

      saveTasks(complexTask);
      const loaded = loadTasks();

      // All properties should be preserved
      expect(loaded[0]).toEqual(complexTask[0]);
    });
  });

  /**
   * Test suite for filter preference storage.
   * 
   * Filter state (all/active/done) needs to persist across sessions
   * so users return to their preferred view.
   */
  describe("Filter Storage", () => {
    /**
     * Test: All filter types can be saved and loaded.
     * 
     * Tests each valid filter value: "all", "active", "done".
     */
    it("saves and loads filter state", () => {
      // Test each filter type
      const filters = ["all", "active", "done"];

      filters.forEach((filter) => {
        saveFilter(filter);
        const loaded = loadFilter();
        expect(loaded).toBe(filter);
      });
    });

    /**
     * Test: Default state when no filter is saved.
     * 
     * Returns null so the app can use its own default logic.
     */
    it("returns null when no filter is stored", () => {
      const filter = loadFilter();
      expect(filter).toBeNull();
    });

    /**
     * Test: Robust handling of corrupted filter data.
     */
    it("handles corrupted filter data gracefully", () => {
      localStorage.setItem("listFilter", null);
      const filter = loadFilter();
      // Should handle gracefully (either null or default)
      expect(typeof filter === "string" || filter === null).toBe(true);
    });
  });

  /**
   * Test suite for sort preference storage.
   * 
   * Sort order (none/dueDate/priority) persists so users maintain
   * their preferred task organization across sessions.
   */
  describe("Sort Storage", () => {
    /**
     * Test: All sort options can be persisted.
     */
    it("saves and loads sort preference", () => {
      const sortOptions = ["none", "dueDate", "priority"];

      sortOptions.forEach((sort) => {
        saveSort(sort);
        const loaded = loadSort();
        expect(loaded).toBe(sort);
      });
    });

    /**
     * Test: Default state returns null.
     */
    it("returns null when no sort is stored", () => {
      const sort = loadSort();
      expect(sort).toBeNull();
    });
  });

  /**
   * Test suite for tag filter storage.
   * 
   * Tag filters are arrays of strings that need JSON serialization.
   * More complex than simple string storage.
   */
  describe("Tag Filter Storage", () => {
    /**
     * Test: Array of tags can be saved and loaded.
     */
    it("saves and loads tag filters", () => {
      const tags = ["work", "personal", "urgent"];

      saveTagFilter(tags);
      const loaded = loadTagFilter();

      expect(loaded).toEqual(tags);
    });

    /**
     * Test: No tags stored returns null.
     */
    it("returns null when no tag filter is stored", () => {
      const tags = loadTagFilter();
      expect(tags).toBeNull();
    });

    /**
     * Test: Empty array is valid (no tags selected).
     */
    it("handles empty tag array", () => {
      saveTagFilter([]);
      const loaded = loadTagFilter();
      expect(loaded).toEqual([]);
    });

    /**
     * Test: Invalid JSON in tagFilter key returns null.
     * 
     * Defensive: If localStorage is manually corrupted, don't crash.
     */
    it("handles corrupted tag filter data gracefully", () => {
      localStorage.setItem("tagFilter", "not-an-array");
      const tags = loadTagFilter();
      expect(tags).toBeNull(); // Should return null for invalid data
    });

    /**
     * Test: Type validation - rejects non-array data.
     * 
     * Even if JSON is valid, if it's not an array, return null.
     * Prevents type errors in the app.
     */
    it("rejects non-array data when loading", () => {
      // Store a non-array value
      localStorage.setItem("tagFilter", JSON.stringify("not-array"));
      const tags = loadTagFilter();
      expect(tags).toBeNull();
    });
  });

  /**
   * Test suite for theme preference storage.
   * 
   * UI theme (light/dark mode) persists across sessions.
   * Only accepts specific valid theme values for security.
   */
  describe("Theme Storage", () => {
    /**
     * Test: Light theme persistence.
     */
    it("saves and loads light theme", () => {
      saveTheme("theme-light");
      const loaded = loadTheme();
      expect(loaded).toBe("theme-light");
    });

    /**
     * Test: Dark theme persistence.
     */
    it("saves and loads dark theme", () => {
      saveTheme("theme-dark");
      const loaded = loadTheme();
      expect(loaded).toBe("theme-dark");
    });

    /**
     * Test: No theme stored returns null (use system default).
     */
    it("returns null when no theme is stored", () => {
      const theme = loadTheme();
      expect(theme).toBeNull();
    });

    /**
     * Test: Rejects invalid theme values (security).
     * 
     * If someone manually edits localStorage to add "theme-purple",
     * reject it and return null. Prevents CSS injection or errors.
     */
    it("rejects invalid theme values", () => {
      // Try to load an invalid theme
      localStorage.setItem("uiTheme", "theme-purple");
      const theme = loadTheme();
      expect(theme).toBeNull(); // Should reject invalid values
    });
  });

  /**
   * Test suite for error handling scenarios.
   * 
   * Tests edge cases: quota exceeded, corrupted data, and ensures
   * console.error is called for debugging without crashing the app.
   */
  describe("Error Handling", () => {
    /**
     * Test: Handles localStorage quota exceeded gracefully.
     * 
     * localStorage has size limits (~5-10MB). When exceeded,
     * save operations should fail gracefully without crashing.
     */
    it("handles localStorage quota exceeded errors", () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });

      // Should not throw when saving
      expect(() => saveTasks([{ id: "1", text: "Test" }])).not.toThrow();

      // Restore original
      localStorage.setItem = originalSetItem;
    });

    /**
     * Test: Errors are logged to console for debugging.
     * 
     * When load operations fail, console.error should be called
     * so developers can debug issues in production.
     */
    it("handles console.error being called on load failures", () => {
      // Spy on console.error
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Put invalid data in localStorage
      localStorage.setItem("listItems", "invalid-json");

      // Try to load
      loadTasks();

      // console.error should have been called
      expect(errorSpy).toHaveBeenCalled();

      // Cleanup
      errorSpy.mockRestore();
    });
  });
});

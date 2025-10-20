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

describe("store.js - LocalStorage Management", () => {
  beforeEach(() => {
    // Clear localStorage before each test for clean state
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Tasks Storage", () => {
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

    it("returns empty array when no tasks are stored", () => {
      const tasks = loadTasks();
      expect(tasks).toEqual([]);
      expect(Array.isArray(tasks)).toBe(true);
    });

    it("handles corrupted localStorage data gracefully", () => {
      // ARRANGE: Put invalid JSON in localStorage
      localStorage.setItem("listItems", "not-valid-json{");

      // ACT & ASSERT: Should return empty array instead of throwing
      const tasks = loadTasks();
      expect(tasks).toEqual([]);
    });

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

  describe("Filter Storage", () => {
    it("saves and loads filter state", () => {
      // Test each filter type
      const filters = ["all", "active", "done"];

      filters.forEach((filter) => {
        saveFilter(filter);
        const loaded = loadFilter();
        expect(loaded).toBe(filter);
      });
    });

    it("returns null when no filter is stored", () => {
      const filter = loadFilter();
      expect(filter).toBeNull();
    });

    it("handles corrupted filter data gracefully", () => {
      localStorage.setItem("listFilter", null);
      const filter = loadFilter();
      // Should handle gracefully (either null or default)
      expect(typeof filter === "string" || filter === null).toBe(true);
    });
  });

  describe("Sort Storage", () => {
    it("saves and loads sort preference", () => {
      const sortOptions = ["none", "dueDate", "priority"];

      sortOptions.forEach((sort) => {
        saveSort(sort);
        const loaded = loadSort();
        expect(loaded).toBe(sort);
      });
    });

    it("returns null when no sort is stored", () => {
      const sort = loadSort();
      expect(sort).toBeNull();
    });
  });

  describe("Tag Filter Storage", () => {
    it("saves and loads tag filters", () => {
      const tags = ["work", "personal", "urgent"];

      saveTagFilter(tags);
      const loaded = loadTagFilter();

      expect(loaded).toEqual(tags);
    });

    it("returns null when no tag filter is stored", () => {
      const tags = loadTagFilter();
      expect(tags).toBeNull();
    });

    it("handles empty tag array", () => {
      saveTagFilter([]);
      const loaded = loadTagFilter();
      expect(loaded).toEqual([]);
    });

    it("handles corrupted tag filter data gracefully", () => {
      localStorage.setItem("tagFilter", "not-an-array");
      const tags = loadTagFilter();
      expect(tags).toBeNull(); // Should return null for invalid data
    });

    it("rejects non-array data when loading", () => {
      // Store a non-array value
      localStorage.setItem("tagFilter", JSON.stringify("not-array"));
      const tags = loadTagFilter();
      expect(tags).toBeNull();
    });
  });

  describe("Theme Storage", () => {
    it("saves and loads light theme", () => {
      saveTheme("theme-light");
      const loaded = loadTheme();
      expect(loaded).toBe("theme-light");
    });

    it("saves and loads dark theme", () => {
      saveTheme("theme-dark");
      const loaded = loadTheme();
      expect(loaded).toBe("theme-dark");
    });

    it("returns null when no theme is stored", () => {
      const theme = loadTheme();
      expect(theme).toBeNull();
    });

    it("rejects invalid theme values", () => {
      // Try to load an invalid theme
      localStorage.setItem("uiTheme", "theme-purple");
      const theme = loadTheme();
      expect(theme).toBeNull(); // Should reject invalid values
    });
  });

  describe("Error Handling", () => {
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

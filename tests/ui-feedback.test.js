/**
 * @fileoverview Test suite for UI feedback components (toasts and inline validation).
 * 
 * Tests the toast notification system and inline form validation feedback,
 * including DOM manipulation, timer handling, and event interactions.
 * 
 * @requires vitest
 * @requires jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createToastManager,
  createInlineFeedback,
} from "../src/js/ui-feedback.js";

/**
 * Test suite for the toast notification manager.
 * Covers rendering, lifecycle, variants, actions, and edge cases.
 */
describe("createToastManager", () => {
  /**
   * Setup before each test: enable fake timers and reset DOM.
   * Fake timers allow us to control setTimeout/setInterval behavior.
   */
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  /**
   * Cleanup after each test: restore real timers.
   */
  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Test: Toast element is created and becomes visible after animation frame.
   * 
   * Verifies:
   * - Toast element is added to DOM
   * - Correct variant CSS class is applied
   * - Visibility class is added on next animation frame
   */
  it("renders a toast and applies the visible class on the next frame", async () => {
    const layer = document.createElement("div");
    document.body.appendChild(layer);
    const { showToast } = createToastManager(layer);

    showToast({ message: "Saved!", variant: "success", duration: 0 });

    const toast = layer.querySelector(".toast");
    expect(toast).toBeTruthy();
    expect(toast?.classList.contains("toast--success")).toBe(true);

    // Flush the requestAnimationFrame shim
    vi.runOnlyPendingTimers();
    expect(toast?.classList.contains("is-visible")).toBe(true);
  });

  /**
   * Test: Toast action button calls handler and dismisses toast.
   * 
   * Verifies:
   * - Action button is rendered with correct label
   * - Handler function is called when button is clicked
   * - Toast is removed from DOM after dismiss
   * - Dismiss function can be called multiple times safely
   */
  it("invokes the action handler and dismisses the toast", () => {
    const layer = document.createElement("div");
    document.body.appendChild(layer);
    const { showToast } = createToastManager(layer);
    const actionSpy = vi.fn();

    const dismiss = showToast({
      message: "Task deleted",
      variant: "info",
      duration: 0,
      action: {
        label: "Undo",
        handler: actionSpy,
      },
    });

    const toast = layer.querySelector(".toast");
    expect(toast).toBeTruthy();

    const button = toast?.querySelector("button");
    button?.dispatchEvent(new Event("click"));

    expect(actionSpy).toHaveBeenCalledTimes(1);

    toast?.dispatchEvent(new Event("transitionend"));
    vi.runAllTimers();

    expect(layer.querySelector(".toast")).toBeNull();

    // Subsequent dismiss calls should be no-ops
    expect(() => dismiss()).not.toThrow();
  });

  /**
   * Test: Toast automatically dismisses after specified duration.
   * 
   * Uses fake timers to simulate time passage without actual waiting.
   * 
   * Verifies:
   * - Toast exists initially
   * - After duration, dismiss animation is triggered
   * - Toast is removed from DOM after transition
   */
  it("auto-dismisses toast after the specified duration", () => {
    // ARRANGE: Create layer and manager
    const layer = document.createElement("div");
    document.body.appendChild(layer);
    const { showToast } = createToastManager(layer);

    // ACT: Show toast with 3 second duration
    showToast({ message: "Auto-hide me", duration: 3000 });

    const toast = layer.querySelector(".toast");

    // ASSERT: Toast exists initially
    expect(toast).toBeTruthy();

    // Fast-forward time by 3 seconds
    vi.advanceTimersByTime(3000);

    // Simulate the CSS transition ending
    toast?.dispatchEvent(new Event("transitionend"));
    vi.runAllTimers();

    // ASSERT: Toast should be removed from DOM
    expect(layer.querySelector(".toast")).toBeNull();
  });

  /**
   * Test: All toast variants (info, success, error) render with correct CSS classes.
   * 
   * Ensures visual variants are properly applied for different notification types.
   */
  it("renders toasts with different variants", () => {
    const layer = document.createElement("div");
    document.body.appendChild(layer);
    const { showToast } = createToastManager(layer);

    // Test info variant
    showToast({ message: "Info message", variant: "info", duration: 0 });
    expect(layer.querySelector(".toast--info")).toBeTruthy();
    layer.innerHTML = "";

    // Test success variant
    showToast({ message: "Success!", variant: "success", duration: 0 });
    expect(layer.querySelector(".toast--success")).toBeTruthy();
    layer.innerHTML = "";

    // Test error variant
    showToast({ message: "Error!", variant: "error", duration: 0 });
    expect(layer.querySelector(".toast--error")).toBeTruthy();
  });

  /**
   * Test: Toast manager gracefully handles invalid layer element.
   * 
   * Edge case: Ensures the manager doesn't crash when passed null/invalid element.
   * Returns no-op functions that can be called safely without errors.
   */
  it("returns a no-op function when layer is not an HTMLElement", () => {
    // Pass null instead of an element
    const { showToast } = createToastManager(null);

    // Should not throw and should return a function
    const dismiss = showToast({ message: "Test" });
    expect(typeof dismiss).toBe("function");
    expect(() => dismiss()).not.toThrow();
  });

  /**
   * Test: Manual dismiss cancels auto-dismiss timer.
   * 
   * Verifies that calling the dismiss function immediately removes the toast
   * and prevents the auto-dismiss timer from firing later.
   */
  it("allows manual dismissal before auto-dismiss timer fires", () => {
    const layer = document.createElement("div");
    document.body.appendChild(layer);
    const { showToast } = createToastManager(layer);

    // Show toast with 5 second auto-dismiss
    const dismiss = showToast({ message: "Manual dismiss", duration: 5000 });

    expect(layer.querySelector(".toast")).toBeTruthy();

    // Manually dismiss after 1 second
    vi.advanceTimersByTime(1000);
    dismiss();

    // Trigger transition end
    layer.querySelector(".toast")?.dispatchEvent(new Event("transitionend"));
    vi.runAllTimers();

    // Toast should be gone (didn't wait for full 5 seconds)
    expect(layer.querySelector(".toast")).toBeNull();
  });

  /**
   * Test: Toast renders without action button when no action is provided.
   * 
   * Ensures the action button is optional and doesn't render when not needed.
   */
  it("renders toast without action button when action is not provided", () => {
    const layer = document.createElement("div");
    document.body.appendChild(layer);
    const { showToast } = createToastManager(layer);

    showToast({ message: "No action", duration: 0 });

    const toast = layer.querySelector(".toast");
    const button = toast?.querySelector("button");

    expect(toast).toBeTruthy();
    expect(button).toBeNull(); // No button should exist
  });
});

/**
 * Test suite for inline validation feedback.
 * 
 * Tests form input validation messages and error state styling
 * for different container types (input-text, todo-list edit).
 */
describe("createInlineFeedback", () => {
  /**
   * Setup: Reset DOM before each test for clean state.
   */
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("shows and clears validation feedback for input-text containers", () => {
    const wrapper = document.createElement("div");
    wrapper.className = "input-text";
    const input = document.createElement("input");
    input.className = "input-text__input";
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    const feedback = createInlineFeedback();

    feedback.show(input, "Required");

    const messageElm = wrapper.querySelector(".input-text__feedback");
    expect(wrapper.classList.contains("input-text--error")).toBe(true);
    expect(messageElm?.textContent).toBe("Required");
    expect(input.getAttribute("aria-invalid")).toBe("true");

    feedback.clear(input);

    expect(wrapper.classList.contains("input-text--error")).toBe(false);
    expect(messageElm?.textContent).toBe("");
    expect(messageElm?.hidden).toBe(true);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  /**
   * Test: Feedback system handles unknown container types gracefully.
   * 
   * Edge case: When input is not inside a recognized container,
   * show/clear operations should not throw errors.
   */
  it("falls back gracefully when container metadata is missing", () => {
    const wrapper = document.createElement("div");
    const input = document.createElement("input");
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    const feedback = createInlineFeedback();

    // Should not throw even though container classes are unknown
    expect(() => feedback.show(input, "Oops")).not.toThrow();
    expect(() => feedback.clear(input)).not.toThrow();
  });

  /**
   * Test: Feedback works with todo-list edit wrapper containers.
   * 
   * Verifies the feedback system supports the inline editing UI pattern
   * used in the todo list, with different CSS classes than standard inputs.
   */
  it("shows and clears validation feedback for todo-list__editWrap containers", () => {
    // ARRANGE: Create the edit wrapper structure
    const wrapper = document.createElement("div");
    wrapper.className = "todo-list__editWrap";
    const input = document.createElement("input");
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    const feedback = createInlineFeedback();

    // ACT: Show error
    feedback.show(input, "Cannot be empty");

    // ASSERT: Error state is applied
    const messageElm = wrapper.querySelector(".todo-list__editFeedback");
    expect(wrapper.classList.contains("is-invalid")).toBe(true);
    expect(messageElm?.textContent).toBe("Cannot be empty");
    expect(input.getAttribute("aria-invalid")).toBe("true");

    // ACT: Clear error
    feedback.clear(input);

    // ASSERT: Error state is removed
    expect(wrapper.classList.contains("is-invalid")).toBe(false);
    expect(messageElm?.hidden).toBe(true);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  /**
   * Test: Multiple errors reuse the same feedback element.
   * 
   * Performance optimization: Instead of creating new elements,
   * the feedback system updates the existing message element.
   */
  it("reuses existing feedback element when showing multiple errors", () => {
    const wrapper = document.createElement("div");
    wrapper.className = "input-text";
    const input = document.createElement("input");
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    const feedback = createInlineFeedback();

    // Show first error
    feedback.show(input, "First error");
    const firstMessage = wrapper.querySelector(".input-text__feedback");
    expect(firstMessage?.textContent).toBe("First error");

    // Show second error (should reuse same element)
    feedback.show(input, "Second error");
    const secondMessage = wrapper.querySelector(".input-text__feedback");

    // Should be the same element, just updated content
    expect(secondMessage).toBe(firstMessage);
    expect(secondMessage?.textContent).toBe("Second error");
  });
});

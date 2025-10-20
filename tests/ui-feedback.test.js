import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createToastManager,
  createInlineFeedback,
} from "../src/js/ui-feedback.js";

describe("createToastManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  // NEW TEST: Auto-dismiss functionality
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

  // NEW TEST: Multiple toast variants
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

  // NEW TEST: Handle invalid layer element
  it("returns a no-op function when layer is not an HTMLElement", () => {
    // Pass null instead of an element
    const { showToast } = createToastManager(null);

    // Should not throw and should return a function
    const dismiss = showToast({ message: "Test" });
    expect(typeof dismiss).toBe("function");
    expect(() => dismiss()).not.toThrow();
  });

  // NEW TEST: Manual dismiss before auto-dismiss
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

  // NEW TEST: Toast without action button
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

describe("createInlineFeedback", () => {
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

  // NEW TEST: Test with todo-list edit wrap container
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

  // NEW TEST: Reusing existing feedback element
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

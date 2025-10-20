/**
 * @fileoverview UI feedback components for user interactions.
 *
 * Provides toast notifications and inline form validation feedback.
 * These components enhance UX by giving immediate visual feedback
 * for user actions and form errors.
 *
 * @module ui-feedback
 */

/**
 * Create a toast manager that renders lightweight notifications inside the provided layer.
 *
 * @param {HTMLElement | null} layerElm Toast container element.
 * @returns {{showToast: (config: {message: string, variant?: "info" | "success" | "error", duration?: number, action?: {label: string, handler: () => void}}) => () => void}} Toast API.
 */
export const createToastManager = (layerElm) => {
  if (!(layerElm instanceof HTMLElement)) {
    return {
      showToast: () => () => {},
    };
  }

  const TOAST_VISIBLE_CLASS = "is-visible";
  const EXIT_ANIMATION_MS = 180;

  /**
   * Render and display a toast notification.
   *
   * @param {Object} config Toast configuration.
   * @param {string} config.message Message to display.
   * @param {"info" | "success" | "error"} [config.variant="info"] Visual variant.
   * @param {number} [config.duration=4000] Auto-dismiss timeout in milliseconds. Use 0 to disable.
   * @param {{label: string, handler: () => void}} [config.action] Optional action button.
   * @returns {() => void} Function that dismisses the toast early.
   */
  const showToast = ({
    message,
    variant = "info",
    duration = 4000,
    action,
  }) => {
    const toastElm = document.createElement("div");
    toastElm.className = `toast toast--${variant}`;
    toastElm.setAttribute("role", "status");

    const messageElm = document.createElement("span");
    messageElm.className = "toast__message";
    messageElm.textContent = message;
    toastElm.appendChild(messageElm);

    let autoHideId = null; // Reference to the scheduled auto-dismiss timeout
    let isHiding = false; // Prevent duplicate dismiss logic while animation runs

    const cleanup = () => {
      toastElm.remove();
    };

    /**
     * Trigger the exit animation and remove the toast from the DOM.
     *
     * @returns {void}
     */
    const dismiss = () => {
      if (isHiding || !toastElm.isConnected) return;
      isHiding = true;
      if (autoHideId !== null) window.clearTimeout(autoHideId);
      toastElm.classList.remove(TOAST_VISIBLE_CLASS);
      const handleTransitionEnd = () => {
        toastElm.removeEventListener("transitionend", handleTransitionEnd);
        cleanup();
      };
      toastElm.addEventListener("transitionend", handleTransitionEnd);
      window.setTimeout(handleTransitionEnd, EXIT_ANIMATION_MS + 120);
    };

    if (
      action &&
      typeof action.label === "string" &&
      typeof action.handler === "function"
    ) {
      const actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.className = "toast__action";
      actionButton.textContent = action.label;
      actionButton.addEventListener("click", () => {
        action.handler();
        dismiss();
      });
      toastElm.appendChild(actionButton);
    }

    layerElm.appendChild(toastElm);
    requestAnimationFrame(() => {
      toastElm.classList.add(TOAST_VISIBLE_CLASS);
    });

    if (typeof duration === "number" && duration > 0) {
      autoHideId = window.setTimeout(() => {
        dismiss();
      }, duration);
    }

    return dismiss;
  };

  return { showToast };
};

/**
 * Factory that exposes helpers to show and clear inline validation feedback.
 *
 * @returns {{show: (input: HTMLInputElement, message: string) => void, clear: (input: HTMLInputElement) => void}}
 */
export const createInlineFeedback = () => {
  /**
   * Resolve the container element that should host the feedback message.
   *
   * @param {HTMLElement} inputElm
   * @returns {HTMLElement | null}
   */
  const findContainer = (inputElm) => {
    return (
      inputElm.closest(".input-text") ??
      inputElm.closest(".todo-list__editWrap")
    );
  };

  /**
   * Map supported containers to their feedback/flag classes.
   *
   * @param {HTMLElement} container
   * @returns {{feedbackClass: string, errorClass: string} | null}
   */
  const getContainerMeta = (container) => {
    if (!container) return null;
    if (container.classList.contains("input-text")) {
      return {
        feedbackClass: "input-text__feedback",
        errorClass: "input-text--error",
      };
    }
    if (container.classList.contains("todo-list__editWrap")) {
      return {
        feedbackClass: "todo-list__editFeedback",
        errorClass: "is-invalid",
      };
    }
    return null;
  };

  /**
   * Present an inline validation message next to the given input element.
   *
   * @param {HTMLInputElement} inputElm
   * @param {string} message
   * @returns {void}
   */
  const show = (inputElm, message) => {
    const container = findContainer(inputElm);
    const meta = getContainerMeta(container);
    if (!container || !meta) return;

    let feedbackElm = container.querySelector(`.${meta.feedbackClass}`);
    if (!feedbackElm) {
      feedbackElm = document.createElement("p");
      feedbackElm.className = `${meta.feedbackClass} form-feedback form-feedback--error`;
      container.appendChild(feedbackElm);
    }
    feedbackElm.textContent = message;
    feedbackElm.hidden = false;

    container.classList.add(meta.errorClass);
    inputElm.setAttribute("aria-invalid", "true");
  };

  /**
   * Remove inline validation styling and hide the helper message.
   *
   * @param {HTMLInputElement} inputElm
   * @returns {void}
   */
  const clear = (inputElm) => {
    const container = findContainer(inputElm);
    const meta = getContainerMeta(container);
    if (!container || !meta) return;

    container.classList.remove(meta.errorClass);
    inputElm.removeAttribute("aria-invalid");
    const feedbackElm = container.querySelector(`.${meta.feedbackClass}`);
    if (feedbackElm) {
      feedbackElm.textContent = "";
      feedbackElm.hidden = true;
    }
  };

  return { show, clear };
};

class MetricCard extends HTMLElement {
  static get observedAttributes() {
    return ["label", "value", "helper"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <article class="metric-card">
        <span class="metric-card__label"></span>
        <span class="metric-card__value"></span>
        <span class="metric-card__helper"></span>
        <style>
          .metric-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            padding: var(--gap-sm) var(--gap-md);
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: var(--shadow-soft);
          }
          .metric-card__label {
            font-size: 0.85rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .metric-card__value {
            font-size: 1.6rem;
            font-weight: 600;
            color: var(--color-text);
          }
          .metric-card__helper {
            font-size: 0.85rem;
            color: var(--color-text-muted);
          }
        </style>
      </article>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.shadowRoot) return;
    if (name === "label") {
      this.shadowRoot.querySelector(".metric-card__label").textContent =
        newValue || "";
    }
    if (name === "value") {
      this.shadowRoot.querySelector(".metric-card__value").textContent =
        newValue || "";
    }
    if (name === "helper") {
      this.shadowRoot.querySelector(".metric-card__helper").textContent =
        newValue || "";
    }
  }

  connectedCallback() {
    // 初期値反映
    this.attributeChangedCallback("label", null, this.getAttribute("label"));
    this.attributeChangedCallback("value", null, this.getAttribute("value"));
    this.attributeChangedCallback("helper", null, this.getAttribute("helper"));
  }
}

customElements.define("metric-card", MetricCard);

# Quick Test Writing Reference

## 🚀 Quick Start Template

```javascript
import { describe, it, expect, beforeEach } from "vitest";
import { yourFunction } from "../src/js/your-file.js";

describe("YourFeature", () => {
  beforeEach(() => {
    // Setup before each test
  });

  it("does something specific", () => {
    // ARRANGE: Set up test data
    const input = "test";

    // ACT: Call the function
    const result = yourFunction(input);

    // ASSERT: Check the result
    expect(result).toBe("expected");
  });
});
```

## 📋 Common Assertions Cheat Sheet

```javascript
// Equality
expect(value).toBe(5); // Exact match (===)
expect(object).toEqual({ a: 1 }); // Deep equality
expect(value).not.toBe(10); // Negation

// Truthiness
expect(value).toBeTruthy(); // Is truthy
expect(value).toBeFalsy(); // Is falsy
expect(value).toBeDefined(); // Not undefined
expect(value).toBeUndefined(); // Is undefined
expect(value).toBeNull(); // Is null

// Numbers
expect(value).toBeGreaterThan(3); // > 3
expect(value).toBeGreaterThanOrEqual(3); // >= 3
expect(value).toBeLessThan(10); // < 10
expect(value).toBeCloseTo(0.3); // For floating point

// Strings
expect(string).toContain("sub"); // Contains substring
expect(string).toMatch(/regex/); // Matches regex
expect(string).toHaveLength(5); // Length is 5

// Arrays
expect(array).toContain(item); // Includes item
expect(array).toHaveLength(3); // Length is 3
expect(array).toEqual([1, 2, 3]); // Deep equality

// Objects
expect(obj).toHaveProperty("key"); // Has property
expect(obj).toMatchObject({ a: 1 }); // Contains properties

// Functions
expect(fn).toThrow(); // Throws error
expect(fn).toThrow("Error message"); // Specific error
expect(() => fn()).not.toThrow(); // Doesn't throw
```

## 🎭 Testing with Spies

```javascript
import { vi } from "vitest";

// Create a spy
const callback = vi.fn();

// Use it
callback("arg1", "arg2");

// Check it was called
expect(callback).toHaveBeenCalled();
expect(callback).toHaveBeenCalledTimes(1);
expect(callback).toHaveBeenCalledWith("arg1", "arg2");

// Check return value
callback.mockReturnValue(42);
expect(callback()).toBe(42);

// Spy on existing function
const spy = vi.spyOn(console, "log");
console.log("test");
expect(spy).toHaveBeenCalledWith("test");
spy.mockRestore(); // Clean up
```

## ⏰ Testing with Timers

```javascript
import { vi } from "vitest";

beforeEach(() => {
  vi.useFakeTimers(); // Enable fake timers
});

afterEach(() => {
  vi.useRealTimers(); // Restore real timers
});

it("works with setTimeout", () => {
  const callback = vi.fn();

  setTimeout(callback, 1000);

  // Fast-forward time
  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});

it("works with setInterval", () => {
  const callback = vi.fn();

  setInterval(callback, 100);

  // Run all pending timers
  vi.runAllTimers();

  expect(callback).toHaveBeenCalled();
});
```

## 🌐 Testing DOM

```javascript
beforeEach(() => {
  document.body.innerHTML = ""; // Clean slate
});

it("manipulates DOM", () => {
  // Create elements
  const div = document.createElement("div");
  div.className = "test-class";
  div.textContent = "Hello";
  document.body.appendChild(div);

  // Query elements
  const element = document.querySelector(".test-class");

  // Assert
  expect(element).toBeTruthy();
  expect(element.textContent).toBe("Hello");
  expect(element.classList.contains("test-class")).toBe(true);
});

it("handles events", () => {
  const button = document.createElement("button");
  const handler = vi.fn();

  button.addEventListener("click", handler);
  button.dispatchEvent(new Event("click"));

  expect(handler).toHaveBeenCalledTimes(1);
});
```

## 🎯 Testing Async Code

```javascript
it("works with promises", async () => {
  const result = await fetchData();
  expect(result).toBe("data");
});

it("works with callbacks", (done) => {
  fetchData((result) => {
    expect(result).toBe("data");
    done(); // Signal test completion
  });
});

it("handles errors", async () => {
  await expect(failingFunction()).rejects.toThrow("Error");
});
```

## 📦 Testing Modules

```javascript
// Test imports
import { function1, function2 } from "./module.js";

describe("Module", () => {
  it("exports function1", () => {
    expect(typeof function1).toBe("function");
  });

  it("function1 works correctly", () => {
    expect(function1("input")).toBe("output");
  });
});
```

## 🎨 Test Organization

```javascript
describe("ParentFeature", () => {
  // Setup for all tests in this block
  beforeEach(() => {});

  describe("Subfeature 1", () => {
    it("test case 1", () => {});
    it("test case 2", () => {});
  });

  describe("Subfeature 2", () => {
    it("test case 3", () => {});
    it("test case 4", () => {});
  });
});
```

## 💡 Testing Tips

### Good Test Names

- ✅ "adds a new task to the list"
- ✅ "shows error when input is empty"
- ✅ "removes completed tasks"
- ❌ "test 1"
- ❌ "it works"

### What to Test

- ✅ Public API / exported functions
- ✅ User interactions
- ✅ Edge cases (null, empty, invalid)
- ✅ Error handling
- ❌ Implementation details
- ❌ Third-party code

### Test Independence

```javascript
// ❌ BAD - Tests depend on each other
let sharedState;
it("test 1", () => {
  sharedState = "value";
});
it("test 2", () => {
  expect(sharedState).toBe("value");
});

// ✅ GOOD - Each test is independent
it("test 1", () => {
  const state = "value";
  expect(state).toBe("value");
});
```

## 🏃 Practice Exercise

Try writing a test for this function:

```javascript
// calculator.js
export function add(a, b) {
  return a + b;
}

export function divide(a, b) {
  if (b === 0) throw new Error("Cannot divide by zero");
  return a / b;
}
```

Your test should cover:

1. Normal addition
2. Normal division
3. Division by zero (error case)

<details>
<summary>See Solution</summary>

```javascript
import { describe, it, expect } from "vitest";
import { add, divide } from "./calculator.js";

describe("Calculator", () => {
  describe("add", () => {
    it("adds two positive numbers", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("adds negative numbers", () => {
      expect(add(-2, -3)).toBe(-5);
    });
  });

  describe("divide", () => {
    it("divides two numbers", () => {
      expect(divide(10, 2)).toBe(5);
    });

    it("throws error when dividing by zero", () => {
      expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
    });
  });
});
```

</details>

---

**Remember**: The best way to learn testing is by writing tests! Start small and build up. 🚀

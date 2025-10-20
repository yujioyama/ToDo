# Testing Guide for Your Todo App

## 📊 Test Coverage

Your app now has **51 automated tests** covering:
- ✅ **11 tests** for UI feedback (toasts & validation)
- ✅ **20 tests** for business logic (model.js)
- ✅ **20 tests** for data persistence (store.js)

## 🏃 Running Tests

```bash
# Run tests in watch mode (auto-reruns on file changes)
npm test

# Run tests once and exit
npm test -- --run

# Run tests with coverage report
npm test -- --coverage
```

## 📝 Test Structure Explained

### The AAA Pattern
Every test follows this pattern:

```javascript
it("describes what the test does", () => {
  // 1. ARRANGE - Set up test data
  const layer = document.createElement("div");
  
  // 2. ACT - Do the thing you're testing
  showToast({ message: "Hello" });
  
  // 3. ASSERT - Check if it worked
  expect(layer.querySelector(".toast")).toBeTruthy();
});
```

### Common Test Patterns

#### Testing Functions
```javascript
it("adds two numbers", () => {
  const result = add(2, 3);
  expect(result).toBe(5);
});
```

#### Testing DOM Manipulation
```javascript
it("creates a button", () => {
  const button = document.createElement("button");
  button.textContent = "Click me";
  
  expect(button.textContent).toBe("Click me");
});
```

#### Testing Callbacks with Spies
```javascript
it("calls the callback", () => {
  const callback = vi.fn(); // Create spy
  
  button.addEventListener("click", callback);
  button.click();
  
  expect(callback).toHaveBeenCalledTimes(1);
});
```

#### Testing Timers
```javascript
it("delays execution", () => {
  vi.useFakeTimers(); // Control time
  
  setTimeout(() => doSomething(), 1000);
  
  vi.advanceTimersByTime(1000); // Fast-forward
  
  expect(doSomething).toHaveBeenCalled();
  vi.useRealTimers(); // Cleanup
});
```

## 🎯 What Makes Good Tests?

### ✅ DO:
- **Test behavior, not implementation** - Test what users see/experience
- **Use descriptive test names** - "it renders a toast with success variant"
- **Test edge cases** - null values, empty arrays, invalid input
- **Keep tests isolated** - Each test should be independent
- **Test one thing at a time** - Don't combine multiple assertions unnecessarily

### ❌ DON'T:
- Test internal/private functions directly
- Write brittle tests that break on small changes
- Skip error handling tests
- Have tests that depend on other tests running first
- Test framework code (e.g., don't test that createElement works)

## 📚 Key Vitest Features Used

### Assertions
```javascript
expect(value).toBe(5)              // Strict equality (===)
expect(value).toEqual({a: 1})      // Deep equality for objects/arrays
expect(value).toBeTruthy()         // Value is truthy
expect(value).toBeNull()           // Value is null
expect(fn).toThrow()               // Function throws error
expect(array).toHaveLength(3)      // Array has length
expect(spy).toHaveBeenCalled()     // Spy was invoked
```

### Test Hooks
```javascript
beforeEach(() => {
  // Runs before each test in the describe block
  // Use for setup: creating DOM elements, clearing data
});

afterEach(() => {
  // Runs after each test
  // Use for cleanup: removing elements, clearing timers
});
```

### Mocking & Spies
```javascript
const spy = vi.fn();              // Create mock function
vi.useFakeTimers();               // Mock timers (setTimeout, etc)
vi.spyOn(console, 'error');       // Spy on existing functions
```

## 🎨 For Your Portfolio

Add this section to your README.md:

```markdown
## Testing

This project includes comprehensive automated tests to ensure reliability.

- **Test Framework**: Vitest with JSDOM
- **Coverage**: 51 tests covering UI, business logic, and data persistence
- **Run Tests**: `npm test`

### Test Categories
- UI Feedback (toasts, validation messages)
- Task Management (CRUD operations)
- Data Persistence (localStorage handling)
```

## 💡 Next Steps for Learning

1. **Write tests first (TDD)**:
   - Write a failing test
   - Write code to make it pass
   - Refactor

2. **Add tests for new features**:
   - Before fixing a bug, write a test that reproduces it
   - Then fix the bug and ensure the test passes

3. **Explore coverage**:
   - Run `npm test -- --coverage`
   - Aim for 80%+ coverage on critical code

4. **Learn integration tests**:
   - Test multiple modules working together
   - Test full user workflows (add task → complete → delete)

## 🔗 Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## 💼 Why This Matters for Freelancing

Clients on Upwork/Fiverr value developers who:
- ✅ Write maintainable, tested code
- ✅ Catch bugs before deployment
- ✅ Can confidently make changes without breaking things
- ✅ Demonstrate professional development practices

**Having tests in your portfolio sets you apart from 90% of other applicants!**

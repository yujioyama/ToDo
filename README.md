# ToDo App

A modern, feature-rich todo application built with vanilla JavaScript.

## Features

- ✅ Create, edit, and delete tasks
- 🎨 Clean, responsive UI
- 💾 Automatic localStorage persistence
- 🏷️ Tag support for organization
- 📅 Due dates and priorities
- 🎭 Light/dark theme support
- ✨ Toast notifications
- ✅ Form validation

## Testing

This project includes comprehensive automated tests using **Vitest**.

- **Test Framework**: Vitest with JSDOM
- **Coverage**: 51 tests across 3 test suites
- **Categories**:
  - UI Feedback (toasts, validation) - 11 tests
  - Task Management (business logic) - 20 tests
  - Data Persistence (localStorage) - 20 tests

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run with coverage report
npm test -- --coverage
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing documentation.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Framework**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite
- **Styles**: SCSS
- **Testing**: Vitest + JSDOM
- **Storage**: LocalStorage API

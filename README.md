# ToDo App

A modern, feature-rich todo application built with vanilla JavaScript, showcasing clean architecture, comprehensive testing, and professional development practices.

## 🚀 Live Demo

**[View Live Demo](https://yujioyama.github.io/ToDo/)** 

Try it now! Test all features including dark/light themes, task management, and filtering.

## ✨ Features

- ✅ **Full CRUD Operations** - Create, edit, delete, and toggle tasks
- 🎨 **Modern UI/UX** - Clean, responsive design with smooth animations
- 🌓 **Dark/Light Themes** - Toggle between themes with proper contrast
- 💾 **Persistent Storage** - Automatic localStorage with error handling
- 🏷️ **Task Organization** - Tags, priorities, and due dates
- 🔍 **Advanced Filtering** - Filter by status, search text, and tags
- ✅ **Form Validation** - Real-time validation with helpful error messages
- ✨ **Toast Notifications** - User feedback for all actions
- 📱 **Responsive Design** - Works seamlessly on all devices
- ♿ **Accessibility** - Proper ARIA labels and keyboard navigation

## 🧪 Testing

This project includes **comprehensive automated tests** using Vitest:

- **51 tests** across 3 test suites
- **100% core logic coverage**
- **Error handling** and edge case testing
- **DOM interaction** testing with JSDOM

### Test Categories:
- **UI Feedback** (11 tests) - Toast notifications, form validation
- **Business Logic** (20 tests) - Task CRUD operations, data transformations  
- **Data Persistence** (20 tests) - localStorage operations, error recovery

```bash
npm test              # Run in watch mode
npm run test:run      # Run once
npm run test:coverage # With coverage report
```

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: SCSS with CSS custom properties
- **Build Tool**: Vite (fast HMR, optimized builds)
- **Testing**: Vitest + JSDOM
- **Storage**: LocalStorage API
- **Architecture**: Modular, separation of concerns

## 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/todo-app.git
cd todo-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── js/
│   ├── app.js          # Main application orchestration
│   ├── model.js        # Business logic & data models
│   ├── store.js        # localStorage persistence layer
│   └── ui-feedback.js  # Toast notifications & validation
├── css/
│   ├── style.scss      # Main stylesheet
│   └── _*.scss         # Component-specific styles
└── index.html

tests/
├── model.test.js       # Business logic tests
├── store.test.js       # Storage layer tests
└── ui-feedback.test.js # UI component tests
```

## 🏗️ Architecture Highlights

- **Separation of Concerns**: Clear boundaries between UI, business logic, and data persistence
- **Pure Functions**: Immutable data transformations for predictable behavior
- **Error Handling**: Graceful degradation with user-friendly error messages
- **Performance**: Efficient DOM updates and minimal re-renders
- **Maintainability**: Well-documented code with comprehensive JSDoc annotations

## 📚 Documentation

- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing documentation
- [JSDoc Documentation](./JSDOC_DOCUMENTATION.md) - Code documentation overview
- [Test Cheatsheet](./TEST_CHEATSHEET.md) - Quick testing reference

## 🎯 Professional Features

This project demonstrates:
- **Test-Driven Development** practices
- **Clean Code** principles and patterns
- **Responsive Design** with accessibility considerations
- **Error Handling** and user experience focus
- **Modern JavaScript** features and best practices
- **Build Optimization** and deployment readiness

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

*Built with ❤️ using modern web technologies*

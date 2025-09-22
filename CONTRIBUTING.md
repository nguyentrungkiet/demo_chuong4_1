# Contributing to IoT Web Dashboard

Thank you for your interest in contributing to the IoT Web Dashboard project! This document provides guidelines for contributing to this educational project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

This project follows a simple code of conduct:
- Be respectful and constructive
- Help create a welcoming environment for learning
- Focus on educational value and code quality
- Share knowledge and learn from others

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Arduino IDE (for ESP32 development)
- Basic knowledge of React, TypeScript, and IoT concepts

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/demo_chuong4_1.git
   cd demo_chuong4_1
   ```

2. **Install Dependencies**
   ```bash
   npm run install-all
   ```

3. **Setup Environment**
   ```bash
   # Copy environment templates
   cp app/.env.example app/.env
   cp server/.env.example server/.env
   cp firmware/secrets.h.template firmware/secrets.h
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🛠️ Making Changes

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Coding Standards

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

#### React Components
- Use functional components with hooks
- Follow the existing component structure
- Implement proper prop types with TypeScript interfaces
- Use custom hooks for complex logic

#### Arduino/C++
- Follow Arduino IDE formatting standards
- Use clear variable names and comments
- Implement proper error handling
- Document hardware connections in comments

### Code Quality Checklist
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Documentation updated if needed

## 🧪 Testing Guidelines

### Frontend Testing
```bash
# Run all tests
npm run test:app

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Requirements
- Write tests for new components and hooks
- Maintain test coverage above 80%
- Test both happy path and error scenarios
- Use descriptive test names

### Hardware Testing
- Test with real ESP32 devices when possible
- Verify MQTT communication works correctly
- Test LED control functionality
- Document any hardware-specific issues

## 📚 Documentation

### What to Document
- New features and their usage
- API changes and additions
- Hardware setup modifications
- Configuration options
- Known issues and workarounds

### Documentation Standards
- Use clear, concise language
- Include code examples where helpful
- Update README files for significant changes
- Add inline comments for complex logic

## 📝 Pull Request Process

### Before Submitting
1. **Test Your Changes**
   ```bash
   npm test
   npm run type-check
   npm run lint
   npm run build
   ```

2. **Update Documentation**
   - Update README.md if needed
   - Add/modify comments in code
   - Update API documentation

3. **Check Compatibility**
   - Test with different Node.js versions
   - Verify ESP32 compatibility
   - Test in different browsers

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Hardware testing (if applicable)

## Screenshots (if applicable)

## Additional Notes
```

### Review Process
1. Code review by maintainer
2. Automated tests must pass
3. Documentation review
4. Final approval and merge

## 🐛 Issue Reporting

### Bug Reports
Include the following information:
- **Environment**: OS, Node.js version, browser
- **Steps to Reproduce**: Clear step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Error Messages**: Full error messages and stack traces

### Feature Requests
- Describe the feature clearly
- Explain the use case and benefits
- Consider educational value
- Suggest implementation approach

### Hardware Issues
- Specify ESP32 model and version
- Include wiring diagrams or photos
- Provide serial monitor output
- List component specifications

## 🎓 Educational Focus

This project serves as an educational resource for:
- IoT development with ESP32
- React and TypeScript web development
- Real-time communication protocols (MQTT, WebSocket)
- Full-stack application architecture

When contributing, please consider:
- **Learning Value**: Does this help students understand concepts better?
- **Code Clarity**: Is the code easy to understand and learn from?
- **Documentation**: Are explanations clear for beginners?
- **Best Practices**: Does this demonstrate good development practices?

## 📞 Getting Help

- **Issues**: Create a GitHub issue for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Check existing README files
- **Contact**: Reach out to the project maintainer

## 🏆 Recognition

Contributors will be recognized in:
- Project README acknowledgments section
- GitHub contributors list
- Release notes for significant contributions

---

**Project Maintainer:** Nguyễn Trung Kiệt - TDMU
**Course:** IoT & Web Development
**Institution:** Thủ Dầu Một University

Thank you for contributing to this educational project! 🚀
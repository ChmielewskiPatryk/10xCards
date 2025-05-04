# Testing Guide

This project uses a comprehensive testing approach with both unit tests (Vitest) and E2E tests (Playwright).

## Unit Testing with Vitest

Unit tests are written using Vitest and React Testing Library for component testing.

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Unit Testing Guidelines

1. **Use test doubles appropriately**
   - `vi.fn()` for function mocks
   - `vi.spyOn()` to monitor existing functions
   - `vi.mock()` with factory patterns for module-level mocking

2. **Group related tests** with descriptive `describe` blocks

3. **Follow the Arrange-Act-Assert pattern** for clear test structure

4. **Use inline snapshots** for readable assertions:
   ```typescript
   expect(value).toMatchInlineSnapshot();
   ```

5. **Reset mocks between tests** using `beforeEach(() => { vi.resetAllMocks() })`

## E2E Testing with Playwright

End-to-end tests are written using Playwright and follow the Page Object Model pattern.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui

# Run with step-by-step debugging
npm run test:e2e:debug

# Generate tests with codegen
npm run test:e2e:codegen
```

### E2E Testing Guidelines

1. **Use Page Object Model** for maintainable tests
   - Create page classes in `e2e/pages/` folder
   - Encapsulate page elements and actions

2. **Use locators** for resilient element selection:
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   ```

3. **Use browser contexts** for isolating test environments

4. **Use visual comparison** for UI testing:
   ```typescript
   await expect(page).toHaveScreenshot('mypage.png');
   ```

5. **Use trace viewer** for debugging test failures:
   ```typescript
   test.use({ trace: 'on' });
   ``` 
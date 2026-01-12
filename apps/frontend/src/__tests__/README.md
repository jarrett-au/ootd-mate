# Frontend Tests - Profile Management

## Overview
This directory contains comprehensive unit tests for the Profile Management feature components and API client.

## Test Structure
```
src/__tests__/
├── lib/api/
│   └── profile.test.ts           # API client tests
└── components/profile/
    ├── ProfileForm.test.tsx      # ProfileForm component tests
    └── StylePreferences.test.tsx # StylePreferences component tests
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test profile.test.ts
npm test ProfileForm.test.tsx
npm test StylePreferences.test.tsx
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="Profile API Client"
npm test -- --testNamePattern="ProfileForm Component"
```

## Test Summary

### Total Tests: 98

#### 1. Profile API Client (18 tests)
**File:** `lib/api/profile.test.ts`

- Constants validation (4 tests)
- getProfile() function (4 tests)
- updateProfile() function (7 tests)
- TypeScript types (3 tests)

#### 2. ProfileForm Component (36 tests)
**File:** `components/profile/ProfileForm.test.tsx`

- Rendering (5 tests)
- Height input (9 tests)
- Weight input (10 tests)
- Form state (4 tests)
- Input behavior (4 tests)
- Accessibility (4 tests)

#### 3. StylePreferences Component (44 tests)
**File:** `components/profile/StylePreferences.test.tsx`

- Rendering (4 tests)
- Primary style selection (5 tests)
- Secondary style selection (7 tests)
- Occasion selection (9 tests)
- Style interaction (4 tests)
- Form state (3 tests)
- Validation (4 tests)
- User interactions (2 tests)
- Available styles (2 tests)

## Coverage

Estimated coverage: **85%+**

Covered:
- All API client functions
- All component render paths
- All user interactions
- Input validation logic
- Error states
- Edge cases

## Test Features

### 1. Mocking
- `fetch` API is mocked for API tests
- Component props are controlled
- User interactions are simulated

### 2. Test Isolation
- Each test has fresh mocks
- Props are reset between tests
- No shared state

### 3. Comprehensive Coverage
- Happy paths
- Error cases
- Boundary conditions
- Edge cases
- Accessibility

## Test Dependencies

Required packages (add to package.json):
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

## Setup Instructions

1. Install dependencies:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

2. Add Jest configuration to `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx'
  ],
};
```

3. Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom';
```

## Running Tests Example

```bash
# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode during development
npm test -- --watch
```

## Notes

- Tests use React Testing Library
- Fetch is mocked for API tests
- Tests follow AAA pattern (Arrange, Act, Assert)
- Each test focuses on a single behavior
- Test names are descriptive and clear

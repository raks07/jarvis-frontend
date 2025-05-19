# jarvis-frontend Testing Strategy

This document outlines the testing strategy for the Jarvis Frontend application (<https://github.com/raks07/jarvis-frontend>).

## Testing Framework and Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: For rendering and testing React components
- **User Event**: For simulating user interactions
- **Jest DOM**: For DOM-related assertions

## Test Structure

The tests are organized to mirror the application structure:

```
src/
├── __tests__/
│   ├── components/    # Tests for common components
│   ├── features/      # Tests for feature-specific components
│   │   ├── auth/
│   │   ├── qa/
│   │   ├── users/
│   ├── utils/         # Test utilities and helper functions
```

## Testing Approach

### 1. Unit Tests for Components

Each component should have tests that verify:

- **Rendering**: The component renders correctly with different props
- **Interaction**: User interactions (clicks, inputs, etc.) work as expected
- **State Management**: Component state is updated correctly
- **Conditional Rendering**: Different UI elements are shown/hidden based on props

### 2. Testing Redux Logic

For components connected to Redux:

- Mock the Redux store with preloaded state
- Test that actions are dispatched correctly
- Test that components respond to state changes

### 3. Testing Forms

For forms:

- Test validation logic
- Test form submission
- Test error handling and display

### 4. Testing API Integration

For API integration:

- Mock API responses using Jest mocks
- Test loading states
- Test error handling
- Test successful data fetching and display

### 5. Integration Testing

Test how components work together:

- Test navigation flows
- Test data passing between components
- Test complex user interactions across multiple components

## Best Practices

1. **Focus on behavior, not implementation**: Test what the component does, not how it's implemented

2. **Use data-testid attributes**: For elements that are difficult to select with other queries

3. **Test from the user's perspective**: Prefer queries that reflect how users interact with your application (getByRole, getByText, etc.)

4. **Don't test library code**: Focus on testing your own code, not the behavior of libraries

5. **Keep tests isolated**: Each test should be independent and not affected by other tests

6. **Use the right query methods**:
   - `getBy*`: When the element is expected to be in the document
   - `queryBy*`: When the element might not be in the document
   - `findBy*`: When the element might appear asynchronously

7. **Test accessibility**: Ensure your components are accessible

## Test Coverage Goals

Aim for the following test coverage metrics:

- **Lines**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Statements**: 70%

## Running Tests

Tests can be run using the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- path/to/your/test.js

# Using the test script
./run-tests.sh
```

## Example Test

Here's an example of a component test:

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/common/Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

## Testing Complex Components

For complex components:

1. Break down the component into smaller, testable parts
2. Test each part in isolation
3. Write integration tests for the composed component

## Mock Functions and Services

Use Jest's mocking capabilities to mock:

- API calls
- Complex external dependencies
- Browser APIs (localStorage, fetch, etc.)

Example:

```jsx
// Mock API service
jest.mock('@/services/api', () => ({
  getUsers: jest.fn(),
}));

// Use in test
import { getUsers } from '@/services/api';
getUsers.mockResolvedValue([{ id: 1, name: 'User' }]);
```

## Continuous Integration

Tests should be run as part of the CI/CD pipeline to ensure code quality before deployment.

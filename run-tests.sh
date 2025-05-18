#!/bin/bash

# Script to run unit tests for the React frontend

echo "Running unit tests for React frontend..."

# Check for node_modules
if [ ! -d "node_modules" ]; then
  echo "Error: node_modules directory not found. Please run 'npm install' first."
  exit 1
fi

# Define test patterns to focus on
FOCUS_TESTS=(
  "components/Alert"
  "components/ErrorCard"
  "components/LoadingCard"
  "components/PageHeader"
  "store/slices/authSlice"
  "features/auth/components/LoginForm"
  "features/auth/LoginPage"
  "utils/auth"
)

# Join the patterns with OR (|)
PATTERN=$(IFS=\|; echo "${FOCUS_TESTS[*]}")

# Run Jest tests with pattern
echo "Running focused tests..."
npm test -- --testPathPattern="$PATTERN" "$@"

# Check if the tests passed
if [ $? -eq 0 ]; then
  echo "✅ All focused tests passed successfully!"
  
  # Run all tests if requested
  if [ "$1" == "--all" ]; then
    echo "Running all tests..."
    npm test
    
    if [ $? -eq 0 ]; then
      echo "✅ All tests passed successfully!"
    else
      echo "❌ Some tests failed. Please check the test report above."
      exit 1
    fi
  else
    echo "To run all tests, use: ./run-tests.sh --all"
  fi
else
  echo "❌ Some focused tests failed. Please check the test report above."
  exit 1
fi

exit 0

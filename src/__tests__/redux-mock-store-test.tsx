import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

// Simple test component
const TestComponent = () => {
  return <div>Test Component</div>;
};

describe("Redux Mock Store Test", () => {
  it("should render with redux store", () => {
    // Create mock store
    const mockStore = configureStore([]);
    const store = mockStore({});

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    expect(screen.getByText("Test Component")).toBeInTheDocument();
  });
});

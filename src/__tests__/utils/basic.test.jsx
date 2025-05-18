import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component
const Greeting = ({ name }) => {
  return <div>Hello, {name}!</div>;
};

describe('Basic Test Suite', () => {
  it('renders a greeting', () => {
    render(<Greeting name="World" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
  
  it('passes a simple test', () => {
    expect(true).toBe(true);
  });
});

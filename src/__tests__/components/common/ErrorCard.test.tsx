import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorCard from '@/components/common/ErrorCard';

describe('ErrorCard Component', () => {
  it('renders with default props', () => {
    render(<ErrorCard />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('An error occurred while processing your request.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });
  
  it('renders with custom title and message', () => {
    const title = 'Custom Error';
    const message = 'This is a custom error message';
    
    render(<ErrorCard title={title} message={message} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('renders retry button when onRetry prop is provided', () => {
    const onRetry = jest.fn();
    
    render(<ErrorCard onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  
  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorCard />);
    
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });
});

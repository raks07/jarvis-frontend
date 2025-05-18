import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorCard from '@/components/common/ErrorCard';

describe('ErrorCard Component', () => {
  const mockOnRetry = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with default title and message', () => {
    render(<ErrorCard />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('An error occurred while processing your request.')).toBeInTheDocument();
  });
  
  it('renders with custom title and message', () => {
    const title = 'Custom Error Title';
    const message = 'Custom error message';
    
    render(<ErrorCard title={title} message={message} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('displays retry button when onRetry prop is provided', () => {
    render(<ErrorCard onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });
  
  it('does not display retry button when onRetry prop is not provided', () => {
    render(<ErrorCard />);
    
    const retryButton = screen.queryByRole('button', { name: /retry/i });
    expect(retryButton).not.toBeInTheDocument();
  });
  
  it('calls onRetry when retry button is clicked', () => {
    render(<ErrorCard onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
  
  it('renders error icon', () => {
    render(<ErrorCard />);
    
    // Check for SVG icon presence
    const iconElement = document.querySelector('svg');
    expect(iconElement).toBeInTheDocument();
  });
  
  it('renders inside a Paper component', () => {
    const { container } = render(<ErrorCard />);
    
    // Check for Paper component (MUI Paper has role="region")
    const paperElement = container.querySelector('.MuiPaper-root');
    expect(paperElement).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '@/components/common/Alert';

describe('Alert Component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with message and title', () => {
    const message = 'Test alert message';
    const title = 'Test Title';
    
    render(
      <Alert 
        open={true} 
        message={message} 
        title={title} 
        severity="success" 
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
  });
  
  it('renders with message only', () => {
    const message = 'Test alert message';
    
    render(
      <Alert 
        open={true} 
        message={message} 
        severity="error" 
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('calls onClose when close button is clicked', () => {
    const message = 'Test alert message';
    
    render(
      <Alert 
        open={true} 
        message={message} 
        onClose={mockOnClose}
      />
    );
    
    // Find the close button and click it
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('renders nothing when open is false', () => {
    const message = 'Test alert message';
    
    const { container } = render(
      <Alert 
        open={false} 
        message={message} 
        onClose={mockOnClose}
      />
    );
    
    // We can't use getByText here since the element won't be in the document
    // So we check if the container is mostly empty (just contains the wrapper Box)
    expect(container.firstChild?.childNodes.length).toBe(0);
  });
  
  it('renders with different severity levels', () => {
    const message = 'Test alert message';
    
    const { rerender } = render(
      <Alert 
        open={true} 
        message={message} 
        severity="error" 
        onClose={mockOnClose}
      />
    );
    
    // Get the alert element and check its classes
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledError');
    
    // Rerender with warning severity
    rerender(
      <Alert 
        open={true} 
        message={message} 
        severity="warning" 
        onClose={mockOnClose}
      />
    );
    
    expect(alert).toHaveClass('MuiAlert-filledWarning');
    
    // Rerender with success severity
    rerender(
      <Alert 
        open={true} 
        message={message} 
        severity="success" 
        onClose={mockOnClose}
      />
    );
    
    expect(alert).toHaveClass('MuiAlert-filledSuccess');
    
    // Rerender with info severity
    rerender(
      <Alert 
        open={true} 
        message={message} 
        severity="info" 
        onClose={mockOnClose}
      />
    );
    
    expect(alert).toHaveClass('MuiAlert-filledInfo');
  });
});

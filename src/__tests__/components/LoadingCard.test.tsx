import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingCard from '@/components/common/LoadingCard';

describe('LoadingCard Component', () => {
  it('renders with default title and message', () => {
    render(<LoadingCard />);
    
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we load the data...')).toBeInTheDocument();
  });
  
  it('renders with custom title and message', () => {
    const title = 'Custom Loading Title';
    const message = 'Custom loading message';
    
    render(<LoadingCard title={title} message={message} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('renders a circular progress indicator', () => {
    render(<LoadingCard />);
    
    // Check for circular progress indicator
    const progressElement = document.querySelector('.MuiCircularProgress-root');
    expect(progressElement).toBeInTheDocument();
  });
  
  it('renders inside a Paper component', () => {
    const { container } = render(<LoadingCard />);
    
    // Check for Paper component
    const paperElement = container.querySelector('.MuiPaper-root');
    expect(paperElement).toBeInTheDocument();
  });
  
  it('has proper layout styles', () => {
    const { container } = render(<LoadingCard />);
    
    const paperElement = container.querySelector('.MuiPaper-root');
    
    // Check for flex display
    expect(paperElement).toHaveStyle({
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      'justify-content': 'center',
      'text-align': 'center',
    });
  });
});

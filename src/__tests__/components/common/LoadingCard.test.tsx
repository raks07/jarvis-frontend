import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingCard from '@/components/common/LoadingCard';

describe('LoadingCard Component', () => {
  it('renders with default props', () => {
    render(<LoadingCard />);
    
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we load the data...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  it('renders with custom title and message', () => {
    const title = 'Custom Loading';
    const message = 'This is a custom loading message';
    
    render(<LoadingCard title={title} message={message} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

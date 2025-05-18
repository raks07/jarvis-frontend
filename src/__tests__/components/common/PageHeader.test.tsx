import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/common/PageHeader';
import { Home } from '@mui/icons-material';
import { Button } from '@mui/material';

describe('PageHeader Component', () => {
  it('renders with just a title', () => {
    render(<PageHeader title="Test Title" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument(); // No info button or action
  });
  
  it('renders with title and subtitle', () => {
    render(<PageHeader title="Test Title" subtitle="Test Subtitle" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });
  
  it('renders with icon', () => {
    render(<PageHeader title="Test Title" icon={<Home data-testid="home-icon" />} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });
  
  it('renders with action button', () => {
    render(
      <PageHeader 
        title="Test Title" 
        action={<Button>Action Button</Button>} 
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });
  
  it('renders with info text tooltip', () => {
    render(<PageHeader title="Test Title" infoText="Info tooltip text" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    
    // Info icon button should be present
    const infoButton = screen.getByRole('button');
    expect(infoButton).toBeInTheDocument();
    
    // Check tooltip contents (would require userEvent testing for hover)
    expect(infoButton).toHaveAttribute('aria-label', expect.stringContaining('Info tooltip text'));
  });
  
  it('renders with all props', () => {
    render(
      <PageHeader 
        title="Test Title" 
        subtitle="Test Subtitle"
        icon={<Home data-testid="home-icon" />}
        action={<Button>Action Button</Button>}
        infoText="Info tooltip text"
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-label', expect.stringContaining('Info tooltip text'));
  });
});

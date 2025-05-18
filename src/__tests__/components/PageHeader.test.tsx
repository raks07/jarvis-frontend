import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/common/PageHeader';
import { Home as HomeIcon } from '@mui/icons-material';
import { Button } from '@mui/material';

describe('PageHeader Component', () => {
  it('renders with title', () => {
    const title = 'Page Title';
    render(<PageHeader title={title} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
  });
  
  it('renders with subtitle when provided', () => {
    const title = 'Page Title';
    const subtitle = 'Page subtitle';
    
    render(<PageHeader title={title} subtitle={subtitle} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });
  
  it('renders with icon when provided', () => {
    const title = 'Page Title';
    
    render(<PageHeader title={title} icon={<HomeIcon data-testid="home-icon" />} />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });
  
  it('renders with action button when provided', () => {
    const title = 'Page Title';
    const actionButtonText = 'Action Button';
    
    render(
      <PageHeader 
        title={title} 
        action={<Button data-testid="action-button">{actionButtonText}</Button>} 
      />
    );
    
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    expect(screen.getByText(actionButtonText)).toBeInTheDocument();
  });
  
  it('renders with info icon when infoText is provided', () => {
    const title = 'Page Title';
    const infoText = 'Information text';
    
    render(<PageHeader title={title} infoText={infoText} />);
    
    // Check for info icon
    const infoIcon = document.querySelector('svg[data-testid="InfoIcon"]');
    expect(infoIcon).toBeInTheDocument();
  });
  
  it('does not render info icon when infoText is not provided', () => {
    const title = 'Page Title';
    
    render(<PageHeader title={title} />);
    
    // Check that info icon is not rendered
    const infoIcon = document.querySelector('svg[data-testid="InfoIcon"]');
    expect(infoIcon).not.toBeInTheDocument();
  });
  
  it('renders inside a Paper component', () => {
    const title = 'Page Title';
    
    const { container } = render(<PageHeader title={title} />);
    
    // Check for Paper component
    const paperElement = container.querySelector('.MuiPaper-root');
    expect(paperElement).toBeInTheDocument();
  });
  
  it('has proper grid layout', () => {
    const title = 'Page Title';
    
    const { container } = render(<PageHeader title={title} />);
    
    // Check for grid container
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });
});

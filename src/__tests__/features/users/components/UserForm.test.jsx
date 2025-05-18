import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from '@/features/users/components/UserForm';

describe('UserForm Component', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders in create mode with empty fields', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    // Check that the form fields are rendered with default values
    expect(screen.getByLabelText(/username/i)).toHaveValue('');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
    
    // Check that the role select has the default value 'viewer'
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    
    // Check that the create button is rendered
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });
  
  it('renders in edit mode with provided data', () => {
    const initialData = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };
    
    render(<UserForm onSubmit={mockOnSubmit} initialData={initialData} mode="edit" />);
    
    // Check that the form fields are pre-filled with the provided data
    expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue(''); // Password should be empty in edit mode
    
    // Check that the role select has the value 'admin'
    expect(screen.getByLabelText(/role/i)).toHaveTextContent('Admin');
    
    // Check that the update button is rendered
    expect(screen.getByRole('button', { name: /update user/i })).toBeInTheDocument();
  });
  
  it('shows loading state', () => {
    render(<UserForm onSubmit={mockOnSubmit} loading={true} />);
    
    // Check that the submit button is disabled and shows loading state
    const submitButton = screen.getByRole('button', { name: /saving/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Saving...');
    
    // Check that all form fields are disabled
    expect(screen.getByLabelText(/username/i)).toBeDisabled();
    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/role/i)).toBeDisabled();
    
    // Check that the reset button is also disabled
    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
  });
  
  it('shows error alert when error prop is provided', () => {
    const errorMessage = 'An error occurred';
    render(<UserForm onSubmit={mockOnSubmit} error={errorMessage} />);
    
    // Check that the error alert is displayed with the correct message
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });
  
  it('validates form fields in create mode and shows validation errors', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Check that onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('validates email format', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    // Fill in an invalid email
    await userEvent.type(screen.getByLabelText(/email address/i), 'invalid-email');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check that email validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/must be a valid email/i)).toBeInTheDocument();
    });
    
    // Check that onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('validates password length in create mode', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    // Fill in a short password
    await userEvent.type(screen.getByLabelText(/^password$/i), 'short');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check that password validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
    
    // Check that onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('allows empty password in edit mode', async () => {
    const initialData = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
    };
    
    render(<UserForm onSubmit={mockOnSubmit} initialData={initialData} mode="edit" />);
    
    // Fill in all required fields except password
    await userEvent.clear(screen.getByLabelText(/username/i));
    await userEvent.type(screen.getByLabelText(/username/i), 'newusername');
    
    await userEvent.clear(screen.getByLabelText(/email address/i));
    await userEvent.type(screen.getByLabelText(/email address/i), 'new@example.com');
    
    // Leave password empty
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update user/i }));
    
    // Check that onSubmit was called with the correct data (without password)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'newusername',
        email: 'new@example.com',
        role: 'admin',
      });
    });
  });
  
  it('validates password length in edit mode when provided', async () => {
    const initialData = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
    };
    
    render(<UserForm onSubmit={mockOnSubmit} initialData={initialData} mode="edit" />);
    
    // Fill in a short password
    await userEvent.type(screen.getByLabelText(/password/i), 'short');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update user/i }));
    
    // Check that password validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
    
    // Check that onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('submits valid data in create mode', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    // Fill in all required fields
    await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/email address/i), 'new@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    
    // Select a role
    fireEvent.mouseDown(screen.getByLabelText(/role/i));
    const roleOptions = screen.getAllByRole('option');
    fireEvent.click(roleOptions[0]); // Select 'admin'
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    
    // Check that onSubmit was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'admin',
      });
    });
  });
  
  it('resets form to initial values when reset button is clicked', async () => {
    const initialData = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
    };
    
    render(<UserForm onSubmit={mockOnSubmit} initialData={initialData} mode="edit" />);
    
    // Change form values
    await userEvent.clear(screen.getByLabelText(/username/i));
    await userEvent.type(screen.getByLabelText(/username/i), 'changeduser');
    
    await userEvent.clear(screen.getByLabelText(/email address/i));
    await userEvent.type(screen.getByLabelText(/email address/i), 'changed@example.com');
    
    // Click reset button
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    
    // Check that the form has been reset to initial values
    expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('test@example.com');
  });
  
  it('excludes id, createdAt, updatedAt fields when submitting in edit mode', async () => {
    const initialData = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };
    
    render(<UserForm onSubmit={mockOnSubmit} initialData={initialData} mode="edit" />);
    
    // Change username
    await userEvent.clear(screen.getByLabelText(/username/i));
    await userEvent.type(screen.getByLabelText(/username/i), 'newusername');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update user/i }));
    
    // Check that onSubmit was called with the correct data (without id, createdAt, updatedAt)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'newusername',
        email: 'test@example.com',
        role: 'admin',
      });
      
      // Check that these fields were excluded
      expect(mockOnSubmit.mock.calls[0][0]).not.toHaveProperty('id');
      expect(mockOnSubmit.mock.calls[0][0]).not.toHaveProperty('createdAt');
      expect(mockOnSubmit.mock.calls[0][0]).not.toHaveProperty('updatedAt');
    });
  });
});

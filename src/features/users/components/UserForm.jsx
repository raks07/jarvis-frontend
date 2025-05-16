import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Must be a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  role: yup.string().required('Role is required'),
});

const UserForm = ({ onSubmit, initialData, loading, error }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      username: '',
      email: '',
      password: '',
      role: 'viewer',
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Edit User' : 'Create New User'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              autoComplete="username"
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={loading}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              type="password"
              autoComplete={initialData ? 'new-password' : 'current-password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
            />
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.role}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                {...field}
                labelId="role-label"
                id="role"
                label="Role"
                disabled={loading}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error">
                  {errors.role.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            onClick={() => reset()}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Saving...' : initialData ? 'Update User' : 'Create User'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserForm;

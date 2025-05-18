import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, FormHelperText } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// Define schemas for different modes
const createSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Must be a valid email").required("Email is required"),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
  role: yup.string().required("Role is required"),
});

const editSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Must be a valid email").required("Email is required"),
  password: yup.string().optional().nullable().transform(value => value === "" ? null : value)
    .test("password", "Password must be at least 8 characters", value => {
      if (!value) return true; // Skip validation if empty (not being updated)
      return value.length >= 8;
    }),
  role: yup.string().required("Role is required"),
});

const UserForm = ({ onSubmit, initialData, loading, error, mode = "create" }) => {
  const schema = mode === "create" ? createSchema : editSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData 
      ? { ...initialData, password: "" } // Clear password when editing
      : {
          username: "",
          email: "",
          password: "",
          role: "viewer",
        },
  });

  // Handle form submit with clean data
  const handleFormSubmit = (data) => {
    const cleanData = { ...data };
    
    // If editing and password is empty, remove it from the data
    if (mode === "edit" && !cleanData.password) {
      delete cleanData.password;
    }
    
    onSubmit(cleanData);
  };

  return (
    <Box>
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
              required={mode === "create"} 
              fullWidth 
              id="password" 
              label={mode === "create" ? "Password" : "Password (leave empty to keep current)"}
              type="password" 
              autoComplete={mode === "create" ? "new-password" : "off"} 
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
                <FormHelperText error>{errors.role.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
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
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              mode === "create" ? "Create User" : "Update User"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UserForm;

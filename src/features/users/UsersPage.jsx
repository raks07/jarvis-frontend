import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, People as PeopleIcon } from "@mui/icons-material";

import PageHeader from "@/components/common/PageHeader";
import UserForm from "./components/UserForm";
import LoadingCard from "@/components/common/LoadingCard";
import ErrorCard from "@/components/common/ErrorCard";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would be replaced with actual API call
      // const response = await usersService.getUsers();

      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock users data
      const mockUsers = [
        {
          id: "1",
          username: "admin",
          email: "admin@example.com",
          role: "admin",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          username: "editor",
          email: "editor@example.com",
          role: "editor",
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          username: "viewer",
          email: "viewer@example.com",
          role: "viewer",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setUsers(mockUsers);
    } catch (err) {
      setError("Failed to fetch users: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setSelectedUser(null);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateUser = async (userData) => {
    setFormLoading(true);
    setFormError(null);

    try {
      // This would be replaced with actual API call
      // const response = await usersService.createUser(userData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create mock user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
      };

      setUsers([...users, newUser]);
      handleCloseDialog();
    } catch (err) {
      setFormError("Failed to create user: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    setFormLoading(true);
    setFormError(null);

    try {
      // This would be replaced with actual API call
      // const response = await usersService.updateUser(selectedUser.id, userData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user in local state
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, ...userData } : user)));

      handleCloseDialog();
    } catch (err) {
      setFormError("Failed to update user: " + (err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      // This would be replaced with actual API call
      // await usersService.deleteUser(userId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError("Failed to delete user: " + (err.message || "Unknown error"));
    }
  };

  const getRoleChipColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "editor":
        return "primary";
      case "viewer":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box p={3}>
        <PageHeader title="Users" subtitle="Manage system users" icon={<PeopleIcon />} />
        <LoadingCard title="Loading Users" message="Please wait while we load the users..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <PageHeader title="Users" subtitle="Manage system users" icon={<PeopleIcon />} />
        <ErrorCard title="Error" message={error} onRetry={fetchUsers} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <PageHeader
        title="Users"
        subtitle="Manage system users and permissions"
        icon={<PeopleIcon />}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
            Add User
          </Button>
        }
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} color={getRoleChipColor(user.role)} size="small" />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit" color="primary" onClick={() => handleOpenEditDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" color="error" onClick={() => handleDeleteUser(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle>{dialogMode === "create" ? "Create New User" : "Edit User"}</DialogTitle>
        <DialogContent>
          <UserForm onSubmit={dialogMode === "create" ? handleCreateUser : handleUpdateUser} initialData={selectedUser} loading={formLoading} error={formError} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;

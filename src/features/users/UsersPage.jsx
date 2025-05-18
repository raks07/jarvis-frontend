import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  IconButton, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  useTheme, 
  useMediaQuery, 
  Alert, 
  Snackbar,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  People as PeopleIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

import PageHeader from "@/components/common/PageHeader";
import UserForm from "./components/UserForm";
import LoadingCard from "@/components/common/LoadingCard";
import ErrorCard from "@/components/common/ErrorCard";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/users.service";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users: " + (err.response?.data?.message || err.message || "Unknown error"));
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
    // Wait for the dialog animation to complete before resetting form state
    setTimeout(() => {
      setFormError(null);
      setSelectedUser(null);
    }, 300);
  };

  const handleCreateUser = async (userData) => {
    setFormLoading(true);
    setFormError(null);

    try {
      const response = await createUser(userData);

      // Update users list with newly created user
      setUsers([...users, response.data]);
      handleCloseDialog();

      // Show success notification
      setNotification({
        open: true,
        message: "User created successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error creating user:", err);
      setFormError("Failed to create user: " + (err.response?.data?.message || err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    setFormLoading(true);
    setFormError(null);

    try {
      const response = await updateUser(selectedUser.id, userData);

      // Update user in local state
      setUsers(users.map((user) => (user.id === selectedUser.id ? response.data : user)));
      handleCloseDialog();

      // Show success notification
      setNotification({
        open: true,
        message: "User updated successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating user:", err);
      setFormError("Failed to update user: " + (err.response?.data?.message || err.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(userId);

      // Update local state
      setUsers(users.filter((user) => user.id !== userId));

      // Show success notification
      setNotification({
        open: true,
        message: "User deleted successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      setNotification({
        open: true,
        message: "Failed to delete user: " + (err.response?.data?.message || err.message || "Unknown error"),
        type: "error",
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
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

  // Empty display for when no users are found
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, users.length - page * rowsPerPage);
  
  return (
    <Box p={3}>
      <PageHeader
        title="Users"
        subtitle="Manage system users and permissions"
        icon={<PeopleIcon />}
        action={
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh users">
              <IconButton color="primary" onClick={fetchUsers}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
              Add User
            </Button>
          </Box>
        }
      />

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" py={4}>
                      No users found. Click "Add User" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                          color={getRoleChipColor(user.role)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{formatDate(user.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit user">
                          <IconButton aria-label="edit" color="primary" onClick={() => handleOpenEditDialog(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton aria-label="delete" color="error" onClick={() => handleDeleteUser(user.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}

              {/* Add empty rows to maintain height consistency */}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {users.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>

      {/* User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth 
        fullScreen={fullScreen}
      >
        <DialogTitle>
          {dialogMode === "create" ? "Create New User" : "Edit User"}
        </DialogTitle>
        <DialogContent dividers>
          <UserForm 
            onSubmit={dialogMode === "create" ? handleCreateUser : handleUpdateUser}
            initialData={selectedUser}
            loading={formLoading}
            error={formError}
            mode={dialogMode}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit" disabled={formLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })} 
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;

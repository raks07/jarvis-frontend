import React from "react";
import { Typography, Paper, Button } from "@mui/material";
import { Error as ErrorIcon } from "@mui/icons-material";

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ title = "Error", message = "An error occurred while processing your request.", onRetry }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: 200,
      }}>
      <ErrorIcon color="error" sx={{ fontSize: 50, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" color="primary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Paper>
  );
};

export default ErrorCard;

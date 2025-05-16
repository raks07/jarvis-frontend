import React from "react";
import { Typography, Paper, CircularProgress } from "@mui/material";

interface LoadingCardProps {
  title?: string;
  message?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ title = "Loading", message = "Please wait while we load the data..." }) => {
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
      <CircularProgress size={50} sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
    </Paper>
  );
};

export default LoadingCard;

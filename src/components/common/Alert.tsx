import React from "react";
import { Alert as MuiAlert, AlertProps as MuiAlertProps, AlertTitle, Snackbar, Box } from "@mui/material";

interface AlertProps extends MuiAlertProps {
  title?: string;
  message: string;
  open: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
  position?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
}

const Alert: React.FC<AlertProps> = ({ title, message, open, onClose, autoHideDuration = 6000, position = { vertical: "top", horizontal: "center" }, severity = "info", ...rest }) => {
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box>
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{
          vertical: position.vertical,
          horizontal: position.horizontal,
        }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleClose} severity={severity} sx={{ width: "100%" }} {...rest}>
          {title && <AlertTitle>{title}</AlertTitle>}
          {message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Alert;

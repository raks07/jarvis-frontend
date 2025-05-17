import React from "react";
import { Card, CardContent, Typography, CardActions, Button, Chip, Stack, Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { Description as DescriptionIcon, Download as DownloadIcon, Delete as DeleteIcon, Edit as EditIcon, MoreVert as MoreVertIcon, Science as ScienceIcon } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

const DocumentCard = ({ document, onDelete, onEdit, onDownload, onIngest, userRole }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(document.id);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(document.id);
  };

  const handleIngest = () => {
    handleMenuClose();
    onIngest(document.id);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType.includes("pdf")) {
      return <DescriptionIcon color="error" />;
    } else if (fileType.includes("word") || fileType.includes("docx")) {
      return <DescriptionIcon color="primary" />;
    } else if (fileType.includes("text")) {
      return <DescriptionIcon color="action" />;
    } else {
      return <DescriptionIcon />;
    }
  };

  const isEditable = userRole === "admin" || userRole === "editor";

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {getFileTypeIcon(document.fileType)}
            <Typography variant="h6" component="div" noWrap>
              {document.title}
            </Typography>
          </Box>

          {isEditable && (
            <IconButton aria-label="more" id={`document-menu-${document.id}`} aria-controls={open ? `document-menu-${document.id}` : undefined} aria-expanded={open ? "true" : undefined} aria-haspopup="true" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          )}

          <Menu
            id={`document-menu-${document.id}`}
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": `document-menu-${document.id}`,
            }}>
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleIngest}>
              <ListItemIcon>
                <ScienceIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ingest</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {document.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {document.description}
          </Typography>
        )}

        <Stack direction="row" spacing={1} mt={2}>
          <Chip label={formatFileSize(document.fileSize)} size="small" variant="outlined" />
          <Chip label={document.fileType.split("/")[1]?.toUpperCase() || document.fileType} size="small" variant="outlined" />
          {document.ingestionStatus && (
            <Tooltip title={document.ingestionError || `Document ingestion status: ${document.ingestionStatus.toLowerCase()}`} arrow>
              <Chip label={`Ingestion: ${document.ingestionStatus.toLowerCase()}`} size="small" color={document.ingestionStatus === "COMPLETED" ? "success" : document.ingestionStatus === "PROCESSING" || document.ingestionStatus === "PENDING" ? "warning" : "error"} />
            </Tooltip>
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Uploaded {formatDistanceToNow(new Date(document.createdAt))} ago
          {document.uploadedBy && ` by ${document.uploadedBy.username}`}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" startIcon={<DownloadIcon />} onClick={() => onDownload(document.id)}>
          Download
        </Button>
      </CardActions>
    </Card>
  );
};

export default DocumentCard;

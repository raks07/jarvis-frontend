import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  pending: {
    color: 'warning',
    icon: <HourglassEmptyIcon />,
    progress: 0,
  },
  processing: {
    color: 'info',
    icon: <SyncIcon />,
    progress: 50,
  },
  completed: {
    color: 'success',
    icon: <CheckCircleIcon />,
    progress: 100,
  },
  failed: {
    color: 'error',
    icon: <ErrorIcon />,
    progress: 100,
  },
};

const IngestionCard = ({ ingestion, onCancel }) => {
  const config = statusConfig[ingestion.status] || statusConfig.pending;
  const isActive = ingestion.status === 'pending' || ingestion.status === 'processing';
  
  return (
    <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h6" gutterBottom>
            {ingestion.document?.title || 'Document'}
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              icon={config.icon}
              label={ingestion.status.toUpperCase()}
              color={config.color}
              size="small"
              variant={ingestion.status === 'completed' ? 'filled' : 'outlined'}
            />
            <Typography variant="caption" color="text.secondary">
              Started {formatDistanceToNow(new Date(ingestion.startedAt))} ago
            </Typography>
            {ingestion.completedAt && (
              <Typography variant="caption" color="text.secondary">
                • Completed {formatDistanceToNow(new Date(ingestion.completedAt))} ago
              </Typography>
            )}
          </Stack>
        </Box>
        
        {isActive && (
          <Tooltip title="Cancel Ingestion">
            <IconButton 
              color="error" 
              size="small"
              onClick={() => onCancel(ingestion.id)}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {ingestion.status === 'processing' && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress variant="indeterminate" />
        </Box>
      )}
      
      {ingestion.status === 'failed' && ingestion.errorMessage && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          Error: {ingestion.errorMessage}
        </Typography>
      )}
    </Paper>
  );
};

export default IngestionCard;

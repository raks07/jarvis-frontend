import React from 'react';
import { Box, Typography, Paper, Grid, IconButton, Tooltip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  infoText?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  infoText,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Grid container alignItems="center" spacing={2}>
        {icon && (
          <Grid item>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'white',
              }}
            >
              {icon}
            </Box>
          </Grid>
        )}
        <Grid item xs>
          <Box>
            <Box display="flex" alignItems="center">
              <Typography variant="h4" component="h1" fontWeight="bold">
                {title}
              </Typography>
              {infoText && (
                <Tooltip title={infoText} arrow placement="top">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {subtitle && (
              <Typography variant="body1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Grid>
        {action && <Grid item>{action}</Grid>}
      </Grid>
    </Paper>
  );
};

export default PageHeader;

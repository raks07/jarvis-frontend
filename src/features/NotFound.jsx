import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Grid
} from '@mui/material';
import { Link } from 'react-router-dom';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={3}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <Box display="flex" justifyContent="center" mb={3}>
          <SadIcon fontSize="large" color="error" sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Grid item>
            <Button variant="contained" color="primary" component={Link} to="/">
              Go to Dashboard
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to="/documents">
              View Documents
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default NotFound;

import React from 'react';
import LoginForm from './components/LoginForm';
import { Box, Container } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <LoginForm />
      </Container>
    </Box>
  );
};

export default LoginPage;

import React from 'react';
import RegisterForm from './components/RegisterForm';
import { Box, Container } from '@mui/material';

const RegisterPage: React.FC = () => {
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
        <RegisterForm />
      </Container>
    </Box>
  );
};

export default RegisterPage;

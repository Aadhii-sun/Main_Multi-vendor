import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext.jsx';

const PrivateRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const isSeller = currentUser?.role === 'seller';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (sellerOnly && !isSeller) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

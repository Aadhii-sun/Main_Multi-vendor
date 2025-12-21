import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Home from '../../pages/Home.jsx';

// Decides what to show on "/" based on auth to avoid flicker/redirects
export default function LandingRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  
  // Debug logging
  if (currentUser) {
    console.log('=== LandingRoute DEBUG ===');
    console.log('Current user role:', currentUser.role);
    console.log('Role type:', typeof currentUser.role);
    console.log('Role === "user":', currentUser.role === 'user');
    console.log('Role === "seller":', currentUser.role === 'seller');
    console.log('Full user object:', JSON.stringify(currentUser, null, 2));
    console.log('========================');
  }
  
  // Normalize role for comparison
  const role = currentUser?.role ? String(currentUser.role).toLowerCase().trim() : null;
  
  if (role === 'admin') {
    console.log('LandingRoute: Redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (role === 'seller') {
    console.log('LandingRoute: Redirecting to seller dashboard');
    return <Navigate to="/seller/dashboard" replace />;
  }
  
  // For 'user' role or any other/undefined role, go to user dashboard
  if (currentUser) {
    console.log('LandingRoute: Redirecting to user dashboard (role:', role, ')');
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return <Home />;
}





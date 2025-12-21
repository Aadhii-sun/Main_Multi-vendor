import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import theme from './theme.js';

// Import components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyOTP from './components/Auth/VerifyOTP';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import Navbar from './components/Common/Navbar';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { WishlistProvider } from './contexts/WishlistContext.jsx';
import PrivateRoute from './components/Layout/PrivateRoute.jsx';
import ErrorBoundary from './components/Common/ErrorBoundary.jsx';

// Pages
import Home from './pages/Home.jsx';
import LandingRoute from './components/Layout/LandingRoute.jsx';
import ChatFab from './components/Common/ChatFab.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import Cart from './pages/Cart.jsx';
import ChatAssistant from './pages/ChatAssistant.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminUserDetail from './pages/AdminUserDetail.jsx';
import AdminSellers from './pages/AdminSellers.jsx';
import AdminSellerDetail from './pages/AdminSellerDetail.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminSettings from './pages/AdminSettings.jsx';
import AdminCategories from './pages/AdminCategories.jsx';
import AdminOverview from './pages/AdminOverview.jsx';
import UserDashboard from './components/User/UserDashboard.jsx';
import Checkout from './pages/Checkout.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import SellerProducts from './pages/SellerProducts.jsx';
import SellerOrders from './pages/SellerOrders.jsx';
import SellerOrderFulfillment from './pages/SellerOrderFulfillment.jsx';
import SellerAnalytics from './pages/SellerAnalytics.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Wishlist from './pages/Wishlist.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Addresses from './pages/Addresses.jsx';
import VendorStore from './pages/VendorStore.jsx';
import Vendors from './pages/Vendors.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
});

function AppContent() {
  const location = useLocation();

  const hideChromeOnRoutes = ['/login', '/register', '/verify-otp', '/admin/login'];
  const hideHeader = hideChromeOnRoutes.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideHeader && <Navbar />}
      {/* Global Contact/Chat button on all pages */}
      <ChatFab />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/" element={<LandingRoute />} />
          
          {/* Protected User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendor/:vendorId" element={<VendorStore />} />
          <Route
            path="/wishlist"
            element={
              <PrivateRoute>
                <Wishlist />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PrivateRoute>
                <OrderDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <PrivateRoute>
                <Addresses />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <PrivateRoute sellerOnly>
                <SellerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <PrivateRoute sellerOnly>
                <SellerProducts />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <PrivateRoute sellerOnly>
                <SellerOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/fulfillment"
            element={
              <PrivateRoute sellerOnly>
                <SellerOrderFulfillment />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/analytics"
            element={
              <PrivateRoute sellerOnly>
                <SellerAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <PrivateRoute>
                <ChatAssistant />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          
          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute adminOnly>
                <AdminOverview />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <PrivateRoute adminOnly>
                <AdminUserDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <PrivateRoute adminOnly>
                <AdminSellers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/sellers/:id"
            element={
              <PrivateRoute adminOnly>
                <AdminSellerDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute adminOnly>
                <AdminProducts />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute adminOnly>
                <AdminOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute adminOnly>
                <AdminCategories />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <PrivateRoute adminOnly>
                <AdminSettings />
              </PrivateRoute>
            }
          />
          
          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Router>
          <ErrorBoundary>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <AppContent />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ErrorBoundary>
        </Router>
        {import.meta?.env?.DEV ? (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  ExitToApp as LogoutIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { Badge } from '@mui/material';
import { useCart } from '../../contexts/CartContext.jsx';
import CartDrawer from './CartDrawer.jsx';
import { demoProducts } from '../../data/products.js';

const Navbar = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { items } = useCart() || { items: [] };
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [logoFailed, setLogoFailed] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
    handleClose();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        borderRadius: 0,
        mx: 0,
        my: 0,
        p: 0.5,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(17, 24, 39, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 1.5, md: 3 },
          py: 1,
          px: { xs: 1, md: 2 },
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          rowGap: { xs: 1, md: 0 },
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: { xs: 1, md: 0 },
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: 160,
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src="/Black White Minimal Simple Modern Creative Studio Ego Logo.png"
            alt="EGO Store logo"
            onError={() => setLogoFailed(true)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '16px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.brand?.midnight,
                fontWeight: 700,
                fontFamily: '"Baloo 2", "Poppins", sans-serif',
                lineHeight: 1,
              }}
            >
              EGO Store
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Store for this generation
            </Typography>
          </Box>
        </Box>

        {/* Search bar */}
        <SearchWithSuggestions />

        {/* Cart - Always visible */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Shopping Cart">
            <IconButton
              aria-label="cart"
              sx={{ color: theme.palette.brand?.midnight }}
              onClick={() => setCartOpen(true)}
            >
              <Badge color="primary" badgeContent={items?.length || 0}>
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Button
            color="secondary"
            variant="text"
            component={RouterLink}
            to="/cart"
            startIcon={<ShoppingCartIcon />}
            sx={{ 
              color: theme.palette.brand?.midnight, 
              fontWeight: 600,
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            Cart {items?.length > 0 && `(${items.length})`}
          </Button>
        </Box>

        {currentUser ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, md: 1.2 },
              flexShrink: 0,
            }}
          >
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {currentUser?.role === 'seller' && (
                  <Chip label="Seller" color="info" variant="outlined" sx={{ fontWeight: 600 }} />
                )}
                {currentUser?.role === 'admin' && (
                  <Chip label="Admin" color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />
                )}
                {currentUser?.role === 'seller' && (
                  <Button
                    color="secondary"
                    variant="text"
                    component={RouterLink}
                    to="/seller/dashboard"
                    startIcon={<DashboardIcon sx={{ color: 'inherit' }} />}
                    sx={{ color: theme.palette.brand?.midnight, fontWeight: 600 }}
                  >
                    Seller Center
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    color="secondary"
                    variant="text"
                    component={RouterLink}
                    to="/admin/dashboard"
                    startIcon={<AdminIcon sx={{ color: 'inherit' }} />}
                    sx={{ color: theme.palette.brand?.midnight, fontWeight: 600 }}
                  >
                    Admin Console
                  </Button>
                )}
                {!isAdmin && currentUser?.role !== 'seller' && (
                  <>
                    <Button color="secondary" variant="text" component={RouterLink} to="/user/dashboard" sx={{ fontWeight: 600 }}>
                      My Account
                    </Button>
                    <Button color="secondary" variant="text" component={RouterLink} to="/orders" sx={{ fontWeight: 600 }}>
                      Orders
                    </Button>
                  </>
                )}
              </Box>
            )}

            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                color="inherit"
              >
                {currentUser.photoURL ? (
                  <Avatar
                    alt={currentUser.displayName || 'User'}
                    src={currentUser.photoURL}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {currentUser.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser.email}
                </Typography>
              </Box>
              <Divider />
              {currentUser?.role === 'seller' && (
                <MenuItem component={RouterLink} to="/seller/dashboard" onClick={handleClose}>
                  <DashboardIcon sx={{ mr: 1, color: 'inherit' }} />
                  Seller Center
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem
                  component={RouterLink}
                  to="/admin/dashboard"
                  onClick={handleClose}
                >
                  <DashboardIcon sx={{ mr: 1, color: 'inherit' }} />
                  Admin Console
                </MenuItem>
              )}
              <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              {!isAdmin && currentUser?.role !== 'seller' && (
                <MenuItem component={RouterLink} to="/user/dashboard" onClick={handleClose}>
                  <DashboardIcon sx={{ mr: 1 }} />
                  My Account
                </MenuItem>
              )}
              <MenuItem component={RouterLink} to="/addresses" onClick={handleClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Address Book
              </MenuItem>
              {!isAdmin && (
                <MenuItem component={RouterLink} to="/assistant" onClick={handleClose}>
                  <DashboardIcon sx={{ mr: 1 }} />
                  Chat Assistant
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              color="secondary"
              variant="outlined"
              component={RouterLink}
              to="/login"
              sx={{
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              Login
            </Button>
            <Button
              color="secondary"
              variant="text"
              component={RouterLink}
              to="/products"
              sx={{ fontWeight: 600 }}
            >
              Shop
            </Button>
            <Button
              color="secondary"
              variant="text"
              component={RouterLink}
              to="/vendors"
              sx={{ fontWeight: 600 }}
            >
              Vendors
            </Button>
            <Button
              color="secondary"
              variant="text"
              component={RouterLink}
              to="/wishlist"
              sx={{ fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Wishlist
            </Button>
            <Button
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/register"
              sx={{
                boxShadow: { xs: 'none', md: '0 14px 30px rgba(241, 85, 185, 0.3)' },
                ml: { xs: 0.5, md: 1 },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
      {/* Secondary bar: show category links only for regular users; hide for sellers and admins */}
      {currentUser?.role !== 'seller' && currentUser?.role !== 'admin' && (
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            pb: 1,
            px: 2,
          }}
        >
          <Box sx={{ display: 'inline-flex', gap: 2 }}>
            {[
              { label: 'All', to: '/products' },
              { label: "Today's Deals", to: '/products?deals=true' },
              { label: 'New Releases', to: '/products' },
              { label: 'Electronics', to: '/products?category=Electronics' },
              { label: 'Home & Kitchen', to: '/products?category=Home' },
            ].map((l) => (
              <Button key={l.label} component={RouterLink} to={l.to} color="secondary" size="small">
                {l.label}
              </Button>
            ))}
          </Box>
        </Box>
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </AppBar>
  );
};

export default Navbar;

// lightweight search suggestions component
const SearchWithSuggestions = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const boxRef = React.useRef(null);

  const sellerProducts = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('seller_products');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);
  const all = React.useMemo(() => [...sellerProducts, ...demoProducts], [sellerProducts]);
  const suggestions = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return all.filter((p) => p.name.toLowerCase().includes(s)).slice(0, 6);
  }, [q, all]);

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <Box ref={boxRef} sx={{ flexGrow: 2, display: { xs: 'none', md: 'block' }, position: 'relative', maxWidth: 680 }}>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/products?search=${encodeURIComponent(q)}`);
          setOpen(false);
        }}
        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
      >
        <Box
          component="input"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          placeholder="Search products"
          aria-label="Search"
          sx={{
            flexGrow: 1,
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'divider',
            px: 2.2,
            py: 1.1,
            outline: 'none',
            fontSize: '0.95rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: theme.palette.brand?.midnight,
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.6)',
            },
          }}
        />
        <Button type="submit" variant="contained" sx={{ borderRadius: 999, px: 3 }}>
          Search
        </Button>
      </Box>
      {open && suggestions.length > 0 && (
        <Box sx={{
          position: 'absolute',
          zIndex: 10,
          mt: 1,
          width: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid',
          borderColor: 'rgba(56, 189, 248, 0.2)',
          borderRadius: 2,
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
        }}>
          {suggestions.map((sug) => (
            <Box
              key={sug.id}
              onClick={() => {
                navigate(`/products/${sug.id}`);
                setOpen(false);
              }}
              sx={{ 
                px: 2, 
                py: 1, 
                cursor: 'pointer', 
                color: theme.palette.brand?.midnight,
                '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.15)' } 
              }}
            >
              {sug.name}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

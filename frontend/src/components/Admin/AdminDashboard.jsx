import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Container,
  IconButton,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Badge,
  Grid,
  Paper,
  useTheme,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ProductsIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  ShoppingBag as OrdersIcon,
} from '@mui/icons-material';
import { getDashboardStats } from '../../services/admin';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const drawerWidth = 240;

const salesTrendData = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 2100 },
  { name: 'Wed', revenue: 1800 },
  { name: 'Thu', revenue: 2400 },
  { name: 'Fri', revenue: 3200 },
  { name: 'Sat', revenue: 2800 },
  { name: 'Sun', revenue: 1900 },
];

const sellerPerformanceData = [
  { name: 'Top Sellers', orders: 320, revenue: 4200 },
  { name: 'Rising Sellers', orders: 180, revenue: 2100 },
  { name: 'New Sellers', orders: 95, revenue: 980 },
];

const AdminDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // Verify admin status
    if (!isAdmin) {
      navigate('/admin/login');
    } else {
      fetchDashboardStats();
    }
  }, [isAdmin, navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Sellers', icon: <StoreIcon />, path: '/admin/sellers' },
    { text: 'Orders', icon: <OrdersIcon />, path: '/admin/orders' },
    { text: 'Products', icon: <ProductsIcon />, path: '/admin/products' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const drawer = (
    <div>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: theme.palette.seller?.sand,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '16px',
            background: theme.palette.seller?.gradient,
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            color: theme.palette.seller?.clay,
          }}
        >
          SC
        </Box>
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: theme.palette.seller?.slate }}>
            Seller Console
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Craft the next big launch
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ py: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1.5,
              my: 0.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(203, 104, 67, 0.12)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(203, 104, 67, 0.22)',
                color: theme.palette.seller?.slate,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.seller?.clay,
                },
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'rgba(203, 104, 67, 0.3)',
              },
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.seller?.slate }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        background: theme.palette.seller?.gradient,
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'rgba(255,255,255,0.88)',
          color: theme.palette.seller?.slate,
          boxShadow: '0 16px 32px rgba(45, 49, 66, 0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              Seller Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inspire shoppers with your next collection
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label="Daily inspiration ready"
              color="info"
              sx={{ mr: 2, fontWeight: 600, background: 'rgba(31,138,112,0.18)', color: theme.palette.seller?.slate }}
            />
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls="account-menu"
                aria-haspopup="true"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {currentUser?.name?.[0]?.toUpperCase() || <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => navigate('/admin/profile')}>
                <Avatar /> Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Height of AppBar
          background: 'linear-gradient(145deg, rgba(255,255,255,0.88), rgba(248,229,215,0.85))',
          borderTopLeftRadius: { sm: 40 },
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontFamily: '"Baloo 2", "Poppins", sans-serif' }}>
                Welcome back, {currentUser?.name || 'Seller'}!
              </Typography>
              <Typography color="text.secondary">
                Here’s how your creations are inspiring customers today.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="info"
              onClick={() => navigate('/admin/products')}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: 999,
                backgroundColor: theme.palette.seller?.teal,
                color: '#fff',
                boxShadow: '0 14px 28px rgba(31, 138, 112, 0.25)',
              }}
            >
              Add new collection
            </Button>
          </Stack>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.seller?.slate }}>
              Overview Statistics
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : stats ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {[
                  { label: 'Total Users', value: stats.overview?.totalUsers || 0, tone: theme.palette.seller?.clay },
                  { label: 'Total Sellers', value: stats.overview?.totalSellers || 0, tone: theme.palette.seller?.teal },
                  { label: 'Total Products', value: stats.overview?.totalProducts || 0, tone: theme.palette.seller?.amber },
                  { label: 'Total Orders', value: stats.overview?.totalOrders || 0, tone: theme.palette.seller?.clay },
                  { label: 'Total Revenue', value: `$${(stats.overview?.totalRevenue || 0).toFixed(2)}`, tone: theme.palette.seller?.teal },
                  { label: 'Pending Orders', value: stats.orders?.pending || 0, tone: theme.palette.seller?.amber },
                ].map((stat) => (
                  <Grid item xs={12} sm={6} md={4} key={stat.label}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.82)',
                        boxShadow: '0 20px 40px rgba(45, 49, 66, 0.08)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                      onClick={() => {
                        if (stat.label === 'Total Users') navigate('/admin/users');
                        if (stat.label === 'Total Sellers') navigate('/admin/sellers');
                        if (stat.label.includes('Orders')) navigate('/admin/orders');
                        if (stat.label === 'Total Products') navigate('/admin/products');
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" textTransform="capitalize">
                        {stat.label}
                      </Typography>
                      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="h4" sx={{ fontFamily: '"Baloo 2", "Poppins", sans-serif', color: stat.tone }}>
                          {stat.value}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="error">Failed to load statistics</Typography>
            )}

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={7}>
                <Paper
                  sx={{
                    p: 3,
                    height: 320,
                    borderRadius: 3,
                    boxShadow: '0 25px 50px rgba(45, 49, 66, 0.12)',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Weekly Gross Merchandise Value (GMV)
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrendData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0d7c7" />
                      <XAxis dataKey="name" stroke="#85604a" />
                      <YAxis stroke="#85604a" />
                      <RechartTooltip cursor={{ fill: 'rgba(203, 104, 67, 0.12)' }} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={theme.palette.seller?.clay}
                        strokeWidth={3}
                        dot={{ r: 5, fill: theme.palette.seller?.amber }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper
                  sx={{
                    p: 3,
                    height: 320,
                    borderRadius: 3,
                    boxShadow: '0 25px 50px rgba(45, 49, 66, 0.12)',
                    backgroundColor: 'rgba(255,255,255,0.88)',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Seller Cohorts (30 days)
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sellerPerformanceData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0d7c7" />
                      <XAxis dataKey="name" stroke="#85604a" />
                      <YAxis stroke="#85604a" />
                      <RechartTooltip cursor={{ fill: 'rgba(31, 138, 112, 0.12)' }} />
                      <Legend />
                      <Bar dataKey="orders" fill={theme.palette.seller?.clay} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="revenue" fill={theme.palette.seller?.teal} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

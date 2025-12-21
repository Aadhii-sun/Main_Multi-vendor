import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getUserById, updateUser, deleteUser, toggleUserStatus } from '../services/admin';
import { getAllOrders } from '../services/admin';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchUserOrders();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await getUserById(id);
      setUser(userData);
      setEditData({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isSellerApproved: userData.isSellerApproved || false,
        isActive: userData.isActive !== false,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const allOrders = await getAllOrders();
      const userOrders = allOrders.filter(order => 
        order.user?._id === id || order.user === id
      );
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      await updateUser(id, editData);
      setSuccess('User updated successfully');
      setEditMode(false);
      fetchUserData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setDeleteDialog(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus(id);
      fetchUserData();
      setSuccess('User status updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">User not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{ mr: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          User Account Details
        </Typography>
        {!editMode ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => {
                setEditMode(false);
                setEditData({
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  isSellerApproved: user.isSellerApproved || false,
                  isActive: user.isActive !== false,
                });
              }}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
          </>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialog(true)}
        >
          Delete
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {editMode ? (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    label="Role"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="seller">Seller</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editData.isActive}
                      onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                    />
                  }
                  label="Account Active"
                  sx={{ mt: 2 }}
                />
                {user.role === 'seller' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editData.isSellerApproved}
                        onChange={(e) => setEditData({ ...editData, isSellerApproved: e.target.checked })}
                      />
                    }
                    label="Seller Approved"
                    sx={{ mt: 1 }}
                  />
                )}
              </>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{user.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Role
                  </Typography>
                  <Chip
                    label={user.role?.toUpperCase()}
                    color={user.role === 'admin' ? 'error' : user.role === 'seller' ? 'warning' : 'primary'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Status
                  </Typography>
                  <Chip
                    label={user.isActive !== false ? 'Active' : 'Inactive'}
                    color={user.isActive !== false ? 'success' : 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                {user.role === 'seller' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Seller Approval
                    </Typography>
                    <Chip
                      label={user.isSellerApproved ? 'Approved' : 'Pending'}
                      color={user.isSellerApproved ? 'success' : 'warning'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleToggleStatus}
              >
                {user.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
              </Button>
              {user.role === 'seller' && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setEditData({ ...editData, isSellerApproved: !user.isSellerApproved });
                    handleSave();
                  }}
                >
                  {user.isSellerApproved ? 'Revoke Seller Approval' : 'Approve Seller'}
                </Button>
              )}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/admin/orders?userId=${id}`)}
              >
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order History ({orders.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {orders.length === 0 ? (
              <Typography color="text.secondary">No orders found</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.slice(0, 10).map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>#{order._id?.slice(-8).toUpperCase()}</TableCell>
                      <TableCell>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{order.orderItems?.length || 0} items</TableCell>
                      <TableCell>${order.totalPrice?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status || 'pending'}
                          size="small"
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'error' :
                            order.status === 'processing' ? 'info' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {user.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserDetail;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  TextField,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { getAllSellers, getPendingSellers, approveSeller, rejectSeller } from '../services/admin';

const AdminSellers = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSellers();
  }, [tabValue]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError('');
      let data;
      if (tabValue === 0) {
        data = await getAllSellers();
      } else {
        data = await getPendingSellers();
      }
      setSellers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, seller) => {
    setAnchorEl(event.currentTarget);
    setSelectedSeller(seller);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSeller(null);
  };

  const handleApprove = async () => {
    if (selectedSeller) {
      try {
        await approveSeller(selectedSeller._id);
        fetchSellers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to approve seller');
      }
    }
    handleMenuClose();
  };

  const handleReject = async () => {
    if (selectedSeller) {
      if (window.confirm(`Are you sure you want to reject ${selectedSeller.name}?`)) {
        try {
          await rejectSeller(selectedSeller._id);
          fetchSellers();
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to reject seller');
        }
      }
    }
    handleMenuClose();
  };

  const filteredSellers = sellers.filter(seller =>
    seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSellers = filteredSellers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Seller Management</Typography>
        <Button variant="outlined" onClick={fetchSellers} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Sellers" />
          <Tab label="Pending Approval" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          <TextField
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name or email"
            size="small"
            fullWidth
          />
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Approval</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                          No sellers found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSellers.map((seller) => (
                      <TableRow
                        key={seller._id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/sellers/${seller._id}`)}
                      >
                        <TableCell>{seller.name}</TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={seller.isActive !== false ? 'Active' : 'Inactive'}
                            color={seller.isActive !== false ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={seller.isSellerApproved ? 'Approved' : 'Pending'}
                            color={seller.isSellerApproved ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, seller)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredSellers.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedSeller && !selectedSeller.isSellerApproved && (
          <MenuItem onClick={handleApprove}>
            <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
            Approve Seller
          </MenuItem>
        )}
        {selectedSeller && selectedSeller.isSellerApproved && (
          <MenuItem onClick={handleReject} sx={{ color: 'error.main' }}>
            <CancelIcon sx={{ mr: 1 }} fontSize="small" />
            Revoke Approval
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          if (selectedSeller) navigate(`/admin/sellers/${selectedSeller._id}`);
          handleMenuClose();
        }}>
          <StoreIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AdminSellers;


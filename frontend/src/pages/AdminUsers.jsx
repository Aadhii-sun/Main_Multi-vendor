import React, { useMemo, useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { getAllUsers, deleteUser, toggleUserStatus, updateUser } from '../services/admin';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllUsers({ page: page + 1, limit: rowsPerPage });
      setUsers(response.users || []);
      setTotalCount(response.pagination?.count || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
      // Set empty arrays to prevent crashes
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEdit = () => {
    if (selectedUser) {
      setEditData({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
      });
      setEditDialog(true);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedUser) {
      if (window.confirm(`Are you sure you want to delete ${selectedUser.name}?`)) {
        try {
          await deleteUser(selectedUser._id);
          fetchUsers();
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to delete user');
        }
      }
    }
    handleMenuClose();
  };

  const handleToggleStatus = async () => {
    if (selectedUser) {
      try {
        await toggleUserStatus(selectedUser._id);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to toggle user status');
      }
    }
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (selectedUser) {
      try {
        await updateUser(selectedUser._id, editData);
        setEditDialog(false);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update user');
      }
    }
  };

  const columnHelper = useMemo(() => createColumnHelper(), []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue() || 'N/A',
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue() || 'N/A',
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue();
          const color = role === 'admin' ? 'error' : role === 'seller' ? 'warning' : 'primary';
          return <Chip label={role?.toUpperCase() || 'USER'} color={color} size="small" />;
        },
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => {
          const isActive = info.getValue() !== false;
          return (
            <Chip
              label={isActive ? 'Active' : 'Inactive'}
              color={isActive ? 'success' : 'default'}
              size="small"
            />
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Joined',
        cell: (info) => {
          const date = info.getValue();
          return date ? new Date(date).toLocaleDateString() : 'N/A';
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, info.row.original)}
          >
            <MoreVertIcon />
          </IconButton>
        ),
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: users || [],
    columns,
    state: {
      globalFilter,
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage,
      },
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex: page, pageSize: rowsPerPage }) : updater;
      setPage(next.pageIndex);
      setRowsPerPage(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    pageCount: Math.ceil((totalCount || 0) / rowsPerPage),
    manualPagination: true,
  });

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const size = Number(event.target.value);
    setRowsPerPage(size);
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="outlined" onClick={fetchUsers} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            value={globalFilter ?? ''}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
              table.setGlobalFilter(event.target.value);
              table.setPageIndex(0);
            }}
            placeholder="Search by name, email, or role"
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
              <Table size="small">
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableCell key={header.id}>
                          {header.isPlaceholder ? null : header.column.columnDef.header}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {(() => {
                    try {
                      const rows = table.getRowModel().rows;
                      if (rows.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={columns.length} align="center">
                              <Typography color="text.secondary" sx={{ py: 4 }}>
                                {loading ? 'Loading...' : 'No users found'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return rows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/users/${row.original._id}`)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            onClick={(e) => {
                              if (cell.column.id === 'actions') {
                                e.stopPropagation();
                              }
                            }}
                          >
                            {cell.renderCell()}
                          </TableCell>
                        ))}
                      </TableRow>
                      ));
                    } catch (err) {
                      console.error('Error rendering table rows:', err);
                      return (
                        <TableRow>
                          <TableCell colSpan={columns.length} align="center">
                            <Typography color="error" sx={{ py: 4 }}>
                              Error loading table data
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedUser?.isActive !== false ? (
            <>
              <BlockIcon sx={{ mr: 1 }} fontSize="small" />
              Deactivate
            </>
          ) : (
            <>
              <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
              Activate
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editData.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={editData.email || ''}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={editData.role || 'user'}
              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="seller">Seller</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;


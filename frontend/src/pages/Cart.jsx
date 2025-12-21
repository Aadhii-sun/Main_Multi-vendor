import React from 'react';
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
  Typography,
  Alert,
  Stack,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';

const Cart = () => {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeItem, clear } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 6, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 3 }}>
          🛒 Shopping Cart
        </Typography>
        <Paper sx={{ borderRadius: 3, p: { xs: 3, md: 6 }, textAlign: 'center' }}>
          <Stack spacing={3} alignItems="center">
            <ShoppingCartIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'text.secondary', opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Add some products to your cart to get started!
            </Typography>
            <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
              Continue Shopping
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 3 }}>
        🛒 Shopping Cart
      </Typography>

      {/* Desktop Table View */}
      {!isMobile && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
                <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Quantity</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.image && (
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.name}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1.5,
                            objectFit: 'cover',
                            border: '1px solid rgba(0,0,0,0.08)',
                          }}
                        />
                      )}
                      <Typography variant="subtitle2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
                      <Button size="small" variant="outlined" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</Button>
                      <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                      <Button size="small" variant="outlined" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </Box>
                  </TableCell>
                  <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" color="error" onClick={() => removeItem(item.id)} startIcon={<DeleteIcon />}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Mobile Card View */}
      {isMobile && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {items.map((item) => (
            <Card key={item.id} sx={{ borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  {item.image && (
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1.5,
                        objectFit: 'cover',
                        border: '1px solid rgba(0,0,0,0.08)',
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{item.name}</Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                      ₹{item.price.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total: ₹{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Quantity</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button size="small" variant="outlined" onClick={() => updateQuantity(item.id, item.quantity - 1)} sx={{ minWidth: 32 }}>−</Button>
                      <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                      <Button size="small" variant="outlined" onClick={() => updateQuantity(item.id, item.quantity + 1)} sx={{ minWidth: 32 }}>+</Button>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth 
                    size="small" 
                    color="error" 
                    variant="outlined"
                    onClick={() => removeItem(item.id)} 
                    startIcon={<DeleteIcon />}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Order Summary Card */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Shipping</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>FREE</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Tax</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{(subtotal * 0.18).toFixed(2)}</Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ₹{(subtotal * 1.18).toFixed(2)}
            </Typography>
          </Box>
        </Stack>

        <Stack 
          spacing={1.5} 
          sx={{ mt: 3 }}
          direction={{ xs: 'column', sm: 'row' }}
        >
          <Button 
            variant="outlined" 
            onClick={clear} 
            disabled={!items.length}
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Clear Cart
          </Button>
          <Button
            type="button"
            variant="contained"
            fullWidth
            disabled={!items.length}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/checkout');
            }}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Proceed to Checkout
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Cart;


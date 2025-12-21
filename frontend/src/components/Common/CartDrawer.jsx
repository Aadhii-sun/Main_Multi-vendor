import React from 'react';
import { Drawer, Box, Typography, IconButton, Stack, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useCart } from '../../contexts/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ open, onClose }) => {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">My Cart</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {items.map((it) => (
            <Box key={it.id} sx={{ py: 1.5, borderBottom: '1px solid #eee' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {it.image && (
                  <Box
                    component="img"
                    src={it.image}
                    alt={it.name}
                    sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #eee' }}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap title={it.name}>{it.name}</Typography>
                  <Typography variant="body2" color="text.secondary">${it.price.toFixed(2)}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button size="small" onClick={() => updateQuantity(it.id, it.quantity - 1)}>-</Button>
                  <Typography>{it.quantity}</Typography>
                  <Button size="small" onClick={() => updateQuantity(it.id, it.quantity + 1)}>+</Button>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="body2">Item total: ${(it.price * it.quantity).toFixed(2)}</Typography>
                <Button size="small" color="error" onClick={() => removeItem(it.id)}>Remove</Button>
              </Stack>
            </Box>
          ))}
          {items.length === 0 && <Typography color="text.secondary">Your cart is empty.</Typography>}
        </Box>
        <Typography variant="h6" sx={{ mt: 2 }}>Subtotal: ${subtotal.toFixed(2)}</Typography>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 1 }}
          disabled={!items.length}
          onClick={() => {
            onClose();
            navigate('/cart');
          }}
        >
          Go to Cart
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 1 }}
          disabled={!items.length}
          onClick={() => {
            onClose();
            navigate('/checkout');
          }}
        >
          Checkout
        </Button>
      </Box>
    </Drawer>
  );
};

export default CartDrawer;



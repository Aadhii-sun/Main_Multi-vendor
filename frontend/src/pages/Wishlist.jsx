import React from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, CardActions, Button, Box } from '@mui/material';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>Wishlist</Typography>
      <Grid container spacing={3}>
        {items.map((p) => (
          <Grid item xs={12} sm={6} md={3} key={p.id}>
            <Card sx={{ borderRadius: 3, height: '480px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ height: '240px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <CardMedia component="img" image={p.image} alt={p.name} sx={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
              </Box>
              <CardContent sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', p: 2, minHeight: 0, overflow: 'hidden' }}>
                <Typography 
                  variant="subtitle1" 
                  title={p.name} 
                  sx={{ 
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                    minHeight: '2.4em',
                    maxHeight: '2.4em'
                  }}
                >
                  {p.name}
                </Typography>
                <Box sx={{ flexGrow: 1, flexShrink: 0 }}>
                  <Typography variant="h6">${p.price.toFixed(2)}</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, height: '56px' }}>
                <Button size="small" onClick={() => navigate(`/products/${p.id}`)}>Details</Button>
                <Button size="small" onClick={() => toggle(p)}>Remove</Button>
                <Button variant="contained" size="small" onClick={() => addItem(p)}>Add to Cart</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {items.length === 0 && <Typography color="text.secondary">No items yet. Browse products and tap the heart to add.</Typography>}
    </Container>
  );
};

export default Wishlist;



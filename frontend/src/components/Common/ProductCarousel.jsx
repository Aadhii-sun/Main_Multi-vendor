import React, { useMemo, useRef } from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Stack, IconButton, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PriceTag from './PriceTag.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

/**
 * Horizontal product carousel showing seller/admin products from local storage (or fallback list).
 * Props:
 *  - title?: string
 *  - max?: number
 */
const ProductCarousel = ({ title = 'Products', max = 12 }) => {
  const viewportRef = useRef(null);
  const navigate = useNavigate();
  const { addItem } = useCart() || { addItem: () => {} };

  const products = useMemo(() => {
    try {
      const sellers = JSON.parse(localStorage.getItem('seller_products')) || [];
      const admins = JSON.parse(localStorage.getItem('admin_products')) || [];
      return [...sellers, ...admins].slice(0, max);
    } catch (e) {
      return [];
    }
  }, [max]);

  const scrollBy = (dir) => {
    const el = viewportRef.current;
    if (!el) return;
    const delta = (dir === 'left' ? -1 : 1) * (el.clientWidth * 0.8);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (!products.length) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', px: { xs: 1, md: 2 }, py: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>{title}</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => scrollBy('left')}><ChevronLeftIcon /></IconButton>
          <IconButton size="small" onClick={() => scrollBy('right')}><ChevronRightIcon /></IconButton>
        </Stack>
      </Stack>

      <Box
        ref={viewportRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          pb: 1,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {products.map((p) => (
          <Card
            key={p.id}
            sx={{ 
              minWidth: 240, 
              width: 240,
              maxWidth: 240,
              borderRadius: 3, 
              flex: '0 0 240px', 
              cursor: 'pointer',
              height: '480px',
              maxHeight: '480px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
            onClick={() => navigate(`/products/${p.id}`)}
          >
            <Box sx={{ 
              height: '240px', 
              minHeight: '240px',
              maxHeight: '240px',
              width: '100%', 
              overflow: 'hidden', 
              position: 'relative',
              flexShrink: 0
            }}>
              <CardMedia component="img" image={p.image || p.images?.[0] || 'https://via.placeholder.com/300'} alt={p.name} sx={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
            </Box>
            <CardContent sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: 0,
              maxHeight: '184px',
              overflow: 'hidden',
              boxSizing: 'border-box',
              p: 2
            }}>
              <Typography 
                variant="subtitle2" 
                title={p.name} 
                sx={{ 
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '2.4em',
                  maxHeight: '2.4em',
                  flexShrink: 0
                }}
              >
                {p.name}
              </Typography>
              <Box sx={{ flexGrow: 1, flexShrink: 1, minHeight: 0, display: 'flex', alignItems: 'flex-end' }}>
                <PriceTag price={p.price} discount={p.discountPrice} />
              </Box>
              <Button
                size="small"
                sx={{ mt: 1, flexShrink: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  addItem({ id: p.id, name: p.name, price: p.discountPrice || p.price, image: p.image, seller: p.seller });
                }}
                variant="contained"
                fullWidth
              >
                Add
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ProductCarousel;




